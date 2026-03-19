import { useState, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(() => typeof Notification !== 'undefined' ? Notification.permission : 'default');

  const requestPermission = useCallback(async () => {
    if(typeof Notification === 'undefined') return 'denied';
    const r = await Notification.requestPermission();
    setPermission(r); return r;
  }, []);

  const send = useCallback((title, opts={}) => {
    if(permission !== 'granted') return null;
    try { return new Notification(title, { icon:'/icons/icon-192.png', ...opts }); }
    catch { return null; }
  }, [permission]);

  return { permission, requestPermission, send };
}
