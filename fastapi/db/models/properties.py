# រក្សាទុកអចលនវត្ថុដែលម្ចាស់ផ្ទះកាន់កាប់។
from sqlalchemy import DECIMAL, TIMESTAMP, Column, ForeignKey, Integer, String, Text, func
from db.session import Base

class Property(Base):
    __tablename__ = "t_properties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=True)
    province = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    latitude = Column(DECIMAL(9,6), nullable=True)
    longitude = Column(DECIMAL(9,6), nullable=True)
    description = Column(Text, nullable=True)
    type_id = Column(Integer, ForeignKey("t_property_types.id"), nullable=False) #លេខសម្គាល់ប្រភេទ (ភ្ជាប់ទៅ property_types)
    owner_id = Column(Integer, ForeignKey("t_users.id"), nullable=False) #លេខសម្គាល់ម្ចាស់ផ្ទះ (ភ្ជាប់ទៅ users)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())