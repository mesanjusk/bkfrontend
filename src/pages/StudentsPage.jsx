import { useEffect, useState } from 'react';
import { AutoFixHigh } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
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

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setSavedMessage('');
    try {
      const { data } = await api.post('/students', toStudentPayload(form));
      setLastCreatedId(data?._id || '');
      setSavedMessage('Student saved successfully by admin.');
      setForm(createInitialStudentForm());
      await load();
    } finally {
      setSaving(false);
    }
  };

  const evaluate = async (id) => {
    await api.post(`/students/${id}/evaluate`);
    load();
  };
  const parse = async (id) => {
    await api.post(`/students/${id}/parse`);
    load();
  };

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'mobile', label: 'Student Mobile' },
    { key: 'parentMobile', label: 'Parent Mobile' },
    { key: 'board', label: 'Board' },
    { key: 'className', label: 'Class' },
    { key: 'percentage', label: 'Percentage' },
    { key: 'status', label: 'Status' },
    { key: 'matched', label: 'Matched Categories' },
    { key: 'actions', label: 'Actions' }
  ];

  const rows = students.map((s) => ({
    title: s.fullName,
    name: s.fullName,
    mobile: s.mobile || '-',
    parentMobile: s.parentMobile || '-',
    board: s.board || '-',
    className: s.className || '-',
    percentage: s.percentage || '-',
    status: () => <StatusChip label={s.status} />,
    matched: (s.matchedCategoryIds || []).map((c) => c.title).join(', ') || '-',
    actions: () => (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => parse(s._id)}>Parse</Button>
        <Button size="small" variant="contained" onClick={() => evaluate(s._id)}>Evaluate</Button>
      </Stack>
    )
  }));

  return (
    <>
      <PageHeader
        title="Student intake"
        subtitle="Admin-assisted wizard, public registration support, and eligibility flow."
        chips={[{ label: `${students.length} students` }, { label: `${categories.length} categories` }]}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add student (Admin/Staff wizard)</Typography>
            <StudentFormWizard
              mode="admin"
              form={form}
              setForm={setForm}
              onSubmit={save}
              saving={saving}
              successMessage={savedMessage}
              topInfo={{
                title: 'Admin-assisted student registration',
                description: 'Use this guided 4-step wizard to quickly add students from the protected dashboard.'
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
            <StudentCertificatePreviewSection form={form} />

            <Card>
              <CardContent>
                <Stack spacing={1.2}>
                  <Typography variant="h6">Admin controls</Typography>
                  <Alert severity="info" icon={<AutoFixHigh />}>
                    After saving a student, you can trigger parse/evaluate directly from the table.
                  </Alert>
                  <Button variant="outlined" disabled={!lastCreatedId} onClick={() => parse(lastCreatedId)}>Parse latest saved student</Button>
                  <Button variant="contained" disabled={!lastCreatedId} onClick={() => evaluate(lastCreatedId)}>Evaluate latest saved student</Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <ResponsiveTable columns={columns} rows={rows} mobileTitleKey="title" />
        </Grid>
      </Grid>
    </>
  );
}
