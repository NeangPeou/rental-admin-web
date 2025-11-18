from sqlalchemy import TIMESTAMP, Column, Integer, Float, String, Date, ForeignKey, func
from db.session import Base

class Invoice(Base):
    __tablename__ = "t_invoices"
    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("t_leases.id"), nullable=False)
    month = Column(Date, nullable=False)
    rent = Column(Float, nullable=False)
    utility = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String(50), nullable=False)  # e.g. 'paid', 'unpaid', 'partial'
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())