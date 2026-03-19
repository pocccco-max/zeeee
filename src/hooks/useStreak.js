import { useState, useCallback } from 'react';
import { getStreak, updateStreak } from '../utils/storage.js';

export function useStreak() {
  const [data, setData] = useState(() => getStreak());

  const recordSession = useCallback(() => {
    const result = updateStreak();
    setData(getStreak());
    return result;
  }, []);

  const refreshStreak = useCallback(() => setData(getStreak()), []);

  return { current:data.current, longest:data.longest, lastDate:data.lastSessionDate, milestones:data.milestones, recordSession, refreshStreak };
}
