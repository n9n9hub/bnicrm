import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { supabase } from '../supabaseClient';

export default function CorporateView() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', short_name: '', billing_region: '', tax_id: '', phone: '', category: ''
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

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('corporates').upsert([formData]);
      if (error) throw error;
      setOpen(false);
      setFormData({ id: '', name: '', short_name: '', billing_region: '', tax_id: '', phone: '', category: ''});
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
    { field: 'tax_id', headerName: '統一編號', width: 130 },
    { field: 'phone', headerName: '電話號碼', width: 150 },
    { field: 'category', headerName: '類別', width: 130 },
  ];

  return (
    <div style={{ height: 650, width: '100%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>法人名單管理</h1>
        <Button variant="contained" onClick={() => setOpen(true)} style={{ backgroundColor: '#4f46e5' }}>
          + 新增法人公司
        </Button>
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
