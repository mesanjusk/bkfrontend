import CallIcon from '@mui/icons-material/Call';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import DoDisturbOnRoundedIcon from '@mui/icons-material/DoDisturbOnRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { Button, Stack } from '@mui/material';

export default function StageActionBar({ onStatus, onChangeGuest, onAddDonation, onTriggerThanks, compact = false }) {
  return (
    <Stack direction="row" gap={0.8} flexWrap="wrap">
      <Button size={compact ? 'small' : 'medium'} startIcon={<CallIcon />} onClick={() => onStatus('CALLED')}>Mark Called</Button>
      <Button size={compact ? 'small' : 'medium'} startIcon={<TheaterComedyRoundedIcon />} onClick={() => onStatus('ON_STAGE')}>Mark On Stage</Button>
      <Button variant="contained" color="success" size={compact ? 'small' : 'medium'} startIcon={<CheckCircleRoundedIcon />} onClick={() => onStatus('COMPLETED')}>Mark Completed</Button>
      <Button color="error" size={compact ? 'small' : 'medium'} startIcon={<DoDisturbOnRoundedIcon />} onClick={() => onStatus('ABSENT')}>Mark Absent</Button>
      <Button color="warning" size={compact ? 'small' : 'medium'} startIcon={<SkipNextRoundedIcon />} onClick={() => onStatus('SKIPPED')}>Skip</Button>
      <Button variant="outlined" size={compact ? 'small' : 'medium'} onClick={onChangeGuest}>Change Guest</Button>
      <Button variant="outlined" size={compact ? 'small' : 'medium'} startIcon={<VolunteerActivismRoundedIcon />} onClick={onAddDonation}>Add Donation</Button>
      <Button variant="outlined" size={compact ? 'small' : 'medium'} startIcon={<CelebrationRoundedIcon />} onClick={onTriggerThanks}>Trigger Thanks</Button>
    </Stack>
  );
}
