import Chip from '@mui/material/Chip';

const normalize = (status) => (status || '').toString().toUpperCase();

export default function PaymentStatusChip({ status, dueAmount = 0, size = 'small' }) {
  const normalized = normalize(status);

  if (dueAmount > 0 && !normalized) {
    return <Chip size={size} color="warning" label="Due Pending" />;
  }

  const map = {
    PAID: { color: 'success', label: 'Paid' },
    FULLY_PAID: { color: 'success', label: 'Paid' },
    PARTIAL: { color: 'warning', label: 'Partial' },
    PARTIALLY_PAID: { color: 'warning', label: 'Partial' },
    UNPAID: { color: 'error', label: 'Unpaid' },
    PENDING: { color: 'warning', label: 'Pending' },
    CANCELLED: { color: 'default', label: 'Cancelled' },
  };

  const fallback = dueAmount > 0 ? { color: 'warning', label: 'Due Pending' } : { color: 'success', label: 'Clear' };
  const ui = map[normalized] || fallback;

  return <Chip size={size} color={ui.color} label={ui.label} />;
}
