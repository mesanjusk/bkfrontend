import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  Skeleton,
  Stack,
  Tabs,
  Tab,
  Typography,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  EmojiEvents,
  School
} from '@mui/icons-material';
import api from '../api';
import StudentFormWizard from '../components/students/StudentFormWizard';
import StudentCertificatePreviewSection from '../components/students/StudentCertificatePreviewSection';
import {
  createInitialStudentForm,
  toStudentPayload
} from '../components/students/studentFormConfig';

function buildFullName(data) {
  return [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
}

function HeroCard({ editMode }) {
  return (
    <Box
      sx={{
        bgcolor: '#2497d3',
        color: '#fff',
        pt: { xs: 4, sm: 5 },
        pb: { xs: 5, sm: 6 },
        px: 2,
        textAlign: 'center',
        borderRadius: '0 0 24px 24px',
        mb: -2
      }}
    >
      <EmojiEvents sx={{ fontSize: 38, mb: 1.2, color: '#fff' }} />

      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, textTransform: 'uppercase' }}
      >
        BADTE KADAM
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 1,
          opacity: 0.95,
          fontSize: { xs: '0.82rem', sm: '0.92rem' }
        }}
      >
        {editMode ? 'Update your submitted details' : 'Scholar Awrads 2026' }
      </Typography>
    </Box>
  );
}

function SubmissionSuccess({ editMode, onBackToForm, onGoList }) {
  return (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 520,
          textAlign: 'center',
          borderRadius: 2,
          border: '1px solid #d9d9d9',
          p: { xs: 3, sm: 4 },
          bgcolor: '#fff'
        }}
      >
        <CheckCircle sx={{ fontSize: 70, color: 'success.main', mb: 1.5 }} />

        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          {editMode ? 'Changes Saved Successfully' : 'Registration Submitted Successfully'}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          {editMode
            ? 'Your student details have been updated successfully.'
            : 'Your registration has been submitted successfully. Confirmation will be sent on WhatsApp.'}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
          <Button
            variant="contained"
            onClick={onBackToForm}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              minWidth: 170,
              bgcolor: '#2497d3'
            }}
          >
            {editMode ? 'Edit Again' : 'Add Another'}
          </Button>

          <Button
            variant="outlined"
            onClick={onGoList}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              minWidth: 170
            }}
          >
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

function normalizeFormFromApi(data) {
  const initial = createInitialStudentForm();
  const hasOtherCategory = !data.categoryId && data.categoryOther;

  const next = {
    ...initial,
    ...data,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    fatherName: data.fatherName || '',
    categoryId: hasOtherCategory
      ? 'OTHER'
      : (data.categoryId?._id || data.categoryId || ''),
    categoryOther: data.categoryOther || '',
    subjects: data.subjects?.length ? data.subjects : initial.subjects,
    certificateAdjustments: {
      photoScale: data.certificateAdjustments?.photoScale ?? 1,
      photoX: data.certificateAdjustments?.photoX ?? 0,
      photoY: data.certificateAdjustments?.photoY ?? 0,
      photoRotation: data.certificateAdjustments?.photoRotation ?? 0
    }
  };

  next.fullName = data.fullName || buildFullName(next);

  return next;
}

function buildPayload(form, categories) {
  const isOther = String(form.categoryId) === 'OTHER';

  const category = categories.find(
    (c) => String(c._id) === String(form.categoryId)
  );

  const fullName = buildFullName(form);

  const payload = toStudentPayload({
    ...form,
    fullName,
    categoryId: isOther ? 'OTHER' : (form.categoryId || ''),
    categoryOther: isOther ? String(form.categoryOther || '').trim() : '',
    board: isOther ? (form.board || '') : (category?.board || form.board || ''),
    categoryName: isOther
      ? (form.categoryOther || form.categoryName || 'Other')
      : (category?.name || category?.title || form.categoryName || ''),
    resultImageUrl: form.resultImageUrl || form.marksheetFileUrl || '',
    certificatePhotoUrl: form.certificatePhotoUrl || form.studentPhotoUrl || ''
  });

  payload.firstName = form.firstName || '';
  payload.lastName = form.lastName || '';
  payload.fatherName = form.fatherName || '';
  payload.fullName = fullName;

  if (isOther) {
    payload.categoryId = 'OTHER';
    payload.categoryOther = String(form.categoryOther || '').trim();
  } else {
    payload.categoryId = form.categoryId || '';
    payload.categoryOther = '';
  }

  return payload;
}

export default function PublicStudentFormPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const editMode = Boolean(token);

  const [form, setForm] = useState(createInitialStudentForm());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    api.get('/students/public-categories').then((r) => setCategories(r.data || []));
  }, []);

  useEffect(() => {
    if (!editMode) return;

    api.get(`/students/public-edit/${token}`)
      .then((r) => {
        const data = r.data || {};
        setForm(normalizeFormFromApi(data));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [editMode, token]);

  const handleSubmit = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      const payload = buildPayload(form, categories);

      if (editMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSuccessMessage('Changes saved successfully.');
        setSubmitted(true);
      } else {
        const { data } = await api.post('/students/public-register', payload);
        setSuccessMessage(data?.message || 'Registration submitted successfully.');
        setSubmitted(true);
      }
    } catch (error) {
      setSuccessMessage(
        error?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddAnother = () => {
    setForm(createInitialStudentForm());
    setSuccessMessage('');
    setSubmitted(false);
    setTab(0);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Skeleton variant="rounded" height={480} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f0f7fc', minHeight: '100vh', pb: { xs: 4, sm: 6 } }}>
      <HeroCard editMode={editMode} />

      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 1.5, sm: 2 },
          px: { xs: 1.25, sm: 2 }
        }}
      >
        <Stack spacing={1.5}>
          {!submitted && successMessage && (
            <Fade in>
              <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                {successMessage}
              </Alert>
            </Fade>
          )}

          {!editMode && !submitted && !successMessage && (
            <Alert
              severity="info"
              icon={<School />}
              sx={{
                borderRadius: 2,
                bgcolor: '#fff',
                border: '1px solid #d9d9d9',
                color: '#111827'
              }}
            >
              
            </Alert>
          )}

          {editMode && !submitted && (
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              centered
              sx={{
                minHeight: 42,
                bgcolor: '#fff',
                borderRadius: 2,
                p: 0.5,
                border: '1px solid #d9d9d9',
                '& .MuiTabs-indicator': {
                  height: 'calc(100% - 8px)',
                  margin: '4px',
                  borderRadius: 2,
                  bgcolor: '#e8f4fb',
                  zIndex: 0
                },
                '& .MuiTab-root': {
                  minHeight: 38,
                  zIndex: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: { xs: '0.82rem', sm: '0.9rem' },
                  borderRadius: 2
                }
              }}
            >
              <Tab label="Form Details" />
              <Tab label="Preview & Adjust" />
            </Tabs>
          )}

          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid #d9d9d9',
              overflow: 'hidden',
              bgcolor: '#fff'
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5 }
              }}
            >
              {submitted ? (
                <SubmissionSuccess
                  editMode={editMode}
                  onBackToForm={handleAddAnother}
                  onGoList={handleBack}
                />
              ) : !editMode || tab === 0 ? (
                <StudentFormWizard
                  mode="public"
                  form={form}
                  setForm={setForm}
                  categories={categories}
                  onSubmit={handleSubmit}
                  saving={saving}
                  successMessage={successMessage}
                  topInfo={{
                    title: 'REGISTRATION FORM',
                    description: editMode
                      ? 'Update your details below.'
                      : 'Fill the form carefully and submit.'
                  }}
                />
              ) : (
                <Fade in>
                  <Box>
                    <StudentCertificatePreviewSection
                      form={form}
                      setForm={setForm}
                      categories={categories}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={saving}
                      sx={{
                        mt: 2,
                        py: 1.2,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#2497d3'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Adjustments'}
                    </Button>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}