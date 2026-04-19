import { Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import TriggerTypeChip from './TriggerTypeChip';

export default function AutomationRuleCard({ rule, onEdit }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" gap={1}>
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1">{rule.name}</Typography>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <TriggerTypeChip triggerKey={rule.triggerKey} />
              <Chip size="small" label={rule.recipientType || 'Recipient'} />
              <Chip size="small" color={rule.isActive ? 'success' : 'default'} label={rule.isActive ? 'Active' : 'Inactive'} />
            </Stack>
            <Typography variant="body2">Template: {rule.templateName || '-'}</Typography>
            <Typography variant="caption">Condition: {rule.conditionSummary || 'No condition provided'}</Typography>
          </Stack>
          <IconButton onClick={() => onEdit(rule)}><EditIcon /></IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
