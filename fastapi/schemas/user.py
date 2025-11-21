from typing import Optional
from pydantic import BaseModel, Field

class RegisterUser(BaseModel):
    username: str
    password: str
    phoneNumber: Optional[str] = None
    deviceName: Optional[str] = None
    passport: Optional[str] = None
    idCard: Optional[str] = None 
    address: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    deviceName: Optional[str] = Field(default=None, alias="device_name")
    userAgent: Optional[str] = Field(default=None, alias="user_agent")
    isAdmin: Optional[bool] = False
    isRenter: Optional[bool] = False
    class Config:
        populate_by_name = True

class UserCreate(BaseModel):
    username: str
    password: str
    phoneNumber: Optional[str] = None
    passport: Optional[str] = None
    idCard: Optional[str] = None
    address: Optional[str] = None
    deviceName: Optional[str] = None
    gender: Optional[str] = Field(
        default='Male',
        description="Valid values: Male, Female"
    )

class UserResponse(BaseModel):
    id: int
    userID: Optional[str] = None
    userName: str
    phoneNumber: Optional[str] = None
    passport: Optional[str] = None
    idCard: Optional[str] = None
    address: Optional[str] = None

    gender: Optional[str] = Field(
        default='Male',
        description="Valid values: Male, Female"
    )

    accessToken: Optional[str] = None
    refreshToken: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    user: UserResponse

class UpdateUser(BaseModel):
    id: Optional[int] = None 
    username: Optional[str] = None
    password: Optional[str] = None
    phoneNumber: Optional[str] = None
    passport: Optional[str] = None
    idCard: Optional[str] = None
    address: Optional[str] = None
    deviceName: Optional[str] = None
    gender: Optional[str] = Field(default=None, description="Valid values: Male, Female")

class ChangePasswordRequest(BaseModel):
    id: int
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None
    confirmPassword: Optional[str] = None
    deviceInfo: Optional[str] = None
