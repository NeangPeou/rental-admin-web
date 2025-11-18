from datetime import datetime
from fastapi import HTTPException
from sqlalchemy import extract, or_, and_
from sqlalchemy.orm import Session, aliased
from db.models.leases import Lease
from db.models.units import Unit
from db.models.properties import Property
from db.models.invoices import Invoice
from db.models.payments import Payment
from db.models.unit_utility import UnitUtility
from db.models.meter_readings import MeterReading
from db.models.renters import Renter
from db.models.user import User
from schemas.invoice import InvoiceCreate

def create_invoice(db: Session, data: InvoiceCreate, current_user):
    try:
        lease = (
            db.query(Lease)
            .join(Unit, Lease.unit_id == Unit.id)
            .join(Property, Unit.property_id == Property.id)
            .filter(Lease.id == int(data.lease_id))
            .filter(Property.owner_id == current_user.id)
            .first()
        )

        if not lease:
            raise HTTPException(status_code=404, detail="Lease not found or unauthorized.")
        
        date_obj = datetime.strptime(data.month, "%Y-%m-%d").date()
        duplicate_invoice = (
            db.query(Invoice)
            .filter(Invoice.lease_id == int(data.lease_id))
            .filter(extract('month', Invoice.month) == date_obj.month)
            .filter(extract('year', Invoice.month) == date_obj.year)
            .first()
        )

        if duplicate_invoice:
            raise HTTPException(status_code=400, detail="An invoice already exists for this lease on the specified due date.")
        
        payment_exists = (
            db.query(Payment)
            .filter(Payment.lease_id == data.lease_id)
            .filter(extract('month', Payment.payment_date) == date_obj.month)
            .filter(extract('year', Payment.payment_date) == date_obj.year)
            .first()
        )

        lease_exists = (
            db.query(Lease)
            .filter(Lease.id == data.lease_id, Lease.status == 'active')
            .first()
        )

        if not lease_exists:
            raise HTTPException(status_code=400, detail="Lease not found or inactive.")
        
        unit_utilities = db.query(UnitUtility).filter(UnitUtility.unit_id == lease.unit_id).all()
        total_utility = 0.0

        for utility in unit_utilities:
            if utility.billing_type == 'fixed':
                total_utility += utility.fixed_rate or 0
            elif utility.billing_type == 'per_unit':
                meter_reading = (
                    db.query(MeterReading)
                    .filter(
                        MeterReading.unit_id == lease.unit_id,
                        MeterReading.utility_type_id == utility.utility_type_id,
                        extract('month', MeterReading.reading_date) == date_obj.month,
                        extract('year', MeterReading.reading_date) == date_obj.year
                    )
                    .order_by(MeterReading.reading_date.desc())
                    .first()
                )

                if meter_reading and utility.unit_rate:
                    usage = meter_reading.usage or (
                        (meter_reading.current_reading - meter_reading.previous_reading)
                        if meter_reading.current_reading is not None and meter_reading.previous_reading is not None
                        else 0
                    )
                    total_utility += usage * utility.unit_rate

        rent_amount = lease.rent_amount
        total_amount = float(rent_amount) + float(total_utility)

        new_invoice = Invoice(
            lease_id=data.lease_id,
            month=date_obj,
            rent=payment_exists.amount_paid if payment_exists else lease_exists.rent_amount,
            utility=total_utility,
            total=total_amount,
            status='paid' if payment_exists else 'unpaid'
        )

        db.add(new_invoice)
        db.commit()
        db.refresh(new_invoice)

        invoice_detail = (
            db.query(Invoice, Lease, Unit, Renter, User)
            .join(Lease, Invoice.lease_id == Lease.id)
            .join(Unit, Lease.unit_id == Unit.id)
            .join(Renter, Lease.renter_id == Renter.id)
            .join(User, Renter.user_id == User.id)
            .join(Property, Unit.property_id == Property.id)
            .filter(Property.owner_id == current_user.id)
            .filter(Invoice.id == new_invoice.id)
            .first()
        )

        if not invoice_detail:
            raise HTTPException(status_code=404, detail="Invoice not found after creation.")

        invoice, lease, unit, renter, user = invoice_detail
        invoice_month = invoice.month

        utilities = []
        unit_utils = db.query(UnitUtility).filter(UnitUtility.unit_id == lease.unit_id).all()

        for u in unit_utils:
            util_entry = {
                "utility_type_id": u.utility_type_id,
                "billing_type": u.billing_type,
                "unit_rate": u.unit_rate,
                "fixed_rate": u.fixed_rate,
            }

            if u.billing_type == "per_unit":
                reading = (
                    db.query(MeterReading)
                    .filter(
                        MeterReading.unit_id == lease.unit_id,
                        MeterReading.utility_type_id == u.utility_type_id,
                        extract('month', MeterReading.reading_date) == invoice_month.month,
                        extract('year', MeterReading.reading_date) == invoice_month.year,
                    )
                    .order_by(MeterReading.reading_date.desc())
                    .first()
                )
                if reading:
                    usage = reading.usage or (
                        reading.current_reading - reading.previous_reading
                        if reading.current_reading and reading.previous_reading else 0
                    )
                    util_entry.update({
                        "previous_reading": reading.previous_reading,
                        "current_reading": reading.current_reading,
                        "usage": usage,
                        "cost": usage * u.unit_rate if u.unit_rate else None
                    })
            else:
                util_entry["cost"] = u.fixed_rate

            utilities.append(util_entry)

        return {
            "id": str(invoice.id),
            "lease_id": invoice.lease_id,
            "month": invoice.month,
            "rent": invoice.rent,
            "utility": invoice.utility,
            "total": invoice.total,
            "status": invoice.status,
            "unit_id": lease.unit_id,
            "unit_number": unit.unit_number,
            "renter_name": user.userName,
            "utilities": utilities
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating invoice: {str(e)}")

def get_active_leases(db: Session, current_user):
    try:
        leases = (
            db.query(Lease, Unit, Property)
            .outerjoin(Unit, Lease.unit_id == Unit.id)
            .outerjoin(Property, Unit.property_id == Property.id)
            .filter((Lease.status == "active") & (Property.owner_id == current_user.id))
            .all()
        )

        return [
            {
                "lease_id": lease.id,
                "unit_id": lease.unit_id,
                "unit_number": unit.unit_number,
                "renter_id": lease.renter_id
            }
            for lease, unit, property in leases
        ]

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")
    
def get_invoices(db: Session, current_user):
    try:
        invoices = (
            db.query(Invoice, Lease, Unit, Renter, User, Property)
            .join(Lease, Invoice.lease_id == Lease.id)
            .join(Unit, Lease.unit_id == Unit.id)
            .join(Renter, Lease.renter_id == Renter.id)
            .join(User, Renter.user_id == User.id)
            .join(Property, Unit.property_id == Property.id)
            .filter(
                or_(
                    Property.owner_id == current_user.id,
                    and_(User.id == current_user.id, Lease.status == 'active')
                )
            )
            .order_by(Invoice.month.desc())
            .all()
        )

        result = []
        for invoice, lease, unit, renter, user, property in invoices:
            invoice_month = invoice.month

            # Calculate cost per utility type
            utilities = []
            unit_utils = (
                db.query(UnitUtility)
                .filter(UnitUtility.unit_id == lease.unit_id)
                .all()
            )

            for u in unit_utils:
                util_entry = {
                    "utility_type_id": u.utility_type_id,
                    "billing_type": u.billing_type,
                    "unit_rate": u.unit_rate,
                    "fixed_rate": u.fixed_rate,
                }

                if u.billing_type == "per_unit":
                    reading = (
                        db.query(MeterReading)
                        .filter(
                            MeterReading.unit_id == lease.unit_id,
                            MeterReading.utility_type_id == u.utility_type_id,
                            extract('month', MeterReading.reading_date) == invoice_month.month,
                            extract('year', MeterReading.reading_date) == invoice_month.year,
                        )
                        .order_by(MeterReading.reading_date.desc())
                        .first()
                    )
                    if reading:
                        usage = reading.usage or (
                            reading.current_reading - reading.previous_reading
                            if reading.current_reading and reading.previous_reading else 0
                        )
                        util_entry.update({
                            "previous_reading": reading.previous_reading,
                            "current_reading": reading.current_reading,
                            "usage": usage,
                            "cost": usage * u.unit_rate if u.unit_rate else None
                        })
                else:
                    util_entry["cost"] = u.fixed_rate

                utilities.append(util_entry)

            result.append({
                "id": str(invoice.id),
                "lease_id": invoice.lease_id,
                "month": invoice.month,
                "rent": invoice.rent,
                "utility": invoice.utility,
                "total": invoice.total,
                "status": invoice.status,
                "unit_id": lease.unit_id,
                "unit_number": unit.unit_number,
                "renter_name": user.userName,
                "utilities": utilities
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")
    
def get_invoice_by_id(invoice_id: int, db: Session, current_user):
    RenterUser = aliased(User)
    OwnerUser = aliased(User)
    try:
        invoice_data = (
            db.query(Invoice, Lease, Unit, Renter, RenterUser, Property, OwnerUser)
            .join(Lease, Invoice.lease_id == Lease.id)
            .join(Unit, Lease.unit_id == Unit.id)
            .join(Renter, Lease.renter_id == Renter.id)
            .join(RenterUser, Renter.user_id == RenterUser.id)
            .join(Property, Unit.property_id == Property.id)
            .join(OwnerUser, Property.owner_id == OwnerUser.id)
            .filter(
                Invoice.id == invoice_id,
                or_(
                    Property.owner_id == current_user.id,
                    Renter.user_id == current_user.id
                )
            )
            .first()
        )

        if not invoice_data:
            raise HTTPException(status_code=404, detail="Invoice not found.")

        invoice, lease, unit, renter, renter_user, property, owner_user = invoice_data
        invoice_month = invoice.month

        # Utilities
        utilities = []
        unit_utils = (
            db.query(UnitUtility)
            .filter(UnitUtility.unit_id == lease.unit_id)
            .all()
        )

        for u in unit_utils:
            util_entry = {
                "utility_type_id": u.utility_type_id,
                "billing_type": u.billing_type,
                "unit_rate": u.unit_rate,
                "fixed_rate": u.fixed_rate,
            }

            if u.billing_type == "per_unit":
                reading = (
                    db.query(MeterReading)
                    .filter(
                        MeterReading.unit_id == lease.unit_id,
                        MeterReading.utility_type_id == u.utility_type_id,
                        extract('month', MeterReading.reading_date) == invoice_month.month,
                        extract('year', MeterReading.reading_date) == invoice_month.year,
                    )
                    .order_by(MeterReading.reading_date.desc())
                    .first()
                )
                if reading:
                    usage = reading.usage or (
                        (reading.current_reading or 0) - (reading.previous_reading or 0)
                    )
                    util_entry.update({
                        "previous_reading": reading.previous_reading,
                        "current_reading": reading.current_reading,
                        "usage": usage,
                        "cost": usage * u.unit_rate if u.unit_rate else None
                    })
            else:
                util_entry["cost"] = u.fixed_rate

            utilities.append(util_entry)

        return {
            # Invoice info
            "id": str(invoice.id),
            "lease_id": invoice.lease_id,
            "month": invoice.month,
            "rent": invoice.rent,
            "utility": invoice.utility,
            "total": invoice.total,
            "status": invoice.status,

            # Unit & Property info
            "unit_id": lease.unit_id,
            "unit_number": unit.unit_number,

            "property": {
                "id": property.id,
                "name": property.name,
                "address": property.address,
                "city": property.city,
            },

            # Tenant info
            "tenant": {
                "name": renter_user.userName,
                "email": renter_user.email,
                "phone": renter_user.phoneNumber,
                "address": f"{unit.unit_number}, {property.name}, {property.city}",
            },

            # Landlord
            "landlord": {
                "name": owner_user.userName,
                "email": owner_user.email,
                "phone": owner_user.phoneNumber,
            },

            "utilities": utilities,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching invoice: {str(e)}")
    
def update_invoice(invoice_id, db: Session, data: InvoiceCreate, current_user):
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Check ownership via lease > unit > property (owner only)
        lease = (
            db.query(Lease)
            .join(Unit, Lease.unit_id == Unit.id)
            .join(Property, Unit.property_id == Property.id)
            .filter(Lease.id == invoice.lease_id, Property.owner_id == current_user.id)
            .first()
        )
        if not lease:
            raise HTTPException(status_code=403, detail="Unauthorized to update this invoice")

        # Check for duplicate invoice with same lease_id and month (excluding current)
        new_lease_id = data.lease_id if data.lease_id is not None else invoice.lease_id
        new_month = (
            datetime.strptime(data.month, "%Y-%m-%d").date()
            if data.month is not None
            else invoice.month
        )

        duplicate_invoice = (
            db.query(Invoice)
            .filter(
                Invoice.lease_id == new_lease_id,
                extract('month', Invoice.month) == new_month.month,
                extract('year', Invoice.month) == new_month.year,
                Invoice.id != invoice_id
            )
            .first()
        )

        if duplicate_invoice:
            raise HTTPException(status_code=400, detail="An invoice already exists for this lease and month.")

        # Apply updates
        invoice.lease_id = data.lease_id or invoice.lease_id
        invoice.month = new_month
        invoice.rent = data.rent if data.rent is not None else invoice.rent
        invoice.utility = data.utility if data.utility is not None else invoice.utility
        invoice.total = data.total if data.total is not None else invoice.total
        invoice.status = data.status if data.status is not None else invoice.status

        db.commit()
        db.refresh(invoice)

        invoice_detail = (
            db.query(Invoice, Lease, Unit, Renter, User)
            .join(Lease, Invoice.lease_id == Lease.id)
            .join(Unit, Lease.unit_id == Unit.id)
            .join(Renter, Lease.renter_id == Renter.id)
            .join(User, Renter.user_id == User.id)
            .join(Property, Unit.property_id == Property.id)
            .filter(Property.owner_id == current_user.id)
            .filter(Invoice.id == invoice.id)
            .first()
        )

        if not invoice_detail:
            raise HTTPException(status_code=404, detail="Invoice not found after update.")

        invoice, lease, unit, renter, user = invoice_detail
        invoice_month = invoice.month

        utilities = []
        unit_utils = db.query(UnitUtility).filter(UnitUtility.unit_id == lease.unit_id).all()

        for u in unit_utils:
            util_entry = {
                "utility_type_id": u.utility_type_id,
                "billing_type": u.billing_type,
                "unit_rate": u.unit_rate,
                "fixed_rate": u.fixed_rate,
            }

            if u.billing_type == "per_unit":
                reading = (
                    db.query(MeterReading)
                    .filter(
                        MeterReading.unit_id == lease.unit_id,
                        MeterReading.utility_type_id == u.utility_type_id,
                        extract('month', MeterReading.reading_date) == invoice_month.month,
                        extract('year', MeterReading.reading_date) == invoice_month.year,
                    )
                    .order_by(MeterReading.reading_date.desc())
                    .first()
                )
                if reading:
                    usage = reading.usage or (
                        (reading.current_reading - reading.previous_reading)
                        if reading.current_reading and reading.previous_reading else 0
                    )
                    util_entry.update({
                        "previous_reading": reading.previous_reading,
                        "current_reading": reading.current_reading,
                        "usage": usage,
                        "cost": usage * u.unit_rate if u.unit_rate else None
                    })
            else:
                util_entry["cost"] = u.fixed_rate

            utilities.append(util_entry)

        return {
            "id": str(invoice.id),
            "lease_id": invoice.lease_id,
            "month": invoice.month,
            "rent": invoice.rent,
            "utility": invoice.utility,
            "total": invoice.total,
            "status": invoice.status,
            "unit_id": lease.unit_id,
            "unit_number": unit.unit_number,
            "renter_name": user.userName,
            "utilities": utilities
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating invoice: {str(e)}")
    
def delete_invoice(invoice_id: int, db: Session, current_user):
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Check ownership via property (owner only)
        lease = (
            db.query(Lease)
            .join(Unit, Lease.unit_id == Unit.id)
            .join(Property, Unit.property_id == Property.id)
            .filter(Lease.id == invoice.lease_id, Property.owner_id == current_user.id)
            .first()
        )
        if not lease:
            raise HTTPException(status_code=403, detail="Unauthorized to delete this invoice")

        db.delete(invoice)
        db.commit()

        return {"message": "Invoice deleted successfully"}

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting invoice: {str(e)}")