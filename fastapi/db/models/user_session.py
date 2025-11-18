from sqlalchemy import TIMESTAMP, Column, Integer, String, ForeignKey, Text, func
from db.session import Base

class UserSession(Base):
    __tablename__ = "t_users_session"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("t_users.id"))
    deviceName = Column(String)
    access_token = Column(String, unique=True, index=True)
    refresh_token = Column(String, unique=True, index=True)
    token_expired = Column(TIMESTAMP)
    refresh_expired = Column(TIMESTAMP)
    ip_address = Column(String)
    user_agent = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
