import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';

export default function LiveActivityFeed({ items }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1.3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={0.8}>Live Activity</Typography>
        <List dense disablePadding>
          {items.length ? items.map((item) => (
            <ListItem key={item.id} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}><AutorenewRoundedIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={item.title} secondary={item.timeLabel} />
            </ListItem>
          )) : (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}><AccessTimeRoundedIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={<Typography color="text.secondary">Waiting for live events...</Typography>} />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
}
