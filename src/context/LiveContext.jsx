import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { socket } from '../socket';
import { useAuth } from './AuthContext';

const LiveContext = createContext();

export function LiveProvider({ children }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const names = ['student_form_submitted','student_eligible','guest_changed','anchor_popup','stage_assignment_updated'];
    const handler = (name) => (payload) => setEvents((prev) => [{ name, payload, at: new Date().toISOString() }, ...prev].slice(0, 30));
    const subscriptions = names.map((name) => {
      const fn = handler(name);
      socket.on(name, fn);
      return { name, fn };
    });

    if (user?.roleId?.code) socket.emit('join-role-room', user.roleId.code);

    return () => {
      subscriptions.forEach(({ name, fn }) => socket.off(name, fn));
    };
  }, [user]);

  const value = useMemo(() => ({ events }), [events]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export const useLive = () => useContext(LiveContext);
