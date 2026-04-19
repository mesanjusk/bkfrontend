import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';

export default function StudentFormSection({ title, subtitle, actions = null, children }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1}>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, overflowWrap: 'anywhere' }}>{title}</Typography>
              {subtitle ? <Typography variant="body2" color="text.secondary">{subtitle}</Typography> : null}
            </Stack>
            {actions ? <Stack sx={{ width: { xs: '100%', sm: 'auto' } }}>{actions}</Stack> : null}
          </Stack>
          <Divider />
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
