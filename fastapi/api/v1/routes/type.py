from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from controller import typecontroller
from controller import usercontroller
from schemas import type as type_schema

router = APIRouter()

@router.post("/create-type")
def create_type(data: type_schema.TypeCreate, db: Session = Depends(get_db)):
    return typecontroller.create_type(db, data)

@router.get("/getalltype")
def get_all(db: Session = Depends(get_db), current_user = Depends(usercontroller.get_current_user)):
    return typecontroller.get_all_types(db, current_user)

@router.put("/type/{type_id}", response_model=type_schema.TypeOut)
def update(type_id: int, data: type_schema.TypeUpdate, db: Session = Depends(get_db)):
    return typecontroller.update_type(db, type_id, data)

@router.delete("/type/{type_id}")
def delete(type_id: int, db: Session = Depends(get_db)):
    return typecontroller.delete_type(db, type_id)
