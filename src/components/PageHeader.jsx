import { Box, Chip, Stack, Typography } from '@mui/material';

export default function PageHeader({ title, subtitle, chips = [], action }) {
  return (
    <Box sx={{ mb: { xs: 1.5, sm: 2.5 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={{ xs: 1.25, sm: 2 }}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ mb: subtitle ? 0.25 : 0, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>{title}</Typography>
          {subtitle ? <Typography color="text.secondary" sx={{ fontSize: { xs: 13, sm: 14 } }}>{subtitle}</Typography> : null}
          {chips.length ? (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              {chips.map((c, i) => <Chip key={i} label={c.label} color={c.color || 'default'} variant={c.variant || 'filled'} size="small" />)}
            </Stack>
          ) : null}
        </Box>
        {action ? <Box sx={{ width: { xs: '100%', md: 'auto' } }}>{action}</Box> : null}
      </Stack>
    </Box>
  );
}
