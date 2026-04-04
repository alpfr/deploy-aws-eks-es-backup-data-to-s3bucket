/**
 * Login Component for AI Compliance Platform
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Login() {
  const [tabValue, setTabValue] = useState(0);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'organization_admin',
    organizationName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginData.username, loginData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(
      registerData.username,
      registerData.email,
      registerData.password,
      registerData.role,
      registerData.organizationName
    );
    
    if (result.success) {
      setTabValue(0); // Switch to login tab
      setError('');
      // Show success message
      alert('Registration successful! Please log in.');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', mt: 3 }}>
          <Box sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              AI Compliance Platform
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Operationalizing AI compliance through automated guardrails and standardized assessments
            </Typography>

            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Demo Accounts:</strong>
                  </Typography>
                  <Typography variant="body2">
                    Organization Admin: admin / admin123
                  </Typography>
                  <Typography variant="body2">
                    Regulatory Inspector: inspector / inspector123
                  </Typography>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleRegister}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Corporate Email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={registerData.role}
                    label="Role"
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                  >
                    <MenuItem value="organization_admin">Organization Admin</MenuItem>
                    <MenuItem value="regulatory_inspector">Regulatory Inspector</MenuItem>
                  </Select>
                </FormControl>
                {registerData.role === 'organization_admin' && (
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Organization Name"
                    value={registerData.organizationName}
                    onChange={(e) => setRegisterData({ ...registerData, organizationName: e.target.value })}
                    helperText="Leave empty to join an existing organization"
                  />
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Are you a prospective client or regulatory partner?
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/about')}
            sx={{ mt: 1, borderRadius: 6, px: 4 }}
          >
            Learn About the Platform
          </Button>
        </Box>
      </Box>
    </Container>
  );
}