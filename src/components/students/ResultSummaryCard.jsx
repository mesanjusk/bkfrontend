import { Alert, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';

export default function ResultSummaryCard({ summary, board, method }) {
  const hasData = Number.isFinite(summary?.percentage) && summary.percentage > 0;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default' }}>
      <CardContent>
        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Board: ${board || '—'}`} />
            <Chip size="small" color={method === 'BEST_5' ? 'primary' : 'default'} label={`Method: ${method === 'BEST_5' ? 'CBSE Best 5' : 'Direct / Aggregate'}`} />
          </Stack>
          {method === 'BEST_5' && board?.toUpperCase() === 'CBSE' ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Best 5 logic is active. Highest-scoring 5 subjects will be used for percentage preview.
            </Alert>
          ) : null}
          {hasData ? (
            <Grid container spacing={1}>
              <Grid item xs={4}><Typography variant="caption" color="text.secondary">Obtained</Typography><Typography variant="h6">{summary.totalObtained}</Typography></Grid>
              <Grid item xs={4}><Typography variant="caption" color="text.secondary">Max</Typography><Typography variant="h6">{summary.totalMax}</Typography></Grid>
              <Grid item xs={4}><Typography variant="caption" color="text.secondary">Percentage</Typography><Typography variant="h6">{summary.percentage.toFixed(2)}%</Typography></Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">Enter percentage directly or complete subject marks to generate a live summary.</Typography>
          )}
          {summary?.topSubjects?.length ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Top contributing subjects</Typography>
              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                {summary.topSubjects.map((item, idx) => (
                  <Chip key={`${item.subject}-${idx}`} size="small" variant="outlined" label={`${item.subject}: ${item.marksObtained}/${item.maxMarks}`} />
                ))}
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
