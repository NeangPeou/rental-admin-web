from fastapi import HTTPException
from sqlalchemy.orm import Session
from db.models.unit_utility import UnitUtility
from db.models.meter_readings import MeterReading
from schemas.leases import LeaseCreate, LeaseUpdate, LeaseOut
from db.models.leases import Lease
from db.models.units import Unit
from db.models.renters import Renter
from db.models.user import User
from db.models.properties import Property

def create_lease(db: Session, data: LeaseCreate, current_user):
    try:
        existing_lease = db.query(Lease).filter(Lease.unit_id == data.unit_id, Lease.status.in_(["active", "pending"])).first()

        if existing_lease:
            raise HTTPException(status_code=400, detail="A lease already exists for this unit with active or pending status.")
        
        unit = db.query(Unit).filter(Unit.id == data.unit_id).first()
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")

        renter = db.query(Renter).filter(Renter.id == data.renter_id).first()
        if not renter:
            raise HTTPException(status_code=404, detail="Renter not found")

        lease = Lease(
            unit_id=data.unit_id,
            renter_id=data.renter_id,
            start_date=data.start_date,
            end_date=data.end_date,
            rent_amount=data.rent_amount,
            deposit_amount=data.deposit_amount,
            status=data.status,
        )

        unit.is_available = data.status not in ["active", "pending"]

        db.add(lease)
        db.add(unit)
        db.commit()
        db.refresh(lease)

        user = db.query(User).filter(User.id == renter.user_id).first()

        return LeaseOut(
            id=lease.id,
            unit_id=lease.unit_id,
            renter_id=lease.renter_id,
            start_date=lease.start_date,
            end_date=lease.end_date,
            rent_amount=lease.rent_amount,
            deposit_amount=lease.deposit_amount,
            status=lease.status,
            username=user.userName if user else None,
            unit_number=unit.unit_number if unit else None,
            is_available=unit.is_available
        )
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating lease: {str(e)}")


def get_all_leases(db: Session, current_user):
    try:
        leases = db.query(Lease, User.userName, Unit.unit_number).\
            join(Renter, Renter.id == Lease.renter_id).\
            join(User, User.id == Renter.user_id).\
            join(Unit, Unit.id == Lease.unit_id).\
            join(Property, Property.id == Unit.property_id).filter(Property.owner_id == current_user.id).all()
        
        return [
            LeaseOut(
                id=lease.id,
                unit_id=lease.unit_id,
                renter_id=lease.renter_id,
                start_date=lease.start_date,
                end_date=lease.end_date,
                rent_amount=lease.rent_amount,
                deposit_amount=lease.deposit_amount,
                status=lease.status,
                username=username,
                unit_number=unit_number,  # Include unit_number
                utilities=[
                {
                    'id': str(utility.id),
                    'utility_type_id': utility.utility_type_id,
                    'billing_type': utility.billing_type,
                    'fixed_rate': utility.fixed_rate,
                    'unit_rate': utility.unit_rate,
                    'current_reading': (
                        db.query(MeterReading.current_reading)
                        .filter(MeterReading.unit_id == lease.unit_id)
                        .filter(MeterReading.utility_type_id == utility.utility_type_id)
                        .order_by(MeterReading.reading_date.desc())
                        .limit(1)
                        .scalar()
                    )
                }
                for utility in db.query(UnitUtility).filter(UnitUtility.unit_id == lease.unit_id).all()
            ]
            ) for lease, username, unit_number in leases
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leases: {str(e)}")

def update_lease(db: Session, lease_id: int, data: LeaseUpdate, current_user):
    try:
        lease = db.get(Lease, lease_id)
        if not lease:
            raise HTTPException(status_code=404, detail="Lease not found")
        
        unit_id_to_check = data.unit_id if data.unit_id is not None else lease.unit_id

        duplicate_lease = db.query(Lease).filter(Lease.unit_id == unit_id_to_check, Lease.id != lease_id, Lease.status.in_(["active", "pending"])).first()
        if duplicate_lease:
            raise HTTPException(status_code=400, detail="Another active lease already exists for this unit.")

        # Handle unit update
        if data.unit_id is not None and data.unit_id != lease.unit_id:
            old_unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()
            new_unit = db.query(Unit).filter(Unit.id == data.unit_id).first()
            if not new_unit:
                raise HTTPException(status_code=404, detail="Unit not found")
            
            if old_unit:
                old_unit.is_available = True
                db.add(old_unit)
                
            lease.unit_id = data.unit_id
            new_unit.is_available = data.status not in ['active', 'pending']
            db.add(new_unit)

        if data.status is not None:
            lease.status = data.status 

            current_unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()
            if current_unit:
                current_unit.is_available = data.status not in ["active", "pending"]
                db.add(current_unit)

        # Handle renter update
        if data.renter_id is not None:
            renter = db.query(Renter).filter(Renter.id == data.renter_id).first()
            if not renter:
                raise HTTPException(status_code=404, detail="Renter not found")
            lease.renter_id = data.renter_id

        # Other fields
        if data.start_date is not None:
            lease.start_date = data.start_date
        if data.end_date is not None:
            lease.end_date = data.end_date
        if data.rent_amount is not None:
            lease.rent_amount = data.rent_amount
        if data.deposit_amount is not None:
            lease.deposit_amount = data.deposit_amount
        if data.status is not None:
            lease.status = data.status

        db.commit()
        db.refresh(lease)

        # Query related data for response
        renter = db.query(Renter).filter(Renter.id == lease.renter_id).first()
        user = db.query(User).filter(User.id == renter.user_id).first() if renter else None
        unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()

        return LeaseOut(
            id=lease.id,
            unit_id=lease.unit_id,
            renter_id=lease.renter_id,
            start_date=lease.start_date,
            end_date=lease.end_date,
            rent_amount=lease.rent_amount,
            deposit_amount=lease.deposit_amount,
            status=lease.status,
            username=user.userName if user else None,
            unit_number=unit.unit_number if unit else None,
            is_available=unit.is_available
        )

    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating lease: {str(e)}")


def delete_lease(db: Session, lease_id: int):
    try:
        lease = db.get(Lease, lease_id)
        if not lease:
            raise HTTPException(status_code=404, detail="Lease not found")

        unit = db.query(Unit).filter(Unit.id == lease.unit_id).with_for_update().first()
        if unit:
            unit.is_available = True

        db.delete(lease)
        db.commit()

        user = db.query(User).join(Renter, Renter.id == lease.renter_id).filter(User.id == Renter.user_id).first()
        unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()
        return LeaseOut(
            id=lease.id,
            unit_id=lease.unit_id,
            renter_id=lease.renter_id,
            start_date=lease.start_date,
            end_date=lease.end_date,
            rent_amount=lease.rent_amount,
            deposit_amount=lease.deposit_amount,
            status=lease.status,
            username=user.userName if user else None,
            unit_number=unit.unit_number if unit else None  # Include unit_number
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting lease: {str(e)}")