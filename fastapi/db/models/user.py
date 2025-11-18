from sqlalchemy import TIMESTAMP, Column, Integer, String, ForeignKey, Text, func
from db.session import Base

class User(Base):
    __tablename__ = "t_users"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("t_roles.id"))
    userName = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phoneNumber = Column(String, index=True, nullable=True)
    password = Column(Text)
    passport = Column(String, nullable=True)
    idCard = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    gender = Column(String, nullable=True, default='Male')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
