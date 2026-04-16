import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import CorporateView from './pages/CorporateView';
import ContactView from './pages/ContactView';

function App() {
  return (
    <BrowserRouter>
      <AppBar position="static" style={{ backgroundColor: '#1e293b' }}>
        <Toolbar>
          <Typography variant="h6" className="font-bold flex-grow" style={{ flexGrow: 1 }}>
            BNI CRM 系統 (MVP)
          </Typography>
          <Button color="inherit" component={Link} to="/">
            法人名單
          </Button>
          <Button color="inherit" component={Link} to="/contacts">
            自然人名單
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<CorporateView />} />
          <Route path="/contacts" element={<ContactView />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
