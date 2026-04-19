import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'sanju', password: 'sanju' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(180deg,#eff6ff 0%, #f8fafc 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.2} component="form" onSubmit={submit}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LockIcon color="primary" />
              <Box>
                <Typography variant="h5">Scholar Awards Login</Typography>
                <Typography variant="body2">Secure access for event operations team.</Typography>
              </Box>
            </Stack>
            <Alert severity="info">Temporary bootstrap login is enabled for deployment.</Alert>
            <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <TextField type="password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Button variant="contained" size="large" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</Button>
            <Typography variant="caption">Default super admin: sanju / sanju</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
