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
        <Typography variant="body2" fontWeight={700}>
          {s.fullName || '-'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {s.mobile || 'No Mobile'}
        </Typography>
      </Box>
    ),
    details: (
      <Box>
        <Typography variant="caption" display="block">
          <b>{s.board || '-'}</b> · {s.className || '-'}
        </Typography>
        <Typography variant="caption" color="primary" fontWeight={700}>
          {s.percentage ?? '-'}
          {s.percentage !== undefined && s.percentage !== null ? '%' : ''}
        </Typography>
      </Box>
    ),
    status: () => <StatusChip label={s.status || 'Pending'} />,
    actions: () => (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button
          size="small"
          variant="text"
          sx={{ fontWeight: 700 }}
          onClick={() => parse(s._id)}
        >
          Parse
        </Button>
        <Button
          size="small"
          variant="outlined"
          sx={{ borderRadius: 2 }}
          onClick={() => evaluate(s._id)}
        >
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
          pt: { xs: 3, md: 4 },
          pb: { xs: 5, md: 6 },
          px: { xs: 2, md: 3 },
          borderRadius: '0 0 28px 28px',
          mb: -4
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <PageHeader
            title="Students"
            subtitle="List first, quick add second — optimized for desktop and mobile."
            chips={[
              { label: `${students.length} Registered`, icon: <People fontSize="small" /> },
              { label: `${categories.length} Categories`, icon: <Analytics fontSize="small" /> }
            ]}
            dark
          />
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        Student Records
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View registered students and add new records from the + button.
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                      justifyContent={{ xs: 'space-between', sm: 'flex-start' }}
                      sx={{ width: { xs: '100%', md: 'auto' } }}
                    >
                      <IconButton
                        onClick={handleOpenAdd}
                        sx={{
                          bgcolor: '#1a1a1a',
                          color: '#fff',
                          width: 48,
                          height: 48,
                          borderRadius: 3,
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
                          textTransform: 'none',
                          fontWeight: 700,
                          '&:hover': { bgcolor: '#000', boxShadow: 'none' }
                        }}
                      >
                        Add Student
                      </Button>
                    </Stack>
                  </Stack>

                  {savedMessage ? (
                    <Alert sx={{ borderRadius: 3 }} severity="success">
                      {savedMessage}
                    </Alert>
                  ) : null}

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={4}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          bgcolor: '#f8fafc',
                          boxShadow: 'none',
                          border: '1px solid #e2e8f0',
                          height: '100%'
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <People color="primary" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Total Students
                              </Typography>
                              <Typography variant="h6" fontWeight={800}>
                                {students.length}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} lg={4}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          bgcolor: '#f8fafc',
                          boxShadow: 'none',
                          border: '1px solid #e2e8f0',
                          height: '100%'
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Analytics color="primary" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Categories
                              </Typography>
                              <Typography variant="h6" fontWeight={800}>
                                {categories.length}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          bgcolor: '#f8fafc',
                          boxShadow: 'none',
                          border: '1px solid #e2e8f0',
                          height: '100%'
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <School color="primary" />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="caption" color="text.secondary">
                                Last Created
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={800}
                                sx={{ wordBreak: 'break-all' }}
                              >
                                {lastCreatedId || 'No recent student'}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Box>
                    <ResponsiveTable
                      columns={columns}
                      rows={rows}
                      mobileTitleKey="title"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 4,
                bgcolor: '#fff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.04)'
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Intelligence Hub
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quick actions for the latest created student.
                    </Typography>
                  </Box>

                  <Alert
                    severity="info"
                    variant="outlined"
                    icon={<AutoFixHigh />}
                    sx={{ borderRadius: 3, bgcolor: '#f8fafc' }}
                  >
                    Trigger parsing or evaluation for the latest created student.
                  </Alert>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      variant="contained"
                      disabled={!lastCreatedId}
                      onClick={() => evaluate(lastCreatedId)}
                      sx={{
                        borderRadius: 2.5,
                        py: 1.2,
                        bgcolor: '#1a1a1a',
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#000' }
                      }}
                    >
                      Evaluate Latest
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!lastCreatedId}
                      onClick={() => parse(lastCreatedId)}
                      sx={{
                        borderRadius: 2.5,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 700
                      }}
                    >
                      Parse Latest
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={openAddDialog}
        onClose={handleCloseAdd}
        fullScreen={false}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: { xs: '100%', md: '96vw' },
            maxWidth: '1600px',
            height: { xs: '100%', md: '94vh' },
            maxHeight: { xs: '100%', md: '94vh' },
            m: { xs: 0, md: 2 },
            borderRadius: { xs: 0, md: 4 },
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Grid
            container
            sx={{
              minHeight: '100%',
              height: '100%'
            }}
          >
            <Grid
              item
              xs={12}
              lg={7}
              xl={7.5}
              sx={{
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#fff'
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, md: 3 },
                  py: { xs: 2, md: 2.5 },
                  borderBottom: '1px solid #e2e8f0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  bgcolor: '#fff'
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Add New Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mobile single screen, desktop split view with large preview.
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={handleCloseAdd}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                  >
                    Close
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  px: { xs: 2, md: 3 },
                  py: { xs: 2, md: 3 }
                }}
              >
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

            <Grid
              item
              xs={12}
              lg={5}
              xl={4.5}
              sx={{
                bgcolor: '#f8fafc',
                borderLeft: { lg: '1px solid #e2e8f0' },
                borderTop: { xs: '1px solid #e2e8f0', lg: 'none' },
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  p: { xs: 1.5, sm: 2, md: 2.5 }
                }}
              >
                <StudentCertificatePreviewSection
                  form={form}
                  setForm={setForm}
                  categories={categories}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}