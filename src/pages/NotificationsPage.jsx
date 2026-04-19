import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';
import { useLive } from '../context/LiveContext';

const donationInitial = { donorGuestId: '', amount: 0, mode: 'cash', note: '', receivedByUserId: '' };

export default function NotificationsPage() {
  const { events } = useLive();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donationForm, setDonationForm] = useState(donationInitial);

  const load = async () => {
    const [n, u, d] = await Promise.all([api.get('/notifications'), api.get('/users'), api.get('/donations')]);
    setNotifications(n.data); setUsers(u.data); setDonations(d.data);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (events.length) load(); }, [events.length]);

  const createDonation = async (e) => { e.preventDefault(); await api.post('/donations', donationForm); setDonationForm(donationInitial); load(); };
  const sendThanks = async (donation) => {
    await api.put(`/donations/${donation._id}`, { ...donation, thankYouStatus: 'SENT' });
    await api.post('/notifications', {
      title: 'WhatsApp thank-you sent',
      message: `Donation thank-you marked sent for ₹${donation.amount}.`,
      type: 'WHATSAPP',
      targetRoles: ['SUPER_ADMIN', 'ADMIN', 'SENIOR_TEAM'],
      readStatus: false
    });
    load();
  };

  return (
    <div className="page">
      <SectionTitle title="Notifications + Donation Thank-you Actions" subtitle="In-app live alerts are stored here. Donation entry can instantly trigger WhatsApp thank-you workflow." />
      <form className="panel form-grid" onSubmit={createDonation}>
        <select value={donationForm.donorGuestId} onChange={(e) => setDonationForm({ ...donationForm, donorGuestId: e.target.value })}><option value="">Donor guest</option>{users.filter((u) => u.eventDutyType === 'GUEST').map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
        <input type="number" placeholder="Amount" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: Number(e.target.value) })} />
        <select value={donationForm.mode} onChange={(e) => setDonationForm({ ...donationForm, mode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="cheque">Cheque</option><option value="promise">Promise</option></select>
        <input placeholder="Note" value={donationForm.note} onChange={(e) => setDonationForm({ ...donationForm, note: e.target.value })} />
        <select value={donationForm.receivedByUserId} onChange={(e) => setDonationForm({ ...donationForm, receivedByUserId: e.target.value })}><option value="">Received by</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
        <button className="primary" type="submit">Record donation</button>
      </form>

      <div className="grid two mt16">
        <div className="panel">
          <h3>Notifications</h3>
          <DataTable headers={['Title', 'Type', 'Message']} rows={notifications.map((n) => [n.title, n.type, n.message])} />
        </div>
        <div className="panel">
          <h3>Donation thank-you queue</h3>
          <DataTable headers={['Guest', 'Amount', 'Mode', 'Thank-you', 'Action']} rows={donations.map((d) => [d.donorGuestId?.name || '-', d.amount, d.mode, d.thankYouStatus, <button className="primary" onClick={() => sendThanks(d)}>Mark WhatsApp sent</button>])} />
        </div>
      </div>
    </div>
  );
}
