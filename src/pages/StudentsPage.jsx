import { useEffect, useState } from 'react';
import { Add, AutoFixHigh, People, Analytics, School } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
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
  const [form, setForm] = useState(createInitialStudentForm());
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [lastCreatedId, setLastCreatedId] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const load = async () => {
    const [s, c] = await Promise.all([api.get('/students'), api.get('/categories')]);
    setStudents(Array.isArray(s.data) ? s.data : []);
    setCategories(Array.isArray(c.data) ? c.data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenAdd = () => {
    setSavedMessage('');
    setForm(createInitialStudentForm());
    setOpenAddDialog(true);
  };

  const handleCloseAdd = () => {
    if (saving) return;
    setOpenAddDialog(false);
  };

  const save = async () => {
    setSaving(true);
    setSavedMessage('');
    try {
      const { data } = await api.post('/students', toStudentPayload(form));
      setLastCreatedId(data?._id || '');
      setSavedMessage('Student profile created successfully.');
      setForm(createInitialStudentForm());
      setOpenAddDialog(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const evaluate = async (id) => {
    await api.post(`/students/${id}/evaluate`);
    await load();
  };

  const parse = async (id) => {
    await api.post(`/students/${id}/parse`);
    await load();
  };

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'details', label: 'Academic Info' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = students.map((s) => ({
    title: s.fullName,
    name: (
      <Box>
        <Typography variant="body2" fontWeight={700}>{s.fullName || '-'}</Typography>
        <Typography variant="caption" color="text.secondary">{s.mobile || 'No Mobile'}</Typography>
      </Box>
    ),
    details: (
      <Box>
        <Typography variant="caption" display="block">
          <b>{s.board || '-'}</b> · {s.className || '-'}
        </Typography>
        <Typography variant="caption" color="primary" fontWeight={700}>
          {s.percentage ?? '-'}{s.percentage !== undefined && s.percentage !== null ? '%' : ''}
        </Typography>
      </Box>
    ),
    status: () => <StatusChip label={s.status || 'Pending'} />,
    actions: () => (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button size="small" variant="text" sx={{ fontWeight: 700 }} onClick={() => parse(s._id)}>
          Parse
        </Button>
        <Button size="small" variant="outlined" sx={{ borderRadius: 2 }} onClick={() => evaluate(s._id)}>
          Evaluate
        </Button>
      </Stack>
    )
  }));

  return (
    <Box sx={{ pb: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box
        sx={{
          bgcolor: '#1a1a1a',
          color: '#fff',
          pt: 4,
          pb: 6,
          px: 3,
          borderRadius: '0 0 32px 32px',
          mb: -4
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <PageHeader
            title="Students"
            subtitle="List of registered students with quick add and processing actions."
            chips={[
              { label: `${students.length} Registered`, icon: <People fontSize="small" /> },
              { label: `${categories.length} Categories`, icon: <Analytics fontSize="small" /> }
            ]}
            dark
          />
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Student Records</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View all registered students and add new student from the + button.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <IconButton
                      onClick={handleOpenAdd}
                      sx={{
                        bgcolor: '#1a1a1a',
                        color: '#fff',
                        width: 48,
                        height: 48,
                        '&:hover': { bgcolor: '#000' }
                      }}
                    >
                      <Add />
                    </IconButton>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleOpenAdd}
                      sx={{
                        borderRadius: 3,
                        px: 2.2,
                        py: 1.2,
                        bgcolor: '#1a1a1a',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#000', boxShadow: 'none' }
                      }}
                    >
                      Add Student
                    </Button>
                  </Stack>
                </Stack>

                {savedMessage ? (
                  <Alert sx={{ mt: 2, borderRadius: 3 }} severity="success">
                    {savedMessage}
                  </Alert>
                ) : null}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <People color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Total Students</Typography>
                            <Typography variant="h6" fontWeight={800}>{students.length}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Analytics color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Categories</Typography>
                            <Typography variant="h6" fontWeight={800}>{categories.length}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <School color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Last Created</Typography>
                            <Typography variant="body2" fontWeight={800} sx={{ wordBreak: 'break-all' }}>
                              {lastCreatedId || 'No recent student'}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <ResponsiveTable columns={columns} rows={rows} mobileTitleKey="title" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  Intelligence Hub
                </Typography>
                <Alert
                  severity="info"
                  variant="outlined"
                  icon={<AutoFixHigh />}
                  sx={{ borderRadius: 3, mb: 2, bgcolor: '#fff' }}
                >
                  Trigger parsing or evaluation for the latest created student.
                </Alert>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="contained"
                    disabled={!lastCreatedId}
                    onClick={() => evaluate(lastCreatedId)}
                    sx={{ borderRadius: 2.5, py: 1.2, bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#000' } }}
                  >
                    Evaluate Latest
                  </Button>
                  <Button
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
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={openAddDialog}
        onClose={handleCloseAdd}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, md: 4 },
            minHeight: { xs: '100%', md: '90vh' }
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Grid container sx={{ minHeight: { xs: '100%', md: '88vh' } }}>
            <Grid item xs={12} lg={8}>
              <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Add New Student</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fill student details and save. After save, the list will refresh automatically.
                    </Typography>
                  </Box>
                  <Button variant="outlined" onClick={handleCloseAdd} sx={{ borderRadius: 2.5 }}>
                    Close
                  </Button>
                </Stack>

                <StudentFormWizard
                  mode="admin"
                  form={form}
                  setForm={setForm}
                  onSubmit={save}
                  saving={saving}
                  successMessage={savedMessage}
                  topInfo={{
                    title: 'New Student Intake',
                    description: 'Admin-assisted registration process.'
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} lg={4} sx={{ bgcolor: '#f8fafc', borderLeft: { lg: '1px solid #e2e8f0' } }}>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <StudentCertificatePreviewSection form={form} />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
