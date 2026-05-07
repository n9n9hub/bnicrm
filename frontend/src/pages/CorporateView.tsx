import { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { supabase } from '../supabaseClient';
import Papa from 'papaparse';
export default function CorporateView() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', short_name: '', billing_region: '', address: '', tax_id: '', phone: '', category: ''
  });

  const fetchCorporates = async () => {
    try {
      const { data, error } = await supabase.from('corporates').select('*');
      if (error) throw error;
      setRows(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCorporates(); }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const columnMapping: Record<string, string> = {
    'id': '客戶編號',
    'name': '客戶名稱',
    'short_name': '客戶簡稱',
    'billing_region': '帳單縣市分區',
    'address': '地址',
    'tax_id': '統一編號',
    'phone': '電話號碼',
    'category': '類別',
    'description': '描述/備註',
    'created_date': '建立日期'
  };

  const reverseMapping: Record<string, string> = Object.fromEntries(
    Object.entries(columnMapping).map(([k, v]) => [v, k])
  );

  const handleExport = () => {
    if (rows.length === 0) {
      alert("目前沒有資料可以匯出！");
      return;
    }
    const exportData = rows.map(row => {
      const mappedRow: any = {};
      Object.keys(columnMapping).forEach(key => {
        mappedRow[columnMapping[key]] = row[key] || '';
      });
      return mappedRow;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '法人名單.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      Object.keys(columnMapping).reduce((acc: any, key) => {
        acc[columnMapping[key]] = '';
        return acc;
      }, {})
    ];
    const csv = Papa.unparse(templateData);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '法人名單_匯入範例.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedData = results.data as any[];
        
        const dbData = parsedData.map(row => {
          const mappedRow: any = {};
          Object.keys(row).forEach(chineseKey => {
            const englishKey = reverseMapping[chineseKey.trim()];
            if (englishKey) {
              mappedRow[englishKey] = row[chineseKey] === '' ? null : row[chineseKey];
            }
          });
          return mappedRow;
        }).filter(row => row.id); // 過濾掉沒有 id 的無效行

        if (dbData.length === 0) {
          alert("沒有找到有效的資料，請確認是否包含「客戶編號」欄位！");
          return;
        }

        try {
          const { error } = await supabase.from('corporates').upsert(dbData);
          if (error) throw error;
          alert(`成功匯入 ${dbData.length} 筆資料！`);
          fetchCorporates();
        } catch (err) {
          console.error(err);
          alert("匯入失敗，請確認資料格式或聯絡管理員。");
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        alert("CSV 解析失敗，請確認檔案格式！");
      }
    });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('corporates').upsert([formData]);
      if (error) throw error;
      setOpen(false);
      setFormData({ id: '', name: '', short_name: '', billing_region: '', address: '', tax_id: '', phone: '', category: ''});
      fetchCorporates();
    } catch (e) {
      alert("儲存失敗！可能缺少必填欄位或未正確連線。");
      console.error(e);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '客戶編號', width: 130 },
    { field: 'name', headerName: '客戶名稱', width: 200 },
    { field: 'short_name', headerName: '客戶簡稱', width: 130 },
    { field: 'billing_region', headerName: '帳單縣市分區', width: 160 },
    { field: 'address', headerName: '地址', width: 250 },
    { field: 'tax_id', headerName: '統一編號', width: 130 },
    { field: 'phone', headerName: '電話號碼', width: 150 },
    { field: 'category', headerName: '類別', width: 130 },
  ];

  return (
    <div style={{ height: 650, width: '100%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>法人名單管理</h1>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImport} 
            style={{ display: 'none' }} 
          />
          <Button variant="outlined" onClick={handleDownloadTemplate} style={{ borderColor: '#6b7280', color: '#6b7280' }}>
            📄 下載範例
          </Button>
          <Button variant="outlined" onClick={() => fileInputRef.current?.click()} style={{ borderColor: '#4f46e5', color: '#4f46e5' }}>
            📥 匯入 CSV
          </Button>
          <Button variant="outlined" onClick={handleExport} style={{ borderColor: '#10b981', color: '#10b981' }}>
            📤 匯出 CSV
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)} style={{ backgroundColor: '#4f46e5' }}>
            + 新增法人公司
          </Button>
        </Box>
      </div>
      
      <DataGrid rows={rows} columns={columns} />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>新增法人公司</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="客戶編號 (例如: C-00086)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} fullWidth />
            <TextField label="客戶名稱" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} fullWidth />
            <TextField label="客戶簡稱" value={formData.short_name} onChange={e => setFormData({...formData, short_name: e.target.value})} fullWidth />
            <TextField label="帳單鄉鎮市區" value={formData.billing_region} onChange={e => setFormData({...formData, billing_region: e.target.value})} fullWidth />
            <TextField label="地址" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} fullWidth />
            <TextField label="統一編號" value={formData.tax_id} onChange={e => setFormData({...formData, tax_id: e.target.value})} fullWidth />
            <TextField label="電話號碼" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} fullWidth />
            <TextField label="類別 (客戶/潛在客戶...)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} style={{ backgroundColor: '#4f46e5', color: '#fff' }}>儲存</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
