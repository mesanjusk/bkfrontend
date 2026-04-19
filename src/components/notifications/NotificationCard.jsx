import { Card, CardContent, Chip, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useState } from 'react';
import ReadStatusChip from './ReadStatusChip';

export default function NotificationCard({ notification, onMarkRead, onOpenRoute, compact = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <Card variant={notification.readStatus ? 'outlined' : undefined} sx={{ borderLeft: `4px solid ${notification.priority === 'CRITICAL' ? '#b91c1c' : notification.priority === 'HIGH' ? '#d97706' : '#0f4c81'}` }}>
      <CardContent sx={{ py: compact ? 1.2 : 1.6 }}>
        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
          <Stack spacing={0.8} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={notification.type || 'GENERAL'} />
              <ReadStatusChip read={notification.readStatus} />
              {notification.priority ? <Chip size="small" color={notification.priority === 'CRITICAL' ? 'error' : notification.priority === 'HIGH' ? 'warning' : 'default'} label={notification.priority} /> : null}
            </Stack>
            <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>{notification.title}</Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{notification.message}</Typography>
            <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
              <Typography variant="caption">{new Date(notification.createdAt || notification.updatedAt || Date.now()).toLocaleString()}</Typography>
              {notification.targetRoles?.length ? <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>Audience: {notification.targetRoles.join(', ')}</Typography> : null}
            </Stack>
          </Stack>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVertIcon fontSize="small" /></IconButton>
        </Stack>
      </CardContent>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem disabled={notification.readStatus} onClick={() => { onMarkRead(notification); setAnchorEl(null); }}>
          <DoneAllIcon sx={{ mr: 1 }} fontSize="small" /> Mark as read
        </MenuItem>
        <MenuItem disabled={!notification.routePath} onClick={() => { onOpenRoute(notification); setAnchorEl(null); }}>
          <OpenInNewIcon sx={{ mr: 1 }} fontSize="small" /> Open related module
        </MenuItem>
      </Menu>
    </Card>
  );
}
