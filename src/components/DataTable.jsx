import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

export default function DataTable({ headers = [], rows = [] }) {
  return (
    <Card variant="outlined" sx={{ borderColor: '#e2e8f0' }}>
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>{headers.map((h) => <TableCell key={h}><strong>{h}</strong></TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {rows.length ? rows.map((row, idx) => (
                <TableRow key={idx}>{row.map((col, cidx) => <TableCell key={cidx}>{col}</TableCell>)}</TableRow>
              )) : (
                <TableRow><TableCell colSpan={headers.length}><Typography variant="body2">No data</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
