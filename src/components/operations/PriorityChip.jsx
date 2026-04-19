import Chip from '@mui/material/Chip';

export default function PriorityChip({ priority = 'MEDIUM', size = 'small' }) {
  const value = (priority || 'MEDIUM').toUpperCase();
  const map = {
    LOW: { color: 'default', label: 'Low' },
    MEDIUM: { color: 'info', label: 'Medium' },
    HIGH: { color: 'warning', label: 'High' },
    URGENT: { color: 'error', label: 'Urgent' },
  };
  const ui = map[value] || map.MEDIUM;
  return <Chip size={size} color={ui.color} label={ui.label} />;
}
