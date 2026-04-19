import { Alert, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';

const severityByStatus = {
  ELIGIBLE: 'success',
  INELIGIBLE: 'error',
  REVIEW_NEEDED: 'warning',
  PENDING: 'info',
};

export default function EligibilitySummaryCard({ student, computedPercentage }) {
  const status = student?.status || 'PENDING';
  const matched = (student?.matchedCategoryIds || []).map((c) => c.title).filter(Boolean);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Eligibility Summary</Typography>
          <Alert severity={severityByStatus[status] || 'info'} sx={{ borderRadius: 2 }}>
            Current status: <strong>{status}</strong>
          </Alert>
          <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
            <Chip size="small" label={`Calculated %: ${Number(computedPercentage || 0).toFixed(2)}`} />
            <Chip size="small" label={`Confidence: ${student?.extractionConfidence || 0}`} />
            <Chip size="small" color={student?.reviewNeeded ? 'warning' : 'default'} label={student?.reviewNeeded ? 'Review needed' : 'No review flags'} />
          </Stack>
          <Divider />
          <Typography variant="caption" color="text.secondary">Matched categories</Typography>
          {matched.length ? (
            <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
              {matched.map((title) => <Chip key={title} label={title} color="success" variant="outlined" size="small" />)}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No matched categories yet. Run evaluate after saving updates.</Typography>
          )}
          {student?.rawExtractedText ? (
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
              Extraction preview available ({student.rawExtractedText.length} chars).
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
