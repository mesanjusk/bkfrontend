import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { School } from '@mui/icons-material';
import api from '../api';
import StudentFormWizard, { StudentCertificatePreviewSection } from '../components/students/StudentFormWizard';
import { createInitialStudentForm, normalizeStudentForm, toStudentPayload } from '../components/students/studentFormConfig';

export default function PublicStudentFormPage() {
  const { token } = useParams();
  const isEditMode = Boolean(token);
  const [form, setForm] = useState(createInitialStudentForm);
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
    api.get(`/students/public-edit/${token}`)
      .then((response) => {
        if (!active) return;
        setForm(normalizeStudentForm(response.data || {}));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isEditMode, token]);

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage('');
    try {
      const payload = toStudentPayload(form);
      if (isEditMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSavedMessage('Changes saved successfully.');
        return;
      }
      const { data } = await api.post('/students/public-register', payload);
      setSuccessData(data);
      setSavedMessage('Registration submitted successfully.');
      setForm(createInitialStudentForm());
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton variant="rounded" height={460} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', pb: 8 }}>
      <Box sx={{ background: 'linear-gradient(165deg, #0f1b3d 0%, #1e3f7a 60%, #7d6526 130%)', color: '#fff', pt: 6, pb: 8, px: 3, textAlign: 'center', borderRadius: '0 0 30px 30px' }}>
        <School sx={{ fontSize: 40, mb: 1, color: '#f4d27b' }} />
        <Typography variant="h4" fontWeight={800}>{isEditMode ? 'Edit Registration' : 'Scholar Registration Wizard'}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.84, mt: 1 }}>BK Scholar Awards 2026</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -4 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {successData?.editLink && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration successful. <Button size="small" href={successData.editLink}>Open edit link</Button>
              </Alert>
            )}

            {isEditMode && (
              <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
                <Tab label="Details" />
                <Tab label="Certificate Preview" />
              </Tabs>
            )}

            {(!isEditMode || tab === 0) && (
              <StudentFormWizard
                mode="public"
                form={form}
                setForm={setForm}
                onSubmit={handleSave}
                saving={saving}
                successMessage={savedMessage}
                topInfo={{
                  title: 'Secure registration flow',
                  description: 'After successful submission, a secure link can be shared for future edits.'
                }}
              />
            )}

            {isEditMode && tab === 1 && (
              <Stack spacing={2}>
                <StudentCertificatePreviewSection
                  form={form}
                  editable
                  onAdjustmentsChange={(patch) => setForm((prev) => ({
                    ...prev,
                    certificateAdjustments: { ...prev.certificateAdjustments, ...patch }
                  }))}
                />
                <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save adjustments'}</Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
