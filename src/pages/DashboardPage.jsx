import { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';
import PageHeader from '../components/PageHeader';
import PageSurface from '../components/PageSurface';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const { events, connected } = useLive();
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data)).catch(() => setSummary({}));
  }, []);

  const cards = useMemo(() => [
    ['Students', summary.students || 0, 'Registered'],
    ['Eligible', summary.eligibleStudents || 0, 'Ready for review'],
    ['WhatsApp', summary.whatsappMessages || 0, connected ? 'Live sync active' : 'Waiting for sync'],
    ['Events', summary.events || 0, 'Configured'],
  ], [summary, connected]);

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        eyebrow="Overview"
        title="Operations Dashboard"
        subtitle="A cleaner WhatsApp-style workspace for daily student, event and inbox management."
        chips={[
          { label: user?.roleId?.name || 'Dashboard' },
          { label: `${events.length} Live updates`, color: connected ? 'success' : 'warning' },
        ]}
      />

      <PageSurface sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {cards.map(([title, value, subtitle]) => (
            <Grid key={title} size={{ xs: 6, lg: 3 }}>
              <StatCard title={title} value={value} subtitle={subtitle} />
            </Grid>
          ))}
        </Grid>
      </PageSurface>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <PageSurface>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Live activity</Typography>
                <List sx={{ py: 0 }}>
                  {events.length ? events.slice(0, 8).map((ev, idx) => (
                    <ListItem key={idx} divider sx={{ px: 0 }}>
                      <ListItemText
                        primary={ev.name.replace(/_/g, ' ')}
                        primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                        secondary={JSON.stringify(ev.payload).slice(0, 92) + '...'}
                      />
                    </ListItem>
                  )) : (
                    <Typography color="text.secondary" variant="body2">Waiting for live events...</Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </PageSurface>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <PageSurface>
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={800}>Quick notes</Typography>
                  <Typography variant="body2" color="text.secondary">Use Students for registration review, WhatsApp for customer reply handling, and Admin for users, guests and teams.</Typography>
                  <Typography variant="body2" color="text.secondary">The UI is now aligned to a WhatsApp-style management dashboard across mobile and desktop.</Typography>
                </Stack>
              </CardContent>
            </Card>
          </PageSurface>
        </Grid>
      </Grid>
    </Box>
  );
}
