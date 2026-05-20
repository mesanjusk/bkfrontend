import { Box, Container, Paper, Typography, Stack } from '@mui/material';
import { Lock, EventBusy } from '@mui/icons-material';

const ANCHOR_COLOR = '#7c3aed';

export default function RegistrationClosedPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          {/* Header bar */}
          <Box sx={{ bgcolor: ANCHOR_COLOR, py: 3, px: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
              <Lock sx={{ color: '#fff', fontSize: 28 }} />
              <Typography variant="h5" fontWeight={700} color="#fff">
                BK Awards – Anchor Registration
              </Typography>
            </Stack>
          </Box>

          {/* Body */}
          <Box sx={{ py: 6, px: 4 }}>
            <EventBusy sx={{ fontSize: 80, color: ANCHOR_COLOR, opacity: 0.25, mb: 2 }} />

            <Typography variant="h4" fontWeight={700} color={ANCHOR_COLOR} gutterBottom>
              Registration Closed
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
              Thank you for your interest in becoming an anchor for BK Awards.
              <br />
              Unfortunately, registrations are currently closed.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Please check back later or contact the organising team for more information.
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ bgcolor: '#f5f3ff', py: 2, px: 4 }}>
            <Typography variant="caption" color="text.disabled">
              BK Awards &copy; {new Date().getFullYear()}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
