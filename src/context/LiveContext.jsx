import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { socket } from '../socket';
import { useAuth } from './AuthContext';

const LiveContext = createContext();
const socketEvents = [
  'student_form_submitted',
  'student_parsed',
  'student_eligible',
  'guest_changed',
  'anchor_popup',
  'stage_assignment_updated',
  'stage_sequence_generated',
  'budget_updated',
  'donation_added',
  'donation_thankyou_pending',
  'notification_created'
];

export function LiveProvider({ children }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [latestPopup, setLatestPopup] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(socket.connected ? 'connected' : 'reconnecting');

  useEffect(() => {
    const handleConnect = () => setConnectionStatus('connected');
    const handleReconnect = () => setConnectionStatus('reconnecting');
    const handleDisconnect = () => setConnectionStatus('offline');

    socket.on('connect', handleConnect);
    socket.on('reconnect_attempt', handleReconnect);
    socket.on('disconnect', handleDisconnect);

    const subs = socketEvents.map((name) => {
      const fn = (payload) => {
        const item = { name, payload, at: new Date().toISOString() };
        setEvents((prev) => [item, ...prev].slice(0, 50));
        if (name === 'anchor_popup') setLatestPopup(item);
      };
      socket.on(name, fn);
      return { name, fn };
    });

    if (user?.roleId?.code) socket.emit('join-role-room', user.roleId.code);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('reconnect_attempt', handleReconnect);
      socket.off('disconnect', handleDisconnect);
      subs.forEach(({ name, fn }) => socket.off(name, fn));
    };
  }, [user]);

  const value = useMemo(
    () => ({
      events,
      latestPopup,
      connectionStatus,
      clearPopup: () => setLatestPopup(null)
    }),
    [events, latestPopup, connectionStatus]
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export const useLive = () => useContext(LiveContext);
