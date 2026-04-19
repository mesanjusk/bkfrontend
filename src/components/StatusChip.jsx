import { Chip } from '@mui/material';

const resolveColor = (status = '') => {
  const value = String(status).toUpperCase();
  if (['DONE', 'COMPLETED', 'ELIGIBLE', 'SENT', 'AVAILABLE'].includes(value)) return 'success';
  if (['IN_PROGRESS', 'ON_STAGE', 'CALLED', 'EXPECTED', 'BUSY'].includes(value)) return 'warning';
  if (['PENDING', 'REVIEW', 'NONE'].includes(value)) return 'default';
  if (['ERROR', 'FAILED', 'OVERDUE'].includes(value)) return 'error';
  return 'default';
};

export default function StatusChip({ label, size = 'small' }) {
  return <Chip size={size} label={label || '-'} color={resolveColor(label)} />;
}
