import { useEffect, useState } from 'react';
import { AutoFixHigh, People, Analytics } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';
import StudentFormWizard, { StudentCertificatePreviewSection } from '../components/students/StudentFormWizard';
import { createInitialStudentForm, toStudentPayload } from '../components/students/studentFormConfig';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(createInitialStudentForm);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [lastCreatedId, setLastCreatedId] = useState('');

  const load = async () => {
    const [s, c] = await Promise.all([api.get('/students'), api.get('/categories')]);
    setStudents(s.data);
    setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setSavedMessage('');
    try {
      const { data } = await api.post('/students', toStudentPayload(form));
      setLastCreatedId(data?._id || '');
      setSavedMessage('Student profile created successfully.');
      setForm(createInitialStudentForm());
      await load();
    } finally { setSaving(false); }
  };

  const evaluate = async (id) => { await api.post(`/students/${id}/evaluate`); load(); };
  const parse = async (id) => { await api.post(`/students/${id}/parse`); load(); };

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'details', label: 'Academic Info' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Intelligence' }
  ];

  const rows = students.map((s) => ({
    title: s.fullName,
    name: (
      <Box>
        <Typography variant="body2" fontWeight={700}>{s.fullName}</Typography>
        <Typography variant="caption" color="text.secondary">{s.mobile || 'No Mobile'}</Typography>
      </Box>
    ),
    details: (
      <Box>
        <Typography variant="caption" display="block"><b>{s.board || '-'}</b> · {s.className || '-'}</Typography>
        <Typography variant="caption" color="primary" fontWeight={700}>{s.percentage}%</Typography>
      </Box>
    ),
    status: () => <StatusChip label={s.status} />,
    actions: () => (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="text" sx={{ fontWeight: 700 }} onClick={() => parse(s._id)}>Parse</Button>
        <Button size="small" variant="outlined" sx={{ borderRadius: 2 }} onClick={() => evaluate(s._id)}>Evaluate</Button>
      </Stack>
    )
  }));

  return (
    <Box sx={{ pb: 4 }}>
      {/* High-End Operations Header */}
      <Box sx={{
        bgcolor: '#1a1a1a', color: '#fff', pt: 4, pb: 6, px: 3,
        borderRadius: '0 0 32px 32px', mb: -4
      }}>
        <PageHeader
          title="Student Intake"
          subtitle="Manage registrations and eligibility flow."
          chips={[
            { label: `${students.length} Total`, icon: <People fontSize="small" /> },
            { label: `${categories.length} Categories`, icon: <Analytics fontSize="small" /> }
          ]}
          dark
        />
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Main Wizard Area */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, display: 'block' }}>
                  Guided Registration Wizard
                </Typography>
                <StudentFormWizard
                  mode="admin"
                  form={form}
                  setForm={setForm}
                  onSubmit={save}
                  saving={saving}
                  successMessage={savedMessage}
                  topInfo={{
                    title: 'New Student Intake',
                    description: 'Admin-assisted 4-step verification process.'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Side Preview & Quick Controls */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <StudentCertificatePreviewSection form={form} />

              <Card sx={{ borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>Intelligence Hub</Typography>
                  <Alert severity="info" variant="outlined" icon={<AutoFixHigh />} sx={{ borderRadius: 3, mb: 2, bgcolor: '#fff' }}>
                    Trigger parsing or evaluation for the latest entry.
                  </Alert>
                  <Stack spacing={1.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={!lastCreatedId}
                      onClick={() => evaluate(lastCreatedId)}
                      sx={{ borderRadius: 2.5, py: 1.2, bgcolor: '#1a1a1a' }}
                    >
                      Evaluate Latest
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled={!lastCreatedId}
                      onClick={() => parse(lastCreatedId)}
                      sx={{ borderRadius: 2.5, py: 1.2 }}
                    >
                      Parse Latest
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Database View */}
          <Grid item xs={12}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1 }}>
              Student Records
            </Typography>
            <Box sx={{ mt: 1 }}>
              <ResponsiveTable columns={columns} rows={rows} mobileTitleKey="title" />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}