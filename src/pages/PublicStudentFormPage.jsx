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
  School,
  WhatsApp
} from '@mui/icons-material';
import api from '../api';
import StudentFormWizard from '../components/students/StudentFormWizard';
import { uploadPublicFile } from '../services/uploadService';
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
        pt: { xs: 4, sm: 5, md: 6 },
        pb: { xs: 5, sm: 6, md: 7 },
        px: { xs: 2, md: 3 },
        textAlign: 'center',
        borderRadius: '0 0 28px 28px',
        mb: { xs: -2, md: -3 }
      }}
    >
      <EmojiEvents sx={{ fontSize: { xs: 38, md: 44 }, mb: 1.2, color: '#fff' }} />

      <Typography
        variant="h5"
        fontWeight={800}
        sx={{
          fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        BADTE KADAM
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 1,
          opacity: 0.95,
          fontSize: { xs: '0.82rem', sm: '0.92rem', md: '1rem' }
        }}
      >
        {editMode ? 'Update your submitted details' : 'Scholar Awards 2026'}
      </Typography>
    </Box>
  );
}

function SubmissionSuccess({
  editMode,
  onBackToForm,
  onGoList,
  whatsappLink = 'https://wa.me/917020955501'
}) {
  return (
    <Box
      sx={{
        minHeight: { xs: '50vh', md: '58vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 560,
          textAlign: 'center',
          borderRadius: 3,
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

        <Stack spacing={1.5}>
          {!editMode && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<WhatsApp />}
              component="a"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#25D366',
                '&:hover': { bgcolor: '#1ebe5d' }
              }}
            >
              Open WhatsApp Chat
            </Button>
          )}

          {editMode && (
            <Button
              fullWidth
              variant="outlined"
              onClick={onGoList}
              sx={{
                py: 1.1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700
              }}
            >
              Go Back
            </Button>
          )}
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
    studentPhotoPreviewUrl: data.studentPhotoUrl || '',
    studentPhotoFile: null,
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

  const whatsappLink = 'https://wa.me/917020955501';

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
      let nextForm = form;

      if (form.studentPhotoFile) {
        const uploaded = await uploadPublicFile(
          form.studentPhotoFile,
          'bk_awards/student_photos',
          { forcePng: true, removeBackground: true }
        );

        const uploadedUrl = uploaded?.url || '';
        nextForm = {
          ...form,
          studentPhotoUrl: uploadedUrl,
          certificatePhotoUrl: uploadedUrl,
          studentPhotoPreviewUrl: uploadedUrl,
          studentPhotoFile: null
        };
        setForm(nextForm);
      }

      const payload = buildPayload(nextForm, categories);

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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rounded" height={560} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f0f7fc', minHeight: '100vh', pb: { xs: 4, sm: 6 } }}>
      <HeroCard editMode={editMode} />

      <Container
        maxWidth={false}
        sx={{
          mt: { xs: 1.5, sm: 2, md: 3 },
          px: { xs: 1.25, sm: 2, md: 3, lg: 4, xl: 6 }
        }}
      >
        <Box sx={{ maxWidth: editMode ? '1600px' : '1100px', mx: 'auto' }}>
          <Stack spacing={2}>
            {!submitted && successMessage && (
              <Fade in>
                <Alert severity="success" variant="filled" sx={{ borderRadius: 2.5 }}>
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
                  border: '1px solid #d9d9d9',
                  color: '#111827'
                }}
              >
                Fill the form carefully and upload a clear student photo for certificate preview.
              </Alert>
            )}

            {editMode && !submitted && (
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                centered
                sx={{
                  minHeight: 46,
                  bgcolor: '#fff',
                  borderRadius: 2.5,
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
                    minHeight: 40,
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
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                border: '1px solid #d9d9d9',
                overflow: 'hidden',
                bgcolor: '#fff'
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 1.5, sm: 2.5, md: 3 }
                }}
              >
                {submitted ? (
                  <SubmissionSuccess
                    editMode={editMode}
                    onBackToForm={handleAddAnother}
                    onGoList={handleBack}
                    whatsappLink={whatsappLink}
                  />
                ) : editMode ? (
                  <>
                    {tab === 0 ? (
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
                          description: 'Update your details below.'
                        }}
                      />
                    ) : (
                      <Fade in>
                        <Box sx={{ minHeight: { md: 'calc(100vh - 260px)' } }}>
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
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 700,
                              bgcolor: '#2497d3',
                              '&:hover': { bgcolor: '#1e88c0' }
                            }}
                          >
                            {saving ? 'Saving...' : 'Save Adjustments'}
                          </Button>
                        </Box>
                      </Fade>
                    )}
                  </>
                ) : (
                  <Box sx={{ minWidth: 0 }}>
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
                        description: 'Fill the form carefully and submit. Certificate preview becomes available on edit only.'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}