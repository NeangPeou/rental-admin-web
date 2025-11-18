from fastapi import HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session
from db.models import role
from db.models.leases import Lease
from db.models.renters import Renter
from db.models.user import User
from schemas.units import PropertyUnitCreate, PropertyUnitUpdate
from db.models.units import Unit
from db.models.properties import Property
from db.models.unit_utility import UnitUtility

def upsert_unit_utilities(db: Session, unit_id: int, utilities: list):
    existing_utilities = {
        u.utility_type_id: u for u in db.query(UnitUtility).filter(UnitUtility.unit_id == unit_id).all()
    }

    incoming_utility_ids = []

    for utility in utilities:
        try:
            amount_value = float(utility.amount)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid amount for utility type {utility.utility_type}")

        fixed_rate = amount_value if utility.billing_type == "fixed" else None
        unit_rate = amount_value if utility.billing_type == "per_unit" else None
        incoming_utility_ids.append(utility.utility_type)

        if int(utility.utility_type) in existing_utilities:
            existing = existing_utilities[int(utility.utility_type)]
            existing.billing_type = utility.billing_type
            existing.fixed_rate = fixed_rate
            existing.unit_rate = unit_rate
        else:
            db.add(UnitUtility(
                unit_id=unit_id,
                utility_type_id=utility.utility_type,
                billing_type=utility.billing_type,
                fixed_rate=fixed_rate,
                unit_rate=unit_rate
            ))

    incoming_utility_ids = [int(x) for x in incoming_utility_ids]

    try:
        db.query(UnitUtility).filter(
            UnitUtility.unit_id == unit_id,
            ~UnitUtility.utility_type_id.in_(incoming_utility_ids)
        ).delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting old utilities: {str(e)}")

def create_property_unit(db: Session, data: PropertyUnitCreate, current_user):
    try:
        property = db.query(Property).filter(Property.id == data.property_id).first()
        if not property:
            raise HTTPException(status_code=400, detail="Invalid property")
        
        duplicate = db.query(Unit).filter(
            Unit.property_id == data.property_id,
            func.lower(Unit.unit_number) == func.lower(data.unit_number),
            Unit.floor == data.floor
        ).first()

        if duplicate:
            raise HTTPException(status_code=400, detail="A unit with the same property ID, unit number, and floor already exists.")
        
        unit = Unit(
            property_id=data.property_id,
            unit_number=data.unit_number,
            floor=None if data.floor == "" else data.floor,
            bedrooms=None if data.bedrooms == "" else data.bedrooms,
            bathrooms=None if data.bathrooms == "" else data.bathrooms,
            size_sqm=None if data.size == "" else data.size,
            rent_price=None if data.rent == "" else data.rent,
            is_available=data.is_available,
        )

        db.add(unit)
        db.commit()
        db.refresh(unit)

        if data.utilities:
            upsert_unit_utilities(db, unit.id, data.utilities)

        db.commit()

        return {
            'id': str(unit.id),
            'unit_number': unit.unit_number,
            'floor': unit.floor,
            'bedrooms': unit.bedrooms,
            'bathrooms': unit.bathrooms,
            'size': unit.size_sqm,
            'rent': unit.rent_price,
            'is_available': unit.is_available,
            'property_id': unit.property_id,
            'property_name': property.name,
            'utilities': [
                {
                    'id': str(utility.id),
                    'utility_type_id': utility.utility_type_id,
                    'billing_type': utility.billing_type,
                    'fixed_rate': utility.fixed_rate,
                    'unit_rate': utility.unit_rate
                }
                for utility in db.query(UnitUtility).filter(UnitUtility.unit_id == unit.id).all()
            ]
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating unit: {str(e)}")

# def get_all_units(db: Session, current_user):
#     try:
#         units = (
#             db.query(Unit, Property, Lease, Renter, User)
#             .join(Property, Property.id == Unit.property_id)
#             .outerjoin(Lease, (Lease.unit_id == Unit.id) & (Lease.status == 'active'))
#             .outerjoin(Renter, Renter.id == Lease.renter_id)
#             .outerjoin(User, User.id == Renter.user_id)
#             .filter(Property.owner_id == current_user.id)
#             .order_by(Unit.id.desc())
#             .all()
#         )

#         return [{
#             'id': str(u.id),
#             'unit_number': u.unit_number,
#             'floor': u.floor,
#             'bedrooms': u.bedrooms,
#             'bathrooms': u.bathrooms,
#             'size': u.size_sqm,
#             'rent': u.rent_price if u.rent_price is not None else (lease.rent_amount if lease else None),
#             'is_available': u.is_available,
#             'property_id': u.property_id,
#             'property_name': p.name,
#             'renter_name': user.userName if user else None,
#             'lease_status': lease.status if lease else None,
#             'utilities': [
#                 {
#                     'id': str(utility.id),
#                     'utility_type_id': utility.utility_type_id,
#                     'billing_type': utility.billing_type,
#                     'fixed_rate': utility.fixed_rate,
#                     'unit_rate': utility.unit_rate
#                 }
#                 for utility in db.query(UnitUtility).filter(UnitUtility.unit_id == u.id).all()
#             ]
#         } for u, p, lease, renter, user in units]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error fetching units: {str(e)}")

def get_all_units(db: Session, current_user):
    try:
        role_obj = db.query(role.Role).filter(role.Role.id == current_user.role_id).first()
        if not role_obj:
            raise HTTPException(status_code=403, detail="Invalid role")

        units = []
        if role_obj.role == "Owner":
            units_data = (
                db.query(Unit, Property, Lease, Renter, User)
                .join(Property, Property.id == Unit.property_id)
                .outerjoin(Lease, (Lease.unit_id == Unit.id) & (Lease.status == 'active'))
                .outerjoin(Renter, Renter.id == Lease.renter_id)
                .outerjoin(User, User.id == Renter.user_id)
                .filter(Property.owner_id == current_user.id)
                .order_by(Unit.id.desc())
                .all()
            )
            units = [{
                'id': str(u.id),
                'unit_number': u.unit_number,
                'floor': u.floor,
                'bedrooms': u.bedrooms,
                'bathrooms': u.bathrooms,
                'size': u.size_sqm,
                'rent': u.rent_price if u.rent_price is not None else (lease.rent_amount if lease else None),
                'is_available': u.is_available,
                'property_id': u.property_id,
                'property_name': p.name,
                'renter_name': user.userName if user else None,
                'lease_status': lease.status if lease else None,
                'utilities': [
                    {
                        'id': str(utility.id),
                        'utility_type_id': utility.utility_type_id,
                        'billing_type': utility.billing_type,
                        'fixed_rate': utility.fixed_rate,
                        'unit_rate': utility.unit_rate
                    }
                    for utility in db.query(UnitUtility).filter(UnitUtility.unit_id == u.id).all()
                ]
            } for u, p, lease, renter, user in units_data]
        elif role_obj.role == "Renter":
            renter = db.query(Renter).filter(Renter.user_id == current_user.id).first()
            if not renter:
                raise HTTPException(status_code=404, detail="Renter profile not found")
            owner_id = renter.owner_id
            units_data = (
                db.query(Unit, Property, Lease, Renter, User)
                .join(Property, Property.id == Unit.property_id)
                .outerjoin(Lease, (Lease.unit_id == Unit.id) & (Lease.status == 'active'))
                .outerjoin(Renter, Renter.id == Lease.renter_id)
                .outerjoin(User, User.id == Renter.user_id)
                .filter(Property.owner_id == owner_id)
                .order_by(Unit.id.desc())
                .all()
            )
            units = [{
                'id': str(u.id),
                'unit_number': u.unit_number,
                'floor': u.floor,
                'bedrooms': u.bedrooms,
                'bathrooms': u.bathrooms,
                'size': u.size_sqm,
                'rent': u.rent_price if u.rent_price is not None else (lease.rent_amount if lease else None),
                'is_available': u.is_available,
                'property_id': u.property_id,
                'property_name': p.name,
                'renter_name': user.userName if user else None,
                'lease_status': lease.status if lease else None,
                'utilities': [
                    {
                        'id': str(utility.id),
                        'utility_type_id': utility.utility_type_id,
                        'billing_type': utility.billing_type,
                        'fixed_rate': utility.fixed_rate,
                        'unit_rate': utility.unit_rate
                    }
                    for utility in db.query(UnitUtility).filter(UnitUtility.unit_id == u.id).all()
                ]
            } for u, p, lease, renter, user in units_data]
        else:
            raise HTTPException(status_code=403, detail="Unauthorized role for viewing units")

        return units
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching units: {str(e)}")

def update_property_unit(db: Session, unit_id: int, data: PropertyUnitUpdate, current_user):
    try:
        unit = db.get(Unit, unit_id)
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")
        
        property_id_to_check = data.property_id if data.property_id is not None else unit.property_id
        unit_number_to_check = data.unit_number if data.unit_number is not None else unit.unit_number
        floor_to_check = data.floor if data.floor is not None else unit.floor
        
        duplicate = db.query(Unit).filter(
            Unit.property_id == property_id_to_check,
            func.lower(Unit.unit_number) == func.lower(unit_number_to_check),
            Unit.floor == floor_to_check,
            Unit.id != unit_id
        ).first()

        if duplicate:
            raise HTTPException(status_code=400, detail="Another unit with the same unit number and floor already exists for this property.")

        if data.unit_number is not None:
            unit.unit_number = data.unit_number
        if data.floor is not None:
            unit.floor = data.floor or None
        if data.bedrooms is not None:
            unit.bedrooms = data.bedrooms or None
        if data.bathrooms is not None:
            unit.bathrooms = data.bathrooms or None
        if data.size is not None:
            unit.size_sqm = data.size or None
        if data.rent is not None:
            unit.rent_price = data.rent or None
        if data.is_available is not None:
            unit.is_available = data.is_available
        if data.property_id is not None:
            unit.property_id = data.property_id

        if data.property_id is not None:
            property = db.query(Property).filter(Property.id == unit.property_id).first()
            if not property:
                raise HTTPException(status_code=404, detail="Property not found")
            
        if data.utilities:
            upsert_unit_utilities(db, unit.id, data.utilities)

        db.commit()
        db.refresh(unit)

        active_lease = (
            db.query(Lease, Renter, User)
            .join(Renter, Renter.id == Lease.renter_id)
            .join(User, User.id == Renter.user_id)
            .filter(Lease.unit_id == unit.id, Lease.status == 'active')
            .order_by(desc(Lease.id))
            .first()
        )

        renter_name = active_lease[2].userName if active_lease else None
        lease_status = active_lease[0].status if active_lease else None

        return {
            'id': str(unit.id),
            'unit_number': unit.unit_number,
            'floor': unit.floor,
            'bedrooms': unit.bedrooms,
            'bathrooms': unit.bathrooms,
            'size': unit.size_sqm,
            'rent': unit.rent_price if unit.rent_price is not None else (active_lease[0].rent_amount if active_lease else None),
            'is_available': unit.is_available,
            'property_id': unit.property_id,
            'property_name': property.name,
            'renter_name': renter_name,
            'lease_status': lease_status,
            'utilities': [
                {
                    'id': str(utility.id),
                    'utility_type_id': utility.utility_type_id,
                    'billing_type': utility.billing_type,
                    'fixed_rate': utility.fixed_rate,
                    'unit_rate': utility.unit_rate
                }
                for utility in db.query(UnitUtility).filter(UnitUtility.unit_id == unit.id).all()
            ]
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating unit: {str(e)}")

def delete_property_unit(db: Session, unit_id: int, current_user):
    try:
        unit = db.get(Unit, unit_id)
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")

        return_data = {
            'id': str(unit.id),
            'unit_number': unit.unit_number,
            'floor': unit.floor,
            'bedrooms': unit.bedrooms,
            'bathrooms': unit.bathrooms,
            'size': unit.size_sqm,
            'rent': unit.rent_price,
            'is_available': unit.is_available,
            'property_id': unit.property_id,
        }

        db.query(UnitUtility).filter(UnitUtility.unit_id == unit.id).delete()
        db.delete(unit)
        db.commit()

        return return_data
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting unit: {str(e)}")
