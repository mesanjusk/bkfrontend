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
  LinearProgress,
  Stack,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import { CheckCircle, EmojiEvents, School } from '@mui/icons-material';
import api from '../api';
import StudentFormWizard, { StudentCertificatePreviewSection } from '../components/students/StudentFormWizard';
import { createInitialStudentForm, toStudentPayload } from '../components/students/studentFormConfig';

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
              Badte Kadam
            </Typography>
          </Stack>
          <Typography sx={{ opacity: 0.92 }}>
            {editMode
              ? 'Scholar Awards 2026'
              : ''}
          </Typography>
          
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function PublicStudentFormPage() {
  const { token } = useParams();
  const editMode = Boolean(token);

  const [form, setForm] = useState(createInitialStudentForm());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
    });
  }, [editMode, token]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c._id) === String(form.categoryId)),
    [categories, form.categoryId]
  );

  const isCbse = useMemo(() => {
    const board = String(selectedCategory?.board || form.board || '').toUpperCase();
    const title = String(selectedCategory?.title || '').toUpperCase();
    return board === 'CBSE' || title.includes('CBSE');
  }, [selectedCategory, form.board]);

  const handleSubmit = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      const payload = toStudentPayload({
        ...form,
        board: selectedCategory?.board || form.board || '',
        resultImageUrl: form.resultImageUrl || form.marksheetFileUrl || '',
        certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl || ''
      });

      if (editMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSuccessMessage('Your form has been updated successfully.');
      } else {
        const { data } = await api.post('/students/public-register', payload);
        setSuccessMessage(data?.message || 'Registration submitted successfully.');
        setForm(createInitialStudentForm());
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
          <Card>
            <CardContent>
              <LinearProgress />
            </CardContent>
          </Card>
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
            ? ''
            : 'After successful registration, confirmation will be sent on WhatsApp to the student mobile number.'}
        </Alert>

        {successMessage ? (
          <Alert severity="success" icon={<CheckCircle />}>
            {successMessage}
          </Alert>
        ) : null}

        {editMode ? (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Form Details" />
            <Tab label="Certificate Preview" />
          </Tabs>
        ) : null}

        {!editMode || tab === 0 ? (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <StudentFormWizard
                mode="public"
                form={form}
                setForm={setForm}
                categories={categories}
                onSubmit={handleSubmit}
                saving={saving}
                successMessage={successMessage}
                topInfo={{
                  title: editMode ? 'Edit registration form' : 'Student self registration',
                  description: editMode
                    ? 'Update your submitted form details below.'
                    : 'Fill the guided wizard step by step. Confirmation will be sent on WhatsApp after submission.'
                }}
              />
            </CardContent>
          </Card>
        ) : null}

        {editMode && tab === 1 ? (
          <Box>
            <StudentCertificatePreviewSection form={form} />
          </Box>
        ) : null}
      </Stack>
    </Container>
  );
}