# អនុញ្ញាតឲ្យមានការប្រាស្រ័យទាក់ទងរវាងអ្នកគ្រប់គ្រង, ម្ចាស់ផ្ទះ និងអ្នកជួល។
from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Integer, Text, func
from db.session import Base

class Message(Base):
    __tablename__ = "t_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("t_users.id"), nullable=False) #លេខសម្គាល់អ្នកផ្ញើសារ
    receiver_id = Column(Integer, ForeignKey("t_users.id"), nullable=False) #លេខសម្គាល់អ្នកទទួលសារ
    content = Column(Text, nullable=False)
    sent_at = Column(TIMESTAMP, server_default=func.now())
    is_read = Column(Boolean, default=False) #ស្ថានភាពអាន (true=បានអាន, false=មិនបានអាន)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())