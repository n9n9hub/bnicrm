from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BNI CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Corporate Routes ---

@app.post("/corporates/", response_model=schemas.Corporate)
def create_corporate(corporate: schemas.CorporateCreate, db: Session = Depends(get_db)):
    db_corp = db.query(models.Corporate).filter(models.Corporate.id == corporate.id).first()
    if db_corp:
        raise HTTPException(status_code=400, detail="Corporate ID already registered")
    db_corp = models.Corporate(**corporate.model_dump())
    db.add(db_corp)
    db.commit()
    db.refresh(db_corp)
    return db_corp

@app.get("/corporates/", response_model=list[schemas.Corporate])
def read_corporates(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return db.query(models.Corporate).offset(skip).limit(limit).all()

@app.get("/corporates/{corp_id}", response_model=schemas.CorporateWithContacts)
def read_corporate(corp_id: str, db: Session = Depends(get_db)):
    db_corp = db.query(models.Corporate).filter(models.Corporate.id == corp_id).first()
    if db_corp is None:
        raise HTTPException(status_code=404, detail="Corporate not found")
    return db_corp

@app.put("/corporates/{corp_id}", response_model=schemas.Corporate)
def update_corporate(corp_id: str, corporate: schemas.CorporateBase, db: Session = Depends(get_db)):
    db_corp = db.query(models.Corporate).filter(models.Corporate.id == corp_id).first()
    if db_corp is None:
        raise HTTPException(status_code=404, detail="Corporate not found")
    for key, value in corporate.model_dump().items():
        setattr(db_corp, key, value)
    db.commit()
    db.refresh(db_corp)
    return db_corp

@app.delete("/corporates/{corp_id}")
def delete_corporate(corp_id: str, db: Session = Depends(get_db)):
    db_corp = db.query(models.Corporate).filter(models.Corporate.id == corp_id).first()
    if db_corp is None:
        raise HTTPException(status_code=404, detail="Corporate not found")
    db.delete(db_corp)
    db.commit()
    return {"message": "Deleted successfully"}

# --- Contact Routes ---

@app.post("/contacts/", response_model=schemas.Contact)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact.id).first()
    if db_contact:
        raise HTTPException(status_code=400, detail="Contact ID already registered")
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.get("/contacts/", response_model=list[schemas.Contact])
def read_contacts(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return db.query(models.Contact).offset(skip).limit(limit).all()

@app.get("/contacts/{contact_id}", response_model=schemas.Contact)
def read_contact(contact_id: str, db: Session = Depends(get_db)):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@app.put("/contacts/{contact_id}", response_model=schemas.Contact)
def update_contact(contact_id: str, contact: schemas.ContactBase, db: Session = Depends(get_db)):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    for key, value in contact.model_dump().items():
        setattr(db_contact, key, value)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str, db: Session = Depends(get_db)):
    db_contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(db_contact)
    db.commit()
    return {"message": "Deleted successfully"}
