import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, LinearProgress, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';

export default function BudgetPage() {
  const [tab, setTab] = useState(0);
  const [heads, setHeads] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [headForm, setHeadForm] = useState({ title: '', code: '', allowedBudget: 0, expectedCost: 0, responsibleTeamId: '', responsibleUserId: '' });

  const load = async () => {
    const [b, v, e, t, u] = await Promise.all([api.get('/budget-heads'), api.get('/vendors'), api.get('/expenses'), api.get('/teams'), api.get('/users')]);
    setHeads(b.data); setVendors(v.data); setExpenses(e.data); setTeams(t.data); setUsers(u.data);
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => ({
    allowed: heads.reduce((a, b) => a + (b.allowedBudget || 0), 0),
    actual: expenses.reduce((a, b) => a + (b.amount || 0), 0)
  }), [heads, expenses]);

  return (
    <Box>
      <PageHeader 
        title="Finance" 
        subtitle="Event budget vs actual expenses."
        chips={[{ label: `Total ₹${totals.allowed}` }]} 
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Overview" /><Tab label="Vendors" /><Tab label="Expenses" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Card sx={{ bgcolor: '#1a1a1a', color: '#fff', borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>Actual Burn</Typography>
                <Typography variant="h4" fontWeight={800}>₹{totals.actual}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(totals.actual / totals.allowed) * 100} 
                  sx={{ mt: 2, height: 8, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#d4af37' } }} 
                />
              </CardContent>
            </Card>
            
            <Box component="form" sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>New Budget Head</Typography>
              <Stack spacing={2}>
                <TextField label="Title" fullWidth variant="filled" InputProps={{ disableUnderline: true }} />
                <TextField label="Limit (₹)" type="number" fullWidth variant="filled" InputProps={{ disableUnderline: true }} />
                <Button variant="contained" fullWidth sx={{ py: 1.5, borderRadius: 3 }}>Add Head</Button>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Stack spacing={2}>
              {heads.map((h) => (
                <Card key={h._id} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight={700}>{h.title}</Typography>
                      <Typography variant="caption" color="text.secondary">Limit: ₹{h.allowedBudget}</Typography>
                    </Box>
                    <StatusChip label="Tracked" />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}