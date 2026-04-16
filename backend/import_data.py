import pandas as pd
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import math

def clean_val(val):
    if pd.isna(val) or val == 'nan':
        return None
    if isinstance(val, float) and math.isnan(val):
        return None
    return str(val).strip()

def import_data():
    db = SessionLocal()
    
    print("Importing Corporates...")
    df_corp = pd.read_excel('/Users/charmiem4/AI/AI-Notes/BNI_CRM/法人名單.xlsx')
    corp_count = 0
    for index, row in df_corp.iterrows():
        corp_id = clean_val(row.get('客戶編號'))
        if not corp_id:
            continue
            
        corp = db.query(models.Corporate).filter(models.Corporate.id == corp_id).first()
        if not corp:
            corp = models.Corporate(id=corp_id)
        
        corp.name = clean_val(row.get('客戶名稱')) or "未命名"
        corp.short_name = clean_val(row.get('客戶簡稱'))
        corp.billing_region = clean_val(row.get('帳單縣市及鄉鎮市區'))
        
        tax_id_val = row.get('統一編號')
        if pd.notna(tax_id_val):
            if isinstance(tax_id_val, float):
                tax_id_val = str(int(tax_id_val))
            corp.tax_id = str(tax_id_val).strip()
        
        corp.phone = clean_val(row.get('電話號碼'))
        corp.description = clean_val(row.get('描述'))
        corp.category = clean_val(row.get('類別'))
        
        db.add(corp)
        corp_count += 1
    
    db.commit()
    print(f"Corporate import finished. Imported {corp_count} records.")
    
    print("Importing Contacts...")
    df_contact = pd.read_excel('/Users/charmiem4/AI/AI-Notes/BNI_CRM/自然人名單.xlsx')
    
    corps = db.query(models.Corporate).all()
    corp_map = {c.name.strip(): c.id for c in corps if c.name}
    
    contact_count = 0
    for index, row in df_contact.iterrows():
        raw_contact_id = row.get('聯絡人編號')
        if pd.isna(raw_contact_id):
            continue
            
        # Parse Contact ID
        if isinstance(raw_contact_id, float) or isinstance(raw_contact_id, int):
            c_id = str(int(raw_contact_id))
        else:
            c_id = str(raw_contact_id).strip()
            
        contact_id = c_id.zfill(5)
            
        contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
        if not contact:
            contact = models.Contact(id=contact_id)
            
        contact.name = clean_val(row.get('聯絡人姓名')) or "未命名"
        
        comp_name = clean_val(row.get('公司名稱'))
        if comp_name and comp_name in corp_map:
            contact.corporate_id = corp_map[comp_name]
            
        contact.remarks = clean_val(row.get('備註'))
        contact.address = clean_val(row.get('地址'))
        contact.mobile = clean_val(row.get('手機'))
        contact.title = clean_val(row.get('職稱'))
        contact.email = clean_val(row.get('E-mail'))
        contact.phone = clean_val(row.get('電話'))
        
        db.add(contact)
        contact_count += 1
        
    db.commit()
    print(f"Contact import finished. Imported {contact_count} records.")
    db.close()

if __name__ == "__main__":
    import_data()
