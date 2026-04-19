import { useEffect, useMemo, useState } from 'react';
import { Add, Delete, AutoFixHigh } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';

const emptySubject = { subject: '', marksObtained: 0, maxMarks: 100 };

const initialForm = {
  fullName: '',
  mobile: '',
  parentMobile: '',
  schoolName: '',
  board: '',
  className: '',
  percentage: 0,
  gender: 'Any',
  city: '',
  state: '',
  studentPhotoUrl: '',
  marksheetFileUrl: '',
  subjects: [emptySubject],
  certificateAdjustments: { photoScale: 1, photoX: 0, photoY: 0, photoRotation: 0 },
  remarks: ''
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const [s, c] = await Promise.all([api.get('/students'), api.get('/categories')]);
    setStudents(s.data);
    setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post('/students', form);
    setForm(initialForm);
    load();
  };

  const evaluate = async (id) => { await api.post(`/students/${id}/evaluate`); load(); };
  const parse = async (id) => { await api.post(`/students/${id}/parse`); load(); };

  const best5Preview = useMemo(() => {
    const scores = (form.subjects || [])
      .map((s) => Number(s.marksObtained || 0))
      .sort((a, b) => b - a)
      .slice(0, 5);
    const total = scores.reduce((a, b) => a + b, 0);
    return { total, percentage: scores.length ? (total / (scores.length * 100)) * 100 : 0 };
  }, [form.subjects]);

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'mobile', label: 'Student Mobile' },
    { key: 'parentMobile', label: 'Parent Mobile' },
    { key: 'board', label: 'Board' },
    { key: 'className', label: 'Class' },
    { key: 'percentage', label: 'Percentage' },
    { key: 'status', label: 'Status' },
    { key: 'matched', label: 'Matched Categories' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = students.map((s) => ({
    title: s.fullName,
    name: s.fullName,
    mobile: s.mobile || '-',
    parentMobile: s.parentMobile || '-',
    board: s.board || '-',
    className: s.className || '-',
    percentage: s.percentage || '-',
    status: () => <StatusChip label={s.status} />,
    matched: (s.matchedCategoryIds || []).map((c) => c.title).join(', ') || '-',
    actions: () => (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => parse(s._id)}>Parse</Button>
        <Button size="small" variant="contained" onClick={() => evaluate(s._id)}>Evaluate</Button>
      </Stack>
    )
  }));

  return (
    <>
      <PageHeader
        title="Student intake"
        subtitle="Admin intake, public registration, parsing placeholder and eligibility flow."
        chips={[{ label: `${students.length} students` }, { label: `${categories.length} categories` }]}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper component="form" onSubmit={save} sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">Admin student registration</Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Student mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Parent mobile" value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="number" label="Percentage" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <MenuItem value="Any">Any</MenuItem>
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
                  <TextField fullWidth label="Student photo URL / uploaded data URL" value={form.studentPhotoUrl} onChange={(e) => setForm({ ...form, studentPhotoUrl: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Marksheet file URL / uploaded data URL" value={form.marksheetFileUrl} onChange={(e) => setForm({ ...form, marksheetFileUrl: e.target.value, resultImageUrl: e.target.value })} />
                </Grid>
              </Grid>

              <Divider />

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Subject marks (CBSE Best 5 supported)</Typography>
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
                <Alert severity="info">
                  Best 5 preview: total {best5Preview.total} / percentage {best5Preview.percentage.toFixed(2)}%
                </Alert>
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Certificate adjustments</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">Scale</Typography>
                    <Slider min={0.6} max={2} step={0.1} value={form.certificateAdjustments.photoScale} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoScale: v } })} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">Rotate</Typography>
                    <Slider min={-15} max={15} step={1} value={form.certificateAdjustments.photoRotation} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoRotation: v } })} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">Move X</Typography>
                    <Slider min={-100} max={100} step={1} value={form.certificateAdjustments.photoX} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoX: v } })} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">Move Y</Typography>
                    <Slider min={-100} max={100} step={1} value={form.certificateAdjustments.photoY} onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoY: v } })} />
                  </Grid>
                </Grid>
                <TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
              </Stack>

              <Button variant="contained" size="large" type="submit">Save student</Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Certificate preview</Typography>
                <Box sx={{ borderRadius: 3, bgcolor: '#fff7e6', minHeight: 260, p: 2, position: 'relative', border: '1px dashed #e2b866' }}>
                  <Typography variant="caption" color="text.secondary">Award certificate preview</Typography>
                  <Typography variant="h6" sx={{ mt: 3 }}>{form.fullName || 'Student Name'}</Typography>
                  <Typography color="text.secondary">{form.board || 'Board'} · {form.className || 'Class'} · {form.percentage || 0}%</Typography>
                  <Box
                    sx={{
                      width: 100,
                      height: 120,
                      bgcolor: 'rgba(21,94,239,0.12)',
                      borderRadius: 2,
                      position: 'absolute',
                      right: 24 + form.certificateAdjustments.photoX / 5,
                      top: 48 + form.certificateAdjustments.photoY / 5,
                      transform: `scale(${form.certificateAdjustments.photoScale}) rotate(${form.certificateAdjustments.photoRotation}deg)`,
                      overflow: 'hidden',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                      fontWeight: 700
                    }}
                  >
                    {form.studentPhotoUrl ? (
                      <img src={form.studentPhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : 'PHOTO'}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={1.2}>
                  <Typography variant="h6">Eligibility summary</Typography>
                  <Alert severity={form.board === 'CBSE' ? 'info' : 'success'} icon={<AutoFixHigh />}>
                    {form.board === 'CBSE'
                      ? `CBSE best 5 preview = ${best5Preview.percentage.toFixed(2)}%`
                      : 'Direct percentage will be used unless category says otherwise.'}
                  </Alert>
                  <Typography color="text.secondary">
                    Public student registration is now separate and does not require login.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <ResponsiveTable columns={columns} rows={rows} mobileTitleKey="title" />
        </Grid>
      </Grid>
    </>
  );
}