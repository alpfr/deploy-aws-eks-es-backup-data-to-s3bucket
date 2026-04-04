/**
 * AI Compliance Platform - Main React Application
 * Sample frontend for the MVP prototype
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Assessments from './components/Assessments';
import Guardrails from './components/Guardrails';
import Organizations from './components/Organizations';
import AuditTrail from './components/AuditTrail';
import Navigation from './components/Navigation';
import PendingApprovals from './components/PendingApprovals';
import About from './components/About';
import Settings from './components/Settings';
import LLMManagement from './components/LLMManagement';

// Premium Dark Theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0a1929',
      paper: '#001e3c',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13, // Scaled down for maximum density
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '1.75rem',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

// Main App Component
function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        {user && <Navigation />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/assessments" element={
            <ProtectedRoute>
              <Assessments />
            </ProtectedRoute>
          } />
          <Route path="/guardrails" element={
            <ProtectedRoute>
              <Guardrails />
            </ProtectedRoute>
          } />
          <Route path="/organizations" element={
            <ProtectedRoute>
              <Organizations />
            </ProtectedRoute>
          } />
          <Route path="/approvals" element={
            <ProtectedRoute>
              <PendingApprovals />
            </ProtectedRoute>
          } />
          <Route path="/audit-trail" element={
            <ProtectedRoute>
              <AuditTrail />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/llm-management" element={
            <ProtectedRoute>
              <LLMManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ApiProvider>
          <AppContent />
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;