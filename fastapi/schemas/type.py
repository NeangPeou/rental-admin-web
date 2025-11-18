from pydantic import BaseModel
from typing import Optional

class TypeCreate(BaseModel):
    type_code: str
    name: str

class TypeUpdate(BaseModel):
    type_code: Optional[str] = None
    name: Optional[str] = None

class TypeOut(BaseModel):
    id: int
    type_code: str
    name: str

    model_config = {
        "from_attributes": True
    }
