import { useLive } from '../context/LiveContext';

export default function NotificationsPage() {
  const { events } = useLive();

  return (
    <div className="page">
      <h2>Notifications & Live Alerts</h2>
      <div className="panel">
        <p>PWA push subscription UI is not fully implemented yet, but this page already shows live in-app event alerts from Socket.IO.</p>
      </div>
      <div className="feed">
        {events.map((item, idx) => (
          <div className="feed-item" key={idx}>
            <div><strong>{item.name}</strong></div>
            <div className="small">{item.at}</div>
            <pre className="code">{JSON.stringify(item.payload, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
