import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Breadcrumbs,
  Button,
  Chip,
  FormControl,
  Grid,
  LinearProgress,
  Link,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Add, AutoAwesome, Refresh, Save } from '@mui/icons-material';
import api from '../api';
import SectionTitle from '../components/SectionTitle';
import StudentFormSection from '../components/students/StudentFormSection';
import SubjectMarksEditor from '../components/students/SubjectMarksEditor';
import ResultSummaryCard from '../components/students/ResultSummaryCard';
import UploadPreviewCard from '../components/students/UploadPreviewCard';
import CertificatePreviewCard from '../components/students/CertificatePreviewCard';
import PhotoAdjustControls from '../components/students/PhotoAdjustControls';
import EligibilitySummaryCard from '../components/students/EligibilitySummaryCard';
import ResponsiveStudentList from '../components/students/ResponsiveStudentList';
import StudentFormPage from '../components/students/StudentFormPage';

const blankSubject = { subject: '', marksObtained: 0, maxMarks: 100, code: '' };
const initialForm = {
  fullName: '',
  mobile: '',
  email: '',
  gender: 'Any',
  city: '',
  state: '',
  schoolName: '',
  board: '',
  className: '',
  schoolType: 'Any',
  resultStatus: 'PENDING',
  percentage: 0,
  totalObtained: 0,
  totalMax: 0,
  resultMethod: 'PERCENTAGE',
  rawExtractedText: '',
  extractionConfidence: 0,
  reviewNeeded: false,
  certificatePhotoUrl: '',
  resultImageUrl: '',
  notes: '',
  certificateAdjustments: { photoScale: 1, photoX: 0, photoY: 0, photoRotation: 0 },
  subjects: Array.from({ length: 6 }, () => ({ ...blankSubject })),
};

const steps = ['Basic Details', 'Academic Details', 'Result Details', 'Uploads', 'Certificate Preview', 'Eligibility Summary'];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [localResultPreview, setLocalResultPreview] = useState('');
  const [localPhotoPreview, setLocalPhotoPreview] = useState('');

  const computedSummary = useMemo(() => {
    const filled = (form.subjects || []).filter((s) => s.subject && Number(s.maxMarks) > 0);
    const valid = filled.map((s) => ({
      ...s,
      marksObtained: Number(s.marksObtained || 0),
      maxMarks: Number(s.maxMarks || 0),
      ratio: Number(s.maxMarks || 0) ? Number(s.marksObtained || 0) / Number(s.maxMarks || 0) : 0,
    }));

    const useBest5 = form.board?.toUpperCase() === 'CBSE' && form.resultMethod === 'BEST_5';
    const candidate = useBest5 ? [...valid].sort((a, b) => b.ratio - a.ratio).slice(0, 5) : valid;
    const totalObtained = candidate.reduce((sum, s) => sum + Number(s.marksObtained || 0), 0);
    const totalMax = candidate.reduce((sum, s) => sum + Number(s.maxMarks || 0), 0);
    const percentage = totalMax ? (totalObtained / totalMax) * 100 : Number(form.percentage || 0);

    return {
      useBest5,
      totalObtained,
      totalMax,
      percentage,
      topSubjects: candidate,
    };
  }, [form]);

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      setStudents(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm(initialForm);
    setSelectedId(null);
    setLocalPhotoPreview('');
    setLocalResultPreview('');
  };

  const toEditableSubjects = (subjects = []) => {
    const cleaned = subjects.length ? subjects.map((s) => ({ ...blankSubject, ...s })) : Array.from({ length: 6 }, () => ({ ...blankSubject }));
    return cleaned;
  };

  const edit = (student) => {
    setSelectedId(student._id);
    setForm({
      ...initialForm,
      ...student,
      resultMethod: student.resultMethod || 'PERCENTAGE',
      certificateAdjustments: { ...initialForm.certificateAdjustments, ...(student.certificateAdjustments || {}) },
      subjects: toEditableSubjects(student.subjects),
    });
    setLocalPhotoPreview('');
    setLocalResultPreview('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        percentage: form.resultMethod === 'PERCENTAGE' ? Number(form.percentage || 0) : Number(computedSummary.percentage || 0),
        totalObtained: Number(computedSummary.totalObtained || form.totalObtained || 0),
        totalMax: Number(computedSummary.totalMax || form.totalMax || 0),
        subjects: (form.subjects || []).filter((s) => s.subject),
      };

      if (selectedId) {
        await api.put(`/students/${selectedId}`, payload);
      } else {
        await api.post('/students', payload);
      }

      setSnack(selectedId ? 'Student updated successfully.' : 'Student added successfully.');
      reset();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save student.');
    } finally {
      setSaving(false);
    }
  };

  const parse = async (id) => {
    try {
      setSaving(true);
      await api.post(`/students/${id}/parse`);
      setSnack('Result parsing initiated.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Parse failed.');
    } finally {
      setSaving(false);
    }
  };

  const evaluate = async (id = selectedId) => {
    if (!id) {
      setError('Select and save a student before running evaluate.');
      return;
    }
    try {
      setSaving(true);
      await api.post(`/students/${id}/evaluate`);
      setSnack('Eligibility evaluation completed.');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Evaluate failed.');
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = () => {
    window.localStorage.setItem('studentIntakeDraft', JSON.stringify(form));
    setSnack('Draft saved locally on this device.');
  };

  const loadDraft = () => {
    const draft = window.localStorage.getItem('studentIntakeDraft');
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft);
      setForm({ ...initialForm, ...parsed, subjects: toEditableSubjects(parsed.subjects) });
      setSnack('Draft restored.');
    } catch {
      setError('Could not load draft.');
    }
  };

  const onPhotoSelect = (file) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPhotoPreview(objectUrl);
    setForm((prev) => ({ ...prev, certificatePhotoUrl: objectUrl }));
  };

  const onResultSelect = (file) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalResultPreview(objectUrl);
    setForm((prev) => ({ ...prev, resultImageUrl: objectUrl }));
  };

  const quickActions = (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button variant="contained" startIcon={<Add />} onClick={reset}>New Student</Button>
      <Button variant="outlined" startIcon={<AutoAwesome />} onClick={() => evaluate()}>Evaluate</Button>
      <Button variant="outlined" startIcon={<Save />} onClick={saveDraft}>Save Draft</Button>
      <Button variant="text" startIcon={<Refresh />} onClick={reset}>Reset Form</Button>
    </Stack>
  );

  return (
    <Stack spacing={2.2}>
      <SectionTitle
        title="Student Intake + Result Entry + Certificate Preview"
        subtitle="Guided admission-style flow for student/admin entry, CBSE Best 5 scoring, eligibility checks, and certificate photo adjustments."
        actions={quickActions}
      />

      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit">Dashboard</Link>
        <Typography color="text.primary">Students</Typography>
      </Breadcrumbs>

      <Stepper alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
        {steps.map((label) => <Step key={label} active><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {saving ? <LinearProgress /> : null}
      {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}

      <form onSubmit={submit}>
        <StudentFormPage
          left={(
            <>
              <StudentFormSection title="1) Basic Details" subtitle="Capture core identity and contact details for student or operator entry.">
                <Grid container spacing={1.2}>
                  <Grid item xs={12} sm={6}><TextField label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} fullWidth required /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} fullWidth /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth /></Grid>
                  <Grid item xs={12} sm={6}><TextField select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} fullWidth><MenuItem value="Any">Any</MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem></TextField></Grid>
                  <Grid item xs={12} sm={6}><TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} fullWidth /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} fullWidth /></Grid>
                </Grid>
              </StudentFormSection>

              <StudentFormSection title="2) School / Academic Details" subtitle="Board/class and metadata used in eligibility checks.">
                <Grid container spacing={1.2}>
                  <Grid item xs={12}><TextField label="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} fullWidth placeholder="CBSE / ICSE / State" /></Grid>
                  <Grid item xs={6}><TextField label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} fullWidth /></Grid>
                  <Grid item xs={6}><TextField select label="School type" value={form.schoolType} onChange={(e) => setForm({ ...form, schoolType: e.target.value })} fullWidth><MenuItem value="Any">Any</MenuItem><MenuItem value="Private">Private</MenuItem><MenuItem value="Government">Government</MenuItem></TextField></Grid>
                  <Grid item xs={6}><TextField select label="Result status" value={form.resultStatus} onChange={(e) => setForm({ ...form, resultStatus: e.target.value })} fullWidth><MenuItem value="PENDING">Pending</MenuItem><MenuItem value="DECLARED">Declared</MenuItem><MenuItem value="RECHECK">Recheck</MenuItem></TextField></Grid>
                </Grid>
              </StudentFormSection>

              <StudentFormSection title="3) Result Details" subtitle="Choose direct percentage entry or subject-wise marks with CBSE Best 5 support.">
                <Stack spacing={1.4}>
                  <FormControl>
                    <ToggleButtonGroup
                      exclusive
                      value={form.resultMethod}
                      onChange={(_, value) => value && setForm({ ...form, resultMethod: value })}
                      size="small"
                    >
                      <ToggleButton value="PERCENTAGE">Direct %</ToggleButton>
                      <ToggleButton value="SUBJECTS">Subject-wise</ToggleButton>
                      <ToggleButton value="BEST_5">CBSE Best 5</ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>

                  {form.resultMethod === 'PERCENTAGE' ? (
                    <Grid container spacing={1.2}>
                      <Grid item xs={12} sm={6}><TextField label="Percentage" type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} fullWidth /></Grid>
                      <Grid item xs={12} sm={6}><TextField label="Total marks (optional)" type="number" value={form.totalMax} onChange={(e) => setForm({ ...form, totalMax: Number(e.target.value) })} fullWidth /></Grid>
                    </Grid>
                  ) : (
                    <SubjectMarksEditor value={form.subjects} onChange={(subjects) => setForm({ ...form, subjects })} />
                  )}

                  <ResultSummaryCard summary={computedSummary} board={form.board} method={form.resultMethod} />
                </Stack>
              </StudentFormSection>

              <StudentFormSection title="4) Uploads" subtitle="Upload result image and student photo with immediate preview.">
                <Grid container spacing={1.2}>
                  <Grid item xs={12} md={6}>
                    <UploadPreviewCard
                      title="Result image"
                      helpText="Upload marksheet/result screenshot for OCR or manual review."
                      urlValue={form.resultImageUrl}
                      onUrlChange={(resultImageUrl) => setForm({ ...form, resultImageUrl })}
                      onFileSelect={onResultSelect}
                      preview={localResultPreview || form.resultImageUrl}
                      inputId="result-image"
                      loading={saving}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <UploadPreviewCard
                      title="Student photo"
                      helpText="Use a clear front-facing photo for certificate placement."
                      urlValue={form.certificatePhotoUrl}
                      onUrlChange={(certificatePhotoUrl) => setForm({ ...form, certificatePhotoUrl })}
                      onFileSelect={onPhotoSelect}
                      preview={localPhotoPreview || form.certificatePhotoUrl}
                      inputId="student-photo"
                      loading={saving}
                    />
                  </Grid>
                </Grid>
              </StudentFormSection>

              <StudentFormSection title="6) Eligibility Summary" subtitle="Quick view of status, review flags, and category match output.">
                <Stack spacing={1}>
                  <EligibilitySummaryCard student={form} computedPercentage={computedSummary.percentage || form.percentage} />
                  <TextField
                    label="Notes / remarks"
                    multiline
                    minRows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="OCR / extracted text"
                    multiline
                    minRows={4}
                    value={form.rawExtractedText}
                    onChange={(e) => setForm({ ...form, rawExtractedText: e.target.value })}
                    helperText="Visible to admin/review team for extraction quality checks."
                    fullWidth
                  />
                </Stack>
              </StudentFormSection>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button type="submit" variant="contained" disabled={saving}>{selectedId ? 'Update Student' : 'Save Student'}</Button>
                <Button variant="outlined" onClick={loadDraft}>Load Draft</Button>
                <Button variant="outlined" onClick={() => selectedId && evaluate(selectedId)} disabled={!selectedId || saving}>Evaluate Selected</Button>
                <Button variant="text" onClick={reset}>Reset</Button>
              </Stack>
            </>
          )}
          rightTop={(
            <StudentFormSection title="5) Certificate Preview" subtitle="Live visual preview with editable photo fit controls.">
              <Stack spacing={1.4}>
                <CertificatePreviewCard
                  name={form.fullName}
                  board={form.board}
                  className={form.className}
                  photoUrl={localPhotoPreview || form.certificatePhotoUrl}
                  adjustments={form.certificateAdjustments}
                />
                <PhotoAdjustControls
                  value={form.certificateAdjustments}
                  onChange={(certificateAdjustments) => setForm({ ...form, certificateAdjustments })}
                />
              </Stack>
            </StudentFormSection>
          )}
          rightBottom={(
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Tip: Save the student first, then click Evaluate to refresh eligibility, category match, and review-needed tags.
            </Alert>
          )}
        />
      </form>

      <StudentFormSection title="Student Records" subtitle="Responsive list/table for admin quick actions and mobile tap-through.">
        {loading ? (
          <Stack spacing={1}>{Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} variant="rounded" height={68} />)}</Stack>
        ) : (
          <ResponsiveStudentList
            students={students}
            onEdit={edit}
            onParse={parse}
            onEvaluate={evaluate}
            onPreview={(student) => edit(student)}
          />
        )}
      </StudentFormSection>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
    </Stack>
  );
}
