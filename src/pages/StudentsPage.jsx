import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const blankSubject = { subject: '', marksObtained: 0, maxMarks: 100 };
const initialForm = {
  fullName: '', schoolName: '', board: '', className: '', percentage: 0, gender: 'Any',
  schoolType: 'Any', city: '', state: '', rawExtractedText: '', extractionConfidence: 0,
  certificatePhotoUrl: '', resultImageUrl: '', certificateAdjustments: { photoScale: 1, photoX: 0, photoY: 0, photoRotation: 0 },
  subjects: Array.from({ length: 6 }, () => ({ ...blankSubject }))
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);

  const load = () => api.get('/students').then((r) => setStudents(r.data));
  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm(initialForm);
    setSelectedId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      subjects: form.subjects.filter((s) => s.subject)
    };
    if (selectedId) await api.put(`/students/${selectedId}`, payload);
    else await api.post('/students', payload);
    reset();
    load();
  };

  const parse = async (id) => { await api.post(`/students/${id}/parse`); load(); };
  const evaluate = async (id) => { await api.post(`/students/${id}/evaluate`); load(); };
  const edit = (student) => {
    setSelectedId(student._id);
    setForm({
      ...initialForm,
      ...student,
      certificateAdjustments: student.certificateAdjustments || initialForm.certificateAdjustments,
      subjects: student.subjects?.length ? [...student.subjects, ...Array.from({ length: Math.max(0, 6 - student.subjects.length) }, () => ({ ...blankSubject }))] : initialForm.subjects
    });
  };

  const previewStyle = useMemo(() => ({
    transform: `translate(${form.certificateAdjustments.photoX}px, ${form.certificateAdjustments.photoY}px) scale(${form.certificateAdjustments.photoScale}) rotate(${form.certificateAdjustments.photoRotation}deg)`
  }), [form.certificateAdjustments]);

  const rows = students.map((s) => [
    s.fullName,
    `${s.board} / ${s.className}`,
    s.percentage,
    s.status,
    s.extractionConfidence || 0,
    (s.matchedCategoryIds || []).map((c) => c.title).join(', '),
    <div className="action-row" key={s._id}>
      <button onClick={() => edit(s)}>Edit</button>
      <button onClick={() => parse(s._id)}>Parse</button>
      <button className="primary" onClick={() => evaluate(s._id)}>Evaluate</button>
    </div>
  ]);

  return (
    <div className="page">
      <SectionTitle title="Student Intake + Eligibility + Certificate Preview" subtitle="Student uploads details, result text/image, subject marks and certificate photo adjustments." />
      <form className="panel stack gap12" onSubmit={submit}>
        <div className="grid two">
          <div className="stack gap8">
            <div className="form-grid">
              <input placeholder="Student name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input placeholder="School name" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
              <input placeholder="Board" value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} />
              <input placeholder="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
              <input type="number" placeholder="Percentage" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} />
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Any</option><option>Male</option><option>Female</option>
              </select>
              <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <textarea rows="5" placeholder="Paste OCR / extracted text here" value={form.rawExtractedText} onChange={(e) => setForm({ ...form, rawExtractedText: e.target.value })} />
            <div className="form-grid">
              <input placeholder="Result image URL" value={form.resultImageUrl} onChange={(e) => setForm({ ...form, resultImageUrl: e.target.value })} />
              <input placeholder="Certificate photo URL" value={form.certificatePhotoUrl} onChange={(e) => setForm({ ...form, certificatePhotoUrl: e.target.value })} />
              <input type="number" placeholder="Confidence" value={form.extractionConfidence} onChange={(e) => setForm({ ...form, extractionConfidence: Number(e.target.value) })} />
            </div>
          </div>

          <div className="stack gap8">
            <div className="small"><strong>Certificate preview adjustment</strong></div>
            <div className="certificate-preview">
              <div className="certificate-stage">
                <div className="certificate-name">{form.fullName || 'Student Name'}</div>
                <div className="certificate-category">{form.board || 'Board'} {form.className || 'Class'}</div>
                <div className="certificate-photo-frame">
                  {form.certificatePhotoUrl ? <img alt="certificate" src={form.certificatePhotoUrl} style={previewStyle} /> : <div className="small">Photo placeholder</div>}
                </div>
              </div>
            </div>
            <div className="form-grid">
              <input type="number" step="0.1" placeholder="Scale" value={form.certificateAdjustments.photoScale} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoScale: Number(e.target.value) } })} />
              <input type="number" placeholder="Photo X" value={form.certificateAdjustments.photoX} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoX: Number(e.target.value) } })} />
              <input type="number" placeholder="Photo Y" value={form.certificateAdjustments.photoY} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoY: Number(e.target.value) } })} />
              <input type="number" placeholder="Rotation" value={form.certificateAdjustments.photoRotation} onChange={(e) => setForm({ ...form, certificateAdjustments: { ...form.certificateAdjustments, photoRotation: Number(e.target.value) } })} />
            </div>
          </div>
        </div>

        <div>
          <div className="small"><strong>Subject-wise marks for CBSE Best 5 and similar logic</strong></div>
          <div className="grid three">
            {form.subjects.map((subject, idx) => (
              <div className="panel compact" key={idx}>
                <input placeholder="Subject" value={subject.subject} onChange={(e) => {
                  const subjects = [...form.subjects];
                  subjects[idx].subject = e.target.value;
                  setForm({ ...form, subjects });
                }} />
                <input type="number" placeholder="Obtained" value={subject.marksObtained} onChange={(e) => {
                  const subjects = [...form.subjects];
                  subjects[idx].marksObtained = Number(e.target.value);
                  setForm({ ...form, subjects });
                }} />
                <input type="number" placeholder="Max" value={subject.maxMarks} onChange={(e) => {
                  const subjects = [...form.subjects];
                  subjects[idx].maxMarks = Number(e.target.value);
                  setForm({ ...form, subjects });
                }} />
              </div>
            ))}
          </div>
        </div>

        <div className="action-row">
          <button className="primary" type="submit">{selectedId ? 'Update Student' : 'Add Student'}</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      <DataTable headers={['Name', 'Board/Class', '%', 'Status', 'Confidence', 'Matched Categories', 'Actions']} rows={rows} />
    </div>
  );
}
