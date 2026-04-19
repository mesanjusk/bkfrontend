import CallIcon from '@mui/icons-material/Call';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import DoDisturbOnRoundedIcon from '@mui/icons-material/DoDisturbOnRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Button, Stack } from '@mui/material';

export default function StageActionBar({ onStatus, onChangeGuest, onAddDonation, onTriggerThanks, compact = false }) {
  const mobileProps = compact ? { fullWidth: true, size: 'medium' } : { size: 'medium' };

  return (
    <Stack direction={compact ? 'column' : 'row'} gap={0.8} flexWrap="wrap">
      <Button {...mobileProps} startIcon={<CallIcon />} onClick={() => onStatus('CALLED')}>Mark Called</Button>
      <Button {...mobileProps} startIcon={<TheaterComedyRoundedIcon />} onClick={() => onStatus('ON_STAGE')}>Mark On Stage</Button>
      <Button {...mobileProps} variant="contained" color="success" startIcon={<CheckCircleRoundedIcon />} onClick={() => onStatus('COMPLETED')}>Mark Completed</Button>
      <Button {...mobileProps} color="error" startIcon={<DoDisturbOnRoundedIcon />} onClick={() => onStatus('ABSENT')}>Mark Absent</Button>
      <Button {...mobileProps} color="warning" startIcon={<SkipNextRoundedIcon />} onClick={() => onStatus('SKIPPED')}>Skip</Button>
      <Button {...mobileProps} variant="outlined" onClick={onChangeGuest}>Change Guest</Button>
      <Button {...mobileProps} variant="outlined" startIcon={<VolunteerActivismRoundedIcon />} onClick={onAddDonation}>Add Donation</Button>
      <Button {...mobileProps} variant="outlined" startIcon={<CelebrationRoundedIcon />} onClick={onTriggerThanks}>Trigger Thanks</Button>
    </Stack>
  );
}
