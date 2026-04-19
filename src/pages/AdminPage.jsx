import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import api from '../api';
import SectionTitle from '../components/SectionTitle';
import SummaryCard from '../components/SummaryCard';
import AdminUserCard from '../components/admin/AdminUserCard';
import RoleSummaryCard from '../components/admin/RoleSummaryCard';
import TemplateCard from '../components/admin/TemplateCard';
import AutomationRuleCard from '../components/admin/AutomationRuleCard';
import AutomationRuleEditor from '../components/admin/AutomationRuleEditor';
import SettingsSectionCard from '../components/admin/SettingsSectionCard';
import HealthAlertPanel from '../components/admin/HealthAlertPanel';

const userInitial = { name: '', username: '', password: '', roleId: '', eventDutyType: 'NONE', availabilityStatus: 'AVAILABLE' };
const templateInitial = { name: '', type: 'STUDENT_AWARD', language: 'EN', isActive: true, snippet: '' };
const ruleInitial = { name: '', triggerKey: 'form_submitted', templateName: '', recipientType: 'Student', conditionSummary: '', conditionJson: '', isActive: true };

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userForm, setUserForm] = useState(userInitial);
  const [templateForm, setTemplateForm] = useState(templateInitial);
  const [editingRule, setEditingRule] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [settings, setSettings] = useState({ event: true, users: true, templates: true, automation: true, liveMode: true, notifications: true });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const load = async () => {
    const [u, r, t, a, n] = await Promise.all([
      api.get('/users'),
      api.get('/roles'),
      api.get('/certificate-templates'),
      api.get('/automation-rules'),
      api.get('/notifications')
    ]);
    setUsers(u.data || []);
    setRoles(r.data || []);
    setTemplates(t.data || []);
    setRules(a.data || []);
    setNotifications(n.data || []);
  };

  useEffect(() => { load(); }, []);

  const addUser = async (e) => { e.preventDefault(); await api.post('/users', userForm); setUserForm(userInitial); load(); };
  const addTemplate = async (e) => { e.preventDefault(); await api.post('/certificate-templates', templateForm); setTemplateForm(templateInitial); load(); };
  const saveRule = async () => {
    if (!editingRule) return;
    if (editingRule?._id) await api.put(`/automation-rules/${editingRule._id}`, editingRule);
    else await api.post('/automation-rules', editingRule);
    setEditingRule(null);
    load();
  };

  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.readStatus).length;
    const inactiveRules = rules.filter((r) => !r.isActive).length;
    const inactiveUsers = users.filter((u) => u.isActive === false).length;
    return {
      unread,
      inactiveRules,
      inactiveUsers,
      activeRules: rules.filter((r) => r.isActive).length
    };
  }, [notifications, rules, users]);

  return (
    <Box>
      <SectionTitle title="Admin Command Center" subtitle="Users, WhatsApp automation, templates, and configuration in one operational console." />

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={6} md={3}><SummaryCard title="Total Admin/Users" value={users.length} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Inactive Users" value={stats.inactiveUsers} tone={stats.inactiveUsers ? 'warning' : 'success'} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Active Automation Rules" value={stats.activeRules} /></Grid>
        <Grid item xs={6} md={3}><SummaryCard title="Total Templates" value={templates.length} /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ px: 1, py: 0.5 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Users" /><Tab label="Roles" /><Tab label="Templates" /><Tab label="Automation" /><Tab label="Settings" />
            </Tabs>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <HealthAlertPanel
            items={[
              ...(stats.unread ? [{ label: 'Unread critical/regular notifications', value: stats.unread, severity: 'warning' }] : []),
              ...(stats.inactiveRules ? [{ label: 'Inactive automation rules', value: stats.inactiveRules, severity: 'error' }] : []),
              ...(stats.inactiveUsers ? [{ label: 'Inactive users', value: stats.inactiveUsers, severity: 'warning' }] : [])
            ]}
          />
        </Grid>
      </Grid>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Paper component="form" onSubmit={addUser} sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Create Admin/User</Typography>
              <Stack spacing={1}>
                <TextField label="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                <TextField label="Username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
                <TextField type="password" label="Password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                <TextField select label="Role" value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}>
                  <MenuItem value="">Select</MenuItem>
                  {roles.map((r) => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}
                </TextField>
                <TextField label="Event duty" value={userForm.eventDutyType} onChange={(e) => setUserForm({ ...userForm, eventDutyType: e.target.value })} />
                <TextField select label="Availability" value={userForm.availabilityStatus} onChange={(e) => setUserForm({ ...userForm, availabilityStatus: e.target.value })}>
                  {['AVAILABLE', 'BUSY', 'EXPECTED', 'ARRIVED_EARLY', 'LEFT_VENUE'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
                <Button variant="contained" type="submit">Add User</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}>
            {isMobile ? (
              <Stack spacing={1}>{users.map((u) => <AdminUserCard key={u._id} user={u} />)}</Stack>
            ) : (
              <Paper>
                <Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Username</TableCell><TableCell>Role</TableCell><TableCell>Duty</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                  <TableBody>{users.map((u) => <TableRow key={u._id}><TableCell>{u.name}</TableCell><TableCell>{u.username}</TableCell><TableCell>{u.roleId?.name || '-'}</TableCell><TableCell>{u.eventDutyType || '-'}</TableCell><TableCell>{u.availabilityStatus || (u.isActive === false ? 'INACTIVE' : 'ACTIVE')}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {tab === 1 && <Grid container spacing={2}>{roles.map((r) => <Grid item xs={12} md={6} lg={4} key={r._id}><RoleSummaryCard role={r} /></Grid>)}</Grid>}

      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Paper component="form" onSubmit={addTemplate} sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Template Management</Typography>
              <Stack spacing={1}>
                <TextField label="Template name" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
                <TextField select label="Type" value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}>
                  {['STUDENT_AWARD', 'GUEST_THANK_YOU', 'VOLUNTEER_APPRECIATION', 'TEAM_APPRECIATION'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
                <TextField label="Language" value={templateForm.language} onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value })} />
                <TextField label="Snippet" value={templateForm.snippet} onChange={(e) => setTemplateForm({ ...templateForm, snippet: e.target.value })} />
                <Button variant="contained" type="submit">Add Template</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}><Grid container spacing={1.2}>{templates.map((t) => <Grid item xs={12} md={6} key={t._id}><TemplateCard template={t} onPreview={setPreviewTemplate} /></Grid>)}</Grid></Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 1 }} gap={1}>
              <Typography variant="h6">WhatsApp Automation Rules</Typography>
              <Button variant="contained" onClick={() => setEditingRule({ ...ruleInitial })}>Create Rule</Button>
            </Stack>
            {!rules.length ? <Alert severity="info">No automation rules configured yet.</Alert> : null}
          </Grid>
          {isMobile ? (
            <Grid item xs={12}><Stack spacing={1}>{rules.map((r) => <AutomationRuleCard key={r._id} rule={r} onEdit={setEditingRule} />)}</Stack></Grid>
          ) : (
            <Grid item xs={12}>
              <Paper>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Rule</TableCell><TableCell>Trigger</TableCell><TableCell>Recipient</TableCell><TableCell>Template</TableCell><TableCell>Status</TableCell><TableCell>Last Modified</TableCell><TableCell /></TableRow></TableHead>
                  <TableBody>
                    {rules.map((r) => (
                      <TableRow key={r._id} hover>
                        <TableCell>{r.name}</TableCell><TableCell>{r.triggerKey}</TableCell><TableCell>{r.recipientType}</TableCell><TableCell>{r.templateName}</TableCell><TableCell>{r.isActive ? 'Active' : 'Inactive'}</TableCell><TableCell>{new Date(r.updatedAt || r.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                        <TableCell><Button size="small" onClick={() => setEditingRule(r)}>Inspect/Edit</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 4 && (
        <Grid container spacing={1.3}>
          <Grid item xs={12} md={6}><SettingsSectionCard title="Event settings" description="Control event level toggles and execution mode." enabled={settings.event} onToggle={(v) => setSettings((p) => ({ ...p, event: v }))} /></Grid>
          <Grid item xs={12} md={6}><SettingsSectionCard title="User/admin settings" description="User onboarding defaults and access experience." enabled={settings.users} onToggle={(v) => setSettings((p) => ({ ...p, users: v }))} /></Grid>
          <Grid item xs={12} md={6}><SettingsSectionCard title="Template settings" description="Certificate and message template availability." enabled={settings.templates} onToggle={(v) => setSettings((p) => ({ ...p, templates: v }))} /></Grid>
          <Grid item xs={12} md={6}><SettingsSectionCard title="Automation settings" description="Automation execution and safety behavior." enabled={settings.automation} onToggle={(v) => setSettings((p) => ({ ...p, automation: v }))} /></Grid>
          <Grid item xs={12} md={6}><SettingsSectionCard title="Live mode preferences" description="Real-time operational dashboard preferences." enabled={settings.liveMode} onToggle={(v) => setSettings((p) => ({ ...p, liveMode: v }))} /></Grid>
          <Grid item xs={12} md={6}><SettingsSectionCard title="Notification preferences" description="Alert noise reduction and priority visibility." enabled={settings.notifications} onToggle={(v) => setSettings((p) => ({ ...p, notifications: v }))} /></Grid>
        </Grid>
      )}

      <AutomationRuleEditor
        open={Boolean(editingRule)}
        value={editingRule}
        templates={templates}
        onClose={() => setEditingRule(null)}
        onChange={(key, value) => setEditingRule((p) => ({ ...p, [key]: value }))}
        onSubmit={saveRule}
      />

      <Dialog open={Boolean(previewTemplate)} onClose={() => setPreviewTemplate(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{previewTemplate?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>Type: {previewTemplate?.type}</Typography>
          <Typography variant="body2">{previewTemplate?.snippet || previewTemplate?.description || 'No quick preview available.'}</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
