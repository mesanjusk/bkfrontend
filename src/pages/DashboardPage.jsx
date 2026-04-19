import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Grid, List, ListItem, ListItemText, Typography, Box, Stack } from '@mui/material';
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

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Live event planning & role-wise visibility."
        chips={[
          { label: user?.roleId?.name || 'Staff' },
          { label: connected ? 'Live' : 'Offline', color: connected ? 'success' : 'error' }
        ]}
      />

      {/* Horizontal Stat Scroll for Mobile */}
      <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 2, px: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
        {[
          ['Students', summary.students || 0],
          ['Eligible', summary.eligibleStudents || 0],
          ['Expenses', `₹${summary.totalActualExpense || 0}`],
          ['WhatsApp', summary.whatsappMessages || 0]
        ].map(([title, value]) => (
          <Box key={title} sx={{ minWidth: 160 }}>
            <StatCard title={title} value={value} />
          </Box>
        ))}
      </Stack>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1 }}>System Flow</Typography>
          <Card sx={{ mt: 1 }}>
            <CardContent>
              <Stack spacing={2}>
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed' }}>
                  <strong>Planning Mode:</strong> Local-first sync is active.
                </Alert>
                <Alert severity="success" variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed' }}>
                  <strong>Live Mode:</strong> Sockets connected for guest alerts.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1 }}>Live Activity</Typography>
          <Card sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            <CardContent sx={{ p: 0 }}>
              <List>
                {events.length ? (
                  events.map((ev, idx) => (
                    <ListItem key={idx} divider sx={{ py: 2 }}>
                      <ListItemText
                        primary={ev.name.replace(/_/g, ' ')}
                        primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                        secondary={JSON.stringify(ev.payload).slice(0, 60) + '...'}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary" variant="body2">Waiting for events...</Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}