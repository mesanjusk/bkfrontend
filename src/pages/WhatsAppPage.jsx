import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Grid, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';

export default function WhatsAppPage() {
  const [tab, setTab] = useState(0);
  const [connections, setConnections] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [connectionForm, setConnectionForm] = useState({ name: '', phoneNumberId: '', businessAccountId: '', mode: 'MANUAL', isActive: true });
  const [templateForm, setTemplateForm] = useState({ name: '', displayName: '', language: 'en_US', category: 'UTILITY', bodyText: '' });
  const [sendForm, setSendForm] = useState({ to: '', templateName: '', text: '' });
  const load = async () => {
    const [c, t, m] = await Promise.all([api.get('/whatsapp/connections'), api.get('/whatsapp/templates'), api.get('/whatsapp/messages')]);
    setConnections(c.data); setTemplates(t.data); setMessages(m.data);
  };
  useEffect(() => { load(); }, []);
  const saveConnection = async (e) => { e.preventDefault(); await api.post('/whatsapp/connections', connectionForm); setConnectionForm({ name: '', phoneNumberId: '', businessAccountId: '', mode: 'MANUAL', isActive: true }); load(); };
  const saveTemplate = async (e) => { e.preventDefault(); await api.post('/whatsapp/templates', templateForm); setTemplateForm({ name: '', displayName: '', language: 'en_US', category: 'UTILITY', bodyText: '' }); load(); };
  const sendText = async (e) => { e.preventDefault(); await api.post('/whatsapp/send-text', sendForm); setSendForm({ to: '', templateName: '', text: '' }); load(); };

  return (
    <>
      <PageHeader title="WhatsApp center" subtitle="Merged WhatsApp Cloud section for connections, templates, logs and quick sends." chips={[{ label: `${connections.length} connections` }, { label: `${templates.length} templates` }, { label: `${messages.length} logs` }]} />
      <Alert severity="info" sx={{ mb: 2 }}>This module is merged into the main event app. Sending actions are safe placeholders unless real WhatsApp Cloud backend integration is wired to your production credentials.</Alert>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ mb: 2 }}><Tab label="Connections" /><Tab label="Templates" /><Tab label="Quick Send" /><Tab label="Logs" /></Tabs>
      {tab === 0 && <Grid container spacing={2}><Grid size={{ xs: 12, lg: 4 }}><Card component="form" onSubmit={saveConnection}><CardContent><Stack spacing={2}><Typography variant="h6">Add connection</Typography><TextField label="Connection name" value={connectionForm.name} onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })} /><TextField label="Phone number ID" value={connectionForm.phoneNumberId} onChange={(e) => setConnectionForm({ ...connectionForm, phoneNumberId: e.target.value })} /><TextField label="Business account ID" value={connectionForm.businessAccountId} onChange={(e) => setConnectionForm({ ...connectionForm, businessAccountId: e.target.value })} /><TextField select label="Mode" value={connectionForm.mode} onChange={(e) => setConnectionForm({ ...connectionForm, mode: e.target.value })}><MenuItem value="MANUAL">Manual</MenuItem><MenuItem value="EMBEDDED">Embedded signup</MenuItem></TextField><Button variant="contained" type="submit">Save connection</Button></Stack></CardContent></Card></Grid><Grid size={{ xs: 12, lg: 8 }}><ResponsiveTable columns={[{ key:'name', label:'Name' },{ key:'mode', label:'Mode' },{ key:'phone', label:'Phone ID' },{ key:'active', label:'Status' }]} rows={connections.map((c)=>({ title:c.name, name:c.name, mode:c.mode, phone:c.phoneNumberId||'-', active:()=> <StatusChip label={c.isActive ? 'PAID' : 'UNPAID'} /> }))} mobileTitleKey="title" /></Grid></Grid>}
      {tab === 1 && <Grid container spacing={2}><Grid size={{ xs: 12, lg: 4 }}><Card component="form" onSubmit={saveTemplate}><CardContent><Stack spacing={2}><Typography variant="h6">Add template</Typography><TextField label="Template key" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} /><TextField label="Display name" value={templateForm.displayName} onChange={(e) => setTemplateForm({ ...templateForm, displayName: e.target.value })} /><TextField label="Language" value={templateForm.language} onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value })} /><TextField select label="Category" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}><MenuItem value="UTILITY">Utility</MenuItem><MenuItem value="MARKETING">Marketing</MenuItem><MenuItem value="AUTHENTICATION">Authentication</MenuItem></TextField><TextField multiline minRows={3} label="Body text" value={templateForm.bodyText} onChange={(e) => setTemplateForm({ ...templateForm, bodyText: e.target.value })} /><Button variant="contained" type="submit">Save template</Button></Stack></CardContent></Card></Grid><Grid size={{ xs: 12, lg: 8 }}><ResponsiveTable columns={[{ key:'name', label:'Template' },{ key:'display', label:'Display' },{ key:'language', label:'Language' },{ key:'category', label:'Category' }]} rows={templates.map((t)=>({ title:t.displayName||t.name, name:t.name, display:t.displayName||'-', language:t.language||'-', category:t.category||'-' }))} mobileTitleKey="title" /></Grid></Grid>}
      {tab === 2 && <Card component="form" onSubmit={sendText}><CardContent><Stack spacing={2}><Typography variant="h6">Quick send</Typography><Grid container spacing={2}><Grid size={{ xs: 12, md: 4 }}><TextField label="To" value={sendForm.to} onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })} /></Grid><Grid size={{ xs: 12, md: 4 }}><TextField select label="Template" value={sendForm.templateName} onChange={(e) => setSendForm({ ...sendForm, templateName: e.target.value })}><MenuItem value="">No template</MenuItem>{templates.map((t) => <MenuItem key={t._id} value={t.name}>{t.displayName || t.name}</MenuItem>)}</TextField></Grid><Grid size={{ xs: 12, md: 4 }}><Button type="submit" variant="contained" fullWidth sx={{ height: '100%' }}>Send placeholder</Button></Grid></Grid><TextField multiline minRows={4} label="Message text" value={sendForm.text} onChange={(e) => setSendForm({ ...sendForm, text: e.target.value })} /></Stack></CardContent></Card>}
      {tab === 3 && <ResponsiveTable columns={[{ key:'to', label:'To' },{ key:'type', label:'Type' },{ key:'template', label:'Template' },{ key:'status', label:'Status' }]} rows={messages.map((m)=>({ title:m.to, to:m.to, type:m.messageType, template:m.templateName || '-', status:()=> <StatusChip label={m.status || 'PENDING'} /> }))} mobileTitleKey="title" />}
    </>
  );
}
