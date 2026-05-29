import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { CheckCircle, Groups } from '@mui/icons-material';
import api from '../api';

const inputSx = {
  '& .MuiFilledInput-root': {
    borderRadius: '10px'
  }
};

function buildFullName(form) {
  return [form.firstName, form.lastName].filter(Boolean).join(' ').trim();
}

export default function PublicVolunteerFormPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    gender: '',
    mobile: '',
    age: ''
  });
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [otpError, setOtpError] = useState('');

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      next.fullName = buildFullName(next);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setFormError('');

    try {
      await api.post('/volunteers/public-register', {
        firstName: form.firstName,
        lastName: form.lastName,
        fullName: buildFullName(form),
        gender: form.gender,
        mobile: form.mobile,
        age: form.age
      });

      setStep('otp');
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Failed to submit volunteer registration.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    setOtpError('');

    try {
      await api.post('/volunteers/verify-otp', {
        mobile: form.mobile,
        otp
      });

      const name = encodeURIComponent(buildFullName(form));
      navigate(`/photo-template?name=${name}`);
    } catch (error) {
      setOtpError(error?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtpError('');

    try {
      await api.post('/volunteers/resend-otp', { mobile: form.mobile });
    } catch (error) {
      setOtpError(error?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f0f7fc', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          bgcolor: '#2497d3',
          color: '#fff',
          pt: { xs: 4, sm: 5 },
          pb: { xs: 5, sm: 6 },
          px: 2,
          textAlign: 'center',
          borderRadius: '0 0 28px 28px'
        }}
      >
        <Groups sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h5" fontWeight={800}>Badte Kadam Scholar Awards</Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.95 }}>Sunday 14 June 2026</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -3 }}>
        <Card sx={{ borderRadius: 3, border: '1px solid #d9d9d9', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Stack spacing={2}>

              {step === 'form' && (
                <>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #d9d9d9', boxShadow: 'none' }}>
                    <Typography variant="h6" fontWeight={800} color="#2497d3">Volunteer Registration Form</Typography>
                  </Paper>

                  {formError && (
                    <Fade in>
                      <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>
                    </Fade>
                  )}

                  <TextField fullWidth size="small" label="First Name" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} sx={inputSx} />
                  <TextField fullWidth size="small" label="Last Name" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} sx={inputSx} />
                  <TextField fullWidth size="small" label="Mobile Number" value={form.mobile} onChange={(e) => updateField('mobile', e.target.value)} inputProps={{ inputMode: 'numeric' }} sx={inputSx} />
                  <TextField fullWidth size="small" label="Age" value={form.age} onChange={(e) => updateField('age', e.target.value.replace(/\D/g, ''))} inputProps={{ inputMode: 'numeric' }} sx={inputSx} />

                  <TextField select fullWidth size="small" label="Gender" value={form.gender} onChange={(e) => updateField('gender', e.target.value)} sx={inputSx}>
                    {['Male', 'Female', 'Other'].map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving || !form.firstName || !form.lastName || !form.mobile || !form.age}
                    sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 700, bgcolor: '#2497d3', '&:hover': { bgcolor: '#1e88c0' } }}
                  >
                    {saving ? 'Submitting...' : 'Submit Volunteer Registration'}
                  </Button>
                </>
              )}

              {step === 'otp' && (
                <>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #d9d9d9', boxShadow: 'none' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight={800} color="#2497d3">Verify OTP</Typography>
                      <Typography variant="body2" color="text.secondary">
                        A 4-digit OTP has been sent to {form.mobile} via WhatsApp.
                      </Typography>
                    </Stack>
                  </Paper>

                  {otpError && (
                    <Fade in>
                      <Alert severity="error" sx={{ borderRadius: 2 }}>{otpError}</Alert>
                    </Fade>
                  )}

                  <TextField
                    fullWidth
                    size="small"
                    label="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                    sx={inputSx}
                  />

                  <Button
                    variant="contained"
                    onClick={handleVerifyOtp}
                    disabled={verifying || otp.length !== 4}
                    sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 700, bgcolor: '#2497d3', '&:hover': { bgcolor: '#1e88c0' } }}
                  >
                    {verifying ? 'Verifying...' : 'Verify & Create My Photo'}
                  </Button>

                  <Button
                    variant="text"
                    size="small"
                    onClick={handleResendOtp}
                    disabled={resending}
                    sx={{ textTransform: 'none', color: '#2497d3' }}
                  >
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </Button>

                  <Alert severity="success" icon={<CheckCircle />} sx={{ borderRadius: 2 }}>
                    Registration submitted! Please check your WhatsApp for the OTP.
                  </Alert>
                </>
              )}

            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
