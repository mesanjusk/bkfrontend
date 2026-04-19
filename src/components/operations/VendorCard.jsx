import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import { Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import PaymentStatusChip from './PaymentStatusChip';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function VendorCard({ vendor, onOpen, onMenu }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>{vendor.name || 'Unnamed vendor'}</Typography>
            <IconButton size="small" onClick={(e) => onMenu?.(e, vendor)}><MoreVertRounded fontSize="small" /></IconButton>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={vendor.vendorType || 'General'} />
            <PaymentStatusChip status={vendor.paymentStatus} dueAmount={vendor.dueAmount} />
            {Number(vendor.dueAmount || 0) > 0 ? <Chip size="small" color="warning" label={`Due ${money(vendor.dueAmount)}`} /> : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">Contact: {vendor.contactPerson || '-'} <PhoneRounded sx={{ fontSize: 14, verticalAlign: 'middle', ml: 0.5, mr: 0.5 }} /> {vendor.mobile || '-'}</Typography>
          <Typography variant="body2">Quoted: {money(vendor.quotedAmount)} • Final: {money(vendor.finalAmount)}</Typography>
          <Typography variant="body2">Advance: {money(vendor.advancePaid)} • Due: {money(vendor.dueAmount)}</Typography>
          <Typography variant="caption" color="text.secondary">Budget: {vendor.budgetHeadId?.title || '-'} • Owner: {vendor.responsibleUserId?.name || '-'}</Typography>
          <Typography variant="caption" onClick={() => onOpen?.(vendor)} color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>Open vendor details</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
