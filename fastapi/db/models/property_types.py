# សម្រាប់ចាត់ថ្នាក់ប្រភេទអចលនវត្ថុ។
from sqlalchemy import TIMESTAMP, Column, Integer, String, func
from db.session import Base

class PropertyType(Base):
    __tablename__ = "t_property_types"
    id = Column(Integer, primary_key=True, index=True)
    type_code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())