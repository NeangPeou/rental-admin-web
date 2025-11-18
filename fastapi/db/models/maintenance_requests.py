# អនុញ្ញាតឱ្យអ្នកជួលរាយការណ៍បញ្ហា និងតាមដានការជួសជុល។
from sqlalchemy import TIMESTAMP, Column, Date, ForeignKey, Integer, String, Text, func
from db.session import Base

class MaintenanceRequest(Base):
    __tablename__ = "t_maintenance_requests"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("t_units.id"), nullable=False) #លេខសម្គាល់ឯកតាដែលមានបញ្ហា
    renter_id = Column(Integer, ForeignKey("t_renters.id"), nullable=False)
    issue_title = Column(String(150), nullable=False) #ចំណងជើងបញ្ហា (ឧ. “ក្បាលកំប៉ុងដាក់ទឹករលក”)
    description = Column(Text, nullable=True)
    request_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False) #ស្ថានភាពសំណើ (pending, in_progress, resolved)
    resolved_date = Column(Date, nullable=True) #ថ្ងៃដែលបានជួសជុលរួច
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())