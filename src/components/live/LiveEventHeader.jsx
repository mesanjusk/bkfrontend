import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { AppBar, Badge, Box, Chip, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import RoleDutyBadge from './RoleDutyBadge';

export default function LiveEventHeader({ nowLabel, connectionStatus, unreadAlerts, role, duty, onRefresh }) {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        top: 0,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.appBar
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, md: 2 }, minHeight: { xs: 64, md: 72 } }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ width: '100%', justifyContent: 'space-between' }}>
          <Stack spacing={0.3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>Live Event Console</Typography>
              <Chip label="LIVE" size="small" color="error" />
            </Stack>
            <Typography variant="caption" color="text.secondary">{nowLabel}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
            <ConnectionStatusBadge status={connectionStatus} />
            <Badge badgeContent={unreadAlerts} color="error" max={99}>
              <Chip size="small" label="Alerts" variant="outlined" />
            </Badge>
            <RoleDutyBadge role={role} duty={duty} />
            <IconButton onClick={onRefresh} size="small" color="primary" aria-label="Refresh live data">
              <SyncRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Toolbar>
      <Box sx={{ height: 4, bgcolor: 'error.light', opacity: 0.35 }} />
    </AppBar>
  );
}
