import os
import requests
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or "請在這裡填入" in SUPABASE_KEY:
    print("錯誤: 請先在 backend/.env 中正確填寫 SUPABASE_KEY。")
    exit(1)

def migrate():
    db = SessionLocal()
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    # 1. 搬移 Corporates
    corporates = db.query(models.Corporate).all()
    corp_data = []
    for c in corporates:
        corp_data.append({
            "id": c.id,
            "name": c.name,
            "short_name": c.short_name,
            "billing_region": c.billing_region,
            "tax_id": c.tax_id,
            "phone": c.phone,
            "description": c.description,
            "category": c.category,
            "created_date": str(c.created_date) if c.created_date else None
        })
    
    if corp_data:
        print(f"正在上傳 {len(corp_data)} 筆法人資料至 Supabase...")
        res = requests.post(f"{SUPABASE_URL}/rest/v1/corporates", json=corp_data, headers=headers)
        if res.status_code in [200, 201]:
            print("法人資料上傳成功！")
        else:
            print("法人上傳失敗:", res.text)

    # 2. 搬移 Contacts
    contacts = db.query(models.Contact).all()
    contact_data = []
    for c in contacts:
        contact_data.append({
            "id": c.id,
            "name": c.name,
            "corporate_id": c.corporate_id,
            "remarks": c.remarks,
            "address": c.address,
            "mobile": c.mobile,
            "title": c.title,
            "email": c.email,
            "phone": c.phone
        })
        
    if contact_data:
        print(f"正在上傳 {len(contact_data)} 筆自然人資料至 Supabase...")
        res = requests.post(f"{SUPABASE_URL}/rest/v1/contacts", json=contact_data, headers=headers)
        if res.status_code in [200, 201]:
            print("自然人資料上傳成功！")
        else:
            print("自然人上傳失敗:", res.text)

    db.close()
    print("資料庫大搬家任務完成！")

if __name__ == "__main__":
    migrate()
