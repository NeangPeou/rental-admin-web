from sqlalchemy import TIMESTAMP, Column, Integer, String, ForeignKey, func
from db.session import Base

class Inventory(Base):
    __tablename__ = "t_inventory"
    id = Column(Integer, primary_key=True, index=True) 
    unit_id = Column(Integer, ForeignKey("t_units.id"), nullable=False)
    item = Column(String(100), nullable=False)
    qty = Column(Integer, default=1)
    condition = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())