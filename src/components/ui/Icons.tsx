/* 線画アイコン（stroke は親の color を継承） */
const base = { viewBox: '0 0 24 24', 'aria-hidden': true } as const;

export const IconHome = () => (
  <svg {...base}><path d="M3 11L12 3l9 8v10h-6v-6H9v6H3z" /></svg>
);
export const IconCalendar = () => (
  <svg {...base}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
);
export const IconLive = () => (
  <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconBoard = () => (
  <svg {...base}><path d="M4 5h16v11H8l-4 4z" /></svg>
);
export const IconMore = () => (
  <svg {...base}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>
);
export const IconTicket = () => (
  <svg {...base}><path d="M3 9a2 2 0 0 0 2-2V5h14v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2H5v-2a2 2 0 0 0-2-2z" /><path d="M13 5v14" strokeDasharray="2 2" /></svg>
);
export const IconPlay = () => (
  <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3z" /></svg>
);
export const IconMap = () => (
  <svg {...base}><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg>
);
export const IconBack = () => (
  <svg {...base}><path d="M15 5l-7 7 7 7" /></svg>
);
export const IconExternal = () => (
  <svg {...base}><path d="M14 4h6v6M20 4l-9 9" /><path d="M19 13v6H5V5h6" /></svg>
);
export const IconCalendarAdd = () => (
  <svg {...base}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4M12 12v6M9 15h6" /></svg>
);
export const IconSun = () => (
  <svg {...base}><circle cx="12" cy="13" r="4.5" /><path d="M12 3v2.5M5.6 6.6l1.8 1.8M3 13h2.5M18.4 6.6l-1.8 1.8M21 13h-2.5M5 20h14" /></svg>
);
