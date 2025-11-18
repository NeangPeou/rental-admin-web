from pydantic import BaseModel
from typing import Optional

class UtilityTypeCreate(BaseModel):
    name: str

class UtilityTypeUpdate(BaseModel):
    name: Optional[str] = None

class UtilityTypeOut(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }