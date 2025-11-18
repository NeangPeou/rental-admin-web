from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from controller import usercontroller
from db.models import renters, role, units, user
from db.models.maintenance_requests import MaintenanceRequest
from db.models.properties import Property
from db.session import get_db
from schemas.maintenance_request import MaintenanceRequestCreate, MaintenanceRequestResponse, MaintenanceRequestUpdate


def create_maintenance_request(db: Session, data: MaintenanceRequestCreate, current_user: user.User):
    try:
        # Check if user is Owner or Renter
        role_obj = db.query(role.Role).filter(role.Role.id == current_user.role_id).first()
        if not role_obj or role_obj.role not in ["Owner", "Renter"]:
            raise HTTPException(status_code=403, detail="Only Owners or Renters can create maintenance requests")

        unit = db.query(units.Unit).filter(units.Unit.id == data.unit_id).first()
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")

        renter_id_to_use = None
        if role_obj.role == "Renter":
            renter = db.query(renters.Renter).filter(renters.Renter.user_id == current_user.id).first()
            if not renter:
                raise HTTPException(status_code=404, detail="Renter profile not found")
            renter_id_to_use = renter.id
        if role_obj.role == "Owner":
            from db.models.properties import Property
            property_obj = db.query(Property).filter(Property.id == unit.property_id, Property.owner_id == current_user.id).first()
            if not property_obj:
                raise HTTPException(status_code=403, detail="You do not own the property this unit belongs to")
        # Check for duplicate maintenance request
        existing_request = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.unit_id == data.unit_id,
            MaintenanceRequest.issue_title == data.issue_title,
            MaintenanceRequest.request_date == data.request_date,
            MaintenanceRequest.status.in_(["pending", "in_progress"])
        ).first()
        if existing_request:
            raise HTTPException(status_code=400, detail="A similar maintenance request already exists for this unit and issue")

        new_request = MaintenanceRequest(
            unit_id=data.unit_id,
            renter_id=renter_id_to_use,
            issue_title=data.issue_title,
            description=data.description,
            request_date=data.request_date,
            status=data.status,
            resolved_date=data.resolved_date,
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        return MaintenanceRequestResponse(
            id=new_request.id,
            unit_id=new_request.unit_id,
            issue_title=new_request.issue_title,
            description=new_request.description,
            request_date=new_request.request_date,
            status=new_request.status,
            resolved_date=new_request.resolved_date,
            renter_id=new_request.renter_id,
            unit_number=unit.unit_number
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating maintenance request: {str(e)}")

def get_all_maintenance_requests(db: Session, current_user: user.User = None):
    try:
        if current_user is None:
            # For WebSocket init, return all requests
            query = db.query(MaintenanceRequest, units.Unit.unit_number).join(
                units.Unit, units.Unit.id == MaintenanceRequest.unit_id
            )
            requests = query.order_by(MaintenanceRequest.id.desc()).all()
            
            return [
                MaintenanceRequestResponse(
                    id=req.id,
                    unit_id=req.unit_id,
                    issue_title=req.issue_title,
                    description=req.description,
                    request_date=req.request_date,
                    status=req.status,
                    resolved_date=req.resolved_date,
                    renter_id=req.renter_id,
                    unit_number=unit_number
                ) for req, unit_number in requests
            ]
        role_obj = db.query(role.Role).filter(role.Role.id == current_user.role_id).first()
        if not role_obj or role_obj.role not in ["Owner", "Renter"]:
            raise HTTPException(status_code=403, detail="Only Owners or Renters can view maintenance requests")

        query = db.query(MaintenanceRequest, units.Unit.unit_number).join(
            units.Unit, units.Unit.id == MaintenanceRequest.unit_id
        )

        if role_obj.role == "Renter":
            renter = db.query(renters.Renter).filter(renters.Renter.user_id == current_user.id).first()
            if not renter:
                raise HTTPException(status_code=404, detail="Renter profile not found")
            query = query.filter(MaintenanceRequest.renter_id == renter.id)
        else:  # Owner
            query = query.join(Property, Property.id == units.Unit.property_id).filter(
                Property.owner_id == current_user.id
            )

        requests = query.order_by(MaintenanceRequest.id.desc()).all()
        
        return [
            MaintenanceRequestResponse(
                id=req.id,
                unit_id=req.unit_id,
                issue_title=req.issue_title,
                description=req.description,
                request_date=req.request_date,
                status=req.status,
                resolved_date=req.resolved_date,
                renter_id=req.renter_id,
                unit_number=unit_number
            ) for req, unit_number in requests
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching maintenance requests: {str(e)}")


def update_maintenance_request(db: Session, request_id: int, data: MaintenanceRequestUpdate, current_user: user.User):
    try:
        role_obj = db.query(role.Role).filter(role.Role.id == current_user.role_id).first()
        if not role_obj or role_obj.role not in ["Owner", "Renter"]:
            raise HTTPException(status_code=403, detail="Only Owners or Renters can update maintenance requests")

        request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Maintenance request not found")

        # Authorization checks
        if role_obj.role == "Renter":
            renter = db.query(renters.Renter).filter(renters.Renter.user_id == current_user.id).first()
            if not renter:
                raise HTTPException(status_code=404, detail="Renter profile not found")
            if request.renter_id != renter.id:
                raise HTTPException(status_code=403, detail="You can only update your own maintenance requests")
        else:  # Owner
            from db.models.properties import Property
            unit = db.query(units.Unit).filter(units.Unit.id == request.unit_id).first()
            if not unit:
                raise HTTPException(status_code=404, detail="Unit not found")
            property_obj = db.query(Property).filter(Property.id == unit.property_id, Property.owner_id == current_user.id).first()
            if not property_obj:
                raise HTTPException(status_code=403, detail="You do not own the property this unit belongs to")

        if data.unit_id is not None:
            unit = db.query(units.Unit).filter(units.Unit.id == data.unit_id).first()
            if not unit:
                raise HTTPException(status_code=404, detail="Unit not found")
            request.unit_id = data.unit_id

        if data.issue_title is not None:
            request.issue_title = data.issue_title
        if data.description is not None:
            request.description = data.description
        if data.request_date is not None:
            request.request_date = data.request_date
        if data.status is not None:
            request.status = data.status
        if data.resolved_date is not None:
            request.resolved_date = data.resolved_date

        db.commit()
        db.refresh(request)

        unit = db.query(units.Unit).filter(units.Unit.id == request.unit_id).first()
        return MaintenanceRequestResponse(
            id=request.id,
            unit_id=request.unit_id,
            issue_title=request.issue_title,
            description=request.description,
            request_date=request.request_date,
            status=request.status,
            resolved_date=request.resolved_date,
            renter_id=request.renter_id,
            unit_number=unit.unit_number if unit else None
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating maintenance request: {str(e)}")

def delete_maintenance_request(db: Session, request_id: int, current_user: user.User):
    try:
        role_obj = db.query(role.Role).filter(role.Role.id == current_user.role_id).first()
        if not role_obj or role_obj.role not in ["Owner", "Renter"]:
            raise HTTPException(status_code=403, detail="Only Owners or Renters can delete maintenance requests")

        request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=404, detail="Maintenance request not found")

        # Authorization checks
        if role_obj.role == "Renter":
            renter = db.query(renters.Renter).filter(renters.Renter.user_id == current_user.id).first()
            if not renter:
                raise HTTPException(status_code=404, detail="Renter profile not found")
            if request.renter_id != renter.id:
                raise HTTPException(status_code=403, detail="You can only delete your own maintenance requests")
        else:  # Owner
            from db.models.properties import Property
            unit = db.query(units.Unit).filter(units.Unit.id == request.unit_id).first()
            if not unit:
                raise HTTPException(status_code=404, detail="Unit not found")
            property_obj = db.query(Property).filter(Property.id == unit.property_id, Property.owner_id == current_user.id).first()
            if not property_obj:
                raise HTTPException(status_code=403, detail="You do not own the property this unit belongs to")

        db.delete(request)
        db.commit()
        return {"detail": "Maintenance request deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting maintenance request: {str(e)}")