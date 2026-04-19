import { Chip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';

export default function TriggerTypeChip({ triggerKey }) {
  return <Chip size="small" color="secondary" icon={<BoltIcon />} label={(triggerKey || 'Unknown Trigger').replaceAll('_', ' ')} />;
}
