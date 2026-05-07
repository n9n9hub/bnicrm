import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import CorporateView from './pages/CorporateView';
import ContactView from './pages/ContactView';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && (
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
            {user && (
              <Button color="inherit" onClick={signOut} style={{ marginLeft: '16px', border: '1px solid rgba(255,255,255,0.3)' }}>
                登出
              </Button>
            )}
          </Toolbar>
        </AppBar>
      )}

      {isLoginPage ? (
         <Routes>
           <Route path="/login" element={<Login />} />
         </Routes>
      ) : (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <CorporateView />
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <ContactView />
              </ProtectedRoute>
            } />
            <Route path="*" element={<ProtectedRoute><CorporateView /></ProtectedRoute>} />
          </Routes>
        </Container>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
