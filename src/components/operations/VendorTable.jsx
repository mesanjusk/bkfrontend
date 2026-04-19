import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PaymentStatusChip from './PaymentStatusChip';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function VendorTable({ vendors, onOpen, onMenu }) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Vendor</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Quoted / Final</TableCell>
            <TableCell>Advance / Due</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Budget Head</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!vendors.length ? (
            <TableRow>
              <TableCell colSpan={9}>
                <Typography variant="body2" color="text.secondary">No vendors found for the current filters.</Typography>
              </TableCell>
            </TableRow>
          ) : null}
          {vendors.map((vendor) => (
            <TableRow key={vendor._id} hover onClick={() => onOpen?.(vendor)} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{vendor.name}</Typography>
              </TableCell>
              <TableCell>{vendor.vendorType || '-'}</TableCell>
              <TableCell sx={{ whiteSpace: 'normal' }}>{vendor.contactPerson || '-'} / {vendor.mobile || '-'}</TableCell>
              <TableCell>{money(vendor.quotedAmount)} / {money(vendor.finalAmount)}</TableCell>
              <TableCell sx={{ color: Number(vendor.dueAmount || 0) > 0 ? 'warning.main' : 'success.main' }}>{money(vendor.advancePaid)} / {money(vendor.dueAmount)}</TableCell>
              <TableCell><PaymentStatusChip status={vendor.paymentStatus} dueAmount={vendor.dueAmount} /></TableCell>
              <TableCell>{vendor.budgetHeadId?.title || '-'}</TableCell>
              <TableCell>{vendor.responsibleUserId?.name || vendor.responsibleTeamId?.name || '-'}</TableCell>
              <TableCell align="right"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onMenu?.(e, vendor); }}><MoreVertRounded fontSize="small" /></IconButton></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
