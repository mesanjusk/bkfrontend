import { Card, CardContent, Stack, Switch, Typography, FormControlLabel } from '@mui/material';

export default function SettingsSectionCard({ title, description, enabled, onToggle }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Stack>
            <Typography variant="subtitle1">{title}</Typography>
            <Typography variant="body2">{description}</Typography>
          </Stack>
          <FormControlLabel control={<Switch checked={Boolean(enabled)} onChange={(e) => onToggle(e.target.checked)} />} label={enabled ? 'On' : 'Off'} />
        </Stack>
      </CardContent>
    </Card>
  );
}
