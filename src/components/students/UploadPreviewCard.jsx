import { CloudUpload } from '@mui/icons-material';
import { Avatar, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';

export default function UploadPreviewCard({
  title,
  helpText,
  urlValue,
  onUrlChange,
  onFileSelect,
  preview,
  inputId,
  loading = false,
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.2}>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{helpText}</Typography>
          <Button component="label" variant="outlined" startIcon={<CloudUpload />} disabled={loading} sx={{ borderStyle: 'dashed', py: 1.2 }}>
            {loading ? 'Uploading...' : 'Click to upload image'}
            <input hidden id={inputId} type="file" accept="image/*" onChange={(e) => onFileSelect(e.target.files?.[0] || null)} />
          </Button>
          <TextField label="or paste image URL" size="small" value={urlValue || ''} onChange={(e) => onUrlChange(e.target.value)} fullWidth />
          {preview ? (
            <Avatar variant="rounded" src={preview} alt={title} sx={{ width: '100%', height: 180, borderRadius: 2 }} />
          ) : (
            <Typography variant="caption" color="text.secondary">No image selected.</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
