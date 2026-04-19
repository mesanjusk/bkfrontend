import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import api from '../api';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function PublicStudentEditPage() {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    api.get(`/students/public-edit/${token}`).then((r) => setForm(r.data));
  }, [token]);

  const best5Preview = useMemo(() => {
    const scores = (form?.subjects || []).map((s) => Number(s.marksObtained || 0)).sort((a, b) => b - a).slice(0, 5);
    const total = scores.reduce((a, b) => a + b, 0);
    return { total, percentage: scores.length ? (total / (scores.length * 100)) * 100 : 0 };
  }, [form]);

  if (!form) {
    return <Container sx={{ py: 4 }}><Alert severity="info">Loading form...</Alert></Container>;
  }

  const save = async () => {
    const payload = {
      ...form,
      resultImageUrl: form.marksheetFileUrl,
      certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl
    };
    await api.put(`/students/public-edit/${token}`, payload);
    setSaved('Saved successfully');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Edit Registration</Typography>
          <Typography color="text.secondary">Update your details and manage certificate preview.</Typography>
        </Box>

        {saved ? <Alert severity="success">{saved}</Alert> : null}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Form details" />
          <Tab label="Certificate preview" />
        </Tabs>

        {tab === 0 ? (
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Full name" value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Student mobile" value={form.mobile || ''} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Parent mobile" value={form.parentMobile || ''} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="School name" value={form.schoolName || ''} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="Board" value={form.board || ''} onChange={(e) => setForm({ ...form, board: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="Class" value={form.className || ''} onChange={(e) => setForm({ ...form, className: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" label="Percentage" value={form.percentage || 0} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth select label="Gender" value={form.gender || 'Any'} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <MenuItem value="Any">Any</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Alert severity="info">CBSE Best 5 preview: {best5Preview.percentage.toFixed(2)}%</Alert>

                <Button variant="outlined" component="label">
                  Replace marksheet
                  <input hidden type="file" accept="image/*,.pdf" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await fileToDataUrl(file);
                    setForm({ ...form, marksheetFileUrl: dataUrl, resultImageUrl: dataUrl });
                  }} />
                </Button>

                <Button variant="outlined" component="label">
                  Replace photo
                  <input hidden type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await fileToDataUrl(file);
                    setForm({ ...form, studentPhotoUrl: dataUrl, certificatePhotoUrl: dataUrl });
                  }} />
                </Button>

                <TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
              </Stack>

              <Button sx={{ mt: 3 }} variant="contained" onClick={save}>Save changes</Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} lg={7}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Certificate preview</Typography>
                  <Box sx={{ borderRadius: 3, bgcolor: '#fff7e6', minHeight: 320, p: 2, position: 'relative', border: '1px dashed #e2b866' }}>
                    <Typography variant="caption" color="text.secondary">Award certificate preview</Typography>
                    <Typography variant="h5" sx={{ mt: 4 }}>{form.fullName || 'Student Name'}</Typography>
                    <Typography color="text.secondary">{form.board || 'Board'} · {form.className || 'Class'} · {form.percentage || 0}%</Typography>
                    <Box
                      sx={{
                        width: 110,
                        height: 130,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'rgba(21,94,239,0.12)',
                        position: 'absolute',
                        right: 24 + (form.certificateAdjustments?.photoX || 0) / 5,
                        top: 60 + (form.certificateAdjustments?.photoY || 0) / 5,
                        transform: `scale(${form.certificateAdjustments?.photoScale || 1}) rotate(${form.certificateAdjustments?.photoRotation || 0}deg)`
                      }}
                    >
                      {(form.studentPhotoUrl || form.certificatePhotoUrl) ? (
                        <img src={form.studentPhotoUrl || form.certificatePhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : null}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Adjust photo</Typography>
                    <Typography variant="body2">Scale</Typography>
                    <Slider min={0.6} max={2} step={0.1} value={form.certificateAdjustments?.photoScale || 1} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoScale: v } })} />
                    <Typography variant="body2">Rotate</Typography>
                    <Slider min={-15} max={15} step={1} value={form.certificateAdjustments?.photoRotation || 0} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoRotation: v } })} />
                    <Typography variant="body2">Move X</Typography>
                    <Slider min={-100} max={100} step={1} value={form.certificateAdjustments?.photoX || 0} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoX: v } })} />
                    <Typography variant="body2">Move Y</Typography>
                    <Slider min={-100} max={100} step={1} value={form.certificateAdjustments?.photoY || 0} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoY: v } })} />
                    <Button variant="contained" onClick={save}>Save preview</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}