import { useEffect, useState } from 'react';
import api from '../api';
import SummaryCard from '../components/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { events } = useLive();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setSummary(res.data));
  }, []);

  return (
    <div className="page">
      <h2>{user?.roleId?.name} Dashboard</h2>
      <div className="grid">
        <SummaryCard title="Students" value={summary?.students || 0} />
        <SummaryCard title="Eligible" value={summary?.eligibleStudents || 0} />
        <SummaryCard title="Stage Assignments" value={summary?.stageAssignments || 0} />
        <SummaryCard title="Budget Heads" value={summary?.budgetHeads || 0} />
        <SummaryCard title="Vendors" value={summary?.vendors || 0} />
        <SummaryCard title="Tasks" value={summary?.tasks || 0} />
        <SummaryCard title="Allowed Budget" value={`₹${summary?.totalAllowedBudget || 0}`} />
        <SummaryCard title="Actual Expense" value={`₹${summary?.totalActualExpense || 0}`} />
      </div>

      <div className="grid two">
        <div className="panel">
          <h3>Role-wise quick view</h3>
          <ul className="plain">
            <li>Dashboard key: {user?.roleId?.dashboardKey}</li>
            <li>Duty type: {user?.eventDutyType}</li>
            <li>Permissions: {(user?.roleId?.permissions || []).join(', ') || 'None'}</li>
            <li>Pending tasks: {summary?.pendingTasks || 0}</li>
            <li>Notifications: {summary?.notifications || 0}</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Live event feed</h3>
          <div className="feed">
            {events.map((item, idx) => (
              <div className="feed-item" key={idx}>
                <strong>{item.name}</strong>
                <div className="small">{JSON.stringify(item.payload)}</div>
              </div>
            ))}
            {!events.length ? <div className="small">No live events yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
