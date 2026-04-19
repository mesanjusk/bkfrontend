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

  useEffect(() => {
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
    return () => subs.forEach(({ name, fn }) => socket.off(name, fn));
  }, [user]);

  const value = useMemo(() => ({ events, latestPopup, clearPopup: () => setLatestPopup(null) }), [events, latestPopup]);
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export const useLive = () => useContext(LiveContext);
