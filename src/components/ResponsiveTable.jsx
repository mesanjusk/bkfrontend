import { Card, CardContent, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ResponsiveTable({ columns, rows, mobileTitleKey = 'title' }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  if (mobile) {
    return (
      <Stack spacing={1.5}>
        {rows.map((row, idx) => (
          <Card key={idx}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>{row[mobileTitleKey] || `Row ${idx + 1}`}</Typography>
              <Stack spacing={1}>
                {columns.map((col) => (
                  <Box key={col.key}>
                    <Typography variant="caption" color="text.secondary">{col.label}</Typography>
                    <Box sx={{ mt: 0.25 }}>{typeof row[col.key] === 'function' ? row[col.key]() : row[col.key]}</Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }
  return (
    <TableContainer component={Card}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => <TableCell key={col.key}>{col.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx} hover>
              {columns.map((col) => <TableCell key={col.key}>{typeof row[col.key] === 'function' ? row[col.key]() : row[col.key]}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
