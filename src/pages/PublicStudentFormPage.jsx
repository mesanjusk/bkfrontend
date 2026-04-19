import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Container, Divider, 
  IconButton, MenuItem, Slider, Skeleton, Stack, TextField, Typography, Fade
} from '@mui/material';
import { Add, Delete, CloudUpload, School, Stars, CheckCircleOutline } from '@mui/icons-material';
import api from '../api';

const emptySubject = { subject: '', marksObtained: 0, maxMarks: 100 };
const initialForm = {
  fullName: '', mobile: '', parentMobile: '', schoolName: '', board: '',
  className: '', percentage: '', gender: 'Any', city: '', state: '',
  subjects: [emptySubject], marksheetFileUrl: '', studentPhotoUrl: '', remarks: '',
  certificateAdjustments: { photoScale: 1, photoRotation: 0, photoX: 0, photoY: 0 }
};

// --- Minimalist Components ---

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, mb: 2, display: 'block' }}>
      {title}
    </Typography>
    <Stack spacing={2}>{children}</Stack>
  </Box>
);

const CompactInput = (props) => (
  <TextField
    {...props}
    variant="filled"
    InputProps={{ disableUnderline: true, sx: { borderRadius: 2, bgcolor: '#f0f2f5' } }}
    fullWidth
  />
);

export default function PublicStudentFormPage() {
  const { token } = useParams();
  const isEditMode = Boolean(token);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success', msg: '' }

  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/students/public-edit/${token}`).then(res => {
      setForm(prev => ({ ...prev, ...res.data }));
      setLoading(false);
    });
  }, [isEditMode, token]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const endpoint = isEditMode ? `/students/public-edit/${token}` : '/students/public-register';
      const method = isEditMode ? 'put' : 'post';
      await api[method](endpoint, form);
      setStatus({ type: 'success', msg: 'Details saved successfully!' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container maxWidth="sm" sx={{ py: 4 }}><Skeleton variant="rounded" height={400} /></Container>;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
      {/* Aesthetic Header */}
      <Box sx={{ bgcolor: '#1a1a1a', color: '#fff', pt: 6, pb: 4, px: 3, textAlign: 'center', borderRadius: '0 0 32px 32px' }}>
        <School sx={{ fontSize: 40, mb: 1, color: '#d4af37' }} />
        <Typography variant="h5" fontWeight={800}>BK Scholar Awards</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>2026 Merit Recognition</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -3 }}>
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
          <CardContent sx={{ p: 3 }}>
            
            {status && <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>{status.msg}</Alert>}

            <form onSubmit={handleSave}>
              <Section title="Student Info">
                <CompactInput label="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
                <Stack direction="row" spacing={2}>
                  <CompactInput label="Mobile" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
                  <CompactInput label="Gender" select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <MenuItem value="Any">Any</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </CompactInput>
                </Stack>
              </Section>

              <Section title="Academic Record">
                <CompactInput label="School Name" value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})} />
                <Stack direction="row" spacing={2}>
                  <CompactInput label="Board" value={form.board} onChange={e => setForm({...form, board: e.target.value})} />
                  <CompactInput label="Class" value={form.className} onChange={e => setForm({...form, className: e.target.value})} />
                </Stack>
              </Section>

              <Section title="Marks Details">
                {form.subjects.map((s, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <CompactInput size="small" placeholder="Subject" value={s.subject} onChange={e => {
                      const subs = [...form.subjects];
                      subs[idx].subject = e.target.value;
                      setForm({...form, subjects: subs});
                    }} />
                    <CompactInput size="small" type="number" placeholder="Marks" sx={{ width: 100 }} value={s.marksObtained} onChange={e => {
                      const subs = [...form.subjects];
                      subs[idx].marksObtained = e.target.value;
                      setForm({...form, subjects: subs});
                    }} />
                    <IconButton size="small" color="error" onClick={() => setForm({...form, subjects: form.subjects.filter((_, i) => i !== idx)})}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button startIcon={<Add />} onClick={() => setForm({...form, subjects: [...form.subjects, { ...emptySubject }]})} sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                  Add Subject
                </Button>
              </Section>

              <Section title="Media">
                <Stack direction="row" spacing={2}>
                  <Button fullWidth variant="outlined" component="label" startIcon={<CloudUpload />} sx={{ borderRadius: 3, textTransform: 'none', py: 1.5, borderStyle: 'dashed' }}>
                    Marksheet
                    <input hidden type="file" onChange={async (e) => {/* Add file logic here */}} />
                  </Button>
                  <Button fullWidth variant="outlined" component="label" startIcon={<CloudUpload />} sx={{ borderRadius: 3, textTransform: 'none', py: 1.5, borderStyle: 'dashed' }}>
                    Photo
                    <input hidden type="file" onChange={async (e) => {/* Add file logic here */}} />
                  </Button>
                </Stack>
              </Section>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{
                  mt: 2, py: 2, borderRadius: 3,
                  bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#000' },
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  fontWeight: 700, textTransform: 'none', fontSize: '1rem'
                }}
              >
                {saving ? 'Processing...' : isEditMode ? 'Update Details' : 'Register Now'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Persistent Mobile Bottom Action if needed */}
      <Box sx={{ position: 'fixed', bottom: 20, width: '100%', px: 3, display: { xs: 'block', sm: 'none' } }}>
        <Typography variant="caption" textAlign="center" display="block" sx={{ opacity: 0.5 }}>
          Secure Registration · © 2026
        </Typography>
      </Box>
    </Box>
  );
}