# រក្សាទុកឯកសារសំខាន់ៗដូចជា កិច្ចសន្យា និងអត្តសញ្ញាណប័ណ្ណ។
from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Text, func
from db.session import Base

class Document(Base):
    __tablename__ = "t_documents"
    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("t_leases.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(Text, nullable=False)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())