from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from controller import propertycontroller, usercontroller
from schemas import property as property_schema

router = APIRouter()

@router.post("/create-property")
def create_property(data: property_schema.PropertyCreate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return propertycontroller.create_property(db, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating property: {str(e)}")

@router.get("/getallproperty")
def get_all_properties(db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    return propertycontroller.get_all_properties(db, current_user)

@router.put("/property/{property_id}")
def update_property(property_id: int, data: property_schema.PropertyUpdate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    return propertycontroller.update_property(db, property_id, data, current_user)

@router.delete("/property/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    return propertycontroller.delete_property(db, property_id, current_user)
