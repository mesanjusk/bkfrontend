import { Box, Typography } from '@mui/material';

export default function SectionTitle({ title, subtitle, actions = null }) {
  return (
    <Box sx={{ mb: 2.2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: { xs: 1.25, md: 2 }, flexWrap: 'wrap', minWidth: 0 }}>
      <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.45rem' }, overflowWrap: 'anywhere' }}>{title}</Typography>
        {subtitle ? <Typography variant="body2" sx={{ mt: 0.5 }}>{subtitle}</Typography> : null}
      </Box>
      {actions ? <Box sx={{ width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>{actions}</Box> : null}
    </Box>
  );
}
