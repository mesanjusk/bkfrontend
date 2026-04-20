import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import {
  Add,
  Delete,
  EmojiEvents,
  PhotoCamera,
  UploadFile,
  School,
  CheckCircle
} from '@mui/icons-material';
import api from '../api';

const emptySubject = { subject: '', marksObtained: 0, maxMarks: 100 };

const initialForm = {
  fullName: '',
  gender: 'Any',
  address: '',
  mobile: '',
  parentMobile: '',
  categoryId: '',
  categoryOther: '',
  schoolName: '',
  className: '',
  percentage: 0,
  subjects: [emptySubject],
  marksheetFileUrl: '',
  studentPhotoUrl: '',
  remarks: '',
  certificateAdjustments: { photoScale: 1, photoX: 0, photoY: 0, photoRotation: 0 }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function HeroCard({ editMode }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #c69214 100%)',
        color: '#fff'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEvents />
            <Typography variant="h5" fontWeight={700}>
              BK Scholar Awards 2026
            </Typography>
          </Stack>
          <Typography sx={{ opacity: 0.92 }}>
            {editMode
              ? 'Update your submitted registration and manage your certificate preview.'
              : 'Complete your scholar award registration with your academic details, marksheet and photo.'}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={editMode ? 'Edit Access' : 'Student Registration'} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
            <Chip label="Secure award process" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PublicStudentFormPage() {
  const { token } = useParams();
  const editMode = Boolean(token);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    api.get('/students/public-categories').then((r) => setCategories(r.data || []));
  }, []);

  useEffect(() => {
    if (!editMode) return;
    api.get(`/students/public-edit/${token}`).then((r) => {
      const data = r.data;
      setForm({
        ...initialForm,
        ...data,
        categoryId: data.categoryId?._id || data.categoryId || '',
        subjects: data.subjects?.length ? data.subjects : [emptySubject],
        certificateAdjustments: {
          photoScale: data.certificateAdjustments?.photoScale ?? 1,
          photoX: data.certificateAdjustments?.photoX ?? 0,
          photoY: data.certificateAdjustments?.photoY ?? 0,
          photoRotation: data.certificateAdjustments?.photoRotation ?? 0
        }
      });
      setLoading(false);
    });
  }, [editMode, token]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c._id) === String(form.categoryId)),
    [categories, form.categoryId]
  );

  const isCbse = useMemo(() => {
    const board = String(selectedCategory?.board || '').toUpperCase();
    const title = String(selectedCategory?.title || '').toUpperCase();
    return board === 'CBSE' || title.includes('CBSE');
  }, [selectedCategory]);

  const best5Preview = useMemo(() => {
    const scores = (form.subjects || [])
      .map((s) => Number(s.marksObtained || 0))
      .sort((a, b) => b - a)
      .slice(0, 5);
    const total = scores.reduce((a, b) => a + b, 0);
    return { total, percentage: scores.length ? (total / (scores.length * 100)) * 100 : 0 };
  }, [form.subjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    try {
      const payload = {
        ...form,
        resultImageUrl: form.marksheetFileUrl,
        certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl
      };

      if (editMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSuccess('Your form has been updated successfully.');
      } else {
        const { data } = await api.post('/students/public-register', payload);
        setSuccess(data.message || 'Registration submitted successfully.');
        setForm(initialForm);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <HeroCard editMode />
          <Card><CardContent><LinearProgress /></CardContent></Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <HeroCard editMode={editMode} />

        <Alert severity="info" icon={<School />}>
          {editMode
            ? 'You can update your registration details here. Certificate preview is available below.'
            : 'After successful registration, confirmation will be sent on WhatsApp to the student mobile number. The secure edit link will be sent only on WhatsApp, not shown on screen.'}
        </Alert>

        {success ? (
          <Alert severity="success" icon={<CheckCircle />}>
            {success}
          </Alert>
        ) : null}

        {editMode ? (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Form Details" />
            <Tab label="Certificate Preview" />
          </Tabs>
        ) : null}

        {!editMode || tab === 0 ? (
          <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={700}>
                {editMode ? 'Update Registration Form' : 'Student Award Registration Form'}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <MenuItem value="Any">Any</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    minRows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Mobile Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required label="Parent Mobile Number" value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} />
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Category"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value, categoryOther: '' })}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.title}
                      </MenuItem>
                    ))}
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>
                </Grid>

                {form.categoryId === 'OTHER' ? (
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="Other Category"
                      value={form.categoryOther}
                      onChange={(e) => setForm({ ...form, categoryOther: e.target.value })}
                    />
                  </Grid>
                ) : null}

                <Grid item xs={12} md={8}>
                  <TextField fullWidth required label="School or College Name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth required label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label={isCbse ? 'Percentage (optional, best 5 can be calculated)' : 'Percentage'}
                    value={form.percentage}
                    onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })}
                  />
                </Grid>
              </Grid>

              {isCbse ? (
                <>
                  <Divider />
                  <Stack spacing={1.5}>
                    <Chip label="CBSE Best 5" color="primary" variant="outlined" sx={{ width: 'fit-content' }} />
                    <Alert severity="info">
                      Subject-wise marks are recommended for CBSE. Best 5 preview: {best5Preview.percentage.toFixed(2)}%
                    </Alert>

                    {form.subjects.map((sub, idx) => (
                      <Grid key={idx} container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <TextField
                            fullWidth
                            label="Subject"
                            value={sub.subject}
                            onChange={(e) => {
                              const subjects = [...form.subjects];
                              subjects[idx].subject = e.target.value;
                              setForm({ ...form, subjects });
                            }}
                          />
                        </Grid>
                        <Grid item xs={5} sm={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Marks"
                            value={sub.marksObtained}
                            onChange={(e) => {
                              const subjects = [...form.subjects];
                              subjects[idx].marksObtained = Number(e.target.value);
                              setForm({ ...form, subjects });
                            }}
                          />
                        </Grid>
                        <Grid item xs={5} sm={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Max"
                            value={sub.maxMarks}
                            onChange={(e) => {
                              const subjects = [...form.subjects];
                              subjects[idx].maxMarks = Number(e.target.value);
                              setForm({ ...form, subjects });
                            }}
                          />
                        </Grid>
                        <Grid item xs={2} sm={1}>
                          <IconButton
                            color="error"
                            onClick={() => {
                              const filtered = form.subjects.filter((_, i) => i !== idx);
                              setForm({ ...form, subjects: filtered.length ? filtered : [emptySubject] });
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                    <Button
                      startIcon={<Add />}
                      variant="outlined"
                      onClick={() => setForm({ ...form, subjects: [...form.subjects, { ...emptySubject }] })}
                    >
                      Add Subject
                    </Button>
                  </Stack>
                </>
              ) : null}

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <UploadFile color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>Marksheet Upload</Typography>
                        </Stack>
                        <Button variant="outlined" component="label">
                          Upload Marksheet
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
                        {form.marksheetFileUrl ? <Alert severity="success">Marksheet selected successfully</Alert> : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PhotoCamera color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>Student Photo</Typography>
                        </Stack>
                        <Button variant="outlined" component="label">
                          Upload Photo
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
                          <Box sx={{ width: 120, height: 140, overflow: 'hidden', borderRadius: 2, border: '1px solid #ddd' }}>
                            <img src={form.studentPhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Remarks"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />

              <Button type="submit" variant="contained" size="large" disabled={saving}>
                {saving ? 'Submitting...' : editMode ? 'Save Changes' : 'Submit Registration'}
              </Button>
            </Stack>
          </Paper>
        ) : null}

        {editMode && tab === 1 ? (
          <Grid container spacing={2}>
            <Grid item xs={12} lg={7}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Certificate Preview</Typography>
                  <Box
                    sx={{
                      borderRadius: 4,
                      minHeight: 340,
                      p: 2,
                      position: 'relative',
                      border: '1px dashed #d4af37',
                      background: 'linear-gradient(180deg, #fffdf6 0%, #fff7df 100%)'
                    }}
                  >
                    <Typography variant="overline" color="text.secondary">
                      BK Scholar Awards 2026
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 4 }}>
                      {form.fullName || 'Student Name'}
                    </Typography>
                    <Typography color="text.secondary">
                      {selectedCategory?.title || form.categoryOther || 'Selected Category'}
                    </Typography>
                    <Typography color="text.secondary">
                      {form.schoolName || 'School / College'} · {form.className || 'Class'} · {form.percentage || 0}%
                    </Typography>

                    <Box
                      sx={{
                        width: 110,
                        height: 130,
                        position: 'absolute',
                        right: 24 + (form.certificateAdjustments?.photoX || 0) / 5,
                        top: 56 + (form.certificateAdjustments?.photoY || 0) / 5,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'rgba(30,58,138,0.10)',
                        transform: `scale(${form.certificateAdjustments?.photoScale || 1}) rotate(${form.certificateAdjustments?.photoRotation || 0}deg)`
                      }}
                    >
                      {form.studentPhotoUrl ? (
                        <img src={form.studentPhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : null}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Adjust Photo</Typography>

                    <Typography variant="body2">Scale</Typography>
                    <Slider
                      min={0.6}
                      max={2}
                      step={0.1}
                      value={form.certificateAdjustments?.photoScale || 1}
                      onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoScale: v } })}
                    />

                    <Typography variant="body2">Rotate</Typography>
                    <Slider
                      min={-15}
                      max={15}
                      step={1}
                      value={form.certificateAdjustments?.photoRotation || 0}
                      onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoRotation: v } })}
                    />

                    <Typography variant="body2">Move X</Typography>
                    <Slider
                      min={-100}
                      max={100}
                      step={1}
                      value={form.certificateAdjustments?.photoX || 0}
                      onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoX: v } })}
                    />

                    <Typography variant="body2">Move Y</Typography>
                    <Slider
                      min={-100}
                      max={100}
                      step={1}
                      value={form.certificateAdjustments?.photoY || 0}
                      onChange={(_, v) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoY: v } })}
                    />

                    <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Preview'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}
      </Stack>
    </Container>
  );
}