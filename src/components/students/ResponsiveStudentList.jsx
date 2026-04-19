import { Button, Chip, Stack } from '@mui/material';
import ResponsiveDataView from '../ResponsiveDataView';
import StudentRecordCard from './StudentRecordCard';

export default function ResponsiveStudentList({ students, onEdit, onParse, onEvaluate, onPreview }) {
  const rows = students.map((s) => [
    s.fullName,
    `${s.board || '-'} / ${s.className || '-'}`,
    `${s.percentage || 0}%`,
    <Chip size="small" label={s.status || 'PENDING'} color={s.status === 'ELIGIBLE' ? 'success' : 'default'} />,
    (s.matchedCategoryIds || []).map((c) => c.title).join(', ') || '—',
    <Stack direction="row" spacing={0.6}>
      <Button size="small" onClick={() => onEdit(s)}>Edit</Button>
      <Button size="small" onClick={() => onParse(s._id)}>Parse</Button>
      <Button size="small" variant="contained" onClick={() => onEvaluate(s._id)}>Evaluate</Button>
      <Button size="small" variant="outlined" onClick={() => onPreview(s)}>Preview</Button>
    </Stack>,
  ]);

  return (
    <ResponsiveDataView
      headers={['Name', 'Board/Class', 'Result', 'Status', 'Matched Categories', 'Actions']}
      rows={rows}
      mobileRender={(_, index) => (
        <StudentRecordCard
          student={students[index]}
          onEdit={onEdit}
          onParse={onParse}
          onEvaluate={onEvaluate}
          onPreview={onPreview}
        />
      )}
    />
  );
}
