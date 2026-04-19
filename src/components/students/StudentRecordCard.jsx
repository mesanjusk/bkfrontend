import { MoreVert, Visibility } from '@mui/icons-material';
import { Card, CardContent, Chip, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useState } from 'react';

export default function StudentRecordCard({ student, onEdit, onParse, onEvaluate, onPreview }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack>
              <Typography variant="subtitle1">{student.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{student.board} · {student.className}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip size="small" label={student.status || 'PENDING'} color={student.status === 'ELIGIBLE' ? 'success' : 'default'} />
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVert fontSize="small" /></IconButton>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
            <Chip size="small" variant="outlined" label={`${student.percentage || 0}%`} />
            <Chip size="small" variant="outlined" label={student.city || 'City —'} />
            <Chip size="small" variant="outlined" label={student.reviewNeeded ? 'Review needed' : 'Auto-reviewed'} color={student.reviewNeeded ? 'warning' : 'default'} />
          </Stack>
          <IconButton size="small" onClick={() => onPreview(student)} sx={{ alignSelf: 'flex-end' }}><Visibility fontSize="small" /></IconButton>
        </Stack>
      </CardContent>

      <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(student); }}>Edit</MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onParse(student._id); }}>Parse</MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onEvaluate(student._id); }}>Evaluate</MenuItem>
      </Menu>
    </Card>
  );
}
