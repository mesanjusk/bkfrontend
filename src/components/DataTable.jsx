import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

export default function DataTable({ headers = [], rows = [] }) {
  return (
    <Card variant="outlined" sx={{ borderColor: '#e2e8f0', overflow: 'hidden', borderRadius: 2.5 }}>
      <CardContent sx={{ p: 0 }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto', maxWidth: '100%' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>{headers.map((h) => <TableCell key={h} sx={{ whiteSpace: 'nowrap' }}><strong>{h}</strong></TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {rows.length ? rows.map((row, idx) => (
                <TableRow key={idx}>{row.map((col, cidx) => <TableCell key={cidx} sx={{ whiteSpace: 'normal', wordBreak: 'break-word', verticalAlign: 'top', overflowWrap: 'anywhere' }}>{col}</TableCell>)}</TableRow>
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
