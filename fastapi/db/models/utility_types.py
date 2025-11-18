from sqlalchemy import TIMESTAMP, Column, Integer, String, func
from db.session import Base

class UtilityType(Base):
    __tablename__ = "t_utility_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())