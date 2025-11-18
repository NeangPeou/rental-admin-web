from typing import Optional
from pydantic import BaseModel

class PaymentCreate(BaseModel):
    lease_id: int
    payment_date: str
    amount_paid: float
    payment_method_id: str
    receipt_url: str
    electricity: Optional[str] = None
    water: Optional[str] = None

class PaymentUpdate(PaymentCreate):
    pass

class PaymentOut(PaymentCreate):
    id: int
    created_by: int

    class Config:
        orm_mode = True
