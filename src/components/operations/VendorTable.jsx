import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import PaymentStatusChip from './PaymentStatusChip';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function VendorTable({ vendors, onOpen, onMenu }) {
  return (
    <Table size="small">
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
        {vendors.map((vendor) => (
          <TableRow key={vendor._id} hover onClick={() => onOpen?.(vendor)} sx={{ cursor: 'pointer' }}>
            <TableCell>
              <Typography fontWeight={600}>{vendor.name}</Typography>
            </TableCell>
            <TableCell>{vendor.vendorType || '-'}</TableCell>
            <TableCell>{vendor.contactPerson || '-'} / {vendor.mobile || '-'}</TableCell>
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
  );
}
