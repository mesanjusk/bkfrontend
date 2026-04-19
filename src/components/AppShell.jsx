import { useState } from 'react';
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

const navItems = [
  { label: 'Dashboard', to: '/', icon: <DashboardIcon /> },
  { label: 'Students', to: '/students', icon: <GroupsIcon /> },
  { label: 'Categories', to: '/categories', icon: <CategoryIcon /> },
  { label: 'Live Stage', to: '/stage', icon: <EventSeatIcon /> },
  { label: 'WhatsApp', to: '/whatsapp', icon: <ChatIcon /> },
  { label: 'Budget & Vendors', to: '/budget', icon: <AccountBalanceWalletIcon /> },
  { label: 'Responsibilities', to: '/responsibilities', icon: <AssignmentTurnedInIcon /> },
  { label: 'Notifications', to: '/notifications', icon: <NotificationsIcon /> },
  { label: 'Admin', to: '/admin', icon: <AdminPanelSettingsIcon /> },
  { label: 'System Flow', to: '/system-flow', icon: <SchemaIcon /> }
];

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

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Scholar Awards</Typography>
        <Typography variant="body2" color="text.secondary">Event operations dashboard</Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItemButton key={item.to} component={RouterLink} to={item.to} selected={pathname === item.to} onClick={() => setOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
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
          width: { md: 'calc(100% - 280px)' },
          ml: { md: '280px' }
        }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          {mobile && <IconButton onClick={() => setOpen(true)}><MenuIcon /></IconButton>}
          <Box sx={{ flexGrow: 1, minWidth: 180 }}>
            <Typography variant="h6">{user?.roleId?.name || 'Dashboard'}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip size="small" label={user?.eventDutyType || 'NONE'} />
              <Chip size="small" color={connected && isOnline ? 'success' : 'warning'} label={connected && isOnline ? 'Live connected' : 'Connection unstable'} />
            </Stack>
          </Box>
          <IconButton component={RouterLink} to="/notifications"><Badge badgeContent={events.length} color="error"><NotificationsIcon /></Badge></IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 36, height: 36 }}>{(user?.name || 'U').slice(0, 1)}</Avatar>
            {!mobile && <Typography variant="body2">{user?.name}</Typography>}
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>Logout</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {mobile ? (
        <Drawer open={open} onClose={() => setOpen(false)}>{drawer}</Drawer>
      ) : (
        <Drawer variant="permanent" open PaperProps={{ sx: { width: 280, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}>{drawer}</Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pt: { xs: 12, md: 13 }, ml: { md: '280px' }, width: { md: 'calc(100% - 280px)' } }}>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <PwaInstallPrompt />
          <OnlineStatusBanner isOnline={isOnline} isLiveMode={isLiveMode} />
        </Stack>
        {children}
      </Box>
    </Box>
  );
}
