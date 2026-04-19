import { Box, Card, CardContent, Typography } from '@mui/material';
import SectionTitle from '../components/SectionTitle';

const text = `MASTER FLOW AND FEATURES CHART

1. CORE APP FLOW
- PWA opens in planning mode before event day
- User logs in with role-based access
- Dashboard loads according to role and event duty
- Admin/Senior Team configure event, categories, guests, teams, vendors, budgets and tasks
- Student uploads form, result image, photo and certificate preview adjustments
- System runs parsing/extraction and board logic like CBSE Best 5
- Student is marked Eligible / Not Eligible / Review Needed
- Eligible students enter award stage sequence
- Category-wise pre-decided anchor is attached automatically
- Preferred guest is attached, but can be changed live by senior team
- Team member and volunteer assignments are tracked with counts
- On event day, app enters live mode with Socket.IO sync
- Anchor gets instant popup if guest changes
- Donation entry can be created instantly
- WhatsApp thank-you can be triggered instantly
- Guest / volunteer / team certificates can be sent on or after event
- Budget vs actual expense, vendors and responsibility tasks remain visible throughout event lifecycle`;

export default function SystemFlowPage() {
  return (
    <Box>
      <SectionTitle title="Complete System Flow" subtitle="Reference map for planning mode, live event mode, and role-wise responsibilities." />
      <Card><CardContent>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0, fontSize: 14 }}>{text}</Typography>
      </CardContent></Card>
    </Box>
  );
}
