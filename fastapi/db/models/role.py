from sqlalchemy import TIMESTAMP, Column, Integer, String, Text, func, event
from db.session import Base

class Role(Base):
    __tablename__ = "t_roles"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

def insert_default_roles(target, connection, **kw):
    default_roles = [
        {"role": "Admin", "description": "Administrator with full access"},
        {"role": "Owner", "description": "Property owner"},
        {"role": "Renter", "description": "Tenant renting the unit"},
    ]
    connection.execute(target.insert(), default_roles)
event.listen(Role.__table__, 'after_create', insert_default_roles)