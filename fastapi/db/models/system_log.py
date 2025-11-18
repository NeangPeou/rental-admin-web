from sqlalchemy import TIMESTAMP, Column, Integer, String, ForeignKey, Text, func
from db.session import Base

class SystemLog(Base):
    __tablename__ = "t_system_log"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("t_users.id"))
    action = Column(String)
    logType = Column(String)
    message = Column(Text)
    hostName = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
