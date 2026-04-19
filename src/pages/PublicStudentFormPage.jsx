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
  MenuItem,
  Slider,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Add,
  AutoAwesome,
  CheckCircle,
  Delete,
  DriveFolderUpload,
  EmojiEvents,
  Insights,
  School,
} from '@mui/icons-material';
import api from '../api';

/* ─────────────────────────── constants ─────────────────────────── */

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
  certificateAdjustments: { photoScale: 1, photoRotation: 0, photoX: 0, photoY: 0 },
};

/* ─────────────────────────── tokens ────────────────────────────── */

const T = {
  navy:   '#0e1f4d',
  gold:   '#b8892a',
  goldLt: '#f5e9d3',
  ivory:  '#faf8f4',
  ink:    '#1a1a2e',
  muted:  '#6b6b80',
  border: '#e6e0d4',
  white:  '#ffffff',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: T.white,
    fontSize: 14,
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.gold },
    '&.Mui-focused fieldset': { borderColor: T.navy, borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: T.navy },
};

/* ─────────────────────────── helpers ───────────────────────────── */

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ─────────────────────────── sub-components ────────────────────── */

function HeroBanner({ isEditMode }) {
  return (
    <Box
      sx={{
        borderRadius: '20px',
        background: `linear-gradient(135deg, ${T.navy} 0%, #1a3472 60%, #2a1a00 100%)`,
        color: T.white,
        p: { xs: '28px 22px', md: '40px 44px' },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(184,137,42,0.18) 0%, transparent 55%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack spacing={1.2} sx={{ maxWidth: 480 }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: { xs: 26, md: 34 },
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.3px',
            }}
          >
            {isEditMode ? 'Edit Registration' : 'Student Award Registration'}
          </Typography>
          <Typography sx={{ fontSize: 14, opacity: 0.78, lineHeight: 1.6 }}>
            BK Scholar Awards 2026 · A trusted, prestigious recognition platform for meritorious
            students.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
            <Chip
              icon={<School sx={{ fontSize: 14, color: `${T.gold} !important` }} />}
              label="Student Registration"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: T.white, fontSize: 12, height: 26 }}
            />
            <Chip
              icon={<Insights sx={{ fontSize: 14, color: `${T.gold} !important` }} />}
              label="CBSE Best 5"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: T.white, fontSize: 12, height: 26 }}
            />
            {isEditMode && (
              <Chip
                icon={<AutoAwesome sx={{ fontSize: 14, color: `${T.gold} !important` }} />}
                label="Edit Access"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: T.white, fontSize: 12, height: 26 }}
              />
            )}
          </Stack>
        </Stack>

        <Avatar
          sx={{
            bgcolor: 'rgba(184,137,42,0.22)',
            border: `1.5px solid rgba(184,137,42,0.4)`,
            width: 52,
            height: 52,
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <EmojiEvents sx={{ color: T.gold }} />
        </Avatar>
      </Stack>
    </Box>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${T.border}`,
        bgcolor: T.white,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: { xs: '20px 18px', md: '28px 28px' } }}>
        <Stack spacing={0.4} sx={{ mb: 2.5 }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 17,
              fontWeight: 700,
              color: T.ink,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: T.muted }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        <Divider sx={{ mb: 2.5, borderColor: T.border }} />
        {children}
      </CardContent>
    </Card>
  );
}

function UploadCard({ title, helperText, selectedLabel, onSelect, accept, children }) {
  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: `1.5px dashed ${T.border}`,
        bgcolor: T.ivory,
        p: '18px 16px',
      }}
    >
      <Stack spacing={1.2}>
        <Typography sx={{ fontWeight: 600, fontSize: 13, color: T.ink }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: T.muted, lineHeight: 1.55 }}>{helperText}</Typography>
        <Button
          fullWidth
          variant="outlined"
          component="label"
          startIcon={<DriveFolderUpload sx={{ fontSize: 17 }} />}
          sx={{
            borderRadius: '9px',
            borderColor: T.border,
            color: T.navy,
            fontSize: 13,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: T.white,
            py: '8px',
            '&:hover': { borderColor: T.navy, bgcolor: T.white },
          }}
        >
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
        {selectedLabel && (
          <Stack direction="row" spacing={0.8} alignItems="center">
            <CheckCircle sx={{ fontSize: 15, color: '#2e7d32' }} />
            <Typography sx={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>
              {selectedLabel}
            </Typography>
          </Stack>
        )}
        {children}
      </Stack>
    </Box>
  );
}

function Best5SummaryCard({ board, subjects, best5Preview }) {
  const isCbse = (board || '').trim().toUpperCase() === 'CBSE';
  if (!isCbse || !(subjects || []).some((s) => s.subject?.trim() && Number(s.marksObtained) > 0))
    return null;

  return (
    <Box
      sx={{
        borderRadius: '10px',
        bgcolor: '#eff6ff',
        border: '1px solid #bfdbfe',
        p: '12px 16px',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.3 }}>
        <Insights sx={{ fontSize: 15, color: '#1d4ed8' }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>
          CBSE Best 5 Preview
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 13, color: '#1e3a8a' }}>
        Top 5 total:{' '}
        <b>
          {best5Preview.total}/{best5Preview.maxTotal}
        </b>{' '}
        · Percentage: <b>{best5Preview.percentage.toFixed(2)}%</b>
      </Typography>
    </Box>
  );
}

function SliderRow({ label, min, max, step, value, onChange }) {
  return (
    <Stack spacing={0.6}>
      <Stack direction="row" justifyContent="space-between">
        <Typography sx={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, color: T.navy, fontWeight: 700 }}>{value}</Typography>
      </Stack>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(_, v) => onChange(v)}
        size="small"
        sx={{
          color: T.navy,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
            '&:hover': { boxShadow: `0 0 0 6px rgba(14,31,77,0.12)` },
          },
          '& .MuiSlider-rail': { opacity: 0.18 },
        }}
      />
    </Stack>
  );
}

function CertificatePreviewCard({ form, onAdjustmentChange }) {
  const photo = form.studentPhotoUrl || form.certificatePhotoUrl;
  const adj = form.certificateAdjustments || {};

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} lg={7}>
        <Card
          elevation={0}
          sx={{ borderRadius: '16px', border: `1px solid ${T.border}`, bgcolor: T.white }}
        >
          <CardContent sx={{ p: { xs: '20px 18px', md: '28px' } }}>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 17,
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Certificate Preview
            </Typography>
            <Typography sx={{ fontSize: 13, color: T.muted, mb: 2 }}>
              Live preview for award certificate photo positioning.
            </Typography>

            <Box
              sx={{
                borderRadius: '12px',
                minHeight: 300,
                p: { xs: '22px 18px', md: '28px 26px' },
                position: 'relative',
                background: `linear-gradient(160deg, #fffdf8 0%, #f7f5f0 100%)`,
                border: `1px solid ${T.border}`,
                overflow: 'hidden',
              }}
            >
              {/* decorative corner */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 90,
                  height: 90,
                  background: `radial-gradient(circle at top right, ${T.goldLt} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <Chip
                label="Scholar Awards Certificate"
                size="small"
                sx={{
                  bgcolor: T.goldLt,
                  color: T.gold,
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                  mb: 2.5,
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: { xs: 20, md: 24 },
                  fontWeight: 700,
                  color: T.ink,
                  lineHeight: 1.2,
                  pr: '130px',
                }}
              >
                {form.fullName || 'Student Name'}
              </Typography>
              <Typography sx={{ fontSize: 13, color: T.navy, mt: 0.8, fontWeight: 500 }}>
                {form.board || 'Board'} · Class {form.className || '—'} · {form.percentage || 0}%
              </Typography>
              <Typography sx={{ fontSize: 12, color: T.muted, mt: 0.5 }}>
                {form.schoolName || 'School Name'}
              </Typography>

              {/* photo box */}
              <Box
                sx={{
                  width: 100,
                  height: 120,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  bgcolor: '#eff4ff',
                  border: `2px solid ${T.border}`,
                  position: 'absolute',
                  right: { xs: 16, md: 24 },
                  top: 56,
                  transform: `translate(${(adj.photoX || 0) / 4}px, ${(adj.photoY || 0) / 4}px) scale(${adj.photoScale || 1}) rotate(${adj.photoRotation || 0}deg)`,
                }}
              >
                {photo && (
                  <img
                    src={photo}
                    alt="Student"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={5}>
        <Section title="Photo Placement" subtitle="Fine-tune certificate photo position.">
          <Stack spacing={2}>
            <SliderRow
              label="Scale"
              min={0.6} max={2} step={0.1}
              value={adj.photoScale || 1}
              onChange={(v) => onAdjustmentChange('photoScale', v)}
            />
            <SliderRow
              label="Rotate"
              min={-15} max={15} step={1}
              value={adj.photoRotation || 0}
              onChange={(v) => onAdjustmentChange('photoRotation', v)}
            />
            <SliderRow
              label="Move X"
              min={-100} max={100} step={1}
              value={adj.photoX || 0}
              onChange={(v) => onAdjustmentChange('photoX', v)}
            />
            <SliderRow
              label="Move Y"
              min={-100} max={100} step={1}
              value={adj.photoY || 0}
              onChange={(v) => onAdjustmentChange('photoY', v)}
            />
          </Stack>
        </Section>
      </Grid>
    </Grid>
  );
}

function SuccessConfirmationCard({ editLink }) {
  return (
    <Box
      sx={{
        borderRadius: '14px',
        bgcolor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        p: { xs: '20px 18px', md: '24px 28px' },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
        <CheckCircle sx={{ fontSize: 20, color: '#16a34a' }} />
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>
          Registration submitted successfully!
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 13, color: '#166534', mb: 1.5, lineHeight: 1.6 }}>
        Your award registration is now recorded. Edit details and certificate preview anytime using
        your secure link.
      </Typography>
      <Typography
        sx={{ fontSize: 12, color: T.muted, wordBreak: 'break-all', mb: 1.5 }}
      >
        Edit link:{' '}
        <Box component="a" href={editLink} sx={{ color: T.navy, fontWeight: 600 }}>
          {editLink}
        </Box>
      </Typography>
      <Button
        href={editLink}
        variant="contained"
        size="small"
        sx={{
          bgcolor: T.navy,
          borderRadius: '9px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 13,
          px: 2.5,
          '&:hover': { bgcolor: '#162d6a' },
        }}
      >
        Open my edit page
      </Button>
    </Box>
  );
}

/* ─────────────────────────── page ──────────────────────────────── */

export default function PublicStudentFormPage() {
  const { token } = useParams();
  const isEditMode = Boolean(token);
  const [form, setForm] = useState(initialForm);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  /* fetch existing data in edit mode */
  useEffect(() => {
    if (!isEditMode) { setLoading(false); return; }
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
            ...(data.certificateAdjustments || {}),
          },
        });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isEditMode, token]);

  /* CBSE Best 5 */
  const best5Preview = useMemo(() => {
    const valid = (form.subjects || []).filter(
      (s) => s.subject?.trim() && Number(s.maxMarks || 0) > 0,
    );
    const top5 = valid
      .map((s) => ({ marks: Number(s.marksObtained || 0), max: Number(s.maxMarks || 100) }))
      .sort((a, b) => b.marks - a.marks)
      .slice(0, 5);
    const total    = top5.reduce((sum, i) => sum + i.marks, 0);
    const maxTotal = top5.reduce((sum, i) => sum + i.max,   0);
    return { total, maxTotal, percentage: maxTotal ? (total / maxTotal) * 100 : 0 };
  }, [form.subjects]);

  /* subject helpers */
  const updateSubject = (idx, key, value) => {
    const subjects = [...(form.subjects || [emptySubject])];
    subjects[idx] = { ...subjects[idx], [key]: value };
    setForm((prev) => ({ ...prev, subjects }));
  };
  const removeSubject = (idx) => {
    const filtered = (form.subjects || []).filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, subjects: filtered.length ? filtered : [emptySubject] }));
  };

  /* save / submit */
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedMessage('');
    const payload = {
      ...form,
      resultImageUrl:      form.marksheetFileUrl || form.resultImageUrl,
      certificatePhotoUrl: form.studentPhotoUrl  || form.certificatePhotoUrl,
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

  /* shared field sx */
  const field = { sx: inputSx };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: T.ivory,
        py: { xs: '18px', md: '40px' },
        fontFamily: '"DM Sans", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Google Font imports via CSS vars trick — works without <head> access */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <Container maxWidth="lg" disableGutters sx={{ px: { xs: '14px', sm: '24px', md: '32px' } }}>
        <Stack spacing={2.5}>

          {/* ── hero ── */}
          <HeroBanner isEditMode={isEditMode} />

          {/* ── info banner (new registration only) ── */}
          {!isEditMode && (
            <Box
              sx={{
                borderRadius: '10px',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                p: '12px 16px',
              }}
            >
              <Typography sx={{ fontSize: 13, color: '#1d4ed8', lineHeight: 1.6 }}>
                Please enter student and parent mobile numbers carefully. No login required — your
                secure edit link is shared after submission.
              </Typography>
            </Box>
          )}

          {/* ── save message ── */}
          {savedMessage && (
            <Alert
              severity="success"
              sx={{ borderRadius: '10px', fontSize: 13, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              {savedMessage}
            </Alert>
          )}

          {/* ── success confirmation ── */}
          {successData?.editLink && <SuccessConfirmationCard editLink={successData.editLink} />}

          {/* ── loading skeleton ── */}
          {loading ? (
            <Card elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${T.border}` }}>
              <CardContent sx={{ p: '28px' }}>
                <Skeleton variant="text" width={200} height={24} />
                <Skeleton variant="rounded" height={160} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ── edit-mode tabs ── */}
              {isEditMode && (
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 40,
                    bgcolor: T.white,
                    borderRadius: '12px',
                    border: `1px solid ${T.border}`,
                    px: 1,
                    '& .MuiTab-root': {
                      fontSize: 13,
                      fontWeight: 600,
                      minHeight: 40,
                      textTransform: 'none',
                      color: T.muted,
                      '&.Mui-selected': { color: T.navy },
                    },
                    '& .MuiTabs-indicator': {
                      height: 2.5,
                      borderRadius: 10,
                      backgroundColor: T.navy,
                    },
                  }}
                >
                  <Tab label="Form Details" />
                  <Tab label="Certificate Preview" />
                </Tabs>
              )}

              {/* ══════════════ FORM TAB ══════════════ */}
              {(!isEditMode || tab === 0) && (
                <Grid container spacing={2.5} component="form" onSubmit={handleSave}>

                  {/* left / main column */}
                  <Grid item xs={12} md={showCertificateTools ? 7 : 12}>
                    <Stack spacing={2.5}>

                      {/* ── student details ── */}
                      <Section
                        title="Student Details"
                        subtitle="Fill in accurate information for award consideration."
                      >
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} {...field} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Student mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} {...field} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Parent mobile" value={form.parentMobile} onChange={(e) => setForm({ ...form, parentMobile: e.target.value })} {...field} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} {...field} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <TextField fullWidth required label="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} {...field} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <TextField fullWidth required label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} {...field} />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="number" label="Percentage (optional)" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} {...field} />
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <TextField fullWidth select label="Gender" value={form.gender || 'Any'} onChange={(e) => setForm({ ...form, gender: e.target.value })} {...field}>
                              <MenuItem value="Any">Any</MenuItem>
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <TextField fullWidth label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} {...field} />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} {...field} />
                          </Grid>
                        </Grid>
                      </Section>

                      {/* ── subject marks ── */}
                      <Section
                        title="Subject Marks"
                        subtitle="Add subject-wise marks. Used for CBSE Best 5 evaluation."
                      >
                        <Stack spacing={1.5}>
                          {(form.subjects || []).map((subject, idx) => (
                            <Grid key={idx} container spacing={1.2} alignItems="center">
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth label="Subject" value={subject.subject || ''}
                                  onChange={(e) => updateSubject(idx, 'subject', e.target.value)}
                                  {...field}
                                />
                              </Grid>
                              <Grid item xs={5} sm={3}>
                                <TextField
                                  fullWidth type="number" label="Marks"
                                  value={subject.marksObtained || 0}
                                  onChange={(e) => updateSubject(idx, 'marksObtained', Number(e.target.value))}
                                  {...field}
                                />
                              </Grid>
                              <Grid item xs={5} sm={3}>
                                <TextField
                                  fullWidth type="number" label="Max"
                                  value={subject.maxMarks || 100}
                                  onChange={(e) => updateSubject(idx, 'maxMarks', Number(e.target.value))}
                                  {...field}
                                />
                              </Grid>
                              <Grid item xs={2} sm={1}>
                                <Button
                                  color="error" onClick={() => removeSubject(idx)}
                                  sx={{ minWidth: 36, p: '6px', borderRadius: '8px' }}
                                >
                                  <Delete sx={{ fontSize: 18 }} />
                                </Button>
                              </Grid>
                            </Grid>
                          ))}

                          <Button
                            startIcon={<Add sx={{ fontSize: 16 }} />}
                            variant="outlined"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                subjects: [...(prev.subjects || []), { ...emptySubject }],
                              }))
                            }
                            sx={{
                              alignSelf: 'flex-start',
                              borderRadius: '9px',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: 13,
                              borderColor: T.border,
                              color: T.navy,
                              '&:hover': { borderColor: T.navy },
                            }}
                          >
                            Add subject
                          </Button>

                          <Best5SummaryCard
                            board={form.board}
                            subjects={form.subjects}
                            best5Preview={best5Preview}
                          />
                        </Stack>
                      </Section>

                      {/* ── uploads & remarks ── */}
                      <Section
                        title="Uploads & Remarks"
                        subtitle="Upload clear, readable files for verification."
                      >
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} md={6}>
                            <UploadCard
                              title="Marksheet"
                              helperText="Image or PDF accepted. Ensure all marks are clearly visible."
                              selectedLabel={
                                form.marksheetFileUrl || form.resultImageUrl
                                  ? 'Marksheet selected'
                                  : ''
                              }
                              accept="image/*,.pdf"
                              onSelect={(dataUrl) =>
                                setForm((prev) => ({
                                  ...prev,
                                  marksheetFileUrl: dataUrl,
                                  resultImageUrl: dataUrl,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <UploadCard
                              title="Student Photo"
                              helperText="Passport-style photo preferred for certificate quality."
                              selectedLabel={
                                form.studentPhotoUrl || form.certificatePhotoUrl
                                  ? 'Photo selected'
                                  : ''
                              }
                              accept="image/*"
                              onSelect={(dataUrl) =>
                                setForm((prev) => ({
                                  ...prev,
                                  studentPhotoUrl: dataUrl,
                                  certificatePhotoUrl: dataUrl,
                                }))
                              }
                            >
                              {(form.studentPhotoUrl || form.certificatePhotoUrl) && (
                                <Box
                                  sx={{
                                    width: 88,
                                    height: 104,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: `1.5px solid ${T.border}`,
                                  }}
                                >
                                  <img
                                    src={form.studentPhotoUrl || form.certificatePhotoUrl}
                                    alt="Student"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                              )}
                            </UploadCard>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth multiline minRows={3} label="Remarks"
                              value={form.remarks || ''}
                              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                              {...field}
                            />
                          </Grid>
                        </Grid>
                      </Section>

                      {/* ── submit ── */}
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        fullWidth
                        sx={{
                          bgcolor: T.navy,
                          borderRadius: '12px',
                          py: '13px',
                          fontWeight: 700,
                          fontSize: 15,
                          textTransform: 'none',
                          letterSpacing: '0.2px',
                          boxShadow: '0 6px 22px rgba(14,31,77,0.22)',
                          '&:hover': { bgcolor: '#162d6a', boxShadow: '0 8px 28px rgba(14,31,77,0.3)' },
                          '&:disabled': { bgcolor: '#c8cfdf', boxShadow: 'none' },
                        }}
                      >
                        {saving
                          ? 'Please wait…'
                          : isEditMode
                          ? 'Save changes'
                          : 'Submit registration'}
                      </Button>
                    </Stack>
                  </Grid>

                  {/* right sidebar — certificate access hint */}
                  {showCertificateTools && (
                    <Grid item xs={12} md={5}>
                      <Box
                        sx={{
                          borderRadius: '16px',
                          border: `1px solid ${T.border}`,
                          bgcolor: T.white,
                          p: { xs: '20px 18px', md: '24px 22px' },
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography
                            sx={{
                              fontFamily: '"Playfair Display", Georgia, serif',
                              fontSize: 16,
                              fontWeight: 700,
                            }}
                          >
                            Certificate Access
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
                            Certificate preview and photo placement are available in edit mode for
                            final polish.
                          </Typography>
                          {successData?.editLink && (
                            <Button
                              href={successData.editLink}
                              variant="outlined"
                              fullWidth
                              sx={{
                                borderRadius: '9px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: 13,
                                borderColor: T.navy,
                                color: T.navy,
                                mt: 0.5,
                                '&:hover': { bgcolor: '#f0f4ff' },
                              }}
                            >
                              Open Certificate Preview
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}

              {/* ══════════════ CERTIFICATE TAB ══════════════ */}
              {isEditMode && tab === 1 && (
                <Stack spacing={2.5}>
                  <CertificatePreviewCard
                    form={form}
                    onAdjustmentChange={(key, value) =>
                      setForm((prev) => ({
                        ...prev,
                        certificateAdjustments: {
                          ...(prev.certificateAdjustments || {}),
                          [key]: value,
                        },
                      }))
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      alignSelf: 'flex-start',
                      bgcolor: T.navy,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: 14,
                      px: 3,
                      py: '10px',
                      '&:hover': { bgcolor: '#162d6a' },
                    }}
                  >
                    {saving ? 'Saving…' : 'Save preview adjustments'}
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
