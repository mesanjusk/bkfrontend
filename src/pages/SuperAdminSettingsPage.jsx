import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Alert,
  CircularProgress, Divider, ToggleButton, ToggleButtonGroup,
  Tooltip, Snackbar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SettingsIcon from '@mui/icons-material/Settings';
import PageHeader from '../components/PageHeader';
import api from '../api';

// ─── helper ──────────────────────────────────────────────────────────────────
function useSystemSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system-settings');
      setSettings(res.data?.map || {});
    } catch (e) {
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
      setSettings(prev => ({ ...prev, [key]: value }));
      setToast({ type: 'success', msg: 'Setting saved ✅' });
    } catch (e) {
      setToast({ type: 'error', msg: e?.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, save, toast, setToast };
}

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({ current, saving, onChange }) {
  const isOfficial = current === 'official';
  const isBaileys = current === 'baileys';

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <WhatsAppIcon sx={{ color: '#25D366', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Registration WhatsApp Provider
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Controls which service sends the auto-confirmation message when a student registers via the public form.
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <ToggleButtonGroup
            value={current}
            exclusive
            onChange={(_, val) => { if (val && val !== current) onChange('registration_whatsapp_provider', val); }}
            disabled={saving}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            {/* Official */}
            <ToggleButton
              value="official"
              sx={{
                flex: 1, minWidth: 200, borderRadius: '12px !important',
                border: '2px solid !important',
                borderColor: isOfficial ? 'success.main !important' : 'divider !important',
                bgcolor: isOfficial ? 'success.50' : 'background.paper',
                py: 2, px: 3,
                '&.Mui-selected': { bgcolor: '#e8f5e9', color: 'success.dark' },
              }}
            >
              <Stack spacing={0.5} alignItems="flex-start" width="100%">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon sx={{ color: isOfficial ? 'success.main' : 'action.disabled', fontSize: 20 }} />
                  <Typography fontWeight={700} fontSize={15}>Official API</Typography>
                  {isOfficial && <Chip label="ACTIVE" color="success" size="small" sx={{ ml: 'auto', height: 20 }} />}
                </Stack>
                <Typography variant="caption" color="text.secondary" textAlign="left">
                  Meta WhatsApp Cloud API — sends the <strong>bk_award</strong> template with edit link.
                </Typography>
                <Chip label="Template message" size="small" variant="outlined" color="success" sx={{ mt: 0.5 }} />
              </Stack>
            </ToggleButton>

            {/* Baileys */}
            <ToggleButton
              value="baileys"
              sx={{
                flex: 1, minWidth: 200, borderRadius: '12px !important',
                border: '2px solid !important',
                borderColor: isBaileys ? 'warning.main !important' : 'divider !important',
                bgcolor: isBaileys ? '#fff8e1' : 'background.paper',
                py: 2, px: 3,
                '&.Mui-selected': { bgcolor: '#fff8e1', color: 'warning.dark' },
              }}
            >
              <Stack spacing={0.5} alignItems="flex-start" width="100%">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneAndroidIcon sx={{ color: isBaileys ? 'warning.main' : 'action.disabled', fontSize: 20 }} />
                  <Typography fontWeight={700} fontSize={15}>Baileys</Typography>
                  {isBaileys && <Chip label="ACTIVE" color="warning" size="small" sx={{ ml: 'auto', height: 20 }} />}
                </Stack>
                <Typography variant="caption" color="text.secondary" textAlign="left">
                  Baileys (WhatsApp Web) — sends a plain text confirmation. Must be connected first.
                </Typography>
                <Chip label="Plain text message" size="small" variant="outlined" color="warning" sx={{ mt: 0.5 }} />
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>

          {saving && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Saving…</Typography>
            </Stack>
          )}

          {isBaileys && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <strong>Baileys must be connected</strong> before registrations arrive — go to the WhatsApp page and ensure the QR is scanned and status shows <strong>CONNECTED</strong>.
            </Alert>
          )}

          {isOfficial && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Official API will send the <strong>bk_award</strong> template with a personalised edit link button. Ensure the template is approved in Meta Business Manager.
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SuperAdminSettingsPage() {
  const { settings, loading, saving, save, toast, setToast } = useSystemSettings();

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        eyebrow="Super Admin"
        title="System Settings"
        subtitle="Global configuration options visible only to super admins."
        chips={[{ label: '🔒 Super Admin Only', color: 'error' }]}
      />

      {loading ? (
        <Stack alignItems="center" sx={{ mt: 6 }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>Loading settings…</Typography>
        </Stack>
      ) : (
        <Stack spacing={3} sx={{ maxWidth: 760 }}>
          {/* WhatsApp Provider */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: -1 }}>
            <SettingsIcon color="action" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
              WhatsApp Configuration
            </Typography>
          </Stack>

          <ProviderCard
            current={settings['registration_whatsapp_provider'] || 'official'}
            saving={saving}
            onChange={save}
          />
        </Stack>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast?.type || 'info'}
          onClose={() => setToast(null)}
          sx={{ width: '100%' }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
