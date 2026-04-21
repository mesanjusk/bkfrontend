import { useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar, Avatar, Badge, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, Stack, Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import CategoryIcon from '@mui/icons-material/Category';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatIcon from '@mui/icons-material/Chat';
import SchemaIcon from '@mui/icons-material/Schema';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';
import useOnlineStatus from '../hooks/useOnlineStatus';
import OnlineStatusBanner from './pwa/OnlineStatusBanner';
import PwaInstallPrompt from './pwa/PwaInstallPrompt';
import { APP_ROUTES, canAccess } from '../utils/accessControl';

const navIcons = {
  '/': <DashboardIcon />,
  '/students': <GroupsIcon />,
  '/categories': <CategoryIcon />,
  '/stage': <EventSeatIcon />,
  '/budget': <AccountBalanceWalletIcon />,
  '/responsibilities': <AssignmentTurnedInIcon />,
  '/notifications': <NotificationsIcon />,
  '/admin': <AdminPanelSettingsIcon />,
  '/whatsapp': <ChatIcon />,
  '/system-flow': <SchemaIcon />
};

const liveModePaths = ['/stage', '/notifications', '/whatsapp'];

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { connected, events } = useLive();
  const isOnline = useOnlineStatus();
  const isLiveMode = liveModePaths.some((path) => pathname.startsWith(path));

  const navItems = useMemo(
    () => APP_ROUTES.filter((item) => canAccess(user, item.permission)),
    [user]
  );

  const drawer = (
    <Box sx={{ width: 286 }}>
      <Box sx={{ p: 2.5, background: 'linear-gradient(180deg, #2497d3 0%, #4fb0e1 100%)', color: '#fff' }}>
        <Typography variant="h6" fontWeight={800}>BK Awards 2026</Typography>
        <Typography variant="body2" sx={{ opacity: 0.92 }}>
          Event operations dashboard
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1.25, py: 1.25 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={pathname === item.to}
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: 3,
              mb: 0.75,
              '&.Mui-selected': {
                bgcolor: '#e9f6fc',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' }
              }
            }}
          >
            <ListItemIcon>{navIcons[item.to]}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', pb: 'env(safe-area-inset-bottom)' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          pt: 'env(safe-area-inset-top)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(12px)',
          bgcolor: 'rgba(255,255,255,0.88)',
          width: { md: 'calc(100% - 286px)' },
          ml: { md: '286px' }
        }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          {mobile && <IconButton onClick={() => setOpen(true)}><MenuIcon /></IconButton>}
          <Box sx={{ flexGrow: 1, minWidth: 180 }}>
            <Typography variant="h6" fontWeight={800}>{user?.roleId?.name || 'Dashboard'}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="small" label={user?.eventDutyType || 'NONE'} />
              <Chip size="small" color={connected && isOnline ? 'success' : 'warning'} label={connected && isOnline ? 'Live connected' : 'Connection unstable'} />
            </Stack>
          </Box>
          <IconButton component={RouterLink} to="/notifications">
            <Badge badgeContent={events.length} color="error"><NotificationsIcon /></Badge>
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>{(user?.name || 'U').slice(0, 1)}</Avatar>
            {!mobile && <Typography variant="body2" fontWeight={700}>{user?.name}</Typography>}
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>Logout</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {mobile ? (
        <Drawer open={open} onClose={() => setOpen(false)}>{drawer}</Drawer>
      ) : (
        <Drawer variant="permanent" open PaperProps={{ sx: { width: 286, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}>{drawer}</Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pt: { xs: 12, md: 13 }, ml: { md: '286px' }, width: { md: 'calc(100% - 286px)' } }}>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <PwaInstallPrompt />
          <OnlineStatusBanner isOnline={isOnline} isLiveMode={isLiveMode} />
        </Stack>
        {children}
      </Box>
    </Box>
  );
}
