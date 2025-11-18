from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import desc, extract
from db.models.meter_readings import MeterReading
from db.models.unit_utility import UnitUtility
from schemas.payment import PaymentCreate, PaymentUpdate
from db.models.payments import Payment
from db.models.leases import Lease
from db.models.units import Unit
from db.models.user import User
from db.models.properties import Property
from db.models.renters import Renter

Owner = aliased(User)
RenterUser = aliased(User)

def upsert_meter_reading(db: Session, unit_id: int, utility_type_id: int, current: float, reading_date):
    try:
        previous_record = db.query(MeterReading).filter(
            MeterReading.unit_id == unit_id,
            MeterReading.utility_type_id == utility_type_id,
            MeterReading.reading_date < reading_date
        ).order_by(MeterReading.reading_date.desc()).first()

        previous_reading = previous_record.current_reading if previous_record else 0.0
        usage = current - previous_reading

        # Check if a reading for this date already exists
        existing = db.query(MeterReading).filter_by(
            unit_id=unit_id,
            utility_type_id=utility_type_id,
            reading_date=reading_date
        ).first()

        if existing:
            existing.previous_reading = previous_reading
            existing.current_reading = current
            existing.usage = usage
        else:
            db.add(MeterReading(
                unit_id=unit_id,
                utility_type_id=utility_type_id,
                previous_reading=previous_reading,
                current_reading=current,
                usage=usage,
                reading_date=reading_date
            ))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving meter reading (unit_id={unit_id}, utility_type_id={utility_type_id}): {str(e)}")

def create_payment(db: Session, data: PaymentCreate, current_user):
    try:
        lease = db.query(Lease).filter(Lease.id == data.lease_id).first()
        if not lease:
            raise HTTPException(status_code=400, detail="Invalid lease ID")
        
        date_obj = datetime.strptime(data.payment_date, "%Y-%m-%d").date()
        existing_payment = db.query(Payment).filter(
            Payment.lease_id == data.lease_id,
            extract('year', Payment.payment_date) == date_obj.year,
            extract('month', Payment.payment_date) == date_obj.month
        ).first()

        if existing_payment:
            raise HTTPException(status_code=400, detail="Payment with this lease and date already exists")


        payment = Payment(
            lease_id=data.lease_id,
            payment_date=data.payment_date,
            amount_paid=data.amount_paid,
            method=data.payment_method_id,
            receipt_url=data.receipt_url,
        )

        unit = db.query(Unit).filter(Unit.id == lease.unit_id).first()
        property = db.query(Property).filter(Property.id == unit.property_id).first() if unit else None
        renter = db.query(Renter).filter(Renter.id == lease.renter_id).first()
        if renter:
            renter = db.query(User).filter(User.id == renter.user_id).first()
        owner = db.query(User).filter(User.id == property.owner_id).first() if property else None

        if data.electricity is not None:
            upsert_meter_reading(
                db=db,
                unit_id=lease.unit_id,
                utility_type_id=1,  # 1 = electricity
                current=float(data.electricity),
                reading_date=data.payment_date
            )

        if data.water is not None:
            upsert_meter_reading(
                db=db,
                unit_id=lease.unit_id,
                utility_type_id=2,  # 2 = water
                current=float(data.water),
                reading_date=data.payment_date
            )

        db.add(payment)
        db.commit()
        db.refresh(payment)

        return {
            'id': str(payment.id),
            'lease_id': payment.lease_id,
            'payment_date': payment.payment_date,
            'amount_paid': payment.amount_paid,
            'payment_method_id': payment.method,
            'receipt_url': payment.receipt_url,
            'property_name': property.name if property else '',
            'unit_number': unit.unit_number if unit else '',
            'renter_name': renter.userName if renter else '',
            'owner_name': owner.userName if owner else '',
            'meter_readings': [
                {
                    "utility_type_id": r.utility_type_id,
                    "previous_reading": r.previous_reading,
                    "current_reading": r.current_reading,
                    "usage": r.usage,
                    "reading_date": r.reading_date,
                    "unit_rate": uu.unit_rate,
                    "billing_type": uu.billing_type,
                }
                for r, uu in db.query(MeterReading, UnitUtility)
                    .filter(MeterReading.unit_id == lease.unit_id)
                    .filter(MeterReading.reading_date == payment.payment_date)
                    .filter(MeterReading.unit_id == UnitUtility.unit_id)
                    .filter(MeterReading.utility_type_id == UnitUtility.utility_type_id)
                    .all()
            ]
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")

def get_all_payments(db: Session, current_user):
    try:
        payments = (
            db.query(Payment, Lease, Unit, Renter, Property, Owner, RenterUser)
            .outerjoin(Lease, Payment.lease_id == Lease.id)
            .outerjoin(Unit, Lease.unit_id == Unit.id)
            .outerjoin(Renter, Renter.id == Lease.renter_id)
            .outerjoin(Property, Unit.property_id == Property.id)
            .outerjoin(Owner, Property.owner_id == Owner.id)
            .outerjoin(RenterUser, Renter.user_id == RenterUser.id)
            .filter(Property.owner_id == current_user.id)
            .order_by(desc(Payment.id))
            .all()
        )

        return [{
            'id': str(payment.id),
            'lease_id': payment.lease_id,
            'payment_date': payment.payment_date,
            'amount_paid': payment.amount_paid,
            'payment_method_id': payment.method,
            'receipt_url': payment.receipt_url,
            'property_name': property.name,
            'unit_number': unit.unit_number,
            'renter_name': renter_user.userName if renter_user else '',
            'owner_name': owner.userName if owner else '',
            'meter_readings': [
                {
                    "utility_type_id": r.utility_type_id,
                    "previous_reading": r.previous_reading,
                    "current_reading": r.current_reading,
                    "usage": r.usage,
                    "reading_date": r.reading_date,
                    "unit_rate": uu.unit_rate,
                    "billing_type": uu.billing_type,
                }
                for r, uu in db.query(MeterReading, UnitUtility)
                    .filter(MeterReading.unit_id == lease.unit_id)
                    .filter(MeterReading.reading_date == payment.payment_date)
                    .filter(MeterReading.unit_id == UnitUtility.unit_id)
                    .filter(MeterReading.utility_type_id == UnitUtility.utility_type_id)
                    .all()
            ]
        } for payment, lease, unit, renter, property, owner, renter_user in payments]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payments: {str(e)}")

def update_payment(db: Session, payment_id: int, data: PaymentUpdate, current_user):
    try:
        payment = db.get(Payment, payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        date_obj = datetime.strptime(data.payment_date, "%Y-%m-%d").date()
        existing_payment = db.query(Payment).filter(
            Payment.lease_id == data.lease_id,
            extract('year', Payment.payment_date) == date_obj.year,
            extract('month', Payment.payment_date) == date_obj.month,
            Payment.id != payment_id
        ).first()

        if existing_payment:
            raise HTTPException(status_code=400, detail="Payment with this lease and date already exists")

        if data.lease_id is not None:
            lease = db.query(Lease).filter(Lease.id == data.lease_id).first()
            if not lease:
                raise HTTPException(status_code=400, detail="Invalid lease ID")
            payment.lease_id = data.lease_id

        if data.payment_date is not None:
            payment.payment_date = data.payment_date

        if data.amount_paid is not None:
            payment.amount_paid = data.amount_paid

        if data.payment_method_id is not None:
            payment.method = data.payment_method_id

        if data.receipt_url is not None:
            payment.receipt_url = data.receipt_url

        lease = db.query(Lease).filter(Lease.id == payment.lease_id).first()
        unit = db.query(Unit).filter(Unit.id == lease.unit_id).first() if lease else None
        property = db.query(Property).filter(Property.id == unit.property_id).first() if unit else None
        renter = db.query(Renter).filter(Renter.id == lease.renter_id).first()
        if renter:
            renter = db.query(User).filter(User.id == renter.user_id).first()
        owner = db.query(User).filter(User.id == property.owner_id).first() if property else None

        if data.electricity is not None:
            upsert_meter_reading(
                db=db,
                unit_id=lease.unit_id,
                utility_type_id=1,  # 1 = electricity
                current=float(data.electricity),
                reading_date=data.payment_date
            )

        if data.water is not None:
            upsert_meter_reading(
                db=db,
                unit_id=lease.unit_id,
                utility_type_id=2,  # 2 = water
                current=float(data.water),
                reading_date=data.payment_date
            )

        db.commit()
        db.refresh(payment)

        return {
            'id': str(payment.id),
            'lease_id': payment.lease_id,
            'payment_date': payment.payment_date,
            'amount_paid': payment.amount_paid,
            'payment_method_id': payment.method,
            'receipt_url': payment.receipt_url,
            'property_name': property.name if property else '',
            'unit_number': unit.unit_number if unit else '',
            'renter_name': renter.userName if renter else '',
            'owner_name': owner.userName if owner else '',
            'meter_readings': [
                {
                    "utility_type_id": r.utility_type_id,
                    "previous_reading": r.previous_reading,
                    "current_reading": r.current_reading,
                    "usage": r.usage,
                    "reading_date": r.reading_date,
                    "unit_rate": uu.unit_rate,
                    "billing_type": uu.billing_type,
                }
                for r, uu in db.query(MeterReading, UnitUtility)
                    .filter(MeterReading.unit_id == lease.unit_id)
                    .filter(MeterReading.reading_date == payment.payment_date)
                    .filter(MeterReading.unit_id == UnitUtility.unit_id)
                    .filter(MeterReading.utility_type_id == UnitUtility.utility_type_id)
                    .all()
            ]
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating payment: {str(e)}")

def delete_payment(db: Session, payment_id: int, current_user):
    try:
        payment = db.get(Payment, payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        lease = db.get(Lease, payment.lease_id)
        if not lease:
            raise HTTPException(status_code=404, detail="Lease not found")

        return_data = {
            'id': str(payment.id),
            'lease_id': payment.lease_id,
            'payment_date': payment.payment_date,
            'amount_paid': payment.amount_paid,
            'payment_method_id': payment.method,
            'receipt_url': payment.receipt_url,
        }
        
        unit_id = lease.unit_id
        payment_year = payment.payment_date.year
        payment_month = payment.payment_date.month

        meter_readings = db.query(MeterReading).filter(
            MeterReading.unit_id == unit_id,
            extract('year', MeterReading.reading_date) == payment_year,
            extract('month', MeterReading.reading_date) == payment_month
        ).all()

        for reading in meter_readings:
            db.delete(reading)

        db.delete(payment)
        db.commit()

        return return_data

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting payment: {str(e)}")
