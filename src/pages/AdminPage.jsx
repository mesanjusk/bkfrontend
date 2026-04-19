import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/roles')]).then(([u, r]) => {
      setUsers(u.data);
      setRoles(r.data);
    });
  }, []);

  return (
    <div className="page">
      <h2>Admin View</h2>
      <div className="grid two">
        <div className="panel">
          <h3>Available roles</h3>
          <DataTable headers={['Role', 'Code', 'Dashboard']} rows={roles.map((r) => [r.name, r.code, r.dashboardKey])} />
        </div>
        <div className="panel">
          <h3>Users</h3>
          <DataTable headers={['Name', 'Username', 'Role', 'Duty', 'Status']} rows={users.map((u) => [u.name, u.username, u.roleId?.name || '-', u.eventDutyType, u.availabilityStatus])} />
        </div>
      </div>
    </div>
  );
}
