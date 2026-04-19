import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  MenuItem,
  Slider,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import {
  Add,
  AutoAwesome,
  CheckCircle,
  Delete,
  DriveFolderUpload,
  EmojiEvents,
  Insights,
  School
} from '@mui/icons-material';
import api from '../api';

const emptySubject = { subject: '', marksObtained: 0, maxMarks: 100 };

const initialForm = {
  fullName: '',
  mobile: '',
  parentMobile: '',
  schoolName: '',
  board: '',
  className: '',
  percentage: '',
  gender: 'Any',
  city: '',
  state: '',
  subjects: [emptySubject],
  marksheetFileUrl: '',
  studentPhotoUrl: '',
  remarks: '',
  certificateAdjustments: {
    photoScale: 1,
    photoRotation: 0,
    photoX: 0,
    photoY: 0
  }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function StudentRegistrationHero({ isEditMode }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background: 'linear-gradient(125deg, #0c1f4f 0%, #1f3c88 55%, #7b5a17 110%)',
        color: '#fff',
        boxShadow: '0 16px 36px rgba(12, 31, 79, 0.35)'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 27, md: 34 } }}>
                {isEditMode ? 'Edit Registration' : 'Student Award Registration'}
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 1 }}>
                BK Scholar Awards 2026 · A trusted, prestigious recognition platform for meritorious students.
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <EmojiEvents />
            </Avatar>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip icon={<School />} label="Student Registration" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
            <Chip icon={<Insights />} label="CBSE Best 5" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
            {isEditMode ? (
              <Chip icon={<AutoAwesome />} label="Edit Access" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FormSectionCard({ title, subtitle, children }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 12px 28px rgba(17, 38, 91, 0.08)' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
          </Box>
          <Divider />
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function UploadCard({ title, helperText, selectedLabel, onSelect, accept, children }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderColor: '#d8dfef', bgcolor: '#fbfdff' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography fontWeight={700}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{helperText}</Typography>
          <Button fullWidth variant="outlined" component="label" startIcon={<DriveFolderUpload />}>
            Select file
            <input
              hidden
              type="file"
              accept={accept}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                onSelect(dataUrl);
              }}
            />
          </Button>
          {selectedLabel ? <Alert icon={<CheckCircle />} severity="success">{selectedLabel}</Alert> : null}
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function Best5SummaryCard({ board, subjects, best5Preview }) {
  const isCbse = (board || '').trim().toUpperCase() === 'CBSE';
  if (!isCbse || !(subjects || []).some((s) => s.subject?.trim() && Number(s.marksObtained) > 0)) return null;

  return (
    <Alert
      icon={<Insights />}
      severity="info"
      sx={{
        borderRadius: 2,
        bgcolor: '#f4f8ff',
        border: '1px solid #d6e3ff'
      }}
    >
      <Typography fontWeight={700}>CBSE Best 5 Guidance</Typography>
      <Typography variant="body2">
        Top 5 subjects total: <b>{best5Preview.total}</b> / {best5Preview.maxTotal}. Preview percentage: <b>{best5Preview.percentage.toFixed(2)}%</b>
      </Typography>
    </Alert>
  );
}

function CertificatePreviewCard({ form, onAdjustmentChange }) {
  const photo = form.studentPhotoUrl || form.certificatePhotoUrl;
  const adjustments = form.certificateAdjustments || {};

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={7}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 12px 28px rgba(17, 38, 91, 0.1)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>Certificate Preview</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Live preview for your award certificate positioning.</Typography>
            <Box
              sx={{
                borderRadius: 3,
                minHeight: 320,
                p: { xs: 2, md: 3 },
                position: 'relative',
                background: 'linear-gradient(165deg, #fffdf8 0%, #f7fbff 100%)',
                border: '1px solid #e3d6b1'
              }}
            >
              <Chip label="Scholar Awards Certificate" sx={{ bgcolor: '#f0e2c1', color: '#6d4b0f', fontWeight: 700 }} />
              <Typography variant="h5" fontWeight={800} sx={{ mt: 3 }}>{form.fullName || 'Student Name'}</Typography>
              <Typography sx={{ color: '#1f3c88' }}>{form.board || 'Board'} · Class {form.className || '-'} · {form.percentage || 0}%</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>{form.schoolName || 'School Name'}</Typography>

              <Box
                sx={{
                  width: 118,
                  height: 140,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#eff4ff',
                  border: '2px solid #c3d2f6',
                  position: 'absolute',
                  right: { xs: 18, md: 28 },
                  top: 62,
                  transform: `translate(${(adjustments.photoX || 0) / 4}px, ${(adjustments.photoY || 0) / 4}px) scale(${adjustments.photoScale || 1}) rotate(${adjustments.photoRotation || 0}deg)`
                }}
              >
                {photo ? <img src={photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={5}>
        <FormSectionCard title="Photo Adjustment" subtitle="Fine-tune your certificate photo placement.">
          <Stack spacing={1.2}>
            <Typography variant="body2">Scale</Typography>
            <Slider min={0.6} max={2} step={0.1} value={adjustments.photoScale || 1} onChange={(_, v) => onAdjustmentChange('photoScale', v)} />
            <Typography variant="body2">Rotate</Typography>
            <Slider min={-15} max={15} step={1} value={adjustments.photoRotation || 0} onChange={(_, v) => onAdjustmentChange('photoRotation', v)} />
            <Typography variant="body2">Move X</Typography>
            <Slider min={-100} max={100} step={1} value={adjustments.photoX || 0} onChange={(_, v) => onAdjustmentChange('photoX', v)} />
            <Typography variant="body2">Move Y</Typography>
            <Slider min={-100} max={100} step={1} value={adjustments.photoY || 0} onChange={(_, v) => onAdjustmentChange('photoY', v)} />
          </Stack>
        </FormSectionCard>
      </Grid>
    </Grid>
  );
}

function SuccessConfirmationCard({ editLink }) {
  return (
    <Alert severity="success" sx={{ borderRadius: 3 }}>
      <Typography fontWeight={700}>Registration submitted successfully!</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        Your award registration is now recorded. You can edit your details and certificate preview anytime using your secure link.
      </Typography>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>Edit link: <a href={editLink}>{editLink}</a></Typography>
        <Button sx={{ mt: 1 }} variant="contained" href={editLink}>Open my edit page</Button>
      </Box>
    </Alert>
  );
}

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
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    api
      .get(`/students/public-edit/${token}`)
      .then((response) => {
        if (!active) return;
        const data = response.data || {};
        setForm({
          ...initialForm,
          ...data,
          subjects: data.subjects?.length ? data.subjects : [emptySubject],
          certificateAdjustments: {
            ...initialForm.certificateAdjustments,
            ...(data.certificateAdjustments || {})
          }
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isEditMode, token]);

  const best5Preview = useMemo(() => {
    const validSubjects = (form.subjects || []).filter((s) => s.subject?.trim() && Number(s.maxMarks || 0) > 0);
    const topFive = validSubjects
      .map((s) => ({ marks: Number(s.marksObtained || 0), max: Number(s.maxMarks || 100) }))
      .sort((a, b) => b.marks - a.marks)
      .slice(0, 5);
    const total = topFive.reduce((sum, item) => sum + item.marks, 0);
    const maxTotal = topFive.reduce((sum, item) => sum + item.max, 0);
    return {
      total,
      maxTotal,
      percentage: maxTotal ? (total / maxTotal) * 100 : 0
    };
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

    const payload = {
      ...form,
      resultImageUrl: form.marksheetFileUrl || form.resultImageUrl,
      certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl
    };

    try {
      if (isEditMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSavedMessage('Changes saved successfully.');
      } else {
        const { data } = await api.post('/students/public-register', payload);
        setSuccessData(data);
        setSavedMessage('Registration submitted successfully.');
      }
    } finally {
      setSaving(false);
    }
  };

  const showCertificateTools = isEditMode || Boolean(successData?.editLink);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7fc', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <StudentRegistrationHero isEditMode={isEditMode} />

          {!isEditMode ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Please enter student and parent mobile numbers carefully. No login is required; your secure edit link is shared after submission.
            </Alert>
          ) : null}

          {savedMessage ? <Alert severity="success" sx={{ borderRadius: 2 }}>{savedMessage}</Alert> : null}
          {successData?.editLink ? <SuccessConfirmationCard editLink={successData.editLink} /> : null}

          {loading ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Skeleton variant="text" width={220} />
                <Skeleton variant="rounded" height={160} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          ) : (
            <>
              {isEditMode ? (
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTabs-indicator': { height: 3, borderRadius: 10, backgroundColor: '#1f3c88' },
                    bgcolor: '#fff',
                    borderRadius: 2,
                    px: 1
                  }}
                >
                  <Tab label="Form Details" />
                  <Tab label="Certificate Preview" />
                </Tabs>
              ) : null}

              {(!isEditMode || tab === 0) ? (
                <Grid container spacing={2.5} component="form" onSubmit={handleSave}>
                  <Grid item xs={12} md={showCertificateTools ? 7 : 12}>
                    <Stack spacing={2.5}>
                      <FormSectionCard title="Student Details" subtitle="Fill in accurate information for award consideration.">
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} sm={6}><TextField fullWidth required label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Grid>
                          <Grid item xs={12} sm={6}><TextField fullWidth required label="Student mobile number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Grid>
                          <Grid item xs={12} sm={6}><TextField fullWidth required label="Parent mobile number" value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} /></Grid>
                          <Grid item xs={12} sm={6}><TextField fullWidth required label="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} /></Grid>
                          <Grid item xs={6} sm={4}><TextField fullWidth required label="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} /></Grid>
                          <Grid item xs={6} sm={4}><TextField fullWidth required label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} /></Grid>
                          <Grid item xs={12} sm={4}><TextField fullWidth type="number" label="Percentage (optional)" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} /></Grid>
                          <Grid item xs={6} sm={4}>
                            <TextField fullWidth select label="Gender" value={form.gender || 'Any'} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                              <MenuItem value="Any">Any</MenuItem>
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={6} sm={4}><TextField fullWidth label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Grid>
                          <Grid item xs={12} sm={4}><TextField fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Grid>
                        </Grid>
                      </FormSectionCard>

                      <FormSectionCard title="Subject Marks" subtitle="Add subject-wise marks. Helpful for CBSE Best 5 evaluation.">
                        <Stack spacing={1.5}>
                          {(form.subjects || []).map((subject, idx) => (
                            <Grid key={idx} container spacing={1.2} alignItems="center">
                              <Grid item xs={12} sm={5}><TextField fullWidth label="Subject" value={subject.subject || ''} onChange={(e) => updateSubject(idx, 'subject', e.target.value)} /></Grid>
                              <Grid item xs={5} sm={3}><TextField fullWidth type="number" label="Marks" value={subject.marksObtained || 0} onChange={(e) => updateSubject(idx, 'marksObtained', Number(e.target.value))} /></Grid>
                              <Grid item xs={5} sm={3}><TextField fullWidth type="number" label="Max" value={subject.maxMarks || 100} onChange={(e) => updateSubject(idx, 'maxMarks', Number(e.target.value))} /></Grid>
                              <Grid item xs={2} sm={1}><Button color="error" onClick={() => removeSubject(idx)}><Delete /></Button></Grid>
                            </Grid>
                          ))}
                          <Button startIcon={<Add />} variant="outlined" onClick={() => setForm((prev) => ({ ...prev, subjects: [...(prev.subjects || []), { ...emptySubject }] }))}>Add subject</Button>
                          <Best5SummaryCard board={form.board} subjects={form.subjects} best5Preview={best5Preview} />
                        </Stack>
                      </FormSectionCard>

                      <FormSectionCard title="Uploads & Remarks" subtitle="Upload clean and readable files for verification.">
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} md={6}>
                            <UploadCard
                              title="Upload Marksheet"
                              helperText="Accepted: image or PDF. Ensure all marks are clearly visible."
                              selectedLabel={form.marksheetFileUrl || form.resultImageUrl ? 'Marksheet selected' : ''}
                              accept="image/*,.pdf"
                              onSelect={(dataUrl) => setForm((prev) => ({ ...prev, marksheetFileUrl: dataUrl, resultImageUrl: dataUrl }))}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <UploadCard
                              title="Upload Student Photo"
                              helperText="Passport-style photo preferred for certificate quality."
                              selectedLabel={form.studentPhotoUrl || form.certificatePhotoUrl ? 'Photo selected' : ''}
                              accept="image/*"
                              onSelect={(dataUrl) => setForm((prev) => ({ ...prev, studentPhotoUrl: dataUrl, certificatePhotoUrl: dataUrl }))}
                            >
                              {(form.studentPhotoUrl || form.certificatePhotoUrl) ? (
                                <Box sx={{ width: 112, height: 132, borderRadius: 2, overflow: 'hidden', border: '1px solid #cad7f6' }}>
                                  <img src={form.studentPhotoUrl || form.certificatePhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                              ) : null}
                            </UploadCard>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField fullWidth multiline minRows={3} label="Remarks" value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                          </Grid>
                        </Grid>
                      </FormSectionCard>

                      <Button type="submit" variant="contained" size="large" disabled={saving} fullWidth sx={{ py: 1.2, fontWeight: 700 }}>
                        {saving ? 'Please wait...' : isEditMode ? 'Save changes' : 'Submit registration'}
                      </Button>
                    </Stack>
                  </Grid>

                  {showCertificateTools ? (
                    <Grid item xs={12} md={5}>
                      <Card sx={{ borderRadius: 3, bgcolor: '#fffef8', border: '1px solid #f1dfb0' }}>
                        <CardContent>
                          <Stack spacing={1.2}>
                            <Typography variant="h6" fontWeight={700}>Certificate Access</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Certificate preview and photo placement are available in edit mode for final polish.
                            </Typography>
                            {successData?.editLink ? <Button href={successData.editLink} variant="outlined" fullWidth>Open Certificate Preview</Button> : null}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ) : null}
                </Grid>
              ) : null}

              {isEditMode && tab === 1 ? (
                <Stack spacing={2}>
                  <CertificatePreviewCard
                    form={form}
                    onAdjustmentChange={(key, value) =>
                      setForm((prev) => ({
                        ...prev,
                        certificateAdjustments: {
                          ...(prev.certificateAdjustments || {}),
                          [key]: value
                        }
                      }))
                    }
                  />
                  <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ alignSelf: 'flex-start' }}>
                    {saving ? 'Saving...' : 'Save preview adjustments'}
                  </Button>
                </Stack>
              ) : null}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
