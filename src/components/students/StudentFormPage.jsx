import { Box, Grid, Stack, useMediaQuery, useTheme } from '@mui/material';

export default function StudentFormPage({ left, rightTop, rightBottom }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8} order={{ xs: 2, lg: 1 }}>
          <Stack spacing={2}>{left}</Stack>
        </Grid>
        <Grid item xs={12} lg={4} order={{ xs: 1, lg: 2 }}>
          <Stack spacing={2}>
            {isMobile ? (
              <Box sx={{ position: 'sticky', top: 72, zIndex: 2 }}>{rightTop}</Box>
            ) : rightTop}
            {rightBottom}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
