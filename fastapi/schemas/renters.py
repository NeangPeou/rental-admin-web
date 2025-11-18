from pydantic import BaseModel
from typing import Optional

class RenterOut(BaseModel):
    id: int
    user_id: int
    id_document: Optional[str] = None
    username: Optional[str] = None
    phoneNumber: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None

    class Config:
        from_attributes = True