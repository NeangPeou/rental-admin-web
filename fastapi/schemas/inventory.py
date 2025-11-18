# type: ignore
from pydantic import BaseModel, constr, conint
from typing import Optional

class InventoryBase(BaseModel):
    unit_id: int
    item: constr(min_length=1, max_length=100) # Matches item field in Inventory model
    qty: conint(ge=1)  # Quantity must be at least 1
    condition: constr(min_length=1, max_length=50)  # Matches condition field in Inventory model

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    unit_id: Optional[int] = None
    item: Optional[constr(min_length=1, max_length=100)] = None
    qty: Optional[conint(ge=1)] = None
    condition: Optional[constr(min_length=1, max_length=50)] = None

class InventoryOut(InventoryBase):
    id: int
    unit_number: Optional[str] = None  # From Unit model, included in response

    class Config:
        from_attributes = True  # Enables compatibility with SQLAlchemy models