

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from controller import usercontroller, utilitytypecontroller
from db.session import get_db
from schemas.utilitytype import UtilityTypeCreate, UtilityTypeOut, UtilityTypeUpdate

router = APIRouter()

@router.post("/create-utility-type")
def create_utility_type(data: UtilityTypeCreate, db: Session = Depends(get_db)):
    return utilitytypecontroller.create_utility_type(db, data)

@router.get("/getallutilitytype")
def get_all(db: Session = Depends(get_db), current_user = Depends(usercontroller.get_current_user)):
    return utilitytypecontroller.get_all_utility_types(db, current_user)

@router.put("/utility-type/{utility_type_id}", response_model = UtilityTypeOut)
def update(utility_type_id: int, data: UtilityTypeUpdate, db: Session = Depends(get_db)):
    return utilitytypecontroller.update_utility_type(db, utility_type_id, data)

@router.delete("/utility-type/{utility_type_id}")
def delete(utility_type_id: int, db: Session = Depends(get_db)):
    return utilitytypecontroller.delete_utility_type(db, utility_type_id)