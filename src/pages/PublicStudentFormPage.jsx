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
import StudentFormWizard, {
  StudentCertificatePreviewSection
} from '../components/students/StudentFormWizard';
import {
  createInitialStudentForm,
  toStudentPayload
} from '../components/students/studentFormConfig';

function HeroCard({ editMode }) {
  return (
    <Box
      sx={{
        bgcolor: '#111827',
        color: '#fff',
        pt: { xs: 4, sm: 5 },
        pb: { xs: 5, sm: 6 },
        px: 2,
        textAlign: 'center',
        borderRadius: '0 0 24px 24px',
        mb: -2
      }}
    >
      <EmojiEvents sx={{ fontSize: 40, mb: 1.25, color: '#fbbf24' }} />
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ letterSpacing: -0.4, fontSize: { xs: '1.3rem', sm: '1.6rem' } }}
      >
        Badte Kadam
      </Typography>
      <Typography
        variant="body2"
        sx={{ opacity: 0.78, mt: 0.5, fontSize: { xs: '0.84rem', sm: '0.92rem' } }}
      >
        Scholar Awards 2026 · Merit Recognition
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 1.25,
          opacity: 0.9,
          fontWeight: 500,
          fontSize: { xs: '0.8rem', sm: '0.9rem' }
        }}
      >
        {editMode ? 'Update your submitted details' : 'Student Registration Form'}
      </Typography>
    </Box>
  );
}

function SubmissionSuccess({ editMode, onBackToForm, onGoList }) {
  return (
    <Box
      sx={{
        minHeight: '60vh',
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
          borderRadius: 4,
          border: '1px solid #e5e7eb',
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
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              minWidth: 170
            }}
          >
            {editMode ? 'Edit Again' : 'Add Another'}
          </Button>

          <Button
            variant="outlined"
            onClick={onGoList}
            sx={{
              borderRadius: 2.5,
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

    api.get(`/students/public-edit/${token}`).then((r) => {
      const data = r.data || {};
      setForm({
        ...createInitialStudentForm(),
        ...data,
        categoryId: data.categoryId?._id || data.categoryId || '',
        subjects: data.subjects?.length ? data.subjects : createInitialStudentForm().subjects,
        certificateAdjustments: {
          photoScale: data.certificateAdjustments?.photoScale ?? 1,
          photoX: data.certificateAdjustments?.photoX ?? 0,
          photoY: data.certificateAdjustments?.photoY ?? 0,
          photoRotation: data.certificateAdjustments?.photoRotation ?? 0
        }
      });
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [editMode, token]);

  const handleSubmit = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      const payload = toStudentPayload({
        ...form,
        board: categories.find((c) => String(c._id) === String(form.categoryId))?.board || form.board || '',
        resultImageUrl: form.resultImageUrl || form.marksheetFileUrl || '',
        certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl || ''
      });

      if (editMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSuccessMessage('Changes saved successfully.');
        setSubmitted(true);
      } else {
        const { data } = await api.post('/students/public-register', payload);
        setSuccessMessage(data?.message || 'Registration submitted successfully.');
        setSubmitted(true);
      }
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
        <Skeleton variant="rounded" height={480} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: { xs: 4, sm: 6 } }}>
      <HeroCard editMode={editMode} />

      <Container
        maxWidth="sm"
        sx={{
          mt: { xs: 1.5, sm: 2 },
          px: { xs: 1.25, sm: 2 }
        }}
      >
        <Stack spacing={1.5}>
          {!submitted && successMessage && (
            <Fade in>
              <Alert
                severity="success"
                variant="filled"
                sx={{
                  borderRadius: 2.5,
                  boxShadow: '0 8px 18px rgba(15,23,42,0.08)'
                }}
              >
                {successMessage}
              </Alert>
            </Fade>
          )}

          {!editMode && !submitted && !successMessage && (
            <Alert
              severity="info"
              icon={<School />}
              sx={{
                borderRadius: 2.5,
                bgcolor: '#fff',
                border: '1px solid #e2e8f0',
                color: '#111827',
                '& .MuiAlert-message': {
                  fontSize: { xs: '0.82rem', sm: '0.9rem' }
                }
              }}
            >
              Confirmation will be sent on WhatsApp after successful submission.
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
                borderRadius: 2.5,
                p: 0.5,
                border: '1px solid #e5e7eb',
                '& .MuiTabs-indicator': {
                  height: 'calc(100% - 8px)',
                  margin: '4px',
                  borderRadius: 2,
                  bgcolor: '#f1f5f9',
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
              <Tab label="Preview" />
            </Tabs>
          )}

          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
              border: '1px solid #eef2f7',
              overflow: 'hidden'
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
                    title: editMode ? 'Update Details' : 'Register Now',
                    description: editMode
                      ? 'Update your details below.'
                      : 'Fill the form carefully and submit.'
                  }}
                />
              ) : (
                <Fade in>
                  <Box>
                    <StudentCertificatePreviewSection form={form} />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={saving}
                      sx={{
                        mt: 2,
                        py: 1.25,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#111827'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Adjustments'}
                    </Button>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>

          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              opacity: 0.6,
              display: 'block',
              mt: 0.5,
              pb: 1
            }}
          >
            Secure Registration · © 2026 Badte Kadam
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}