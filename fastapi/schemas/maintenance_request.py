from datetime import date
from typing import Optional
from pydantic import BaseModel


class MaintenanceRequestCreate(BaseModel):
    unit_id: int
    issue_title: str = None
    description: Optional[str] = None
    request_date: date
    resolved_date: Optional[date] = None
    status: str = None
    renter_id: Optional[int] = None
    unit_number: Optional[str] = None


class MaintenanceRequestUpdate(BaseModel):
    unit_id: Optional[int] = None
    issue_title: Optional[str] = None
    description: Optional[str] = None
    request_date: Optional[date] = None
    status: Optional[str] = None
    resolved_date: Optional[date] = None
    renter_id: Optional[int] = None
    unit_number: Optional[str] = None


class MaintenanceRequestResponse(BaseModel):
    id: int
    unit_id: int
    issue_title: str
    description: Optional[str]
    request_date: date
    status: str
    resolved_date: Optional[date] = None
    renter_id: Optional[int] = None
    unit_number: Optional[str] = None

    model_config = {
        "from_attributes": True
    }