import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import SummaryCard from '../components/SummaryCard';
import SectionTitle from '../components/SectionTitle';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { events, latestPopup, clearPopup } = useLive();
  const [summary, setSummary] = useState(null);
  const [liveBoard, setLiveBoard] = useState({ assignments: [], guests: [], anchors: [], current: null });

  const load = async () => {
    const [s, b] = await Promise.all([
      api.get('/dashboard/summary'),
      api.get('/stage-assignments/live-board')
    ]);
    setSummary(s.data);
    setLiveBoard(b.data);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (events.length) load(); }, [events.length]);

  const roleMessage = useMemo(() => {
    const code = user?.roleId?.code;
    if (code === 'ANCHOR') return 'Anchor dashboard focuses only on category-wise stage flow and live guest changes.';
    if (code === 'SENIOR_TEAM') return 'Senior team controls live guest replacement, donations and instant thank-you actions.';
    if (code === 'TEAM_LEADER') return 'Team leader view focuses on team execution, due tasks and stage readiness.';
    if (code === 'VOLUNTEER') return 'Volunteer view should stay simple: readiness, student support and assigned tasks.';
    return 'Planning mode is used before event day. Switch to live mode on event day and trust server + sockets.';
  }, [user]);

  const currentAssignment = liveBoard.current;
  const taskRows = [
    ['Planning Mode Rule', 'Manual sync + local cache okay'],
    ['Event Day Rule', 'Server truth + sockets + auto refresh'],
    ['Current Event Mode', summary?.latestEvent?.mode || 'PLANNING'],
    ['Current User Role', `${summary?.currentUserRole || '-'} / ${summary?.currentUserDuty || '-'}`]
  ];

  return (
    <div className="page">
      <SectionTitle title="Master Dashboard" subtitle={roleMessage} />

      {latestPopup ? (
        <div className="panel warning-panel">
          <div className="row between"><strong>{latestPopup.payload?.title || 'Live popup'}</strong><button onClick={clearPopup}>Dismiss</button></div>
          <div>{latestPopup.payload?.message || 'A live event update was received.'}</div>
        </div>
      ) : null}

      <div className="grid">
        <SummaryCard title="Students" value={summary?.students || 0} subtitle={`${summary?.eligibleStudents || 0} eligible / ${summary?.reviewStudents || 0} review`} />
        <SummaryCard title="Stage Assignments" value={summary?.stageAssignments || 0} subtitle={`${summary?.liveAssignments || 0} currently live`} />
        <SummaryCard title="Notifications" value={summary?.notifications || 0} subtitle={`${events.length} live events received`} />
        <SummaryCard title="Vendors" value={summary?.vendors || 0} subtitle={`${summary?.pendingTasks || 0} tasks pending`} />
        <SummaryCard title="Allowed Budget" value={`₹${summary?.totalAllowedBudget || 0}`} subtitle={`Actual ₹${summary?.totalActualExpense || 0}`} />
        <SummaryCard title="Available Guests" value={summary?.availableGuests || 0} subtitle="Expected / available / early arrived" tone="success" />
      </div>

      <div className="grid two mt16">
        <div className="panel">
          <h3>Current live sequence</h3>
          {currentAssignment ? (
            <div className="stack gap8">
              <div><strong>Student:</strong> {currentAssignment.studentId?.fullName}</div>
              <div><strong>Category:</strong> {currentAssignment.categoryId?.title}</div>
              <div><strong>Anchor:</strong> {currentAssignment.actualAnchorId?.name || currentAssignment.plannedAnchorId?.name || '-'}</div>
              <div><strong>Guest:</strong> {currentAssignment.actualGuestId?.name || currentAssignment.plannedGuestId?.name || '-'}</div>
              <div><strong>Status:</strong> <span className="pill">{currentAssignment.status}</span></div>
            </div>
          ) : <div className="small">No live assignment yet.</div>}
        </div>

        <div className="panel">
          <h3>Planning vs live rule</h3>
          <DataTable headers={['Key', 'Value']} rows={taskRows} />
        </div>
      </div>

      <div className="grid two mt16">
        <div className="panel">
          <h3>Recent live feed</h3>
          <div className="feed">
            {events.length ? events.map((item, idx) => (
              <div key={idx} className="feed-item">
                <strong>{item.name}</strong>
                <div className="small">{new Date(item.at).toLocaleString()}</div>
                <pre className="code mini">{JSON.stringify(item.payload, null, 2)}</pre>
              </div>
            )) : <div className="small">No live events received yet.</div>}
          </div>
        </div>

        <div className="panel">
          <h3>Available guests now</h3>
          <DataTable
            headers={['Guest', 'Status', 'Guest Awards']}
            rows={(liveBoard.guests || []).map((guest) => [guest.name, guest.availabilityStatus, guest.stageCounts?.guestAwards || 0])}
          />
        </div>
      </div>
    </div>
  );
}
