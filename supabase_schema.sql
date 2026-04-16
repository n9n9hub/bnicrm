-- Supabase Schema for BNI CRM

-- 1. 建立「法人資料」表
CREATE TABLE corporates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    billing_region TEXT,
    tax_id TEXT,
    phone TEXT,
    description TEXT,
    category TEXT,
    created_date DATE DEFAULT CURRENT_DATE
);

-- 2. 建立「自然人資料」表
CREATE TABLE contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    corporate_id TEXT REFERENCES corporates(id) ON DELETE CASCADE,
    remarks TEXT,
    address TEXT,
    mobile TEXT,
    title TEXT,
    email TEXT,
    phone TEXT
);

-- 3. 設定權限 (Row Level Security) 
-- (為方便 MVP 測試與您的本地上線，目前開啟公開讀寫權限。上線正式環境後建議改為 Authenticated)
ALTER TABLE corporates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on corporates" ON corporates FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on corporates" ON corporates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on corporates" ON corporates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on corporates" ON corporates FOR DELETE USING (true);

CREATE POLICY "Allow public read access on contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on contacts" ON contacts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on contacts" ON contacts FOR DELETE USING (true);
