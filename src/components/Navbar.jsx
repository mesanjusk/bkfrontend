import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/categories', label: 'Categories' },
  { to: '/stage', label: 'Live Stage' },
  { to: '/budget', label: 'Budget & Vendors' },
  { to: '/responsibilities', label: 'Responsibilities' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/system-flow', label: 'System Flow' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const canSeeAdmin = ['SUPER_ADMIN', 'ADMIN', 'HOST'].includes(user?.roleId?.code);

  return (
    <div className="nav">
      <div>
        <div className="nav-title">Scholar Awards PWA</div>
        <div className="small">Role dashboard + planning mode + live event mode</div>
      </div>
      <div className="nav-links">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className={location.pathname === item.to ? 'active-link' : ''}>{item.label}</Link>
        ))}
        {canSeeAdmin ? <Link to="/admin" className={location.pathname === '/admin' ? 'active-link' : ''}>Admin</Link> : null}
        <span className="pill">{user?.roleId?.name || '-'} / {user?.eventDutyType || 'NONE'}</span>
        <button className="primary" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
