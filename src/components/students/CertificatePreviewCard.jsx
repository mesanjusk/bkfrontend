import { Card, CardContent, Chip, Stack, Typography, Box } from '@mui/material';

export default function CertificatePreviewCard({ name, board, className, photoUrl, adjustments }) {
  const style = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transformOrigin: 'center',
    transform: `translate(${adjustments?.photoX || 0}px, ${adjustments?.photoY || 0}px) scale(${adjustments?.photoScale || 1}) rotate(${adjustments?.photoRotation || 0}deg)`,
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, position: { md: 'sticky' }, top: { md: 96 } }}>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Certificate Preview</Typography>
            <Chip size="small" color="primary" label="Live" />
          </Stack>
          <Box sx={{ p: 2, borderRadius: 2.5, minHeight: 320, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg,#f8fafc,#ecfeff 35%,#fefce8)', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ letterSpacing: 1.4 }}>Academic Achievement Certificate</Typography>
            <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 700 }}>{name || 'Student Name'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mt: 1 }}>has successfully submitted marks and documents for award eligibility review.</Typography>
            <Typography variant="body2" sx={{ mt: 1.8 }}><strong>{board || 'Board'}</strong> · <strong>{className || 'Class'}</strong></Typography>

            <Box sx={{ position: 'absolute', right: 16, top: 16, width: 120, height: 145, borderRadius: 2.2, overflow: 'hidden', bgcolor: '#fff', border: '2px solid #cbd5e1', display: 'grid', placeItems: 'center' }}>
              {photoUrl ? <img alt="Student" src={photoUrl} style={style} /> : <Typography variant="caption" color="text.secondary">Photo</Typography>}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
