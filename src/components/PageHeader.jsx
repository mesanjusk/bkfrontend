import { Box, Chip, Stack, Typography } from '@mui/material';

export default function PageHeader({ title, subtitle, chips = [], action }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5 }}>{title}</Typography>
          {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
            {chips.map((c, i) => <Chip key={i} label={c.label} color={c.color || 'default'} variant={c.variant || 'filled'} size="small" />)}
          </Stack>
        </Box>
        {action ? <Box>{action}</Box> : null}
      </Stack>
    </Box>
  );
}
