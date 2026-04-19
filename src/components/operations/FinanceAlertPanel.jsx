import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import { Alert, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';

export default function FinanceAlertPanel({ alerts = [] }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>Operational Alerts</Typography>
        {alerts.length === 0 ? <Alert severity="success">No critical risks right now.</Alert> : null}
        <List disablePadding>
          {alerts.map((item, idx) => (
            <ListItem key={`${item.label}-${idx}`} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 34 }}>{item.severity === 'error' ? <ErrorOutlineRounded color="error" fontSize="small" /> : <WarningAmberRounded color="warning" fontSize="small" />}</ListItemIcon>
              <ListItemText primary={item.label} secondary={item.note} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
