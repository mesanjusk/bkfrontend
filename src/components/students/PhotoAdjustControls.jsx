import { CenterFocusStrong, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp, RotateRight } from '@mui/icons-material';
import { Button, ButtonGroup, Card, CardContent, Grid, IconButton, Slider, Stack, Typography } from '@mui/material';

export default function PhotoAdjustControls({ value, onChange }) {
  const update = (key, next) => onChange({ ...value, [key]: next });

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1">Photo Adjustment</Typography>
          <Grid container spacing={1.2}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Zoom</Typography>
              <Slider min={0.5} max={2.5} step={0.01} value={value.photoScale || 1} onChange={(_, v) => update('photoScale', v)} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Rotation</Typography>
              <Slider min={-45} max={45} step={1} value={value.photoRotation || 0} onChange={(_, v) => update('photoRotation', v)} valueLabelDisplay="auto" />
            </Grid>
          </Grid>
          <Stack alignItems="center" spacing={0.5}>
            <IconButton onClick={() => update('photoY', (value.photoY || 0) - 2)} size="small"><KeyboardArrowUp /></IconButton>
            <ButtonGroup size="small">
              <IconButton onClick={() => update('photoX', (value.photoX || 0) - 2)}><KeyboardArrowLeft /></IconButton>
              <IconButton onClick={() => update('photoX', (value.photoX || 0) + 2)}><KeyboardArrowRight /></IconButton>
            </ButtonGroup>
            <IconButton onClick={() => update('photoY', (value.photoY || 0) + 2)} size="small"><KeyboardArrowDown /></IconButton>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="outlined" startIcon={<CenterFocusStrong />} onClick={() => onChange({ ...value, photoX: 0, photoY: 0, photoScale: 1 })}>Reset fit</Button>
            <Button fullWidth variant="outlined" startIcon={<RotateRight />} onClick={() => update('photoRotation', 0)}>Reset rotation</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">X: {value.photoX || 0} · Y: {value.photoY || 0} · Scale: {(value.photoScale || 1).toFixed(2)} · Rotation: {value.photoRotation || 0}°</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
