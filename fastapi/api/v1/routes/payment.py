from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from controller import paymentcontroller, usercontroller
from schemas import payment as payment_schema

router = APIRouter()

@router.post("/payment")
def create_payment(data: payment_schema.PaymentCreate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return paymentcontroller.create_payment(db, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")


@router.get("/payment")
def get_all_payments(db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return paymentcontroller.get_all_payments(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payments: {str(e)}")


@router.put("/payment/{payment_id}")
def update_payment(payment_id: int, data: payment_schema.PaymentUpdate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return paymentcontroller.update_payment(db, payment_id, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating payment: {str(e)}")


@router.delete("/payment/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return paymentcontroller.delete_payment(db, payment_id, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting payment: {str(e)}")
