import { Card, CardContent, Divider, List, ListItemButton, ListItemText, MenuItem, Stack, TextField, Typography } from '@mui/material';
import StatusChip from '../StatusChip';
import AssignmentMiniCard from './AssignmentMiniCard';

export default function QueueList({ items, selectedId, onSelect, filter, onFilterChange, mobile }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 1.3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={700}>Live Queue</Typography>
          <TextField
            select
            size="small"
            value={filter}
            sx={{ minWidth: 130 }}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            {['ALL', 'PENDING', 'CALLED', 'ON_STAGE', 'COMPLETED', 'ISSUES'].map((value) => (
              <MenuItem key={value} value={value}>{value}</MenuItem>
            ))}
          </TextField>
        </Stack>
        {mobile ? (
          <Stack spacing={0.9}>
            {items.map((a) => <AssignmentMiniCard key={a._id} assignment={a} active={selectedId === a._id} onSelect={onSelect} />)}
          </Stack>
        ) : (
          <List dense disablePadding>
            {items.map((a, idx) => (
              <div key={a._id}>
                <ListItemButton selected={selectedId === a._id} onClick={() => onSelect(a)}>
                  <ListItemText
                    primary={`#${a.sequenceNo} ${a.studentId?.fullName || 'Student TBD'}`}
                    secondary={`${a.categoryId?.title || '-'} · Anchor: ${a.actualAnchorId?.name || a.plannedAnchorId?.name || '-'} · Guest: ${a.actualGuestId?.name || a.plannedGuestId?.name || '-'}`}
                  />
                  <StatusChip label={a.status} />
                </ListItemButton>
                {idx < items.length - 1 ? <Divider component="li" /> : null}
              </div>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
