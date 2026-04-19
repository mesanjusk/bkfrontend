import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import StatusChip from '../StatusChip';

export default function AssignmentMiniCard({ assignment, active, onSelect }) {
  const delayed = ['ABSENT', 'SKIPPED'].includes(assignment.status);
  return (
    <Card
      variant={active ? 'elevation' : 'outlined'}
      elevation={active ? 3 : 0}
      onClick={() => onSelect(assignment)}
      sx={{
        cursor: 'pointer',
        borderColor: active ? 'primary.main' : delayed ? 'error.light' : 'divider',
        bgcolor: active ? 'primary.50' : 'background.paper'
      }}
    >
      <CardContent sx={{ p: 1.2, '&:last-child': { pb: 1.2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
          <Chip size="small" label={`#${assignment.sequenceNo || '-'}`} />
          <StatusChip label={assignment.status} />
        </Stack>
        <Typography variant="body2" fontWeight={700}>{assignment.studentId?.fullName || 'Student TBD'}</Typography>
        <Typography variant="caption" color="text.secondary">{assignment.categoryId?.title || 'Category TBD'}</Typography>
        <Typography variant="caption" display="block">Anchor: {assignment.actualAnchorId?.name || assignment.plannedAnchorId?.name || '-'}</Typography>
        <Typography variant="caption" display="block">Guest: {assignment.actualGuestId?.name || assignment.plannedGuestId?.name || '-'}</Typography>
      </CardContent>
    </Card>
  );
}
