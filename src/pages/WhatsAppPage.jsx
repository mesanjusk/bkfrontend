import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Alert, Avatar, Box, Button, Card, CardContent, Checkbox, Chip,
  CircularProgress, Divider, FormControlLabel, Grid, LinearProgress,
  List, ListItemButton, ListItemText, MenuItem, Stack, Switch,
  Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PageHeader from '../components/PageHeader';
import PageSurface from '../components/PageSurface';
import ResponsiveDialog from '../components/ResponsiveDialog';
import ResponsiveTable from '../components/ResponsiveTable';
import whatsappService from '../services/whatsappService';

// ── Tab definitions ───────────────────────────────────────────────────────────
const officialTabs = [
  ['inbox', 'Inbox'],
  ['rules', 'Auto Reply'],
  ['send', 'Quick Send'],
  ['invite', 'Invitation'],
  ['templates', 'Templates'],
  ['connections', 'Connections'],
  ['logs', 'Logs'],
];

// Baileys now matches Official API feature-for-feature
const baileysTabs = [
  ['inbox', 'Inbox'],
  ['rules', 'Auto Reply'],
  ['send', 'Quick Send'],
  ['invite', 'Invitation'],
  ['logs', 'Logs'],
  ['setup', 'Setup / QR'],
];

// ── Shared constants ──────────────────────────────────────────────────────────
const emptyInvitationForm = {
  recipientMode: 'single', singleName: '', singleNumber: '',
  imageUrl: '', eventName: '', date: '', time: '', venue: '',
};
const recipientModeOptions = [
  { value: 'students', label: 'Students' },
  { value: 'parents', label: 'Parents' },
  { value: 'teamMembers', label: 'Team Members' },
  { value: 'volunteers', label: 'Volunteers' },
  { value: 'guests', label: 'Guests' },
  { value: 'single', label: 'Single Number' },
  { value: 'csv', label: 'CSV File' },
  { value: 'excel', label: 'Excel File' },
];
const emptyRule = {
  name: '', matchType: 'CONTAINS', triggerText: '',
  replyType: 'TEXT', replyText: '', templateName: '',
  templateLanguage: 'en_US', isActive: true, priority: 100, stopAfterMatch: true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalizePhone = (v) => String(v || '').replace(/[^\d]/g, '').trim();
const formatWhen = (v) => v ? new Date(v).toLocaleString() : '-';
const conversationName = (item) => item?.contactName || item?.name || item?.phone || 'Unknown';

function parseRowsToRecipients(rows = []) {
  return rows.map(row => ({
    name: String(row.name || row.fullName || row.studentName || row.guestName || row.Name || '').trim() || 'Guest',
    mobile: normalizePhone(
      row.mobile || row.phone || row.number || row.whatsapp ||
      row.Mobile || row.Phone || row.Number || row.WhatsApp || ''
    ),
    source: 'FILE',
  })).filter(item => item.mobile);
}

// ── Shared UI components ──────────────────────────────────────────────────────

function CollectionSection({ title, subtitle, rows, onAdd, children }) {
  return (
    <Stack spacing={2}>
      <Card><CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>{title}</Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
          </Box>
          {onAdd && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Add</Button>
          )}
        </Stack>
      </CardContent></Card>
      {children}
      <Card><CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <ResponsiveTable columns={rows.columns} rows={rows.data} />
      </CardContent></Card>
    </Stack>
  );
}

function MessageBubble({ message }) {
  const isOut = message.direction === 'OUTGOING';
  return (
    <Box sx={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start' }}>
      <Box sx={{
        maxWidth: '75%', px: 1.5, py: 1, borderRadius: 2,
        bgcolor: isOut ? '#dcf8c6' : '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,.13)',
      }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message.bodyText || message.text || '—'}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.25 }}>
          {formatWhen(message.createdAt)} · {message.status || ''}
          {message.source === 'AUTO_REPLY' ? ' · 🤖 auto' : ''}
        </Typography>
      </Box>
    </Box>
  );
}

function ProviderToggle({ useBaileys, onToggle, baileysStatus }) {
  const statusColor = baileysStatus === 'CONNECTED' ? 'success' : baileysStatus === 'QR_PENDING' ? 'warning' : 'default';
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {useBaileys
              ? <QrCode2Icon sx={{ color: 'warning.main' }} />
              : <LinkIcon sx={{ color: 'success.main' }} />}
            <Box>
              <Typography fontWeight={800}>{useBaileys ? '🐝 Baileys Mode' : '✅ Official Cloud API'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {useBaileys
                  ? 'Messages go through Baileys — scan QR in Setup tab to connect.'
                  : 'Messages sent via Meta Graph API. Configure env vars in backend.'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {useBaileys && <Chip label={`Baileys: ${baileysStatus || 'UNKNOWN'}`} color={statusColor} size="small" />}
            <Tooltip title={useBaileys ? 'Switch to Official API' : 'Switch to Baileys'}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Official</Typography>
                <Switch checked={useBaileys} onChange={onToggle} color="warning" />
                <Typography variant="caption" color="text.secondary">Baileys</Typography>
              </Stack>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Inbox (shared layout, branded by provider) ────────────────────────────────

function InboxPanel({ inbox, selectedKey, onSelect, conversationMessages, replyForm, setReplyForm, onSend, saving, isBaileys, templates }) {
  const accentBg = isBaileys ? '#b37a00' : '#1976d2';
  const accentSelected = isBaileys ? '#fff8e1' : '#e3f2fd';
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <PageSurface>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2, py: 1.5, bgcolor: accentBg, color: '#fff' }}>
                <Typography fontWeight={800}>{isBaileys ? '🐝 Baileys Inbox' : '📬 Official Inbox'}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{inbox.length} conversations</Typography>
              </Box>
              <List sx={{ py: 0, maxHeight: { xs: 'unset', lg: '68vh' }, overflow: 'auto' }}>
                {inbox.length === 0 && (
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary" variant="body2">
                      {isBaileys
                        ? 'No conversations yet. Connect via QR and receive a message first.'
                        : 'No conversations yet.'}
                    </Typography>
                  </Box>
                )}
                {inbox.map(item => (
                  <ListItemButton key={item.conversationKey} selected={item.conversationKey === selectedKey}
                    onClick={() => onSelect(item.conversationKey)}
                    sx={{ alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider', '&.Mui-selected': { bgcolor: accentSelected } }}>
                    <Avatar sx={{ bgcolor: isBaileys ? 'warning.main' : 'primary.main', mr: 1.5 }}>
                      {conversationName(item).slice(0, 1)}
                    </Avatar>
                    <ListItemText primary={conversationName(item)} primaryTypographyProps={{ fontWeight: 800 }}
                      secondary={`${item.phone || ''}${item.lastMessage ? ` • ${item.lastMessage}` : ''}`} />
                    <Stack alignItems="flex-end" spacing={0.75}>
                      <Typography variant="caption" color="text.secondary">{formatWhen(item.lastMessageAt)}</Typography>
                      {item.unreadCount > 0 && (
                        <Chip label={item.unreadCount} size="small" color={isBaileys ? 'warning' : 'primary'} />
                      )}
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </PageSurface>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <PageSurface>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={800}>
                  {selectedKey ? conversationName(inbox.find(i => i.conversationKey === selectedKey)) || selectedKey : 'Select a chat'}
                </Typography>
                <Typography variant="body2" color="text.secondary">{selectedKey || 'Choose a conversation from the left list.'}</Typography>
              </Box>
              <Box sx={{ p: 2, minHeight: 360, maxHeight: { xs: 'unset', lg: '52vh' }, overflow: 'auto', bgcolor: isBaileys ? '#fef9e7' : '#efeae2', backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
                <Stack spacing={1.2}>
                  {conversationMessages.length
                    ? conversationMessages.map(msg => <MessageBubble key={msg._id || msg.baileysMessageId || Math.random()} message={msg} />)
                    : <Typography color="text.secondary">No messages yet.</Typography>}
                </Stack>
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#f0f2f5' }}>
                {!isBaileys && (
                  <TextField select label="Template" value={replyForm.templateName || ''} sx={{ mb: 1.5 }}
                    onChange={e => setReplyForm(p => ({ ...p, templateName: e.target.value }))}>
                    <MenuItem value="">No Template</MenuItem>
                    {(templates || []).map(item => (
                      <MenuItem key={item._id} value={item.name}>{item.displayName || item.name}</MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField fullWidth label="Reply message" multiline minRows={2} value={replyForm.text}
                  onChange={e => setReplyForm(p => ({ ...p, text: e.target.value }))} />
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button variant="contained" color={isBaileys ? 'warning' : 'primary'} startIcon={<SendIcon />}
                    disabled={saving || !selectedKey || !replyForm.text.trim()} onClick={onSend}>
                    {isBaileys ? 'Send via Baileys' : 'Send Reply'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </PageSurface>
      </Grid>
    </Grid>
  );
}

// ── Quick Send (shared) ───────────────────────────────────────────────────────

function QuickSendPanel({ onSend, saving, isBaileys, templates }) {
  const [form, setForm] = useState({ to: '', contactName: '', text: '', templateName: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <PageSurface>
      <Card><CardContent>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          {isBaileys ? '🐝 Baileys Quick Send' : '📤 Quick Send'}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="To (phone number)" value={form.to} onChange={e => set('to', e.target.value)} helperText="Country code required e.g. 919876543210" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Contact Name (optional)" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
          </Grid>
          {!isBaileys && templates?.length > 0 && (
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField select label="Template" value={form.templateName} onChange={e => set('templateName', e.target.value)}>
                <MenuItem value="">No Template</MenuItem>
                {templates.map(t => <MenuItem key={t._id} value={t.name}>{t.displayName || t.name}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <TextField label="Message" multiline minRows={3} value={form.text}
              onChange={e => set('text', e.target.value)} />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="contained" color={isBaileys ? 'warning' : 'primary'} startIcon={<SendIcon />}
            disabled={saving || !form.to || !form.text.trim()}
            onClick={() => { onSend(form); setForm({ to: '', contactName: '', text: '', templateName: '' }); }}>
            Send
          </Button>
        </Stack>
      </CardContent></Card>
    </PageSurface>
  );
}

// ── Auto Reply rules (shared panel) ──────────────────────────────────────────

function AutoReplyPanel({ rules, onAdd, onEdit, isBaileys }) {
  const ruleRows = {
    columns: [
      { key: 'name', label: 'Rule' },
      { key: 'trigger', label: 'Trigger' },
      { key: 'reply', label: 'Reply' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ],
    data: rules.map(item => ({
      title: item.name || 'Rule', name: item.name || '-',
      trigger: `${item.matchType || '-'} • ${item.triggerText || 'ALL'}`,
      reply: item.replyType === 'TEMPLATE' ? item.templateName || '-' : item.replyText || '-',
      status: () => <Chip label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} size="small" />,
      action: () => <Button size="small" variant="contained" color={isBaileys ? 'warning' : 'primary'} onClick={() => onEdit(item)}>Edit</Button>,
    })),
  };

  return (
    <CollectionSection
      title={isBaileys ? '🐝 Baileys Auto Reply Rules' : 'Auto Reply Rules'}
      subtitle={isBaileys
        ? 'Rules applied to incoming Baileys messages automatically.'
        : 'Rules trigger after customer message is stored by webhook.'}
      rows={ruleRows}
      onAdd={onAdd}
    >
      {!isBaileys && (
        <Card><CardContent>
          <Typography fontWeight={700}>Webhook setup</Typography>
          <Typography variant="body2" color="text.secondary">Meta webhook URL: <strong>/api/whatsapp/webhook</strong>.</Typography>
        </CardContent></Card>
      )}
      {isBaileys && (
        <Card><CardContent>
          <Typography fontWeight={700}>How Baileys auto-reply works</Typography>
          <Typography variant="body2" color="text.secondary">
            Rules are evaluated on every incoming Baileys message. Matching rules send a text reply automatically and log it with source AUTO_REPLY.
          </Typography>
        </CardContent></Card>
      )}
    </CollectionSection>
  );
}

// ── Invitation panel (shared) ─────────────────────────────────────────────────

function InvitationPanel({
  isBaileys, invitationForm, setInvitationForm, selectedRecipients, setSelectedRecipients,
  textPosition, setTextPosition, onUploadImage, uploadingImage, onSend, sending, fileName, setFileName,
  recipientGroups,
}) {
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
    setSelectedRecipients(parseRowsToRecipients(rows).map(r => ({ ...r, checked: true })));
  };

  return (
    <PageSurface>
      <Card><CardContent>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          {isBaileys ? '🐝 Baileys Invitation Blast' : '📨 Invitation Blast'}
        </Typography>
        <Grid container spacing={2}>
          {/* Event details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Event Name" value={invitationForm.eventName}
              onChange={e => setInvitationForm(p => ({ ...p, eventName: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={invitationForm.date}
              onChange={e => setInvitationForm(p => ({ ...p, date: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField type="time" label="Time" InputLabelProps={{ shrink: true }} value={invitationForm.time}
              onChange={e => setInvitationForm(p => ({ ...p, time: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Venue" value={invitationForm.venue}
              onChange={e => setInvitationForm(p => ({ ...p, venue: e.target.value }))} />
          </Grid>

          {/* Image */}
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField label="Image URL" value={invitationForm.imageUrl}
              onChange={e => setInvitationForm(p => ({ ...p, imageUrl: e.target.value }))}
              helperText="Paste URL or upload below." />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button component="label" variant="outlined" startIcon={uploadingImage ? <CircularProgress size={16} /> : <UploadFileIcon />}
              disabled={uploadingImage} fullWidth sx={{ height: 56 }}>
              Upload Image
              <input hidden accept="image/*" type="file" onChange={onUploadImage} />
            </Button>
          </Grid>
          {invitationForm.imageUrl && (
            <Grid size={{ xs: 12 }}>
              <Box component="img" src={invitationForm.imageUrl} alt="preview"
                sx={{ maxHeight: 160, borderRadius: 2, objectFit: 'contain', border: '1px solid', borderColor: 'divider' }} />
            </Grid>
          )}

          {/* Text position */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField select label="Text Position" value={textPosition}
              onChange={e => setTextPosition(e.target.value)}>
              {['top', 'bottom', 'none'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>

          {/* Recipient mode */}
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField select label="Recipients" value={invitationForm.recipientMode}
              onChange={e => setInvitationForm(p => ({ ...p, recipientMode: e.target.value }))}>
              {recipientModeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          </Grid>

          {invitationForm.recipientMode === 'single' && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Name" value={invitationForm.singleName}
                  onChange={e => setInvitationForm(p => ({ ...p, singleName: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Phone" value={invitationForm.singleNumber}
                  onChange={e => setInvitationForm(p => ({ ...p, singleNumber: e.target.value }))}
                  helperText="With country code e.g. 919876543210" />
              </Grid>
            </>
          )}

          {['csv', 'excel'].includes(invitationForm.recipientMode) && (
            <Grid size={{ xs: 12 }}>
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                Upload {invitationForm.recipientMode.toUpperCase()}
                <input hidden type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
              </Button>
              {fileName && <Typography variant="caption" sx={{ ml: 1 }}>{fileName} — {selectedRecipients.length} recipients</Typography>}
            </Grid>
          )}

          {selectedRecipients.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>Recipients ({selectedRecipients.length})</Typography>
              <Stack spacing={0.5} sx={{ maxHeight: 200, overflow: 'auto' }}>
                {selectedRecipients.map((r, idx) => (
                  <FormControlLabel key={idx} label={`${r.name} — ${r.mobile}`}
                    control={<Checkbox checked={r.checked !== false} size="small"
                      onChange={e => setSelectedRecipients(prev => prev.map((x, i) => i === idx ? { ...x, checked: e.target.checked } : x))} />} />
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="contained" color={isBaileys ? 'warning' : 'primary'} startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
            disabled={sending} onClick={onSend}>
            {sending ? 'Sending…' : 'Send Invitation'}
          </Button>
        </Stack>
      </CardContent></Card>
    </PageSurface>
  );
}

// ── Logs panel (shared) ───────────────────────────────────────────────────────

function LogsPanel({ logs, isBaileys }) {
  const logRows = {
    columns: [
      { key: 'contact', label: 'Contact' },
      { key: 'direction', label: 'Direction' },
      { key: 'source', label: 'Source' },
      { key: 'message', label: 'Message' },
      { key: 'status', label: 'Status' },
      { key: 'when', label: 'Time' },
    ],
    data: logs.map(item => ({
      title: item.contactName || item.from || item.to || 'Message',
      contact: item.contactName || item.from || item.to || '-',
      direction: item.direction || '-',
      source: item.source || '-',
      message: item.bodyText || item.text || '-',
      status: () => (
        <Chip
          label={item.status || '-'}
          size="small"
          color={item.status === 'SENT' || item.status === 'READ' ? 'success' : item.status === 'FAILED' ? 'error' : 'default'}
        />
      ),
      when: formatWhen(item.createdAt),
    })),
  };

  return (
    <CollectionSection
      title={isBaileys ? '🐝 Baileys Message Logs' : 'Message Logs'}
      subtitle={isBaileys
        ? 'All Baileys messages: incoming, outgoing, auto replies and invitations.'
        : 'Incoming webhook messages, manual replies and auto replies.'}
      rows={logRows}
    />
  );
}

// ── Baileys Setup / QR ────────────────────────────────────────────────────────

function BaileysSetup({ status, onConnect, onDisconnect, connecting, onRefresh }) {
  const isConnected = status?.status === 'CONNECTED';
  const isQrPending = status?.status === 'QR_PENDING';
  const isDisconnected = !isConnected && !isQrPending;
  return (
    <PageSurface>
      <Card><CardContent>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <QrCode2Icon sx={{ fontSize: 40, color: 'warning.main' }} />
            <Box>
              <Typography variant="h6" fontWeight={800}>Baileys Connection Setup</Typography>
              <Typography color="text.secondary">Connects your personal WhatsApp number via QR scan (like WhatsApp Web).</Typography>
            </Box>
          </Stack>
          <Alert severity="warning">
            <strong>Unofficial API:</strong> Baileys uses the WhatsApp Web protocol. Use for internal/testing purposes only.
          </Alert>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Chip
              label={`Status: ${status?.status || 'UNKNOWN'}`}
              color={isConnected ? 'success' : isQrPending ? 'warning' : 'default'}
            />
            {status?.phone && <Chip label={`Phone: ${status.phone}`} variant="outlined" />}
            <Button size="small" variant="outlined" onClick={onRefresh}>Refresh</Button>
          </Stack>
          {isDisconnected && (
            <Button variant="contained" color="warning" startIcon={connecting ? <CircularProgress size={16} /> : <LinkIcon />}
              disabled={connecting} onClick={onConnect} sx={{ alignSelf: 'flex-start' }}>
              {connecting ? 'Connecting…' : 'Connect via QR'}
            </Button>
          )}
          {isQrPending && status?.qr && (
            <Box>
              <Typography fontWeight={700} sx={{ mb: 1 }}>Scan this QR in WhatsApp → Linked Devices</Typography>
              <Box component="img" src={status.qr} alt="QR Code"
                sx={{ width: 220, height: 220, border: '2px solid', borderColor: 'warning.main', borderRadius: 2 }} />
            </Box>
          )}
          {isConnected && (
            <Button variant="outlined" color="error" startIcon={<LinkOffIcon />}
              onClick={onDisconnect} sx={{ alignSelf: 'flex-start' }}>
              Disconnect
            </Button>
          )}
        </Stack>
      </CardContent></Card>
    </PageSurface>
  );
}

// ── Rule dialog (shared for both providers) ───────────────────────────────────

function RuleDialog({ open, onClose, editing, form, setForm, onSave, saving, isBaileys }) {
  return (
    <ResponsiveDialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={800}>
            {editing ? 'Edit Auto Reply Rule' : 'Add Auto Reply Rule'}
            {isBaileys ? ' (Baileys)' : ''}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Rule Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField type="number" label="Priority" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: Number(e.target.value) }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField select label="Match Type" value={form.matchType} onChange={e => setForm(p => ({ ...p, matchType: e.target.value }))}>
                {['CONTAINS', 'EXACT', 'STARTS_WITH', 'ALL'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Trigger Text" value={form.triggerText} onChange={e => setForm(p => ({ ...p, triggerText: e.target.value }))}
                helperText="Leave blank only when match type is ALL." />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select label="Reply Type" value={form.replyType} onChange={e => setForm(p => ({ ...p, replyType: e.target.value }))}>
                {['TEXT', 'TEMPLATE'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select label="Active" value={form.isActive ? 'true' : 'false'}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
            {form.replyType === 'TEXT' && (
              <Grid size={{ xs: 12 }}>
                <TextField label="Reply Text" multiline minRows={3} value={form.replyText}
                  onChange={e => setForm(p => ({ ...p, replyText: e.target.value }))} />
              </Grid>
            )}
            {form.replyType === 'TEMPLATE' && (
              <>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField label="Template Name" value={form.templateName}
                    onChange={e => setForm(p => ({ ...p, templateName: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField label="Language" value={form.templateLanguage}
                    onChange={e => setForm(p => ({ ...p, templateLanguage: e.target.value }))} />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel label="Stop after first match"
                control={<Checkbox checked={form.stopAfterMatch}
                  onChange={e => setForm(p => ({ ...p, stopAfterMatch: e.target.checked }))} />} />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" color={isBaileys ? 'warning' : 'primary'}
              disabled={saving || !form.name} onClick={onSave}>
              {saving ? 'Saving…' : 'Save Rule'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </ResponsiveDialog>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════════════

export default function WhatsAppPage() {
  const [useBaileys, setUseBaileys] = useState(false);
  const [tab, setTab] = useState('inbox');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  // ── Official API state ──────────────────────────────────────────────────────
  const [inbox, setInbox] = useState([]);
  const [selectedConversationKey, setSelectedConversationKey] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);
  const [replyForm, setReplyForm] = useState({ text: '', templateName: '' });
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [connections, setConnections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState(emptyRule);

  // Invitation (official)
  const [invitationForm, setInvitationForm] = useState(emptyInvitationForm);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [textPosition, setTextPosition] = useState('bottom');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fileName, setFileName] = useState('');
  const [recipientGroups] = useState({});

  // ── Baileys state ───────────────────────────────────────────────────────────
  const [baileysStatus, setBaileysStatus] = useState({ status: 'DISCONNECTED', qr: null, phone: '' });
  const [baileysConnecting, setBaileysConnecting] = useState(false);
  const [baileysInbox, setBaileysInbox] = useState([]);
  const [baileysSelectedKey, setBaileysSelectedKey] = useState('');
  const [baileysConversation, setBaileysConversation] = useState([]);
  const [baileysReplyForm, setBaileysReplyForm] = useState({ text: '' });

  // Baileys auto-reply
  const [baileysRules, setBaileysRules] = useState([]);
  const [baileysRuleOpen, setBaileysRuleOpen] = useState(false);
  const [baileysEditingRule, setBaileysEditingRule] = useState(null);
  const [baileysRuleForm, setBaileysRuleForm] = useState(emptyRule);

  // Baileys invitation
  const [baileysInvitationForm, setBaileysInvitationForm] = useState(emptyInvitationForm);
  const [baileysSelectedRecipients, setBaileysSelectedRecipients] = useState([]);
  const [baileysTextPosition, setBaileysTextPosition] = useState('bottom');
  const [baileysSendingInvitation, setBaileysSendingInvitation] = useState(false);
  const [baileysUploadingImage, setBaileysUploadingImage] = useState(false);
  const [baileysFileName, setBaileysFileName] = useState('');

  // Baileys logs
  const [baileysLogs, setBaileysLogs] = useState([]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const selectedConversation = inbox.find(i => i.conversationKey === selectedConversationKey);

  // ── Loaders: Official ───────────────────────────────────────────────────────
  const loadOfficial = async () => {
    setLoading(true);
    try {
      const [inboxRes, tplRes, rulesRes, connsRes, logsRes] = await Promise.all([
        whatsappService.getInbox(),
        whatsappService.getTemplates(),
        whatsappService.getRules(),
        whatsappService.getConnections(),
        whatsappService.getMessages(),
      ]);
      const inboxData = Array.isArray(inboxRes.data) ? inboxRes.data : [];
      setInbox(inboxData);
      setTemplates(Array.isArray(tplRes.data) ? tplRes.data : []);
      setRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
      setConnections(Array.isArray(connsRes.data) ? connsRes.data : []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      if (!selectedConversationKey && inboxData[0]?.conversationKey)
        setSelectedConversationKey(inboxData[0].conversationKey);
    } catch (_) { }
    finally { setLoading(false); }
  };

  const loadOfficialConversation = async (conversationKey) => {
    if (!conversationKey) { setConversationMessages([]); return; }
    const { data } = await whatsappService.getConversation(conversationKey);
    setConversationMessages(Array.isArray(data) ? data : []);
    await whatsappService.markConversationRead(conversationKey).catch(() => null);
    const res = await whatsappService.getInbox();
    setInbox(Array.isArray(res.data) ? res.data : []);
  };

  // ── Loaders: Baileys ────────────────────────────────────────────────────────
  const loadBaileys = async () => {
    setLoading(true);
    try {
      const [statusRes, inboxRes, rulesRes, logsRes] = await Promise.all([
        whatsappService.baileysGetStatus(),
        whatsappService.baileysGetInbox(),
        whatsappService.baileysGetRules(),
        whatsappService.baileysGetLogs(),
      ]);
      setBaileysStatus(statusRes.data || { status: 'DISCONNECTED' });
      const rows = Array.isArray(inboxRes.data) ? inboxRes.data : [];
      setBaileysInbox(rows);
      setBaileysRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
      setBaileysLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      if (!baileysSelectedKey && rows[0]?.conversationKey) setBaileysSelectedKey(rows[0].conversationKey);
    } catch (_) { }
    finally { setLoading(false); }
  };

  const loadBaileysConversation = async (key) => {
    if (!key) { setBaileysConversation([]); return; }
    const { data } = await whatsappService.baileysGetConversation(key);
    setBaileysConversation(Array.isArray(data) ? data : []);
    await whatsappService.baileysMarkRead(key).catch(() => null);
  };

  useEffect(() => { if (useBaileys) loadBaileys(); else loadOfficial(); }, [useBaileys]);
  useEffect(() => { if (!useBaileys) loadOfficialConversation(selectedConversationKey); }, [selectedConversationKey]);
  useEffect(() => { if (useBaileys) loadBaileysConversation(baileysSelectedKey); }, [baileysSelectedKey]);

  const handleToggle = () => { setUseBaileys(v => !v); setTab('inbox'); };

  // ── Baileys QR poller ────────────────────────────────────────────────────────
  const baileysPollerRef = useRef(null);
  const stopBaileysPoller = () => {
    if (baileysPollerRef.current) { clearInterval(baileysPollerRef.current); baileysPollerRef.current = null; }
  };
  const startBaileysPoller = () => {
    stopBaileysPoller();
    let attempts = 0;
    baileysPollerRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await whatsappService.baileysGetStatus();
        const s = res.data || {};
        setBaileysStatus(s);
        if (s.status === 'CONNECTED' || attempts >= 60) {
          stopBaileysPoller();
          setBaileysConnecting(false);
        }
      } catch (_) { }
    }, 1000);
  };

  const handleBaileysConnect = async () => {
    setBaileysConnecting(true);
    setBaileysStatus({ status: 'DISCONNECTED', qr: null, phone: '' });
    try {
      await whatsappService.baileysConnect();
      startBaileysPoller();
    } catch (e) {
      setBaileysConnecting(false);
      setResultMessage({ type: 'error', text: e?.response?.data?.message || 'Failed to start Baileys' });
    }
  };
  const handleBaileysRefreshStatus = async () => {
    try { const res = await whatsappService.baileysGetStatus(); setBaileysStatus(res.data || { status: 'DISCONNECTED' }); } catch (_) { }
  };
  const handleBaileysDisconnect = async () => {
    try { await whatsappService.baileysDisconnect(); setBaileysStatus({ status: 'DISCONNECTED', qr: null, phone: '' }); }
    catch (e) { setResultMessage({ type: 'error', text: 'Failed to disconnect' }); }
  };

  // ── Official handlers ────────────────────────────────────────────────────────
  const handleReplySend = async () => {
    if (!selectedConversation?.phone || (!replyForm.text.trim() && !replyForm.templateName)) return;
    setSaving(true);
    try {
      await whatsappService.sendText({
        to: selectedConversation.phone,
        contactName: selectedConversation.contactName,
        text: replyForm.templateName ? '' : replyForm.text,
        templateName: replyForm.templateName,
        replyToMessageId: conversationMessages[conversationMessages.length - 1]?.waMessageId || '',
      });
      setReplyForm({ text: '', templateName: '' });
      await loadOfficial();
      await loadOfficialConversation(selectedConversation.conversationKey);
    } finally { setSaving(false); }
  };

  const handleQuickSend = async (form) => {
    setSaving(true);
    try {
      await whatsappService.sendText({ to: form.to, contactName: form.contactName, text: form.text, templateName: form.templateName });
      setResultMessage({ type: 'success', text: `Message sent to ${form.to}` });
    } catch (e) {
      setResultMessage({ type: 'error', text: e?.response?.data?.message || 'Send failed' });
    } finally { setSaving(false); }
  };

  const handleSaveRule = async () => {
    setSaving(true);
    try {
      await whatsappService.saveRule(ruleForm, editingRule?._id);
      setRuleOpen(false);
      await loadOfficial();
    } finally { setSaving(false); }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'bk_award_invites');
      const { default: api } = await import('../api');
      const response = await api.post('/uploads/public', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setInvitationForm(p => ({ ...p, imageUrl: response?.data?.url || '' }));
    } finally { setUploadingImage(false); }
  };

  const sendInvitation = async () => {
    const recipients = invitationForm.recipientMode === 'single'
      ? [{ name: invitationForm.singleName || 'Guest', mobile: invitationForm.singleNumber, source: 'MANUAL' }]
      : selectedRecipients.filter(item => item.checked !== false);
    if (!recipients.length) return;
    setSendingInvitation(true);
    try {
      const response = await whatsappService.sendInvitation({ ...invitationForm, recipients, textPosition });
      setResultMessage({ type: 'success', text: `Sent ${response.data?.success || 0} of ${response.data?.total || recipients.length}` });
      await loadOfficial();
    } catch (error) {
      setResultMessage({ type: 'error', text: error?.response?.data?.message || 'Invitation send failed' });
    } finally { setSendingInvitation(false); }
  };

  // ── Baileys reply ───────────────────────────────────────────────────────────
  const handleBaileysReplySend = async () => {
    if (!baileysSelectedKey || !baileysReplyForm.text.trim()) return;
    setSaving(true);
    try {
      await whatsappService.baileysSendText({ to: baileysSelectedKey, text: baileysReplyForm.text, contactName: '' });
      setBaileysReplyForm({ text: '' });
      await loadBaileys();
      await loadBaileysConversation(baileysSelectedKey);
    } finally { setSaving(false); }
  };

  const handleBaileysQuickSend = async (form) => {
    setSaving(true);
    try {
      await whatsappService.baileysSendText(form);
      setResultMessage({ type: 'success', text: `Message sent to ${form.to}` });
      await loadBaileys();
    } catch (e) {
      setResultMessage({ type: 'error', text: e?.response?.data?.message || 'Send failed' });
    } finally { setSaving(false); }
  };

  // ── Baileys auto-reply rule handlers ────────────────────────────────────────
  const handleBaileysEditRule = (item) => {
    setBaileysEditingRule(item);
    setBaileysRuleForm({ ...emptyRule, ...item });
    setBaileysRuleOpen(true);
  };

  const handleBaileysAddRule = () => {
    setBaileysEditingRule(null);
    setBaileysRuleForm(emptyRule);
    setBaileysRuleOpen(true);
  };

  const handleBaileysSaveRule = async () => {
    setSaving(true);
    try {
      await whatsappService.baileysSaveRule(baileysRuleForm, baileysEditingRule?._id);
      setBaileysRuleOpen(false);
      await loadBaileys();
    } finally { setSaving(false); }
  };

  // ── Baileys invitation ──────────────────────────────────────────────────────
  const handleBaileysUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBaileysUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'bk_award_invites');
      const { default: api } = await import('../api');
      const response = await api.post('/uploads/public', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBaileysInvitationForm(p => ({ ...p, imageUrl: response?.data?.url || '' }));
    } finally { setBaileysUploadingImage(false); }
  };

  const sendBaileysInvitation = async () => {
    const recipients = baileysInvitationForm.recipientMode === 'single'
      ? [{ name: baileysInvitationForm.singleName || 'Guest', mobile: baileysInvitationForm.singleNumber, source: 'MANUAL' }]
      : baileysSelectedRecipients.filter(item => item.checked !== false);
    if (!recipients.length) return;
    setBaileysSendingInvitation(true);
    try {
      const response = await whatsappService.baileysSendInvitation({ ...baileysInvitationForm, recipients, textPosition: baileysTextPosition });
      setResultMessage({ type: 'success', text: `Sent ${response.data?.success || 0} of ${response.data?.total || recipients.length}` });
      await loadBaileys();
    } catch (error) {
      setResultMessage({ type: 'error', text: error?.response?.data?.message || 'Invitation send failed' });
    } finally { setBaileysSendingInvitation(false); }
  };

  // ── Official table rows ──────────────────────────────────────────────────────
  const officialRuleRows = {
    columns: [
      { key: 'name', label: 'Rule' }, { key: 'trigger', label: 'Trigger' },
      { key: 'reply', label: 'Reply' }, { key: 'status', label: 'Status' }, { key: 'action', label: 'Action' },
    ],
    data: rules.map(item => ({
      title: item.name || 'Rule', name: item.name || '-',
      trigger: `${item.matchType || '-'} • ${item.triggerText || 'ALL'}`,
      reply: item.replyType === 'TEMPLATE' ? item.templateName || '-' : item.replyText || '-',
      status: () => <Chip label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} size="small" />,
      action: () => <Button size="small" variant="contained" onClick={() => { setEditingRule(item); setRuleForm({ ...emptyRule, ...item }); setRuleOpen(true); }}>Edit</Button>,
    })),
  };
  const templateRows = {
    columns: [{ key: 'name', label: 'Template' }, { key: 'category', label: 'Category' }, { key: 'language', label: 'Language' }],
    data: templates.map(item => ({ title: item.displayName || item.name || 'Template', name: item.displayName || item.name || '-', category: item.category || '-', language: item.language || item.templateLanguage || '-' })),
  };
  const connectionsRows = {
    columns: [{ key: 'name', label: 'Name' }, { key: 'mode', label: 'Mode' }, { key: 'phoneNumberId', label: 'Phone ID' }, { key: 'businessAccountId', label: 'Business ID' }],
    data: connections.map(item => ({ title: item.name || 'Connection', name: item.name || '-', mode: item.mode || '-', phoneNumberId: item.phoneNumberId || '-', businessAccountId: item.businessAccountId || '-' })),
  };
  const logRows = {
    columns: [{ key: 'contact', label: 'Contact' }, { key: 'direction', label: 'Direction' }, { key: 'message', label: 'Message' }, { key: 'when', label: 'Time' }],
    data: logs.map(item => ({ title: item.contactName || item.phone || 'Message', contact: item.contactName || item.phone || '-', direction: item.direction || '-', message: item.bodyText || item.text || '-', when: formatWhen(item.createdAt) })),
  };

  const currentTabs = useBaileys ? baileysTabs : officialTabs;

  return (
    <Box sx={{ pb: 3 }}>
      <PageHeader
        eyebrow="Communication"
        title="WhatsApp Management"
        subtitle="Switch between Official Cloud API and Baileys with separate inboxes, auto-reply, invitation, and QR-based connection."
        chips={[
          { label: useBaileys ? '🐝 Baileys Mode' : '✅ Official API', color: useBaileys ? 'warning' : 'success' },
          { label: useBaileys ? `${baileysInbox.length} Conversations` : `${inbox.length} Conversations`, color: 'success' },
          ...(!useBaileys ? [{ label: `${templates.length} Templates` }, { label: `${rules.length} Rules` }] : [{ label: `${baileysRules.length} Rules` }]),
        ]}
      />

      <ProviderToggle useBaileys={useBaileys} onToggle={handleToggle} baileysStatus={baileysStatus?.status} />

      <PageSurface sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile
          sx={{ minHeight: 0, '& .MuiTab-root': { minHeight: 42 } }}
          textColor={useBaileys ? 'warning' : 'primary'} indicatorColor={useBaileys ? 'warning' : 'primary'}>
          {currentTabs.map(([value, label]) => <Tab key={value} value={value} label={label} />)}
        </Tabs>
      </PageSurface>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {resultMessage ? <Alert sx={{ mb: 2 }} severity={resultMessage.type} onClose={() => setResultMessage(null)}>{resultMessage.text}</Alert> : null}

      {/* ═══════════════════ BAILEYS TABS ═══════════════════ */}

      {useBaileys && tab === 'inbox' && (
        <InboxPanel
          inbox={baileysInbox} selectedKey={baileysSelectedKey} onSelect={setBaileysSelectedKey}
          conversationMessages={baileysConversation} replyForm={baileysReplyForm} setReplyForm={setBaileysReplyForm}
          onSend={handleBaileysReplySend} saving={saving} isBaileys
        />
      )}

      {useBaileys && tab === 'rules' && (
        <>
          <AutoReplyPanel rules={baileysRules} onAdd={handleBaileysAddRule} onEdit={handleBaileysEditRule} isBaileys />
          <RuleDialog
            open={baileysRuleOpen} onClose={() => setBaileysRuleOpen(false)}
            editing={baileysEditingRule} form={baileysRuleForm} setForm={setBaileysRuleForm}
            onSave={handleBaileysSaveRule} saving={saving} isBaileys
          />
        </>
      )}

      {useBaileys && tab === 'send' && (
        <QuickSendPanel onSend={handleBaileysQuickSend} saving={saving} isBaileys />
      )}

      {useBaileys && tab === 'invite' && (
        <InvitationPanel
          isBaileys
          invitationForm={baileysInvitationForm} setInvitationForm={setBaileysInvitationForm}
          selectedRecipients={baileysSelectedRecipients} setSelectedRecipients={setBaileysSelectedRecipients}
          textPosition={baileysTextPosition} setTextPosition={setBaileysTextPosition}
          onUploadImage={handleBaileysUploadImage} uploadingImage={baileysUploadingImage}
          onSend={sendBaileysInvitation} sending={baileysSendingInvitation}
          fileName={baileysFileName} setFileName={setBaileysFileName}
          recipientGroups={{}}
        />
      )}

      {useBaileys && tab === 'logs' && (
        <LogsPanel logs={baileysLogs} isBaileys />
      )}

      {useBaileys && tab === 'setup' && (
        <BaileysSetup status={baileysStatus} onConnect={handleBaileysConnect}
          onDisconnect={handleBaileysDisconnect} connecting={baileysConnecting}
          onRefresh={handleBaileysRefreshStatus} />
      )}

      {/* ═══════════════════ OFFICIAL TABS ═══════════════════ */}

      {!useBaileys && tab === 'inbox' && (
        <InboxPanel
          inbox={inbox} selectedKey={selectedConversationKey} onSelect={setSelectedConversationKey}
          conversationMessages={conversationMessages} replyForm={replyForm} setReplyForm={setReplyForm}
          onSend={handleReplySend} saving={saving} isBaileys={false} templates={templates}
        />
      )}

      {!useBaileys && tab === 'rules' && (
        <>
          <CollectionSection title="Auto Reply Rules" subtitle="Rules trigger after customer message is stored by webhook." rows={officialRuleRows}
            onAdd={() => { setEditingRule(null); setRuleForm(emptyRule); setRuleOpen(true); }}>
            <Card><CardContent>
              <Typography fontWeight={700}>Webhook setup</Typography>
              <Typography variant="body2" color="text.secondary">Meta webhook URL: <strong>/api/whatsapp/webhook</strong>.</Typography>
            </CardContent></Card>
          </CollectionSection>
          <RuleDialog
            open={ruleOpen} onClose={() => setRuleOpen(false)}
            editing={editingRule} form={ruleForm} setForm={setRuleForm}
            onSave={handleSaveRule} saving={saving} isBaileys={false}
          />
        </>
      )}

      {!useBaileys && tab === 'send' && (
        <QuickSendPanel onSend={handleQuickSend} saving={saving} isBaileys={false} templates={templates} />
      )}

      {!useBaileys && tab === 'invite' && (
        <InvitationPanel
          isBaileys={false}
          invitationForm={invitationForm} setInvitationForm={setInvitationForm}
          selectedRecipients={selectedRecipients} setSelectedRecipients={setSelectedRecipients}
          textPosition={textPosition} setTextPosition={setTextPosition}
          onUploadImage={handleUploadImage} uploadingImage={uploadingImage}
          onSend={sendInvitation} sending={sendingInvitation}
          fileName={fileName} setFileName={setFileName}
          recipientGroups={recipientGroups}
        />
      )}

      {!useBaileys && tab === 'templates' && (
        <CollectionSection title="Templates" subtitle="Approved WhatsApp message templates." rows={templateRows} />
      )}

      {!useBaileys && tab === 'connections' && (
        <CollectionSection title="Connections" subtitle="Manual or embedded WhatsApp connection records." rows={connectionsRows} />
      )}

      {!useBaileys && tab === 'logs' && (
        <CollectionSection title="Message Logs" subtitle="Incoming webhook messages, manual replies and auto replies." rows={logRows} />
      )}
    </Box>
  );
}
