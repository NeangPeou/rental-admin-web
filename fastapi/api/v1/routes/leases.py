from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from controller import leasecontroller, usercontroller
from schemas import leases as lease_schema

router = APIRouter()

@router.post("/create-lease")
def create_lease(data: lease_schema.LeaseCreate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return leasecontroller.create_lease(db, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating lease: {str(e)}")

@router.get("/get-all-leases")
def get_all_leases(db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return leasecontroller.get_all_leases(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leases: {str(e)}")

@router.put("/update-lease/{lease_id}")
def update_lease(lease_id: int, data: lease_schema.LeaseUpdate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return leasecontroller.update_lease(db, lease_id, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating lease: {str(e)}")

@router.delete("/delete-lease/{lease_id}")
def delete_lease(lease_id: int, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return leasecontroller.delete_lease(db, lease_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting lease: {str(e)}")