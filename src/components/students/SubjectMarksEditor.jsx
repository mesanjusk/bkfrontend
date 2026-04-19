import { Add, DeleteOutline } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';

const EMPTY_ROW = { subject: '', marksObtained: 0, maxMarks: 100, code: '' };

export default function SubjectMarksEditor({ value = [], onChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const rows = value.length ? value : [EMPTY_ROW];

  const update = (idx, key, nextValue) => {
    const copy = rows.map((row) => ({ ...row }));
    copy[idx][key] = ['marksObtained', 'maxMarks'].includes(key) ? Number(nextValue) : nextValue;
    onChange(copy);
  };

  const addRow = () => onChange([...rows, { ...EMPTY_ROW }]);
  const removeRow = (idx) => {
    const nextRows = rows.filter((_, i) => i !== idx);
    onChange(nextRows.length ? nextRows : [{ ...EMPTY_ROW }]);
  };

  if (isMobile) {
    return (
      <Stack spacing={1}>
        {rows.map((row, idx) => (
          <Card variant="outlined" key={idx} sx={{ borderRadius: 2.5 }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Subject {idx + 1}</Typography>
                  <IconButton size="small" onClick={() => removeRow(idx)} aria-label="remove subject">
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
                <TextField size="small" label="Subject name" value={row.subject} onChange={(e) => update(idx, 'subject', e.target.value)} fullWidth />
                <Grid container spacing={1}>
                  <Grid item xs={6}><TextField size="small" label="Obtained" type="number" value={row.marksObtained} onChange={(e) => update(idx, 'marksObtained', e.target.value)} fullWidth /></Grid>
                  <Grid item xs={6}><TextField size="small" label="Max" type="number" value={row.maxMarks} onChange={(e) => update(idx, 'maxMarks', e.target.value)} fullWidth /></Grid>
                </Grid>
                <TextField size="small" label="Subject code (optional)" value={row.code || ''} onChange={(e) => update(idx, 'code', e.target.value)} fullWidth />
              </Stack>
            </CardContent>
          </Card>
        ))}
        <Button startIcon={<Add />} variant="outlined" onClick={addRow}>Add subject</Button>
      </Stack>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Code (optional)</TableCell>
              <TableCell>Obtained</TableCell>
              <TableCell>Max</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell><TextField size="small" value={row.subject} onChange={(e) => update(idx, 'subject', e.target.value)} fullWidth /></TableCell>
                <TableCell><TextField size="small" value={row.code || ''} onChange={(e) => update(idx, 'code', e.target.value)} fullWidth /></TableCell>
                <TableCell><TextField size="small" type="number" value={row.marksObtained} onChange={(e) => update(idx, 'marksObtained', e.target.value)} fullWidth /></TableCell>
                <TableCell><TextField size="small" type="number" value={row.maxMarks} onChange={(e) => update(idx, 'maxMarks', e.target.value)} fullWidth /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => removeRow(idx)} aria-label="remove subject">
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button sx={{ mt: 1 }} startIcon={<Add />} variant="outlined" onClick={addRow}>Add subject row</Button>
    </Box>
  );
}
