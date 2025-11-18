from sqlalchemy import TIMESTAMP, Column, Integer, Float, String, ForeignKey, func
from db.session import Base

class UnitUtility(Base):
    __tablename__ = "t_unit_utilities"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("t_units.id"), nullable=False)
    utility_type_id = Column(Integer, ForeignKey("t_utility_types.id"), nullable=False)
    billing_type = Column(String(50), nullable=False)  # fixed or per_unit
    fixed_rate = Column(Float, nullable=True)
    unit_rate = Column(Float, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())