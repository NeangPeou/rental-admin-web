from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from controller import rentercontroller, usercontroller

router = APIRouter()

@router.get("/get-all-renters")
def get_all_renters(db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    return rentercontroller.get_all_renters(db, current_user)