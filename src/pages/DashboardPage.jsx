import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const { events, connected } = useLive();
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data));
  }, []);

  const cards = [
    ['Students', summary.students || 0],
    ['Eligible', summary.eligibleStudents || 0],
    ['Expenses', `₹${summary.totalActualExpense || 0}`],
    ['WhatsApp', summary.whatsappMessages || 0],
  ];

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Clear view of today’s work"
        chips={[
          { label: user?.roleId?.name || 'Staff' },
          { label: connected ? 'Live' : 'Offline', color: connected ? 'success' : 'warning' },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {cards.map(([title, value]) => (
          <Grid key={title} size={{ xs: 6, md: 3 }}>
            <StatCard title={title} value={value} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Live activity</Typography>
              <List sx={{ py: 0 }}>
                {events.length ? events.slice(0, 8).map((ev, idx) => (
                  <ListItem key={idx} divider sx={{ px: 0 }}>
                    <ListItemText
                      primary={ev.name.replace(/_/g, ' ')}
                      primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                      secondary={JSON.stringify(ev.payload).slice(0, 70) + '...'}
                    />
                  </ListItem>
                )) : (
                  <Typography color="text.secondary" variant="body2">Waiting for live events...</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Quick notes</Typography>
              <Stack spacing={1.25}>
                <Typography variant="body2" color="text.secondary">Use the + button for student, volunteer, guest and team member entry.</Typography>
                <Typography variant="body2" color="text.secondary">Open Students to view marksheet, photo and certificate-ready records.</Typography>
                <Typography variant="body2" color="text.secondary">Super admin can control module access from Admin → Roles & Access.</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
