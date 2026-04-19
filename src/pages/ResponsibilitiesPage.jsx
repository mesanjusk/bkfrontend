import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function ResponsibilitiesPage() {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/teams'), api.get('/event-tasks')]).then(([t, k]) => {
      setTeams(t.data); setTasks(k.data);
    });
  }, []);

  return (
    <div className="page">
      <h2>Teams and Responsibilities</h2>
      <div className="grid two">
        <div className="panel">
          <h3>Event teams</h3>
          <DataTable
            headers={['Team', 'Lead', 'Purpose', 'Members']}
            rows={teams.map((x) => [x.name, x.leadUserId?.name || '-', x.purpose, (x.memberUserIds || []).map((m) => m.name).join(', ')])}
          />
        </div>
        <div className="panel">
          <h3>Task board</h3>
          <DataTable
            headers={['Task', 'Team', 'Assigned To', 'Backup', 'Priority', 'Status', 'Deadline']}
            rows={tasks.map((x) => [x.title, x.teamId?.name || '-', x.assignedToUserId?.name || '-', x.backupUserId?.name || '-', x.priority, x.status, x.deadlineLabel || '-'])}
          />
        </div>
      </div>
    </div>
  );
}
