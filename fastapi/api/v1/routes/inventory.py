

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from controller import inventorycontroller, usercontroller
from db.session import get_db
from schemas.inventory import InventoryCreate, InventoryUpdate


router = APIRouter()

@router.get("/get-all-inventory")
def get_all_inventory(db: Session = Depends(get_db), current_user = Depends(usercontroller.get_current_user)):
    try:
        return inventorycontroller.get_all_inventory(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching inventory: {str(e)}")

@router.post("/create-inventory")
def create_inventory(data: InventoryCreate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return inventorycontroller.create_inventory(db, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creatind inventory: {str(e)}")
    
@router.put("/update-inventory/{inventory_id}")
def update_inventory(inventory_id: int, data: InventoryUpdate, db:Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return inventorycontroller.update_inventory(db, inventory_id, data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error update inventory: {str(e)}")
    
@router.delete("/delete-inventory/{inventory_id}")
def delete_inventory(inventory_id: int, db:Session=Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        return inventorycontroller.delete_inventory(db, inventory_id, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting inventory: {str(e)}")
