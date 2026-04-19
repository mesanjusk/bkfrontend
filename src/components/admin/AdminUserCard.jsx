import { Avatar, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

export default function AdminUserCard({ user }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1.2}>
          <Avatar>{(user.name || 'U').charAt(0)}</Avatar>
          <Stack spacing={0.8}>
            <Typography variant="subtitle1">{user.name}</Typography>
            <Typography variant="body2">@{user.username}</Typography>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={user.roleId?.name || 'No role'} />
              <Chip size="small" label={user.eventDutyType || 'NONE'} />
              <Chip size="small" color={user.isActive === false ? 'default' : 'success'} label={user.isActive === false ? 'Inactive' : 'Active'} />
            </Stack>
            <Typography variant="caption">{user.contactNumber || user.email || 'No contact info'}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
