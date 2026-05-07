import { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { supabase } from '../supabaseClient';
import Papa from 'papaparse';
export default function ContactView() {
  const [rows, setRows] = useState<any[]>([]);
  const [corporates, setCorporates] = useState<{id: string, name: string, short_name: string}[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', corporate_id: '', address: '', title: '', mobile: '', email: '', remarks: ''
  });

  const fetchData = async () => {
    try {
      const { data: contacts, error: e1 } = await supabase.from('contacts').select('*');
      const { data: corps, error: e2 } = await supabase.from('corporates').select('id, name, short_name');
      
      if (e1) throw e1;
      if (e2) throw e2;

      setRows(contacts || []);
      setCorporates(corps || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const columnMapping: Record<string, string> = {
    'id': '聯絡人編號',
    'name': '聯絡人姓名',
    'corporate_id': '所屬公司編號',
    'title': '職稱',
    'mobile': '手機',
    'phone': '室內電話',
    'email': 'Email',
    'address': '地址',
    'remarks': '備註/分會'
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
    link.setAttribute('download', '自然人名單.csv');
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
    link.setAttribute('download', '自然人名單_匯入範例.csv');
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
          alert("沒有找到有效的資料，請確認是否包含「聯絡人編號」欄位！");
          return;
        }

        try {
          const { error } = await supabase.from('contacts').upsert(dbData);
          if (error) throw error;
          alert(`成功匯入 ${dbData.length} 筆資料！`);
          fetchData();
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
      const { error } = await supabase.from('contacts').upsert([formData]);
      if (error) throw error;
      setOpen(false);
      setFormData({ id: '', name: '', corporate_id: '', address: '', title: '', mobile: '', email: '', remarks: '' });
      setIsEditing(false);
      fetchData();
    } catch (e) {
      alert("儲存失敗！可能缺少必填欄位或未正確連線。");
      console.error(e);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: '聯絡人編號', width: 130 },
    { field: 'name', headerName: '聯絡人姓名', width: 150 },
    { 
      field: 'corporate_id', 
      headerName: '所屬公司', 
      width: 200,
      valueGetter: (_, row) => {
        const corp = corporates.find(c => c.id === row.corporate_id);
        return corp ? corp.name : row.corporate_id;
      }
    },
    { field: 'address', headerName: '地址', width: 250 },
    { field: 'title', headerName: '職稱', width: 130 },
    { field: 'mobile', headerName: '手機', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'remarks', headerName: '備註/分會', width: 180 },
  ];

  return (
    <div style={{ height: 650, width: '100%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>自然人 (聯絡人) 名單管理</h1>
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
          <Button variant="outlined" onClick={() => fileInputRef.current?.click()} style={{ borderColor: '#0ea5e9', color: '#0ea5e9' }}>
            📥 匯入 CSV
          </Button>
          <Button variant="outlined" onClick={handleExport} style={{ borderColor: '#10b981', color: '#10b981' }}>
            📤 匯出 CSV
          </Button>
          <Button variant="contained" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', corporate_id: '', address: '', title: '', mobile: '', email: '', remarks: '' }); setOpen(true); }} style={{ backgroundColor: '#0ea5e9' }}>
            + 新增聯絡人
          </Button>
        </Box>
      </div>
      
      <DataGrid 
        rows={rows} 
        columns={columns} 
        onRowDoubleClick={(params) => {
          setFormData(params.row);
          setIsEditing(true);
          setOpen(true);
        }}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{isEditing ? '編輯自然人名單' : '新增自然人名單'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="聯絡人編號 (例如: 00114)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} fullWidth disabled={isEditing} />
            <TextField label="人員姓名" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} fullWidth />
            
            <FormControl fullWidth>
              <InputLabel>綁定所屬法人公司</InputLabel>
              <Select
                value={formData.corporate_id}
                label="綁定所屬法人公司"
                onChange={e => setFormData({...formData, corporate_id: e.target.value})}
              >
                {corporates.map(corp => (
                   <MenuItem key={corp.id} value={corp.id}>{corp.name} ({corp.short_name})</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="地址" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} fullWidth />
            <TextField label="職稱" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} fullWidth />
            <TextField label="手機" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} fullWidth />
            <TextField label="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} fullWidth />
            <TextField label="備註 (例如: BNI 區域董事...)" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} style={{ backgroundColor: '#0ea5e9', color: '#fff' }}>儲存聯絡人</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
