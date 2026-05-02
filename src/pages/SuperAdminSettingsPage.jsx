import { useEffect, useState } from 'react';
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress,
  Divider, Snackbar, Stack, Typography,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TuneIcon from '@mui/icons-material/Tune';
import PageHeader from '../components/PageHeader';
import api from '../api';

// ── data hook ────────────────────────────────────────────────────────────────
function useSystemSettings() {
  const [map, setMap]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system-settings');
      setMap(res.data?.map || {});
    } catch {
      setToast({ type: 'error', msg: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (key, value) => {
    setSaving(true);
    try {
      await api.put(`/system-settings/${key}`, { value });
      setMap(prev => ({ ...prev, [key]: value }));
      setToast({ type: 'success', msg: 'Saved successfully ✅' });
    } catch (e) {
      setToast({ type: 'error', msg: e?.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return { map, loading, saving, save, toast, setToast };
}

// ── provider option button ────────────────────────────────────────────────────
function ProviderOption({ value, current, saving, onSelect, icon, label, tag, tagColor, description, alertMsg, alertSeverity }) {
  const selected = current === value;
  return (
    <Box
      onClick={() => !saving && !selected && onSelect(value)}
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: 220 },
        border: '2px solid',
        borderColor: selected ? (value === 'baileys' ? 'warning.main' : 'success.main') : 'divider',
        borderRadius: 3,
        p: 2.5,
        cursor: saving || selected ? 'default' : 'pointer',
        bgcolor: selected
          ? value === 'baileys' ? '#fff8e1' : '#e8f5e9'
          : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': !selected && !saving ? {
          borderColor: value === 'baileys' ? 'warning.light' : 'success.light',
          bgcolor: value === 'baileys' ? '#fffde7' : '#f1f8e9',
        } : {},
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          {icon}
          <Typography fontWeight={700} fontSize={15}>{label}</Typography>
          {selected && (
            <Chip
              label="ACTIVE"
              size="small"
              color={value === 'baileys' ? 'warning' : 'success'}
              sx={{ ml: 'auto', height: 20, fontSize: 10, fontWeight: 700 }}
            />
          )}
          {!selected && (
            <Chip
              label={tag}
              size="small"
              color={tagColor}
              variant="outlined"
              sx={{ ml: 'auto', height: 20, fontSize: 10 }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" fontSize={13}>
          {description}
        </Typography>
        {selected && alertMsg && (
          <Alert severity={alertSeverity || 'info'} sx={{ py: 0.5, fontSize: 12 }}>
            {alertMsg}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function SuperAdminSettingsPage() {
  const { map, loading, saving, save, toast, setToast } = useSystemSettings();

  // default to 'baileys' if not set yet
  const provider = map['registration_whatsapp_provider'] || 'baileys';

  const handleProviderChange = (val) => {
    save('registration_whatsapp_provider', val);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        eyebrow="Super Admin"
        title="System Settings"
        subtitle="Global configuration options. Changes take effect immediately."
        chips={[{ label: '🔒 Super Admin Only', color: 'error' }]}
      />

      {loading ? (
        <Stack alignItems="center" sx={{ mt: 8 }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>Loading settings…</Typography>
        </Stack>
      ) : (
        <Stack spacing={3} sx={{ maxWidth: 780 }}>

          {/* Section header */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <WhatsAppIcon sx={{ color: '#25D366', fontSize: 22 }} />
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
              WhatsApp — Registration Message Provider
            </Typography>
          </Stack>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    When a student registers via the public form, this controls which WhatsApp
                    service sends the auto-confirmation message. Click a provider to switch.
                  </Typography>
                </Box>

                <Divider />

                {saving && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} color="warning" />
                    <Typography variant="body2" color="text.secondary">Saving…</Typography>
                  </Stack>
                )}

                {/* Provider cards */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <ProviderOption
                    value="baileys"
                    current={provider}
                    saving={saving}
                    onSelect={handleProviderChange}
                    icon={<PhoneAndroidIcon sx={{ color: provider === 'baileys' ? 'warning.main' : 'action.disabled', fontSize: 22 }} />}
                    label="Baileys"
                    tag="Default"
                    tagColor="warning"
                    description="Sends a plain text confirmation via Baileys (WhatsApp Web). Must be connected via QR before registrations arrive."
                    alertMsg="Baileys is active. Ensure it is connected — go to WhatsApp page and confirm status shows CONNECTED."
                    alertSeverity="warning"
                  />
                  <ProviderOption
                    value="official"
                    current={provider}
                    saving={saving}
                    onSelect={handleProviderChange}
                    icon={<CheckCircleIcon sx={{ color: provider === 'official' ? 'success.main' : 'action.disabled', fontSize: 22 }} />}
                    label="Official API"
                    tag="Meta"
                    tagColor="success"
                    description="Sends the bk_award approved template with personalised edit link via Meta WhatsApp Cloud API."
                    alertMsg="Official API is active. Ensure the bk_award template is approved in Meta Business Manager."
                    alertSeverity="info"
                  />
                </Stack>

                <Divider />

                {/* Current status summary */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <TuneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Current provider:{' '}
                    <strong style={{ color: provider === 'baileys' ? '#b45309' : '#166534' }}>
                      {provider === 'baileys' ? 'Baileys (WhatsApp Web)' : 'Official Meta Cloud API'}
                    </strong>
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

        </Stack>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.type || 'info'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
