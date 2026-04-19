import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';
import RecentNotificationsPopover from './notifications/RecentNotificationsPopover';

const drawerWidth = 260;

const menu = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/students', label: 'Students', icon: <GroupIcon /> },
  { to: '/categories', label: 'Categories', icon: <CategoryIcon /> },
  { to: '/stage', label: 'Live Stage', icon: <EventAvailableIcon /> },
  { to: '/budget', label: 'Finance Ops', icon: <AccountBalanceWalletIcon /> },
  { to: '/responsibilities', label: 'Tasks', icon: <AssignmentTurnedInIcon /> },
  { to: '/notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { to: '/system-flow', label: 'System Flow', icon: <SettingsSuggestIcon /> }
];

export default function AppShell({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { latestPopup, clearPopup } = useLive();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const canSeeAdmin = ['SUPER_ADMIN', 'ADMIN', 'HOST'].includes(user?.roleId?.code);

  const mode = useMemo(() => (location.pathname === '/stage' ? 'LIVE' : 'PLANNING'), [location.pathname]);
  const roleLabel = user?.roleId?.name || 'Unknown Role';
  const duty = user?.eventDutyType || 'NONE';

  useEffect(() => {
    api.get('/notifications').then((res) => setRecentNotifications(res.data || [])).catch(() => setRecentNotifications([]));
  }, [location.pathname]);

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6">Scholar Awards</Typography>
        <Typography variant="body2">Event Operations Console</Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        {canSeeAdmin && (
          <ListItemButton component={RouterLink} to="/admin" selected={location.pathname === '/admin'} sx={{ borderRadius: 2 }}>
            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
            <ListItemText primary="Admin Settings" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar sx={{ gap: 1, alignItems: 'center', py: { xs: 0.5, md: 0 } }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { lg: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <TextField
            placeholder="Search students, categories, tasks..."
            size="small"
            sx={{ maxWidth: 420, display: { xs: 'none', sm: 'block' }, flexShrink: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: 0 }}>
            <Chip size="small" color={mode === 'LIVE' ? 'error' : 'primary'} label={isMobile ? mode : `${mode} MODE`} />
            {!isMobile ? <Chip size="small" variant="outlined" label={duty} /> : null}
            <Chip size="small" label={roleLabel} sx={{ display: { xs: 'none', md: 'inline-flex' } }} />
            <RecentNotificationsPopover
              notifications={recentNotifications}
              anchorEl={notificationAnchor}
              onOpen={(e) => setNotificationAnchor(e.currentTarget)}
              onClose={() => setNotificationAnchor(null)}
              onClickItem={(n) => {
                setNotificationAnchor(null);
                navigate(n.routePath || '/notifications');
              }}
            />
            <Avatar sx={{ width: 32, height: 32 }}>{(user?.name || 'U').charAt(0)}</Avatar>
            <IconButton onClick={logout}><LogoutIcon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>
          {drawerContent}
        </Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.25, sm: 2, md: 3 }, mt: { xs: 8, sm: 8 } }}>
        {children}
      </Box>

      <Snackbar
        open={Boolean(latestPopup)}
        onClose={clearPopup}
        autoHideDuration={3500}
        message={latestPopup ? `${latestPopup.name.replaceAll('_', ' ')} update received` : ''}
      />
    </Box>
  );
}
