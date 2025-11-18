# រក្សាទុកព័ត៌មានបន្ថែមសម្រាប់អ្នកជួល។
from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, func
from db.session import Base

class Renter(Base):
    __tablename__ = "t_renters"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("t_users.id"), unique=True, nullable=False)
    id_document = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("t_users.id"), nullable=False)