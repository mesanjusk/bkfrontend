import { Card, CardContent, Chip, Typography } from '@mui/material';

export default function SummaryCard({ title, value, subtitle, tone = 'default' }) {
  const color = tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'default';
  return (
    <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
      <CardContent sx={{ minHeight: 132 }}>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{title}</Typography>
        <Typography variant="h5" sx={{ mt: 0.7, overflowWrap: 'anywhere' }}>{value}</Typography>
        {subtitle ? <Typography variant="body2" sx={{ mt: 0.7, overflowWrap: 'anywhere' }}>{subtitle}</Typography> : null}
        {tone !== 'default' ? <Chip size="small" color={color} label={tone.toUpperCase()} sx={{ mt: 1 }} /> : null}
      </CardContent>
    </Card>
  );
}
