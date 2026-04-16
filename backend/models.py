from sqlalchemy import Column, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Corporate(Base):
    __tablename__ = "corporates"

    id = Column(String, primary_key=True, index=True) # e.g. C-00085
    name = Column(String, index=True)
    short_name = Column(String)
    billing_region = Column(String)
    tax_id = Column(String)
    phone = Column(String)
    description = Column(Text)
    category = Column(String)
    created_date = Column(Date, default=datetime.date.today)

    contacts = relationship("Contact", back_populates="corporate", cascade="all, delete-orphan")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String, primary_key=True, index=True) # e.g. 00113
    name = Column(String, index=True)
    corporate_id = Column(String, ForeignKey("corporates.id"))
    remarks = Column(Text)
    address = Column(String)
    mobile = Column(String)
    title = Column(String)
    email = Column(String)
    phone = Column(String)

    corporate = relationship("Corporate", back_populates="contacts")
