import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { AppBar, Badge, Box, Chip, IconButton, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import RoleDutyBadge from './RoleDutyBadge';

export default function LiveEventHeader({ nowLabel, connectionStatus, unreadAlerts, role, duty, onRefresh }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Toolbar sx={{ px: { xs: 1.2, md: 2 }, minHeight: { xs: 64, md: 72 }, py: { xs: 0.5, sm: 0 } }}>
        <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" sx={{ width: '100%', justifyContent: 'space-between', rowGap: 0.6 }}>
          <Stack spacing={0.3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>Live Event Console</Typography>
              <Chip label="LIVE" size="small" color="error" />
            </Stack>
            <Typography variant="caption" color="text.secondary">{nowLabel}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <ConnectionStatusBadge status={connectionStatus} />
            <Badge badgeContent={unreadAlerts} color="error" max={99}>
              <Chip size="small" label="Alerts" variant="outlined" />
            </Badge>
            {!isMobile ? <RoleDutyBadge role={role} duty={duty} /> : null}
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
