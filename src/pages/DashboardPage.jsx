import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
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
    <>
      <PageHeader
        title="Operations dashboard"
        subtitle="Planning and live event overview with role-wise visibility."
        chips={[
          { label: user?.roleId?.name || '-' },
          { label: user?.eventDutyType || 'NONE' },
          {
            label: connected ? 'Live mode connected' : 'Reconnecting',
            color: connected ? 'success' : 'warning'
          }
        ]}
      />

      <Grid container spacing={2}>
        {[
          ['Students', summary.students || 0],
          ['Eligible', summary.eligibleStudents || 0],
          ['Stage', summary.stageAssignments || 0],
          ['Teams', summary.teams || 0],
          ['Budget Heads', summary.budgetHeads || 0],
          ['Vendors', summary.vendors || 0],
          ['Expenses', `₹${summary.totalActualExpense || 0}`],
          ['WhatsApp Logs', summary.whatsappMessages || 0]
        ].map(([title, value]) => (
          <Grid item xs={12} sm={6} lg={3} key={title}>
            <StatCard title={title} value={value} />
          </Grid>
        ))}

        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Master flow status
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Alert severity="info">
                    Planning mode: local-first and manual sync friendly.
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Alert severity="success">
                    Live day mode: sockets + server truth + guest change alerts.
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Alert severity="warning">
                    Certificate render, OCR, and WhatsApp sending remain safe placeholders unless real
                    integrations are configured.
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Alert severity="success">
                    Budget, vendor, task, student, stage, and WhatsApp modules are now visible in one
                    app.
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Live activity
              </Typography>

              <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
                {events.length ? (
                  events.map((ev, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemText
                        primary={ev.name.replaceAll('_', ' ')}
                        secondary={JSON.stringify(ev.payload).slice(0, 120)}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">No live events yet.</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}