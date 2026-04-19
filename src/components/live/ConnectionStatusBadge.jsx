import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { Chip } from '@mui/material';

const mapState = {
  connected: { color: 'success', icon: <WifiRoundedIcon />, label: 'Socket Connected' },
  reconnecting: { color: 'warning', icon: <SyncRoundedIcon />, label: 'Reconnecting' },
  offline: { color: 'error', icon: <WifiOffRoundedIcon />, label: 'Offline' }
};

export default function ConnectionStatusBadge({ status = 'offline' }) {
  const config = mapState[status] || mapState.offline;
  return <Chip size="small" color={config.color} icon={config.icon} label={config.label} />;
}
