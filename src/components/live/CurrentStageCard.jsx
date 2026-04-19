import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { Avatar, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import StatusChip from '../StatusChip';
import StageActionBar from './StageActionBar';

const Row = ({ label, value }) => (
  <Stack spacing={0.2}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{value || '-'}</Typography>
  </Stack>
);

export default function CurrentStageCard({ assignment, onStatus, onChangeGuest, onAddDonation, onTriggerThanks, compact }) {
  if (!assignment) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>Current Stage Focus</Typography>
          <Typography variant="body2" color="text.secondary">No active assignment right now.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={4} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} mb={1} spacing={1}>
          <Stack direction="row" spacing={1.2} alignItems="center" minWidth={0}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><PersonRoundedIcon /></Avatar>
            <Stack minWidth={0}>
              <Typography variant="overline" color="text.secondary">Current Stage Focus</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>{assignment.studentId?.fullName || 'Student TBD'}</Typography>
            </Stack>
          </Stack>
          <Stack direction={{ xs: 'row', sm: 'column' }} alignItems={{ xs: 'center', sm: 'flex-end' }} spacing={0.6}>
            <Chip label={`Seq #${assignment.sequenceNo || '-'}`} size="small" />
            <StatusChip label={assignment.status} />
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1.2 }} />
        <Grid container spacing={1.2}>
          <Grid item xs={12} sm={6} md={4}><Row label="Category" value={assignment.categoryId?.title} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Planned Anchor" value={assignment.plannedAnchorId?.name} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Actual Anchor" value={assignment.actualAnchorId?.name || assignment.plannedAnchorId?.name} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Planned Guest" value={assignment.plannedGuestId?.name} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Actual Guest" value={assignment.actualGuestId?.name || assignment.plannedGuestId?.name} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Team Member" value={assignment.teamMemberId?.name} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Volunteer" value={assignment.volunteerId?.name} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Guest Assignments" value={assignment.actualGuestId?.stageCounts?.guestAwards || assignment.plannedGuestId?.stageCounts?.guestAwards || 0} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Row label="Volunteer Assignments" value={assignment.volunteerId?.stageCounts?.volunteerAssignments || 0} /></Grid>
        </Grid>

        <Divider sx={{ my: 1.2 }} />
        <StageActionBar
          compact={compact}
          onStatus={onStatus}
          onChangeGuest={onChangeGuest}
          onAddDonation={onAddDonation}
          onTriggerThanks={onTriggerThanks}
        />
      </CardContent>
    </Card>
  );
}
