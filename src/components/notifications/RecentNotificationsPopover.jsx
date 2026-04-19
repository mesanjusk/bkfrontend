import { useMemo } from 'react';
import { Badge, Box, Divider, IconButton, List, ListItemButton, ListItemText, Popover, Stack, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function RecentNotificationsPopover({ notifications = [], anchorEl, onOpen, onClose, onClickItem }) {
  const unread = useMemo(() => notifications.filter((n) => !n.readStatus).length, [notifications]);

  return (
    <>
      <IconButton onClick={onOpen}>
        <Badge color="error" badgeContent={unread} max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Box sx={{ width: 360, maxWidth: '90vw' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5 }}>
            <Typography variant="subtitle1">Recent Notifications</Typography>
            <Typography variant="caption">Unread {unread}</Typography>
          </Stack>
          <Divider />
          <List dense sx={{ maxHeight: 340, overflowY: 'auto', py: 0 }}>
            {notifications.slice(0, 6).map((n) => (
              <ListItemButton key={n._id} onClick={() => onClickItem(n)} sx={{ alignItems: 'flex-start' }}>
                <ListItemText
                  primary={n.title}
                  secondary={<>{n.message}<br />{new Date(n.createdAt || Date.now()).toLocaleTimeString()}</>}
                  primaryTypographyProps={{ fontWeight: n.readStatus ? 500 : 700 }}
                />
              </ListItemButton>
            ))}
            {!notifications.length ? <Typography variant="body2" sx={{ p: 2 }}>No notifications yet.</Typography> : null}
          </List>
        </Box>
      </Popover>
    </>
  );
}
