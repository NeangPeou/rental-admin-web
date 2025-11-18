# ត្រួតពិនិត្យការជួលឯកតា និងសម្គាល់រយៈពេលជួល។
from sqlalchemy import DECIMAL, TIMESTAMP, Column, Date, ForeignKey, Integer, String, func
from db.session import Base

class Lease(Base):
    __tablename__ = "t_leases"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("t_units.id"), nullable=False) #លេខសម្គាល់ឯកតាជួលដែលបានជួល
    renter_id = Column(Integer, ForeignKey("t_renters.id"), nullable=False) #លេខសម្គាល់អ្នកជួល
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    rent_amount = Column(DECIMAL(12, 2), nullable=False) #តម្លៃជួល
    deposit_amount = Column(DECIMAL(12, 2), nullable=True) #ប្រាក់ដាក់ធានា
    status = Column(String(20), nullable=False) #ស្ថានភាពកិច្ចសន្យា (active=កំពុងប្រើ, terminated=បញ្ចប់, expired=ផុតកំណត់)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())