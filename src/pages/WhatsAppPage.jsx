import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogContent, Grid, MenuItem, Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import api from '../api';
import PageHeader from '../components/PageHeader';
import ResponsiveTable from '../components/ResponsiveTable';
import StatusChip from '../components/StatusChip';

function CollectionSection({ title, subtitle, items, fields, viewMode, setViewMode, onAdd, onEdit }) {
  const rows = items.map((item) => ({ title: item[fields[0].key] || 'Record', ...Object.fromEntries(fields.map((f) => [f.key, f.render ? f.render(item) : item[f.key] || '-'])), action: () => <Button size="small" variant="contained" onClick={() => onEdit(item)}>Edit</Button> }));
  return <Stack spacing={2}><Card><CardContent><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}><Box><Typography variant="h6" fontWeight={800}>{title}</Typography><Typography color="text.secondary">{subtitle}</Typography></Box><Stack direction="row" spacing={1}><ToggleButtonGroup exclusive size="small" value={viewMode} onChange={(_, v) => v && setViewMode(v)}><ToggleButton value="card"><ViewModuleIcon fontSize="small" /></ToggleButton><ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton></ToggleButtonGroup><Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Add</Button></Stack></Stack></CardContent></Card>{viewMode === 'card' ? <Grid container spacing={2}>{items.map((item) => <Grid key={item._id} size={{ xs: 12, md: 6, xl: 4 }}><Card><CardContent><Stack spacing={1.2}>{fields.map((f, i) => i === 0 ? <Typography key={f.key} variant="h6" fontWeight={800}>{f.render ? f.render(item) : item[f.key] || '-'}</Typography> : <Typography key={f.key} variant="body2"><strong>{f.label}:</strong> {f.render ? f.render(item) : item[f.key] || '-'}</Typography>)}{item.status || item.isActive !== undefined ? <StatusChip label={item.status || (item.isActive ? 'Active' : 'Inactive')} /> : null}<Stack direction="row" justifyContent="flex-end"><Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(item)}>Edit</Button></Stack></Stack></CardContent></Card></Grid>)}</Grid> : <ResponsiveTable columns={[...fields.map((f) => ({ key: f.key, label: f.label })), { key: 'action', label: 'Action' }]} rows={rows} mobileTitleKey="title" />}</Stack>;
}

export default function WhatsAppPage() {
  const [tab, setTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [viewMode, setViewMode] = useState('card');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [sendForm, setSendForm] = useState({ to: '', templateName: '', text: '' });

  const load = async () => {
    const [c, t, m] = await Promise.all([api.get('/whatsapp/connections'), api.get('/whatsapp/templates'), api.get('/whatsapp/messages')]);
    setConnections(Array.isArray(c.data) ? c.data : []);
    setTemplates(Array.isArray(t.data) ? t.data : []);
    setMessages(Array.isArray(m.data) ? m.data : []);
  };
  useEffect(() => { load(); }, []);

  const config = {
    connections: { title: 'Connections', endpoint: '/whatsapp/connections', subtitle: 'Manual and embedded connections.', initial: { name: '', phoneNumberId: '', businessAccountId: '', mode: 'MANUAL', isActive: true }, fields: [{ key: 'name', label: 'Name' }, { key: 'mode', label: 'Mode' }, { key: 'phoneNumberId', label: 'Phone ID' }, { key: 'businessAccountId', label: 'Business ID' }], formFields: [{ key: 'name', label: 'Connection Name' }, { key: 'phoneNumberId', label: 'Phone Number ID' }, { key: 'businessAccountId', label: 'Business Account ID' }, { key: 'mode', label: 'Mode', type: 'select', options: ['MANUAL', 'EMBEDDED'].map((v) => ({ value: v, label: v })) }] , items: connections },
    templates: { title: 'Templates', endpoint: '/whatsapp/templates', subtitle: 'Template registry used for quick sends.', initial: { name: '', displayName: '', language: 'en_US', category: 'UTILITY', bodyText: '', isActive: true }, fields: [{ key: 'name', label: 'Template' }, { key: 'displayName', label: 'Display Name' }, { key: 'language', label: 'Language' }, { key: 'category', label: 'Category' }], formFields: [{ key: 'name', label: 'Template Key' }, { key: 'displayName', label: 'Display Name' }, { key: 'language', label: 'Language' }, { key: 'category', label: 'Category', type: 'select', options: ['UTILITY', 'MARKETING', 'AUTHENTICATION'].map((v) => ({ value: v, label: v })) }, { key: 'bodyText', label: 'Body Text', multiline: true }], items: templates },
    logs: { title: 'Message Logs', endpoint: '/whatsapp/messages', subtitle: 'Recent sends and statuses.', initial: {}, fields: [{ key: 'to', label: 'To' }, { key: 'messageType', label: 'Type' }, { key: 'templateName', label: 'Template' }, { key: 'status', label: 'Status' }], formFields: [], items: messages }
  };
  const current = config[tab];
  const openAdd = () => { if (tab === 'logs') return; setEditing(null); setForm(current.initial); setOpen(true); };
  const openEdit = (item) => { if (tab === 'logs') return; setEditing(item); setForm({ ...current.initial, ...item }); setOpen(true); };
  const save = async () => { if (editing?._id) await api.put(`${current.endpoint}/${editing._id}`, form); else await api.post(current.endpoint, form); setOpen(false); load(); };
  const sendText = async () => { await api.post('/whatsapp/send-text', sendForm); setSendForm({ to: '', templateName: '', text: '' }); load(); };

  return (
    <>
      <PageHeader title="WhatsApp Center" subtitle="One panel for connection records, templates, sending and logs." chips={[{ label: `${connections.length} Connections` }, { label: `${templates.length} Templates` }, { label: `${messages.length} Logs` }]} />
      <Alert severity="info" sx={{ mb: 2 }}>This panel keeps the same add/edit card or table pattern as the rest of the dashboard.</Alert>
      <Card sx={{ mb: 2 }}><CardContent><Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"><Tab value="connections" label={`Connections (${connections.length})`} /><Tab value="templates" label={`Templates (${templates.length})`} /><Tab value="send" label="Quick Send" /><Tab value="logs" label={`Logs (${messages.length})`} /></Tabs></CardContent></Card>
      {tab === 'send' ? <Card><CardContent><Stack spacing={2}><Typography variant="h6" fontWeight={800}>Quick Send</Typography><Grid container spacing={2}><Grid size={{ xs: 12, md: 4 }}><TextField label="To" value={sendForm.to} onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })} /></Grid><Grid size={{ xs: 12, md: 4 }}><TextField select label="Template" value={sendForm.templateName} onChange={(e) => setSendForm({ ...sendForm, templateName: e.target.value })}><MenuItem value="">No Template</MenuItem>{templates.map((t) => <MenuItem key={t._id} value={t.name}>{t.displayName || t.name}</MenuItem>)}</TextField></Grid><Grid size={{ xs: 12, md: 4 }}><Button variant="contained" fullWidth sx={{ height: '100%' }} onClick={sendText}>Send</Button></Grid></Grid><TextField label="Text Message" multiline minRows={4} value={sendForm.text} onChange={(e) => setSendForm({ ...sendForm, text: e.target.value })} /></Stack></CardContent></Card> : <CollectionSection {...current} viewMode={viewMode} setViewMode={setViewMode} onAdd={openAdd} onEdit={openEdit} />}
      {tab !== 'logs' ? <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md"><DialogContent sx={{ pt: 3 }}><Stack spacing={2}><Typography variant="h6" fontWeight={800}>{editing ? `Edit ${current.title}` : `Add ${current.title}`}</Typography><Grid container spacing={2}>{current.formFields.map((field) => <Grid key={field.key} size={{ xs: 12, md: field.multiline ? 12 : 6 }}>{field.type === 'select' ? <TextField select label={field.label} value={form[field.key] ?? ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>{(field.options || []).map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField> : <TextField label={field.label} multiline={field.multiline} minRows={field.multiline ? 3 : undefined} value={form[field.key] ?? ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />}</Grid>)}</Grid><Stack direction="row" justifyContent="flex-end" spacing={1}><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></Stack></Stack></DialogContent></Dialog> : null}
    </>
  );
}
