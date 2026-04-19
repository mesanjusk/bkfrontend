import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import api from '../api';

const emptySubject = { subject: '', marksObtained: 0, maxMarks: 100 };

const initialForm = {
  fullName: '',
  mobile: '',
  
  schoolName: '',
  board: '',
  className: '',
  percentage: 0,
  gender: 'Any',
  
  city: '',
  state: '',
  parentMobile: '',
  marksheetFileUrl: '',
  studentPhotoUrl: '',
  subjects: [emptySubject],
  remarks: ''
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function PublicStudentRegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const best5Preview = useMemo(() => {
    const scores = (form.subjects || [])
      .map((s) => Number(s.marksObtained || 0))
      .sort((a, b) => b - a)
      .slice(0, 5);
    const total = scores.reduce((a, b) => a + b, 0);
    return { total, percentage: scores.length ? (total / (scores.length * 100)) * 100 : 0 };
  }, [form.subjects]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        resultImageUrl: form.marksheetFileUrl,
        certificatePhotoUrl: form.studentPhotoUrl
      };
      const { data } = await api.post('/students/public-register', payload);
      setSuccess(data);
      setForm(initialForm);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={700}>BK Awards 2026</Typography>
          
        </Box>

        {success ? (
          <Alert severity="success">
            Registration submitted successfully. Confirmation WhatsApp has been queued to your mobile number.
            <br />
            Edit link: <a href={success.editLink}>{success.editLink}</a>
          </Alert>
        ) : null}

        <Card component="form" onSubmit={submit}>
          <CardContent>
            <Stack spacing={2.5}>
              <Typography variant="h6">Registration form</Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Student mobile number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth required label="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth required label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" label="Percentage (optional if subject marks added)" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Parent mobile number" value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} />
                </Grid>
              </Grid>

              <Divider />

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Subject marks (recommended for CBSE)</Typography>
                {form.subjects.map((sub, idx) => (
                  <Grid key={idx} container spacing={1.5} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField fullWidth label="Subject" value={sub.subject} onChange={(e) => {
                        const subjects = [...form.subjects];
                        subjects[idx].subject = e.target.value;
                        setForm({ ...form, subjects });
                      }} />
                    </Grid>
                    <Grid item xs={5} sm={3}>
                      <TextField fullWidth type="number" label="Marks" value={sub.marksObtained} onChange={(e) => {
                        const subjects = [...form.subjects];
                        subjects[idx].marksObtained = Number(e.target.value);
                        setForm({ ...form, subjects });
                      }} />
                    </Grid>
                    <Grid item xs={5} sm={3}>
                      <TextField fullWidth type="number" label="Max" value={sub.maxMarks} onChange={(e) => {
                        const subjects = [...form.subjects];
                        subjects[idx].maxMarks = Number(e.target.value);
                        setForm({ ...form, subjects });
                      }} />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton color="error" onClick={() => setForm({ ...form, subjects: form.subjects.filter((_, i) => i !== idx).length ? form.subjects.filter((_, i) => i !== idx) : [emptySubject] })}>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<Add />} variant="outlined" onClick={() => setForm({ ...form, subjects: [...form.subjects, { ...emptySubject }] })}>
                  Add subject
                </Button>
                <Alert severity="info">Best 5 preview: {best5Preview.percentage.toFixed(2)}%</Alert>
              </Stack>

              <Divider />

              <Stack spacing={2}>
                <Typography variant="subtitle1">Uploads</Typography>

                <Button variant="outlined" component="label">
                  Upload marksheet
                  <input
                    hidden
                    type="file"
                    accept="image/*,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setForm((prev) => ({ ...prev, marksheetFileUrl: dataUrl }));
                    }}
                  />
                </Button>
                {form.marksheetFileUrl ? <Alert severity="success">Marksheet selected</Alert> : null}

                <Button variant="outlined" component="label">
                  Upload your photo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setForm((prev) => ({ ...prev, studentPhotoUrl: dataUrl }));
                    }}
                  />
                </Button>
                {form.studentPhotoUrl ? (
                  <Box sx={{ width: 120, height: 140, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                    <img src={form.studentPhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ) : null}
              </Stack>

              

              <Button type="submit" size="large" variant="contained" disabled={saving}>
                {saving ? 'Submitting...' : 'Submit registration'}
              </Button>

              
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}