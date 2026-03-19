/**
 * storage.js — LocalStorage persistence with typed helpers and schema defaults.
 */
const NS = 'zenith:';

export const get    = (key, fallback = null) => { try { const r = localStorage.getItem(NS+key); return r !== null ? JSON.parse(r) : fallback; } catch { return fallback; } };
export const set    = (key, value) => { try { localStorage.setItem(NS+key, JSON.stringify(value)); return true; } catch { return false; } };
export const remove = (key) => localStorage.removeItem(NS+key);

export const DEFAULT_SETTINGS = {
  theme:'dark', mode:'work', environment:'rain',
  ambientVolume:0.5, focusDuration:25, breakDuration:5,
  longBreakDuration:15, sessionsBeforeLongBreak:4,
  notifications:true, soundAlerts:true,
  autoStartBreak:false, autoStartFocus:false,
};

export const DEFAULT_STREAK = { current:0, longest:0, lastSessionDate:null, milestones:[] };

/* Settings */
export const getSettings  = ()  => ({ ...DEFAULT_SETTINGS, ...get('settings', {}) });
export const saveSettings = (s) => set('settings', { ...getSettings(), ...s });

/* Sessions */
export const getSessions = () => get('sessions', []);

export const addSession = (session) => {
  const sessions = getSessions();
  const record = { id:Date.now().toString(36), date:toDateString(new Date()), timestamp:Date.now(), ...session };
  sessions.push(record);
  const cutoff = Date.now() - 365*24*60*60*1000;
  set('sessions', sessions.filter((s) => s.timestamp > cutoff));
  return record;
};

export const getSessionsByDate       = (d)  => getSessions().filter((s) => s.date === d);
export const getSessionsGroupedByDate = ()  =>
  getSessions().reduce((acc, s) => { acc[s.date] = acc[s.date]||[]; acc[s.date].push(s); return acc; }, {});

/* Streak */
export const getStreak = () => ({ ...DEFAULT_STREAK, ...get('streak', {}) });

export const updateStreak = () => {
  const streak = getStreak();
  const today     = toDateString(new Date());
  const yesterday = toDateString(new Date(Date.now() - 86400000));
  let { current, longest, lastSessionDate, milestones } = streak;

  if (lastSessionDate === today) return { streak:current, isNew:false, milestone:null };
  current = lastSessionDate === yesterday ? current + 1 : 1;
  if (current > longest) longest = current;

  const MILESTONES = [3,7,14,21,30,60,100,200,365];
  let milestone = null;
  if (MILESTONES.includes(current) && !milestones.includes(current)) {
    milestones = [...milestones, current];
    milestone  = current;
  }
  set('streak', { current, longest, lastSessionDate:today, milestones });
  return { streak:current, isNew:true, milestone };
};

/* Heatmap */
export const buildHeatmapData = (weeks = 26) => {
  const grouped = getSessionsGroupedByDate();
  const result  = [];
  const now     = new Date();
  for (let i = weeks*7-1; i >= 0; i--) {
    const d   = new Date(now); d.setDate(d.getDate() - i);
    const str = toDateString(d);
    const day = grouped[str] || [];
    result.push({ date:str, count:day.length, minutes:day.reduce((s,x)=>s+(x.duration||0),0), sessions:day });
  }
  return result;
};

/* Stats */
export const getTotalStats = () => {
  const completed    = getSessions().filter((s) => s.completed);
  const totalMinutes = completed.reduce((s,x) => s+(x.duration||0), 0);
  const byMode       = completed.reduce((acc,s) => { acc[s.mode]=(acc[s.mode]||0)+1; return acc; }, {});
  return { totalSessions:completed.length, totalMinutes, totalHours:Math.floor(totalMinutes/60), byMode, today:getSessionsByDate(toDateString(new Date())).filter((s)=>s.completed).length };
};

export const toDateString = (date) =>
  [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');

export const clearAll = () => ['settings','sessions','streak'].forEach(remove);
