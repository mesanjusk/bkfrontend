import { Box, Grid, Stack } from '@mui/material';

export default function StudentFormPage({ left, rightTop, rightBottom }) {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={2}>{left}</Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {rightTop}
            {rightBottom}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
