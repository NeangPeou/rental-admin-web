from typing import Optional
from pydantic import BaseModel
from tomlkit import datetime


class SystemLogResponse(BaseModel):
    id: int
    user_id: int
    action: Optional[str] = None
    log_type: Optional[str] = None
    message: Optional[str] = None
    hostName: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
