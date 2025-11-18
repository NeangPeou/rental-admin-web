from fastapi import HTTPException
from sqlalchemy.orm import Session
from db.models.inventory import Inventory
from db.models.units import Unit
from db.models.properties import Property
from schemas.inventory import InventoryCreate, InventoryUpdate, InventoryOut

def create_inventory(db: Session, data: InventoryCreate, current_user):
    try:
        # Verify unit exists and belongs to the current user's property
        unit = db.query(Unit).join(Property).filter(
            Unit.id == data.unit_id,
            Property.id == Unit.property_id,
            Property.owner_id == current_user.id
        ).first()
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found or you don't have permission")

        # Check for duplicate item in the same unit
        existing_item = db.query(Inventory).filter(
            Inventory.unit_id == data.unit_id,
            Inventory.item == data.item
        ).first()
        if existing_item:
            raise HTTPException(status_code=400, detail=f"Item '{data.item}' already exists for this unit")

        inventory = Inventory(
            unit_id=data.unit_id,
            item=data.item,
            qty=data.qty,
            condition=data.condition
        )

        db.add(inventory)
        db.commit()
        db.refresh(inventory)

        return InventoryOut(
            id=inventory.id,
            unit_id=inventory.unit_id,
            item=inventory.item,
            qty=inventory.qty,
            condition=inventory.condition,
            unit_number=unit.unit_number
        )
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating inventory item: {str(e)}")

def get_all_inventory(db: Session, current_user):
    try:
        inventory_items = db.query(Inventory, Unit.unit_number).\
            join(Unit, Unit.id == Inventory.unit_id).\
            join(Property, Property.id == Unit.property_id).\
            filter(Property.owner_id == current_user.id).all()

        return [
            InventoryOut(
                id=inventory.id,
                unit_id=inventory.unit_id,
                item=inventory.item,
                qty=inventory.qty,
                condition=inventory.condition,
                unit_number=unit_number
            ) for inventory, unit_number in inventory_items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching inventory items: {str(e)}")

def update_inventory(db: Session, inventory_id: int, data: InventoryUpdate, current_user):
    try:
        # Verify inventory item exists and belongs to a unit owned by the current user
        inventory = db.query(Inventory).join(Unit).join(Property).filter(
            Inventory.id == inventory_id,
            Property.id == Unit.property_id,
            Property.owner_id == current_user.id
        ).first()
        if not inventory:
            raise HTTPException(status_code=404, detail="Inventory item not found or you don't have permission")

        # Check for duplicate item name if updated
        if data.item is not None and data.item != inventory.item:
            existing_item = db.query(Inventory).filter(
                Inventory.unit_id == inventory.unit_id,
                Inventory.item == data.item,
                Inventory.id != inventory_id
            ).first()
            if existing_item:
                raise HTTPException(status_code=400, detail=f"Item '{data.item}' already exists for this unit")

        # Update fields if provided
        if data.unit_id is not None:
            unit = db.query(Unit).join(Property).filter(
                Unit.id == data.unit_id,
                Property.id == Unit.property_id,
                Property.owner_id == current_user.id
            ).first()
            if not unit:
                raise HTTPException(status_code=404, detail="Unit not found or you don't have permission")
            inventory.unit_id = data.unit_id

        if data.item is not None:
            inventory.item = data.item
        if data.qty is not None:
            inventory.qty = data.qty
        if data.condition is not None:
            inventory.condition = data.condition

        db.commit()
        db.refresh(inventory)

        unit = db.query(Unit).filter(Unit.id == inventory.unit_id).first()
        return InventoryOut(
            id=inventory.id,
            unit_id=inventory.unit_id,
            item=inventory.item,
            qty=inventory.qty,
            condition=inventory.condition,
            unit_number=unit.unit_number if unit else None
        )
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating inventory item: {str(e)}")

def delete_inventory(db: Session, inventory_id: int, current_user):
    try:
        # Verify inventory item exists and belongs to a unit owned by the current user
        inventory = db.query(Inventory).join(Unit).join(Property).filter(
            Inventory.id == inventory_id,
            Property.id == Unit.property_id,
            Property.owner_id == current_user.id
        ).first()
        if not inventory:
            raise HTTPException(status_code=404, detail="Inventory item not found or you don't have permission")

        unit = db.query(Unit).filter(Unit.id == inventory.unit_id).first()
        result = InventoryOut(
            id=inventory.id,
            unit_id=inventory.unit_id,
            item=inventory.item,
            qty=inventory.qty,
            condition=inventory.condition,
            unit_number=unit.unit_number if unit else None
        )

        db.delete(inventory)
        db.commit()

        return result
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting inventory item: {str(e)}")