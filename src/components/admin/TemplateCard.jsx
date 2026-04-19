import { Card, CardContent, Chip, Stack, Typography, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function TemplateCard({ template, onPreview }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">{template.name}</Typography>
            <Chip size="small" color={template.isActive === false ? 'default' : 'success'} label={template.isActive === false ? 'Inactive' : 'Active'} />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={template.type || 'GENERIC'} />
            {template.language ? <Chip size="small" variant="outlined" label={template.language} /> : null}
          </Stack>
          {template.previewUrl ? <img src={template.previewUrl} alt={template.name} style={{ width: '100%', borderRadius: 8, maxHeight: 120, objectFit: 'cover' }} /> : null}
          <Typography variant="body2">{template.snippet || template.description || 'No preview snippet provided.'}</Typography>
          <Button size="small" startIcon={<VisibilityIcon />} onClick={() => onPreview(template)}>Quick Preview</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
