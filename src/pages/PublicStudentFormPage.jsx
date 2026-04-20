import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Container, IconButton,
  LinearProgress, Stack, Tabs, Tab, Typography, Fade
} from '@mui/material';
import { CheckCircle, EmojiEvents, School, Tune, ArrowBack } from '@mui/icons-material';
import api from '../api';
import StudentFormWizard, { StudentCertificatePreviewSection } from '../components/students/StudentFormWizard';
import { createInitialStudentForm, toStudentPayload } from '../components/students/studentFormConfig';

// --- Aesthetic Hero Component ---
function HeroCard({ editMode }) {
  return (
    <Box sx={{ 
      bgcolor: '#1a1a1a', 
      color: '#fff', 
      pt: 6, pb: 4, px: 3, 
      textAlign: 'center', 
      borderRadius: '0 0 32px 32px',
      mb: -3 // Overlap for the content below
    }}>
      <EmojiEvents sx={{ fontSize: 48, mb: 1.5, color: '#d4af37' }} />
      <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
        Badte Kadam
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
        Scholar Awards 2026 · Merit Recognition
      </Typography>
    </Box>
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

  const handleSubmit = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      const payload = toStudentPayload({
        ...form,
        board: categories.find(c => String(c._id) === String(form.categoryId))?.board || form.board || '',
        resultImageUrl: form.resultImageUrl || form.marksheetFileUrl || '',
        certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl || ''
      });

      if (editMode) {
        await api.put(`/students/public-edit/${token}`, payload);
        setSuccessMessage('Changes saved successfully.');
      } else {
        const { data } = await api.post('/students/public-register', payload);
        setSuccessMessage(data?.message || 'Registration submitted successfully.');
        setForm(createInitialStudentForm());
      }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: 5 }} />
    </Container>
  );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      <HeroCard editMode={editMode} />

      <Container maxWidth="sm" sx={{ mt: 0 }}>
        <Stack spacing={2.5}>
          
          {/* Status Alerts */}
          {successMessage && (
            <Fade in>
              <Alert severity="success" variant="filled" sx={{ borderRadius: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                {successMessage}
              </Alert>
            </Fade>
          )}

          {!editMode && !successMessage && (
            <Alert severity="info" icon={<School />} sx={{ borderRadius: 3, bgcolor: '#fff', border: '1px solid #e2e8f0', color: '#1a1a1a' }}>
              Confirmation will be sent on WhatsApp.
            </Alert>
          )}

          {/* Minimal Tab Switcher */}
          {editMode && (
            <Tabs 
              value={tab} 
              onChange={(_, v) => setTab(v)} 
              centered
              sx={{ 
                bgcolor: '#fff', 
                borderRadius: 3, 
                p: 0.5, 
                '& .MuiTabs-indicator': { height: '100%', borderRadius: 2.5, zIndex: 0, bgcolor: '#f1f5f9' },
                '& .MuiTab-root': { zIndex: 1, textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }
              }}
            >
              <Tab label="Form Details" />
              <Tab label="Preview" />
            </Tabs>
          )}

          {/* Main Content Card */}
          <Card sx={{ borderRadius: 5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: 'none', overflow: 'visible' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              {!editMode || tab === 0 ? (
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
                      ? 'Adjust your submission below.' 
                      : 'Fill the guided wizard step by step.'
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
                      sx={{ mt: 3, py: 1.5, borderRadius: 3, bgcolor: '#1a1a1a' }}
                    >
                      {saving ? 'Saving...' : 'Save Adjustments'}
                    </Button>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>

          {/* Help Footer */}
          <Typography variant="caption" sx={{ textAlign: 'center', opacity: 0.5, display: 'block', mt: 2 }}>
            Secure Registration · © 2026 Badte Kadam
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}