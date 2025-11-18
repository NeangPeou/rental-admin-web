from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from controller import unitcontroller, usercontroller
from schemas import units as unit_schema

router = APIRouter()

@router.post("/create-unit")
def create_property_unit(data: unit_schema.PropertyUnitCreate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return unitcontroller.create_property_unit(db, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating unit: {str(e)}")

@router.get("/get-all-units")
def get_all_property_units(db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return unitcontroller.get_all_units(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching units: {str(e)}")

@router.put("/update-unit/{unit_id}")
def update_property_unit(unit_id: int, data: unit_schema.PropertyUnitUpdate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return unitcontroller.update_property_unit(db, unit_id, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating unit: {str(e)}")

@router.delete("/delete-unit/{unit_id}")
def delete_property_unit(unit_id: int, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return unitcontroller.delete_property_unit(db, unit_id, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting unit: {str(e)}")
