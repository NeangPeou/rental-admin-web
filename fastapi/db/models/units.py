# ជាឯកតាជួលមួយៗនៅក្នុងអចលនវត្ថុ។
from sqlalchemy import DECIMAL, TIMESTAMP, Boolean, Column, ForeignKey, Integer, String, func
from db.session import Base

class Unit(Base):
    __tablename__ = "t_units"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("t_properties.id"), nullable=False)
    unit_number = Column(String(50), nullable=False) #លេខឯកតា (ឧ. "A-302")
    floor = Column(Integer, nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    size_sqm = Column(DECIMAL(10, 2), nullable=True)
    rent_price = Column(DECIMAL(12, 2), nullable=True) #តម្លៃជួលប្រចាំខែ
    is_available = Column(Boolean, default=True) #មានស្ថានភាពអាចជួលបាន (true/false)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    