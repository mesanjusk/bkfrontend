import { Chip } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';

export default function ReadStatusChip({ read }) {
  return (
    <Chip
      size="small"
      color={read ? 'default' : 'primary'}
      icon={read ? <MarkEmailReadIcon /> : <MarkEmailUnreadIcon />}
      label={read ? 'Read' : 'Unread'}
      variant={read ? 'outlined' : 'filled'}
    />
  );
}
