import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';

const triggerOptions = ['form_submitted', 'student_eligible', 'guest_invited', 'donation_received', 'certificate_ready', 'event_completed'];

export default function AutomationRuleEditor({ open, value, onClose, onChange, onSubmit, templates = [] }) {
  const form = value || {};

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Automation Rule Editor</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.2 }}>
          <Grid item xs={12}><Typography variant="subtitle2">1. Rule basics</Typography></Grid>
          <Grid item xs={12} md={6}><TextField label="Rule name" value={form.name || ''} onChange={(e) => onChange('name', e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField label="Condition summary" value={form.conditionSummary || ''} onChange={(e) => onChange('conditionSummary', e.target.value)} helperText="Use plain language for senior team members." /></Grid>

          <Grid item xs={12}><Typography variant="subtitle2">2. Trigger</Typography></Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Trigger" value={form.triggerKey || ''} onChange={(e) => onChange('triggerKey', e.target.value)}>
              {triggerOptions.map((t) => <MenuItem key={t} value={t}>{t.replaceAll('_', ' ')}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12}><Typography variant="subtitle2">3. Recipient target</Typography></Grid>
          <Grid item xs={12} md={6}><TextField label="Recipient type" value={form.recipientType || ''} onChange={(e) => onChange('recipientType', e.target.value)} /></Grid>

          <Grid item xs={12}><Typography variant="subtitle2">4. Conditions</Typography></Grid>
          <Grid item xs={12}><TextField multiline minRows={2} label="Condition JSON / notes" value={form.conditionJson || ''} onChange={(e) => onChange('conditionJson', e.target.value)} helperText="Optional technical condition expression." /></Grid>

          <Grid item xs={12}><Typography variant="subtitle2">5. Template/action</Typography></Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Template" value={form.templateName || ''} onChange={(e) => onChange('templateName', e.target.value)}>
              <MenuItem value="">Select template</MenuItem>
              {templates.map((t) => <MenuItem key={t._id} value={t.name}>{t.name}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12}><Typography variant="subtitle2">6. Status</Typography></Grid>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel control={<Switch checked={Boolean(form.isActive)} onChange={(e) => onChange('isActive', e.target.checked)} />} label="Rule active" />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>Save Rule</Button>
      </DialogActions>
    </Dialog>
  );
}
