import { useMemo } from 'react';
import { Card, CardContent, Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import DataTable from './DataTable';
import EmptyState from './EmptyState';

export default function ResponsiveDataView({ headers = [], rows = [], mobileRender }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const items = useMemo(() => rows || [], [rows]);
  if (!items.length) return <EmptyState />;

  if (!isMobile || !mobileRender) {
    return <DataTable headers={headers} rows={items} />;
  }

  return (
    <Grid container spacing={1.2}>
      {items.map((row, index) => (
        <Grid item xs={12} key={index}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.2, sm: 1.8 }, '&:last-child': { pb: { xs: 1.2, sm: 1.8 } } }}>
              {mobileRender(row, index) || (
                <Stack spacing={0.7}>
                  {headers.map((h, i) => (
                    <Typography variant="body2" key={`${h}-${i}`} sx={{ overflowWrap: 'anywhere' }}>
                      <strong>{h}: </strong>{row[i]}
                    </Typography>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
