from sqlalchemy import TIMESTAMP, Column, Integer, Float, Date, ForeignKey, func
from db.session import Base

class MeterReading(Base):
    __tablename__ = "t_meter_readings"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("t_units.id"), nullable=False)
    utility_type_id = Column(Integer, ForeignKey("t_utility_types.id"), nullable=False)
    previous_reading = Column(Float, nullable=False)
    current_reading = Column(Float, nullable=False)
    usage = Column(Float, nullable=False)
    reading_date = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())