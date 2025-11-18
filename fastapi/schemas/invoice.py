from pydantic import BaseModel
from datetime import date
from typing import Optional

class InvoiceCreate(BaseModel):
    lease_id: Optional[str] = None
    month: Optional[str] = None
    rent: Optional[str] = None
    utility: Optional[str] = None
    total: Optional[str] = None
    status: Optional[str] = None

class InvoiceOut(BaseModel):
    id: int
    lease_id: int
    month: str
    rent: str
    utility: str
    total: str
    status: str

    model_config = {
        "from_attributes": True
    }
