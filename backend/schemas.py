from pydantic import BaseModel
from typing import List, Optional
import datetime

class ContactBase(BaseModel):
    name: str
    corporate_id: Optional[str] = None
    remarks: Optional[str] = None
    address: Optional[str] = None
    mobile: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ContactCreate(ContactBase):
    id: str

class Contact(ContactBase):
    id: str
    
    class Config:
        from_attributes = True

class CorporateBase(BaseModel):
    name: str
    short_name: Optional[str] = None
    billing_region: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    created_date: Optional[datetime.date] = None

class CorporateCreate(CorporateBase):
    id: str

class Corporate(CorporateBase):
    id: str
    
    class Config:
        from_attributes = True

class CorporateWithContacts(Corporate):
    contacts: List[Contact] = []
