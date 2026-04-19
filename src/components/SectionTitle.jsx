import { Box, Typography } from '@mui/material';

export default function SectionTitle({ title, subtitle, actions = null }) {
  return (
    <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle ? <Typography variant="body2" sx={{ mt: 0.5 }}>{subtitle}</Typography> : null}
      </Box>
      {actions}
    </Box>
  );
}
