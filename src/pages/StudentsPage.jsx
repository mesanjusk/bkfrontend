import { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const blankSubject = { subject: '', marksObtained: 0, maxMarks: 100 };
const initialForm = {
  fullName: '', schoolName: '', board: '', className: '', percentage: 0, gender: 'Any', schoolType: 'Any', city: '', state: '', rawExtractedText: '', extractionConfidence: 0,
  certificatePhotoUrl: '', resultImageUrl: '', certificateAdjustments: { photoScale: 1, photoX: 0, photoY: 0, photoRotation: 0 },
  subjects: Array.from({ length: 6 }, () => ({ ...blankSubject }))
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const load = () => api.get('/students').then((r) => setStudents(r.data));
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(initialForm); setSelectedId(null); };
  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, subjects: form.subjects.filter((s) => s.subject) };
    if (selectedId) await api.put(`/students/${selectedId}`, payload); else await api.post('/students', payload);
    reset(); load();
  };
  const parse = async (id) => { await api.post(`/students/${id}/parse`); load(); };
  const evaluate = async (id) => { await api.post(`/students/${id}/evaluate`); load(); };
  const edit = (student) => {
    setSelectedId(student._id);
    setForm({ ...initialForm, ...student, certificateAdjustments: student.certificateAdjustments || initialForm.certificateAdjustments, subjects: student.subjects?.length ? [...student.subjects, ...Array.from({ length: Math.max(0, 6 - student.subjects.length) }, () => ({ ...blankSubject }))] : initialForm.subjects });
  };

  const previewStyle = useMemo(() => ({ transform: `translate(${form.certificateAdjustments.photoX}px, ${form.certificateAdjustments.photoY}px) scale(${form.certificateAdjustments.photoScale}) rotate(${form.certificateAdjustments.photoRotation}deg)` }), [form.certificateAdjustments]);

  return (
    <Box>
      <SectionTitle title="Student Intake + Eligibility + Certificate Preview" subtitle="Mobile-first multi-section form with board/class/subject details and visual certificate controls." />
      <Card component="form" onSubmit={submit}><CardContent>
        <Stack spacing={1.5}>
          <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle1">Personal + Result Info</Typography></AccordionSummary><AccordionDetails>
            <Grid container spacing={1.5}>
              {[
                ['Student name', 'fullName'], ['School name', 'schoolName'], ['Board', 'board'], ['Class', 'className'], ['City', 'city'], ['State', 'state'],
              ].map(([label, key]) => <Grid item xs={12} sm={6} md={4} key={key}><TextField label={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Grid>)}
              <Grid item xs={12} sm={6} md={4}><TextField label="Percentage" type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} /></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><MenuItem value="Any">Any</MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem></TextField></Grid>
              <Grid item xs={12}><TextField label="OCR / extracted text" multiline minRows={4} value={form.rawExtractedText} onChange={(e) => setForm({ ...form, rawExtractedText: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Result image URL" value={form.resultImageUrl} onChange={(e) => setForm({ ...form, resultImageUrl: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Certificate photo URL" value={form.certificatePhotoUrl} onChange={(e) => setForm({ ...form, certificatePhotoUrl: e.target.value })} /></Grid>
            </Grid>
          </AccordionDetails></Accordion>

          <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle1">Subject Marks + CBSE Best 5 Support</Typography></AccordionSummary><AccordionDetails>
            <Grid container spacing={1.2}>{form.subjects.map((subject, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}><Card variant="outlined"><CardContent>
                <Stack spacing={1}><TextField label="Subject" value={subject.subject} onChange={(e) => { const subjects = [...form.subjects]; subjects[idx].subject = e.target.value; setForm({ ...form, subjects }); }} />
                <TextField label="Obtained" type="number" value={subject.marksObtained} onChange={(e) => { const subjects = [...form.subjects]; subjects[idx].marksObtained = Number(e.target.value); setForm({ ...form, subjects }); }} />
                <TextField label="Max" type="number" value={subject.maxMarks} onChange={(e) => { const subjects = [...form.subjects]; subjects[idx].maxMarks = Number(e.target.value); setForm({ ...form, subjects }); }} /></Stack>
              </CardContent></Card></Grid>
            ))}</Grid>
          </AccordionDetails></Accordion>

          <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle1">Certificate Preview & Photo Adjustment</Typography></AccordionSummary><AccordionDetails>
            <Grid container spacing={1.5}><Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2, height: 300, position: 'relative', background: 'linear-gradient(120deg,#fff,#ecfeff)' }}>
                <Typography variant="h6" sx={{ position: 'absolute', left: 16, bottom: 36 }}>{form.fullName || 'Student Name'}</Typography>
                <Typography variant="body2" sx={{ position: 'absolute', left: 16, bottom: 16 }}>{form.board || 'Board'} {form.className || 'Class'}</Typography>
                <Box sx={{ width: 120, height: 145, border: '2px solid #cbd5e1', borderRadius: 2, overflow: 'hidden', position: 'absolute', top: 20, right: 20, bgcolor: '#fff', display: 'grid', placeItems: 'center' }}>
                  {form.certificatePhotoUrl ? <img alt="certificate" src={form.certificatePhotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', ...previewStyle }} /> : <Typography variant="caption">Photo</Typography>}
                </Box>
              </Card>
            </Grid><Grid item xs={12} md={6}><Grid container spacing={1}><Grid item xs={6}><TextField label="Scale" type="number" value={form.certificateAdjustments.photoScale} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoScale: Number(e.target.value) } })} /></Grid><Grid item xs={6}><TextField label="Rotation" type="number" value={form.certificateAdjustments.photoRotation} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoRotation: Number(e.target.value) } })} /></Grid><Grid item xs={6}><TextField label="Photo X" type="number" value={form.certificateAdjustments.photoX} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoX: Number(e.target.value) } })} /></Grid><Grid item xs={6}><TextField label="Photo Y" type="number" value={form.certificateAdjustments.photoY} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoY: Number(e.target.value) } })} /></Grid></Grid></Grid></Grid>
          </AccordionDetails></Accordion>

          <Stack direction="row" gap={1} flexWrap="wrap"><Button variant="contained" type="submit">{selectedId ? 'Update Student' : 'Add Student'}</Button><Button variant="outlined" onClick={reset}>Reset</Button></Stack>
        </Stack>
      </CardContent></Card>

      <Alert severity="info" sx={{ mt: 2, mb: 1 }}>Evaluate a student to refresh eligibility chips and matched categories.</Alert>
      <DataTable headers={['Name', 'Board/Class', '%', 'Status', 'Confidence', 'Matched Categories', 'Actions']} rows={students.map((s) => [s.fullName, `${s.board} / ${s.className}`, s.percentage, <Chip size="small" label={s.status || 'PENDING'} color={s.status === 'ELIGIBLE' ? 'success' : 'default'} />, s.extractionConfidence || 0, (s.matchedCategoryIds || []).map((c) => c.title).join(', '), <Stack direction="row" gap={0.5}><Button size="small" onClick={() => edit(s)}>Edit</Button><Button size="small" onClick={() => parse(s._id)}>Parse</Button><Button size="small" variant="contained" onClick={() => evaluate(s._id)}>Evaluate</Button></Stack>])} />
    </Box>
  );
}
