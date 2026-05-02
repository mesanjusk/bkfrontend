import { useEffect, useMemo, useRef, useState } from 'react';
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

const officialTabs = [
  ['inbox','Inbox'],['rules','Auto Reply'],['send','Quick Send'],
  ['invite','Invitation'],['templates','Templates'],['connections','Connections'],['logs','Logs'],
];
const baileysTabs = [['inbox','Inbox'],['send','Quick Send'],['setup','Setup / QR']];

const emptyInvitationForm = { recipientMode:'students', singleName:'', singleNumber:'', imageUrl:'', eventName:'', date:'', time:'', venue:'' };
const recipientModeOptions = [
  {value:'students',label:'Students'},{value:'parents',label:'Parents'},
  {value:'teamMembers',label:'Team Members'},{value:'volunteers',label:'Volunteers'},
  {value:'guests',label:'Guests'},{value:'single',label:'Single Number'},
  {value:'csv',label:'CSV File'},{value:'excel',label:'Excel File'},
];
const emptyRule = { name:'', matchType:'CONTAINS', triggerText:'', replyType:'TEXT', replyText:'', templateName:'', templateLanguage:'en_US', isActive:true, priority:100, stopAfterMatch:true };

const normalizePhone = (v) => String(v||'').replace(/[^\d]/g,'').trim();
const formatWhen = (v) => v ? new Date(v).toLocaleString() : '-';
const conversationName = (item) => item?.contactName || item?.name || item?.phone || 'Unknown';

function parseRowsToRecipients(rows=[]) {
  return rows.map(row=>({
    name: String(row.name||row.fullName||row.studentName||row.guestName||row.Name||'').trim()||'Guest',
    mobile: normalizePhone(row.mobile||row.phone||row.number||row.whatsapp||row.Mobile||row.Phone||row.Number||row.WhatsApp||''),
    source:'FILE',
  })).filter(item=>item.mobile);
}

function CollectionSection({ title, subtitle, rows, onAdd, children }) {
  return (
    <Stack spacing={2}>
      <Card><CardContent>
        <Stack direction={{xs:'column',md:'row'}} justifyContent="space-between" spacing={2} alignItems={{xs:'stretch',md:'center'}}>
          <Box>
            <Typography variant="h6" fontWeight={800}>{title}</Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
          </Box>
          {onAdd ? <Button variant="contained" startIcon={<AddIcon/>} onClick={onAdd}>Add</Button> : null}
        </Stack>
      </CardContent></Card>
      {children}
      <ResponsiveTable columns={rows.columns} rows={rows.data} mobileTitleKey="title" />
    </Stack>
  );
}

function MessageBubble({ message }) {
  const incoming = String(message.direction||'').toLowerCase() === 'incoming';
  const text = message.bodyText || message.text || message.messageText || message.body || '(media / template message)';
  return (
    <Stack alignItems={incoming?'flex-start':'flex-end'}>
      <Box sx={{ maxWidth:'88%', px:1.5, py:1.1, borderRadius:3, bgcolor:incoming?'#ffffff':'#dcf8e7', border:'1px solid', borderColor:incoming?'#e2e8ee':'#c6f0d7', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
        <Typography variant="body2" sx={{whiteSpace:'pre-wrap'}}>{text}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{display:'block',mt:0.75,textAlign:'right'}}>
          {formatWhen(message.createdAt||message.updatedAt)}
        </Typography>
      </Box>
    </Stack>
  );
}

function ProviderToggle({ useBaileys, onToggle, baileysStatus }) {
  const statusColor = baileysStatus==='CONNECTED'?'success':baileysStatus==='QR_PENDING'?'warning':'default';
  return (
    <Card sx={{mb:2, border:'2px solid', borderColor:useBaileys?'warning.main':'success.main'}}>
      <CardContent sx={{py:1.5}}>
        <Stack direction={{xs:'column',sm:'row'}} alignItems={{xs:'flex-start',sm:'center'}} spacing={2} justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography fontWeight={800} variant="body1">
              {useBaileys ? '🐝 Using Baileys (Unofficial)' : '✅ Using Official WhatsApp Cloud API'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {useBaileys
                ? 'Messages go through Baileys — scan QR in Setup tab to connect.'
                : 'Messages sent via Meta Graph API. Configure env vars in backend.'}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {useBaileys && <Chip label={`Baileys: ${baileysStatus||'UNKNOWN'}`} color={statusColor} size="small" />}
            <Tooltip title={useBaileys?'Switch to Official API':'Switch to Baileys'}>
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

function BaileysInbox({ inbox, selectedKey, onSelect, conversationMessages, replyForm, setReplyForm, onSend, saving }) {
  return (
    <Grid container spacing={2}>
      <Grid size={{xs:12,lg:4}}>
        <PageSurface>
          <Card sx={{overflow:'hidden'}}>
            <CardContent sx={{p:0}}>
              <Box sx={{px:2,py:1.5,bgcolor:'#b37a00',color:'#fff'}}>
                <Typography fontWeight={800}>🐝 Baileys Inbox</Typography>
                <Typography variant="body2" sx={{opacity:0.9}}>{inbox.length} conversations</Typography>
              </Box>
              <List sx={{py:0,maxHeight:{xs:'unset',lg:'68vh'},overflow:'auto'}}>
                {inbox.length===0 && (
                  <Box sx={{p:2}}><Typography color="text.secondary" variant="body2">No conversations yet. Connect via QR and receive a message first.</Typography></Box>
                )}
                {inbox.map(item=>(
                  <ListItemButton key={item.conversationKey} selected={item.conversationKey===selectedKey} onClick={()=>onSelect(item.conversationKey)}
                    sx={{alignItems:'flex-start',borderBottom:'1px solid',borderColor:'divider','&.Mui-selected':{bgcolor:'#fff8e1'}}}>
                    <Avatar sx={{bgcolor:'warning.main',mr:1.5}}>{conversationName(item).slice(0,1)}</Avatar>
                    <ListItemText primary={conversationName(item)} primaryTypographyProps={{fontWeight:800}}
                      secondary={`${item.phone||''}${item.lastMessage?` • ${item.lastMessage}`:''}`} />
                    <Stack alignItems="flex-end" spacing={0.75}>
                      <Typography variant="caption" color="text.secondary">{formatWhen(item.lastMessageAt)}</Typography>
                      {item.unreadCount ? <Chip label={item.unreadCount} color="warning" size="small" /> : null}
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </PageSurface>
      </Grid>
      <Grid size={{xs:12,lg:8}}>
        <PageSurface>
          <Card sx={{overflow:'hidden'}}>
            <CardContent sx={{p:0}}>
              <Box sx={{px:2,py:1.5,bgcolor:'#f0f2f5',borderBottom:'1px solid',borderColor:'divider'}}>
                <Typography fontWeight={800}>{selectedKey ? inbox.find(i=>i.conversationKey===selectedKey)?.contactName||selectedKey : 'Select a chat'}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedKey||'Choose a conversation from the left list.'}</Typography>
              </Box>
              <Box sx={{p:2,minHeight:360,maxHeight:{xs:'unset',lg:'52vh'},overflow:'auto',bgcolor:'#fef9e7',backgroundImage:'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',backgroundSize:'18px 18px'}}>
                <Stack spacing={1.2}>
                  {conversationMessages.length
                    ? conversationMessages.map(msg=><MessageBubble key={msg._id||msg.baileysMessageId||Math.random()} message={msg} />)
                    : <Typography color="text.secondary">No messages yet.</Typography>}
                </Stack>
              </Box>
              <Box sx={{p:2,borderTop:'1px solid',borderColor:'divider',bgcolor:'#f0f2f5'}}>
                <TextField fullWidth label="Reply message" multiline minRows={2} value={replyForm.text}
                  onChange={e=>setReplyForm(p=>({...p,text:e.target.value}))} />
                <Stack direction="row" justifyContent="flex-end" sx={{mt:1}}>
                  <Button variant="contained" color="warning" startIcon={<SendIcon/>}
                    disabled={saving||!selectedKey||!replyForm.text.trim()} onClick={onSend}>
                    Send via Baileys
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

function BaileysSetup({ status, onConnect, onDisconnect, connecting }) {
  return (
    <PageSurface>
      <Card><CardContent>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <QrCode2Icon sx={{fontSize:40,color:'warning.main'}} />
            <Box>
              <Typography variant="h6" fontWeight={800}>Baileys Connection Setup</Typography>
              <Typography color="text.secondary">Connects your personal WhatsApp number via QR scan (like WhatsApp Web).</Typography>
            </Box>
          </Stack>
          <Alert severity="warning">
            <strong>Unofficial API Warning:</strong> Baileys uses the WhatsApp Web protocol. Using it may violate WhatsApp Terms of Service. Use at your own risk for testing or internal tools only.
          </Alert>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={`Status: ${status?.status||'UNKNOWN'}`}
              color={status?.status==='CONNECTED'?'success':status?.status==='QR_PENDING'?'warning':'default'} />
            {status?.phone && <Chip label={`Phone: +${status.phone}`} variant="outlined" />}
          </Stack>
          {status?.status==='QR_PENDING' && status?.qr ? (
            <Box>
              <Typography fontWeight={700} sx={{mb:1}}>Scan this QR code with WhatsApp:</Typography>
              <Box component="img" src={status.qr} alt="Baileys QR Code"
                sx={{width:240,height:240,border:'4px solid',borderColor:'warning.main',borderRadius:2}} />
              <Typography variant="body2" color="text.secondary" sx={{mt:1}}>
                Open WhatsApp → Linked Devices → Link a Device → Scan this QR
              </Typography>
            </Box>
          ) : null}
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="warning"
              startIcon={connecting ? <CircularProgress size={16} color="inherit"/> : <LinkIcon/>}
              onClick={onConnect} disabled={connecting||status?.status==='CONNECTED'}>
              {status?.status==='QR_PENDING' ? 'Reconnect / Refresh QR' : 'Connect'}
            </Button>
            <Button variant="outlined" color="error" startIcon={<LinkOffIcon/>}
              onClick={onDisconnect} disabled={status?.status==='DISCONNECTED'}>
              Disconnect
            </Button>
          </Stack>
          <Divider/>
          <Box>
            <Typography fontWeight={700} sx={{mb:1}}>Backend Setup</Typography>
            <Typography variant="body2" color="text.secondary">
              Install in backend: <code>npm install @whiskeysockets/baileys qrcode pino</code>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mt:0.5}}>
              Auth credentials stored in <code>baileys_auth/</code> in backend root. Delete folder to reset/logout.
            </Typography>
          </Box>
        </Stack>
      </CardContent></Card>
    </PageSurface>
  );
}

function BaileysQuickSend({ onSend, saving }) {
  const [form, setForm] = useState({to:'',contactName:'',text:''});
  const handleSend = async () => {
    if(!form.to||!form.text.trim()) return;
    await onSend(form);
    setForm({to:'',contactName:'',text:''});
  };
  return (
    <PageSurface>
      <Card><CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={800}>🐝 Baileys Quick Send</Typography>
          <Grid container spacing={2}>
            <Grid size={{xs:12,md:6}}>
              <TextField fullWidth label="WhatsApp Number (with country code)" value={form.to}
                onChange={e=>setForm(p=>({...p,to:e.target.value}))} helperText="e.g. 919876543210" />
            </Grid>
            <Grid size={{xs:12,md:6}}>
              <TextField fullWidth label="Contact Name (optional)" value={form.contactName}
                onChange={e=>setForm(p=>({...p,contactName:e.target.value}))} />
            </Grid>
            <Grid size={{xs:12}}>
              <TextField fullWidth label="Message" multiline minRows={4} value={form.text}
                onChange={e=>setForm(p=>({...p,text:e.target.value}))} />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" color="warning" startIcon={<SendIcon/>}
              disabled={saving||!form.to||!form.text.trim()} onClick={handleSend}>
              Send via Baileys
            </Button>
          </Stack>
        </Stack>
      </CardContent></Card>
    </PageSurface>
  );
}

export default function WhatsAppPage() {
  const fileInputRef = useRef(null);
  const [useBaileys, setUseBaileys] = useState(()=>localStorage.getItem('wa_provider')==='baileys');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [tab, setTab] = useState('inbox');

  // Official state
  const [connections, setConnections] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [rules, setRules] = useState([]);
  const [recipientGroups, setRecipientGroups] = useState({students:[],parents:[],teamMembers:[],volunteers:[],guests:[]});
  const [selectedConversationKey, setSelectedConversationKey] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);
  const [replyForm, setReplyForm] = useState({text:'',templateName:''});
  const [sendForm, setSendForm] = useState({to:'',contactName:'',text:'',templateName:''});
  const [ruleOpen, setRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState(emptyRule);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [invitationForm, setInvitationForm] = useState(emptyInvitationForm);
  const [textPosition, setTextPosition] = useState({x:150,y:200,fontSize:30,color:'#000000'});

  // Baileys state
  const [baileysInbox, setBaileysInbox] = useState([]);
  const [baileysSelectedKey, setBaileysSelectedKey] = useState('');
  const [baileysConversation, setBaileysConversation] = useState([]);
  const [baileysReplyForm, setBaileysReplyForm] = useState({text:''});
  const [baileysStatus, setBaileysStatus] = useState({status:'DISCONNECTED',qr:null,phone:''});
  const [baileysConnecting, setBaileysConnecting] = useState(false);

  const selectedConversation = useMemo(()=>inbox.find(item=>item.conversationKey===selectedConversationKey)||null,[inbox,selectedConversationKey]);
  const selectedCount = useMemo(()=>{
    if(invitationForm.recipientMode==='single') return normalizePhone(invitationForm.singleNumber)?1:0;
    return selectedRecipients.filter(item=>item.checked!==false).length;
  },[invitationForm,selectedRecipients]);

  const handleToggle = () => {
    const next = !useBaileys;
    setUseBaileys(next);
    localStorage.setItem('wa_provider', next?'baileys':'official');
    setTab('inbox');
    setResultMessage(null);
  };

  // Official loaders
  const loadOfficial = async () => {
    setLoading(true);
    try {
      const [a,b,c,d,e,f] = await Promise.all([
        whatsappService.getConnections(), whatsappService.getTemplates(),
        whatsappService.getMessages(), whatsappService.getRecipients(),
        whatsappService.getInbox(), whatsappService.getRules(),
      ]);
      setConnections(Array.isArray(a.data)?a.data:[]);
      setTemplates(Array.isArray(b.data)?b.data:[]);
      setLogs(Array.isArray(c.data)?c.data:[]);
      setRecipientGroups(d.data||{});
      const inboxRows = Array.isArray(e.data)?e.data:[];
      setInbox(inboxRows);
      setRules(Array.isArray(f.data)?f.data:[]);
      if(!selectedConversationKey && inboxRows[0]?.conversationKey) setSelectedConversationKey(inboxRows[0].conversationKey);
    } finally { setLoading(false); }
  };

  const loadOfficialConversation = async (conversationKey) => {
    if(!conversationKey){setConversationMessages([]);return;}
    const {data} = await whatsappService.getConversation(conversationKey);
    setConversationMessages(Array.isArray(data)?data:[]);
    await whatsappService.markConversationRead(conversationKey).catch(()=>null);
    const res = await whatsappService.getInbox();
    setInbox(Array.isArray(res.data)?res.data:[]);
  };

  // Baileys loaders
  const loadBaileys = async () => {
    setLoading(true);
    try {
      const [statusRes, inboxRes] = await Promise.all([
        whatsappService.baileysGetStatus(),
        whatsappService.baileysGetInbox(),
      ]);
      setBaileysStatus(statusRes.data||{status:'DISCONNECTED'});
      const rows = Array.isArray(inboxRes.data)?inboxRes.data:[];
      setBaileysInbox(rows);
      if(!baileysSelectedKey && rows[0]?.conversationKey) setBaileysSelectedKey(rows[0].conversationKey);
    } catch(_){}
    finally{setLoading(false);}
  };

  const loadBaileysConversation = async (key) => {
    if(!key){setBaileysConversation([]);return;}
    const {data} = await whatsappService.baileysGetConversation(key);
    setBaileysConversation(Array.isArray(data)?data:[]);
    await whatsappService.baileysMarkRead(key).catch(()=>null);
  };

  useEffect(()=>{if(useBaileys) loadBaileys(); else loadOfficial();},[useBaileys]);
  useEffect(()=>{if(!useBaileys) loadOfficialConversation(selectedConversationKey);},[selectedConversationKey]);
  useEffect(()=>{if(useBaileys) loadBaileysConversation(baileysSelectedKey);},[baileysSelectedKey]);
  useEffect(()=>{
    const mode = invitationForm.recipientMode;
    if(['students','parents','teamMembers','volunteers','guests'].includes(mode)){
      setSelectedRecipients((recipientGroups[mode]||[]).map(item=>({...item,checked:true})));
    } else if(mode==='single'){setSelectedRecipients([]);}
  },[invitationForm.recipientMode,recipientGroups]);

  // Official handlers
  const handleReplySend = async () => {
    if(!selectedConversation?.phone||(!replyForm.text.trim()&&!replyForm.templateName)) return;
    setSaving(true);
    try {
      await whatsappService.sendText({to:selectedConversation.phone,contactName:selectedConversation.contactName,text:replyForm.templateName?'':replyForm.text,templateName:replyForm.templateName,replyToMessageId:conversationMessages[conversationMessages.length-1]?.waMessageId||''});
      setReplyForm({text:'',templateName:''});
      await loadOfficial();
      await loadOfficialConversation(selectedConversation.conversationKey);
    } finally{setSaving(false);}
  };

  const handleQuickSend = async () => {
    if(!sendForm.to||(!sendForm.text.trim()&&!sendForm.templateName)) return;
    setSaving(true);
    try {
      await whatsappService.sendText({to:sendForm.to,contactName:sendForm.contactName,text:sendForm.templateName?'':sendForm.text,templateName:sendForm.templateName});
      setSendForm({to:'',contactName:'',text:'',templateName:''});
      await loadOfficial();
    } finally{setSaving(false);}
  };

  const saveRule = async () => {
    setSaving(true);
    try {
      await whatsappService.saveRule(ruleForm,editingRule?._id);
      setRuleOpen(false);
      await loadOfficial();
    } finally{setSaving(false);}
  };

  const handleSheetUpload = async (event) => {
    const file = event.target.files?.[0]; if(!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer,{type:'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    setSelectedRecipients(parseRowsToRecipients(XLSX.utils.sheet_to_json(sheet,{defval:''})).map(item=>({...item,checked:true})));
  };

  const uploadInvitationImage = async (event) => {
    const file = event.target.files?.[0]; if(!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file',file); formData.append('folder','bk_award_invites');
      const {default:api} = await import('../api');
      const response = await api.post('/uploads/public',formData,{headers:{'Content-Type':'multipart/form-data'}});
      setInvitationForm(prev=>({...prev,imageUrl:response?.data?.url||''}));
    } finally{setUploadingImage(false);}
  };

  const sendInvitation = async () => {
    const recipients = invitationForm.recipientMode==='single'
      ? [{name:invitationForm.singleName||'Guest',mobile:invitationForm.singleNumber,source:'MANUAL'}]
      : selectedRecipients.filter(item=>item.checked!==false);
    if(!recipients.length) return;
    setSendingInvitation(true);
    try {
      const response = await whatsappService.sendInvitation({...invitationForm,recipients,textPosition});
      setResultMessage({type:'success',text:`Sent ${response.data?.success||0} of ${response.data?.total||recipients.length}`});
      await loadOfficial();
    } catch(error){
      setResultMessage({type:'error',text:error?.response?.data?.message||'Invitation send failed'});
    } finally{setSendingInvitation(false);}
  };

  // Baileys handlers
  const handleBaileysConnect = async () => {
    setBaileysConnecting(true);
    try {
      await whatsappService.baileysConnect();
      setTimeout(async()=>{
        try{const res=await whatsappService.baileysGetStatus();setBaileysStatus(res.data||{});}catch(_){}
        setBaileysConnecting(false);
      },2500);
    } catch(e){
      setBaileysConnecting(false);
      setResultMessage({type:'error',text:e?.response?.data?.message||'Failed to start Baileys'});
    }
  };

  const handleBaileysDisconnect = async () => {
    try{await whatsappService.baileysDisconnect();setBaileysStatus({status:'DISCONNECTED',qr:null,phone:''});}
    catch(e){setResultMessage({type:'error',text:'Failed to disconnect'});}
  };

  const handleBaileysReplySend = async () => {
    if(!baileysSelectedKey||!baileysReplyForm.text.trim()) return;
    setSaving(true);
    try {
      await whatsappService.baileysSendText({to:baileysSelectedKey,text:baileysReplyForm.text,contactName:''});
      setBaileysReplyForm({text:''});
      await loadBaileys();
      await loadBaileysConversation(baileysSelectedKey);
    } finally{setSaving(false);}
  };

  const handleBaileysQuickSend = async (form) => {
    setSaving(true);
    try {
      await whatsappService.baileysSendText(form);
      setResultMessage({type:'success',text:`Message sent to ${form.to}`});
      await loadBaileys();
    } catch(e){
      setResultMessage({type:'error',text:e?.response?.data?.message||'Send failed'});
    } finally{setSaving(false);}
  };

  // Table rows
  const ruleRows = {
    columns:[{key:'name',label:'Rule'},{key:'trigger',label:'Trigger'},{key:'reply',label:'Reply'},{key:'status',label:'Status'},{key:'action',label:'Action'}],
    data:rules.map(item=>({
      title:item.name||'Rule', name:item.name||'-',
      trigger:`${item.matchType||'-'} • ${item.triggerText||'ALL'}`,
      reply:item.replyType==='TEMPLATE'?item.templateName||'-':item.replyText||'-',
      status:()=><Chip label={item.isActive?'Active':'Inactive'} color={item.isActive?'success':'default'} size="small"/>,
      action:()=><Button size="small" variant="contained" onClick={()=>{setEditingRule(item);setRuleForm({...emptyRule,...item});setRuleOpen(true);}}>Edit</Button>,
    })),
  };
  const templateRows = {
    columns:[{key:'name',label:'Template'},{key:'category',label:'Category'},{key:'language',label:'Language'}],
    data:templates.map(item=>({title:item.displayName||item.name||'Template',name:item.displayName||item.name||'-',category:item.category||'-',language:item.language||item.templateLanguage||'-'})),
  };
  const connectionsRows = {
    columns:[{key:'name',label:'Name'},{key:'mode',label:'Mode'},{key:'phoneNumberId',label:'Phone ID'},{key:'businessAccountId',label:'Business ID'}],
    data:connections.map(item=>({title:item.name||'Connection',name:item.name||'-',mode:item.mode||'-',phoneNumberId:item.phoneNumberId||'-',businessAccountId:item.businessAccountId||'-'})),
  };
  const logRows = {
    columns:[{key:'contact',label:'Contact'},{key:'direction',label:'Direction'},{key:'message',label:'Message'},{key:'when',label:'Time'}],
    data:logs.map(item=>({title:item.contactName||item.phone||'Message',contact:item.contactName||item.phone||'-',direction:item.direction||'-',message:item.bodyText||item.text||'-',when:formatWhen(item.createdAt)})),
  };

  const currentTabs = useBaileys ? baileysTabs : officialTabs;

  return (
    <Box sx={{pb:3}}>
      <PageHeader
        eyebrow="Communication"
        title="WhatsApp Management"
        subtitle="Switch between Official Cloud API and Baileys with separate inboxes, send options, and QR-based connection."
        chips={[
          {label:useBaileys?'🐝 Baileys Mode':'✅ Official API',color:useBaileys?'warning':'success'},
          {label:useBaileys?`${baileysInbox.length} Conversations`:`${inbox.length} Conversations`,color:'success'},
          ...(!useBaileys?[{label:`${templates.length} Templates`},{label:`${rules.length} Rules`}]:[]),
        ]}
      />

      <ProviderToggle useBaileys={useBaileys} onToggle={handleToggle} baileysStatus={baileysStatus?.status} />

      <PageSurface sx={{mb:2}}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" allowScrollButtonsMobile
          sx={{minHeight:0,'& .MuiTab-root':{minHeight:42}}}
          textColor={useBaileys?'warning':'primary'} indicatorColor={useBaileys?'warning':'primary'}>
          {currentTabs.map(([value,label])=><Tab key={value} value={value} label={label}/>)}
        </Tabs>
      </PageSurface>

      {loading ? <LinearProgress sx={{mb:2}}/> : null}
      {resultMessage ? <Alert sx={{mb:2}} severity={resultMessage.type} onClose={()=>setResultMessage(null)}>{resultMessage.text}</Alert> : null}

      {/* ── BAILEYS TABS ── */}
      {useBaileys && tab==='inbox' && (
        <BaileysInbox inbox={baileysInbox} selectedKey={baileysSelectedKey} onSelect={setBaileysSelectedKey}
          conversationMessages={baileysConversation} replyForm={baileysReplyForm} setReplyForm={setBaileysReplyForm}
          onSend={handleBaileysReplySend} saving={saving} />
      )}
      {useBaileys && tab==='send' && <BaileysQuickSend onSend={handleBaileysQuickSend} saving={saving} />}
      {useBaileys && tab==='setup' && (
        <BaileysSetup status={baileysStatus} onConnect={handleBaileysConnect}
          onDisconnect={handleBaileysDisconnect} connecting={baileysConnecting} />
      )}

      {/* ── OFFICIAL TABS ── */}
      {!useBaileys && tab==='inbox' && (
        <Grid container spacing={2}>
          <Grid size={{xs:12,lg:4}}>
            <PageSurface>
              <Card sx={{overflow:'hidden'}}>
                <CardContent sx={{p:0}}>
                  <Box sx={{px:2,py:1.5,bgcolor:'#128C7E',color:'#fff'}}>
                    <Typography fontWeight={800}>Chats</Typography>
                    <Typography variant="body2" sx={{opacity:0.9}}>{inbox.length} active conversations</Typography>
                  </Box>
                  <List sx={{py:0,maxHeight:{xs:'unset',lg:'68vh'},overflow:'auto'}}>
                    {inbox.map(item=>(
                      <ListItemButton key={item.conversationKey} selected={item.conversationKey===selectedConversationKey}
                        onClick={()=>setSelectedConversationKey(item.conversationKey)}
                        sx={{alignItems:'flex-start',borderBottom:'1px solid',borderColor:'divider','&.Mui-selected':{bgcolor:'#ecfff3'}}}>
                        <Avatar sx={{bgcolor:'primary.main',mr:1.5}}>{conversationName(item).slice(0,1)}</Avatar>
                        <ListItemText primary={conversationName(item)} primaryTypographyProps={{fontWeight:800}}
                          secondary={`${item.phone||''}${item.lastMessage?` • ${item.lastMessage}`:''}`} />
                        <Stack alignItems="flex-end" spacing={0.75}>
                          <Typography variant="caption" color="text.secondary">{formatWhen(item.updatedAt||item.createdAt)}</Typography>
                          {item.unreadCount?<Chip label={item.unreadCount} color="success" size="small"/>:null}
                        </Stack>
                      </ListItemButton>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </PageSurface>
          </Grid>
          <Grid size={{xs:12,lg:8}}>
            <PageSurface>
              <Card sx={{overflow:'hidden'}}>
                <CardContent sx={{p:0}}>
                  <Box sx={{px:2,py:1.5,bgcolor:'#f0f2f5',borderBottom:'1px solid',borderColor:'divider'}}>
                    <Typography fontWeight={800}>{selectedConversation?conversationName(selectedConversation):'Select a chat'}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedConversation?.phone||'Choose a conversation from the left list.'}</Typography>
                  </Box>
                  <Box sx={{p:2,minHeight:360,maxHeight:{xs:'unset',lg:'52vh'},overflow:'auto',bgcolor:'#efeae2',backgroundImage:'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',backgroundSize:'18px 18px'}}>
                    <Stack spacing={1.2}>
                      {conversationMessages.length
                        ? conversationMessages.map(message=><MessageBubble key={message._id||message.waMessageId||Math.random()} message={message}/>)
                        : <Typography color="text.secondary">No messages yet.</Typography>}
                    </Stack>
                  </Box>
                  <Box sx={{p:2,borderTop:'1px solid',borderColor:'divider',bgcolor:'#f0f2f5'}}>
                    <Grid container spacing={1.5} alignItems="flex-start">
                      <Grid size={{xs:12,md:4}}>
                        <TextField select label="Template" value={replyForm.templateName} onChange={e=>setReplyForm(prev=>({...prev,templateName:e.target.value}))}>
                          <MenuItem value="">No Template</MenuItem>
                          {templates.map(item=><MenuItem key={item._id} value={item.name}>{item.displayName||item.name}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid size={{xs:12,md:8}}>
                        <TextField label="Reply message" multiline minRows={3} value={replyForm.text}
                          onChange={e=>setReplyForm(prev=>({...prev,text:e.target.value}))} helperText="Type message or choose template." />
                      </Grid>
                    </Grid>
                    <Stack direction="row" justifyContent="flex-end" sx={{mt:1.5}}>
                      <Button variant="contained" startIcon={<SendIcon/>}
                        disabled={saving||!selectedConversationKey||(!replyForm.text.trim()&&!replyForm.templateName)}
                        onClick={handleReplySend}>Send Reply</Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </PageSurface>
          </Grid>
        </Grid>
      )}

      {!useBaileys && tab==='rules' && (
        <CollectionSection title="Auto Reply Rules" subtitle="Rules trigger after customer message is stored by webhook." rows={ruleRows}
          onAdd={()=>{setEditingRule(null);setRuleForm(emptyRule);setRuleOpen(true);}}>
          <Card><CardContent>
            <Typography fontWeight={700}>Webhook setup</Typography>
            <Typography variant="body2" color="text.secondary">Meta webhook URL: <strong>/api/whatsapp/webhook</strong>. Verify token uses your <strong>WHATSAPP_WEBHOOK_VERIFY_TOKEN</strong> env.</Typography>
          </CardContent></Card>
        </CollectionSection>
      )}

      {!useBaileys && tab==='send' && (
        <PageSurface>
          <Card><CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Quick Manual Send</Typography>
              <Grid container spacing={2}>
                <Grid size={{xs:12,md:4}}><TextField label="WhatsApp Number" value={sendForm.to} onChange={e=>setSendForm(prev=>({...prev,to:e.target.value}))}/></Grid>
                <Grid size={{xs:12,md:4}}><TextField label="Customer Name" value={sendForm.contactName} onChange={e=>setSendForm(prev=>({...prev,contactName:e.target.value}))}/></Grid>
                <Grid size={{xs:12,md:4}}>
                  <TextField select label="Template" value={sendForm.templateName} onChange={e=>setSendForm(prev=>({...prev,templateName:e.target.value}))}>
                    <MenuItem value="">No Template</MenuItem>
                    {templates.map(item=><MenuItem key={item._id} value={item.name}>{item.displayName||item.name}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{xs:12}}><TextField label="Text Message" multiline minRows={4} value={sendForm.text} onChange={e=>setSendForm(prev=>({...prev,text:e.target.value}))}/></Grid>
              </Grid>
              <Stack direction="row" justifyContent="flex-end"><Button variant="contained" startIcon={<SendIcon/>} onClick={handleQuickSend}>Send</Button></Stack>
            </Stack>
          </CardContent></Card>
        </PageSurface>
      )}

      {!useBaileys && tab==='invite' && (
        <PageSurface>
          <Card><CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Invitation Bulk Send</Typography>
              <Grid container spacing={2}>
                <Grid size={{xs:12,md:4}}><TextField select label="Recipient Source" value={invitationForm.recipientMode} onChange={e=>setInvitationForm(prev=>({...prev,recipientMode:e.target.value}))}>{recipientModeOptions.map(item=><MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</TextField></Grid>
                <Grid size={{xs:12,md:4}}><TextField label="Event Name" value={invitationForm.eventName} onChange={e=>setInvitationForm(prev=>({...prev,eventName:e.target.value}))}/></Grid>
                <Grid size={{xs:12,md:4}}><TextField label="Venue" value={invitationForm.venue} onChange={e=>setInvitationForm(prev=>({...prev,venue:e.target.value}))}/></Grid>
                <Grid size={{xs:12,md:4}}><TextField label="Date" value={invitationForm.date} onChange={e=>setInvitationForm(prev=>({...prev,date:e.target.value}))}/></Grid>
                <Grid size={{xs:12,md:4}}><TextField label="Time" value={invitationForm.time} onChange={e=>setInvitationForm(prev=>({...prev,time:e.target.value}))}/></Grid>
                <Grid size={{xs:12,md:4}}><Button fullWidth variant="contained" component="label" startIcon={<UploadFileIcon/>}>{uploadingImage?'Uploading...':'Upload Image'}<input hidden type="file" accept="image/*" onChange={uploadInvitationImage}/></Button></Grid>
                <Grid size={{xs:12}}><TextField label="Invitation Image URL" value={invitationForm.imageUrl} onChange={e=>setInvitationForm(prev=>({...prev,imageUrl:e.target.value}))}/></Grid>
              </Grid>
              {invitationForm.recipientMode==='single' && (
                <Grid container spacing={2}>
                  <Grid size={{xs:12,md:6}}><TextField label="Guest Name" value={invitationForm.singleName} onChange={e=>setInvitationForm(prev=>({...prev,singleName:e.target.value}))}/></Grid>
                  <Grid size={{xs:12,md:6}}><TextField label="WhatsApp Number" value={invitationForm.singleNumber} onChange={e=>setInvitationForm(prev=>({...prev,singleNumber:e.target.value}))}/></Grid>
                </Grid>
              )}
              {['csv','excel'].includes(invitationForm.recipientMode) && (
                <Button variant="outlined" component="label" startIcon={<UploadFileIcon/>}>
                  Choose {invitationForm.recipientMode.toUpperCase()}
                  <input ref={fileInputRef} hidden type="file" accept={invitationForm.recipientMode==='csv'?'.csv':'.xlsx,.xls'} onChange={handleSheetUpload}/>
                </Button>
              )}
              {fileName ? <Chip label={fileName}/> : null}
              <Divider/>
              <Grid container spacing={2}>
                <Grid size={{xs:12,md:3}}><TextField label="Text X" type="number" value={textPosition.x} onChange={e=>setTextPosition(prev=>({...prev,x:Number(e.target.value)}))}/></Grid>
                <Grid size={{xs:12,md:3}}><TextField label="Text Y" type="number" value={textPosition.y} onChange={e=>setTextPosition(prev=>({...prev,y:Number(e.target.value)}))}/></Grid>
                <Grid size={{xs:12,md:3}}><TextField label="Font Size" type="number" value={textPosition.fontSize} onChange={e=>setTextPosition(prev=>({...prev,fontSize:Number(e.target.value)}))}/></Grid>
                <Grid size={{xs:12,md:3}}><TextField label="Color" value={textPosition.color} onChange={e=>setTextPosition(prev=>({...prev,color:e.target.value}))}/></Grid>
              </Grid>
              {invitationForm.recipientMode!=='single' && (
                <Card variant="outlined"><CardContent>
                  <Grid container spacing={1}>
                    {selectedRecipients.map(item=>(
                      <Grid key={`${item.mobile}-${item.source}`} size={{xs:12,md:6,xl:4}}>
                        <FormControlLabel control={<Checkbox checked={item.checked!==false} onChange={()=>setSelectedRecipients(prev=>prev.map(row=>row.mobile===item.mobile?{...row,checked:row.checked===false}:row))}/>} label={`${item.name} • ${item.mobile}`}/>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent></Card>
              )}
              <Stack direction={{xs:'column',md:'row'}} justifyContent="space-between" spacing={2}>
                <Typography color="text.secondary">Template: <strong>entry_pass</strong> · Total: <strong>{selectedCount}</strong></Typography>
                <Button variant="contained" startIcon={<SendIcon/>} disabled={sendingInvitation||!selectedCount} onClick={sendInvitation}>Send Invitation</Button>
              </Stack>
            </Stack>
          </CardContent></Card>
        </PageSurface>
      )}

      {!useBaileys && tab==='templates' && <CollectionSection title="Templates" subtitle="Approved template registry for sends and auto replies." rows={templateRows}/>}
      {!useBaileys && tab==='connections' && <CollectionSection title="Connections" subtitle="Manual or embedded WhatsApp connection records." rows={connectionsRows}/>}
      {!useBaileys && tab==='logs' && <CollectionSection title="Message Logs" subtitle="Incoming webhook messages, manual replies and auto replies." rows={logRows}/>}

      <ResponsiveDialog open={ruleOpen} onClose={()=>setRuleOpen(false)} fullWidth maxWidth="md">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={800}>{editingRule?'Edit Auto Reply Rule':'Add Auto Reply Rule'}</Typography>
            <Grid container spacing={2}>
              <Grid size={{xs:12,md:6}}><TextField label="Rule Name" value={ruleForm.name} onChange={e=>setRuleForm(prev=>({...prev,name:e.target.value}))}/></Grid>
              <Grid size={{xs:12,md:3}}><TextField type="number" label="Priority" value={ruleForm.priority} onChange={e=>setRuleForm(prev=>({...prev,priority:Number(e.target.value)}))}/></Grid>
              <Grid size={{xs:12,md:3}}><TextField select label="Match Type" value={ruleForm.matchType} onChange={e=>setRuleForm(prev=>({...prev,matchType:e.target.value}))}>{['CONTAINS','EXACT','STARTS_WITH','ALL'].map(item=><MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid size={{xs:12}}><TextField label="Trigger Text" value={ruleForm.triggerText} onChange={e=>setRuleForm(prev=>({...prev,triggerText:e.target.value}))} helperText="Leave blank only when match type is ALL."/></Grid>
              <Grid size={{xs:12,md:4}}><TextField select label="Reply Type" value={ruleForm.replyType} onChange={e=>setRuleForm(prev=>({...prev,replyType:e.target.value}))}>{['TEXT','TEMPLATE'].map(item=><MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid size={{xs:12,md:8}}><TextField select label="Template" value={ruleForm.templateName} onChange={e=>setRuleForm(prev=>({...prev,templateName:e.target.value}))} disabled={ruleForm.replyType!=='TEMPLATE'}><MenuItem value="">Select Template</MenuItem>{templates.map(item=><MenuItem key={item._id} value={item.name}>{item.displayName||item.name}</MenuItem>)}</TextField></Grid>
              <Grid size={{xs:12}}><TextField label="Reply Text" multiline minRows={4} value={ruleForm.replyText} onChange={e=>setRuleForm(prev=>({...prev,replyText:e.target.value}))} disabled={ruleForm.replyType!=='TEXT'}/></Grid>
              <Grid size={{xs:12,md:6}}><FormControlLabel control={<Checkbox checked={Boolean(ruleForm.isActive)} onChange={e=>setRuleForm(prev=>({...prev,isActive:e.target.checked}))}/>} label="Rule Active"/></Grid>
              <Grid size={{xs:12,md:6}}><FormControlLabel control={<Checkbox checked={Boolean(ruleForm.stopAfterMatch)} onChange={e=>setRuleForm(prev=>({...prev,stopAfterMatch:e.target.checked}))}/>} label="Stop after this rule matches"/></Grid>
            </Grid>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={()=>setRuleOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={saveRule}>Save Rule</Button>
            </Stack>
          </Stack>
        </CardContent>
      </ResponsiveDialog>
    </Box>
  );
}
