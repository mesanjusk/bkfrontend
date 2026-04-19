import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert, Avatar, Box, Button, Card, CardContent, Chip, Container, Divider,
  MenuItem, Slider, Skeleton, Stack, Tab, Tabs, TextField, Typography, Fade
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Add, AutoAwesome, CheckCircle, Delete, DriveFolderUpload, EmojiEvents,
  Insights, School
} from '@mui/icons-material';
import api from '../api';

const emptySubject = { subject: '', marksObtained: 0, maxMarks: 100 };

const initialForm = {
  fullName: '', mobile: '', parentMobile: '', schoolName: '', board: '',
  className: '', percentage: '', gender: 'Any', city: '', state: '',
  subjects: [emptySubject], marksheetFileUrl: '', studentPhotoUrl: '', remarks: '',
  certificateAdjustments: { photoScale: 1, photoRotation: 0, photoX: 0, photoY: 0 }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// --- Aesthetic Minimalist Components ---

const FormSection = ({ title, subtitle, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5, letterSpacing: 1.2 }}>
      {title}
    </Typography>
    {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>{subtitle}</Typography>}
    <Stack spacing={2}>{children}</Stack>
  </Box>
);

const MinimalTextField = (props) => (
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
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (!isEditMode) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    api.get(`/students/public-edit/${token}`)
      .then((response) => {
        if (!active) return;
        const data = response.data || {};
        setForm({
          ...initialForm, ...data,
          subjects: data.subjects?.length ? data.subjects : [emptySubject],
          certificateAdjustments: { ...initialForm.certificateAdjustments, ...(data.certificateAdjustments || {}) }
        });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isEditMode, token]);

  const best5Preview = useMemo(() => {
    const validSubjects = (form.subjects || []).filter((s) => s.subject?.trim() && Number(s.maxMarks || 0) > 0);
    const topFive = validSubjects
      .map((s) => ({ marks: Number(s.marksObtained || 0), max: Number(s.maxMarks || 100) }))
      .sort((a, b) => b.marks - a.marks)
      .slice(0, 5);
    const total = topFive.reduce((sum, item) => sum + item.marks, 0);
    const maxTotal = topFive.reduce((sum, item) => sum + item.max, 0);
    return { total, maxTotal, percentage: maxTotal ? (total / maxTotal) * 100 : 0 };
  }, [form.subjects]);

  const updateSubject = (idx, key, value) => {
    const subjects = [...(form.subjects || [emptySubject])];
    subjects[idx] = { ...subjects[idx], [key]: value };
    setForm((prev) => ({ ...prev, subjects }));
  };

  const removeSubject = (idx) => {
    const filtered = (form.subjects || []).filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, subjects: filtered.length ? filtered : [emptySubject] }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedMessage('');
    const payload = { ...form, resultImageUrl: form.marksheetFileUrl || form.resultImageUrl, certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl };
    try {
      if (isEditMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSavedMessage('Changes saved successfully.');
      } else {
        const { data } = await api.post('/students/public-register', payload);
        setSuccessData(data);
        setSavedMessage('Registration submitted successfully.');
      }
    } finally { setSaving(false); }
  };

  const showCertificateTools = isEditMode || Boolean(successData?.editLink);

  if (loading) return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3, mb: 2 }} />
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
    </Container>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', pb: 10 }}>
      {/* Header Section */}
      <Box sx={{ bgcolor: '#1a1a1a', color: '#fff', pt: 6, pb: 8, px: 3, textAlign: 'center', borderRadius: '0 0 32px 32px' }}>
        <School sx={{ fontSize: 40, mb: 1, color: '#d4af37' }} />
        <Typography variant="h4" fontWeight={800}>{isEditMode ? 'Edit Profile' : 'Award Registration'}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>BK Scholar Awards 2026</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -4 }}>
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            
            {savedMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{savedMessage}</Alert>}
            {!isEditMode && <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>Secure link shared after submission.</Alert>}
            {successData?.editLink && (
               <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Registration successful! <Button href={successData.editLink} size="small" variant="contained" sx={{ mt: 1 }}>Edit via link</Button>
               </Alert>
            )}

            {isEditMode && (
              <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Details" />
                <Tab label="Preview" />
              </Tabs>
            )}

            {(!isEditMode || tab === 0) && (
              <form onSubmit={handleSave}>
                <FormSection title="Student Details" subtitle="Accurate info for award consideration.">
                  <MinimalTextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  <Stack direction="row" spacing={2}>
                    <MinimalTextField label="Student Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
                    <MinimalTextField label="Parent Mobile" value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} required />
                  </Stack>
                  <MinimalTextField label="School Name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} required />
                  <Grid container spacing={2}>
                    <Grid item xs={6}><MinimalTextField label="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} required /></Grid>
                    <Grid item xs={6}><MinimalTextField label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required /></Grid>
                    <Grid item xs={6}><MinimalTextField type="number" label="Percentage" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} /></Grid>
                    <Grid item xs={6}>
                      <MinimalTextField select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <MenuItem value="Any">Any</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </MinimalTextField>
                    </Grid>
                    <Grid item xs={6}><MinimalTextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Grid>
                    <Grid item xs={6}><MinimalTextField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Grid>
                  </Grid>
                </FormSection>

                <FormSection title="Subject Marks" subtitle="Helpful for CBSE Best 5 evaluation.">
                  {form.subjects.map((s, idx) => (
                    <Stack key={idx} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <MinimalTextField placeholder="Subject" value={s.subject} onChange={(e) => updateSubject(idx, 'subject', e.target.value)} />
                      <MinimalTextField placeholder="Marks" type="number" sx={{ width: 100 }} value={s.marksObtained} onChange={(e) => updateSubject(idx, 'marksObtained', e.target.value)} />
                      <MinimalTextField placeholder="Max" type="number" sx={{ width: 80 }} value={s.maxMarks} onChange={(e) => updateSubject(idx, 'maxMarks', e.target.value)} />
                      <IconButton color="error" onClick={() => removeSubject(idx)}><Delete fontSize="small" /></IconButton>
                    </Stack>
                  ))}
                  <Button startIcon={<Add />} size="small" onClick={() => setForm((p) => ({ ...p, subjects: [...p.subjects, { ...emptySubject }] }))}>Add Subject</Button>
                  
                  {form.board.toUpperCase() === 'CBSE' && (
                    <Alert icon={<Insights />} severity="info" sx={{ borderRadius: 2, mt: 1 }}>
                      Best 5 Preview: <b>{best5Preview.percentage.toFixed(2)}%</b>
                    </Alert>
                  )}
                </FormSection>

                <FormSection title="Uploads & Remarks">
                   <Stack spacing={2}>
                      <Button fullWidth variant="outlined" component="label" startIcon={<DriveFolderUpload />} sx={{ py: 1.5, borderRadius: 3, borderStyle: 'dashed' }}>
                        {form.marksheetFileUrl || form.resultImageUrl ? 'Marksheet Uploaded' : 'Upload Marksheet'}
                        <input hidden type="file" accept="image/*,.pdf" onChange={async (e) => {
                           const url = await fileToDataUrl(e.target.files[0]);
                           setForm(p => ({...p, marksheetFileUrl: url, resultImageUrl: url}))
                        }} />
                      </Button>
                      <Button fullWidth variant="outlined" component="label" startIcon={<DriveFolderUpload />} sx={{ py: 1.5, borderRadius: 3, borderStyle: 'dashed' }}>
                        {form.studentPhotoUrl || form.certificatePhotoUrl ? 'Photo Uploaded' : 'Upload Photo'}
                        <input hidden type="file" accept="image/*" onChange={async (e) => {
                           const url = await fileToDataUrl(e.target.files[0]);
                           setForm(p => ({...p, studentPhotoUrl: url, certificatePhotoUrl: url}))
                        }} />
                      </Button>
                      <MinimalTextField multiline minRows={2} label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                   </Stack>
                </FormSection>

                <Button fullWidth type="submit" variant="contained" size="large" disabled={saving} sx={{ py: 2, borderRadius: 3, fontWeight: 700 }}>
                  {saving ? 'Processing...' : isEditMode ? 'Save Changes' : 'Submit Registration'}
                </Button>
              </form>
            )}

            {isEditMode && tab === 1 && (
              <Stack spacing={3}>
                <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(165deg, #fffdf8 0%, #f7fbff 100%)', border: '1px solid #e3d6b1', position: 'relative', minHeight: 280 }}>
                  <Typography variant="h6" fontWeight={800}>{form.fullName || 'Name'}</Typography>
                  <Typography variant="caption" display="block">{form.board} · Class {form.className} · {form.percentage}%</Typography>
                  <Box sx={{ 
                    width: 80, height: 100, bgcolor: '#eff4ff', border: '2px solid #c3d2f6', borderRadius: 2,
                    position: 'absolute', right: 24, top: 24, overflow: 'hidden',
                    transform: `translate(${form.certificateAdjustments.photoX / 4}px, ${form.certificateAdjustments.photoY / 4}px) scale(${form.certificateAdjustments.photoScale}) rotate(${form.certificateAdjustments.photoRotation}deg)`
                  }}>
                    {(form.studentPhotoUrl || form.certificatePhotoUrl) && <img src={form.studentPhotoUrl || form.certificatePhotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </Box>
                </Box>
                
                <FormSection title="Adjust Photo Position">
                  <Stack spacing={1}>
                    <Typography variant="caption">Scale</Typography>
                    <Slider size="small" min={0.6} max={2} step={0.1} value={form.certificateAdjustments.photoScale} onChange={(_, v) => setForm(p => ({...p, certificateAdjustments: {...p.certificateAdjustments, photoScale: v}}))} />
                    <Typography variant="caption">Move X / Y</Typography>
                    <Slider size="small" min={-100} max={100} value={form.certificateAdjustments.photoX} onChange={(_, v) => setForm(p => ({...p, certificateAdjustments: {...p.certificateAdjustments, photoX: v}}))} />
                    <Slider size="small" min={-100} max={100} value={form.certificateAdjustments.photoY} onChange={(_, v) => setForm(p => ({...p, certificateAdjustments: {...p.certificateAdjustments, photoY: v}}))} />
                  </Stack>
                </FormSection>
                
                <Button variant="contained" fullWidth onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Adjustments'}</Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}