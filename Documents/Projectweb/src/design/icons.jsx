// Minimal line icons (1.75 stroke) — designed for soft pastel theme
const Icon = ({ children, size = 20, stroke = "currentColor", strokeWidth = 1.75, fill = "none", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

export const IconHome = (p) => <Icon {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V10"/><path d="M10 20v-5h4v5"/></Icon>;
export const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.8-3.5 4-5.5 7.5-5.5s6.7 2 7.5 5.5"/></Icon>;
export const IconUsers = (p) => <Icon {...p}><circle cx="9" cy="9" r="3"/><path d="M3 19c.7-3 3.2-4.5 6-4.5s5.3 1.5 6 4.5"/><path d="M16 4.5a3 3 0 0 1 0 6"/><path d="M18.5 14.5c2.2.5 3.8 2.2 4.3 4.5"/></Icon>;
export const IconWallet = (p) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none"/></Icon>;
export const IconCard = (p) => <Icon {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M7 15h4"/></Icon>;
export const IconWrench = (p) => <Icon {...p}><path d="M14.5 6.5a3.5 3.5 0 1 1 3 5.9l-8 8a2 2 0 0 1-2.8-2.8l8-8a3.5 3.5 0 0 1-.2-3.1z"/><circle cx="8" cy="17" r=".8" fill="currentColor" stroke="none"/></Icon>;
export const IconBuilding = (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2"/><path d="M10 21v-3h4v3"/></Icon>;
export const IconChart = (p) => <Icon {...p}><path d="M4 20V8"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M3 20h18"/></Icon>;
export const IconLock = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>;
export const IconBell = (p) => <Icon {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></Icon>;
export const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></Icon>;
export const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const IconCheck = (p) => <Icon {...p}><path d="m5 12 4.5 4.5L19 7"/></Icon>;
export const IconX = (p) => <Icon {...p}><path d="m6 6 12 12M18 6 6 18"/></Icon>;
export const IconArrowLeft = (p) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></Icon>;
export const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>;
export const IconChevR = (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>;
export const IconChevL = (p) => <Icon {...p}><path d="m15 6-6 6 6 6"/></Icon>;
export const IconCal = (p) => <Icon {...p}><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></Icon>;
export const IconPhone = (p) => <Icon {...p}><path d="M5 4.5a1.5 1.5 0 0 1 1.5-1.5h2L10 7l-2 1.5a11 11 0 0 0 5.5 5.5L15 12l3.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5C10.6 17 5 11.4 5 4.5z"/></Icon>;
export const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>;
export const IconLogout = (p) => <Icon {...p}><path d="M9 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></Icon>;
export const IconSparkle = (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></Icon>;
export const IconWifi = (p) => <Icon {...p}><path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></Icon>;
export const IconSnow = (p) => <Icon {...p}><path d="M12 3v18M5 7l14 10M5 17l14-10"/><path d="m9 4 3 3 3-3M9 20l3-3 3 3M2 9l3 1 1 3M18 11l3-1 1-3M2 15l1 3 3 1M22 15l-3 1-1 3"/></Icon>;
export const IconFridge = (p) => <Icon {...p}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M9 6v2M9 13v3"/></Icon>;
export const IconBalcony = (p) => <Icon {...p}><path d="M4 21h16M6 21V11M18 21V11M10 21V11M14 21V11M4 11h16M9 11V5h6v6"/></Icon>;
export const IconTV = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></Icon>;
export const IconWasher = (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><circle cx="8" cy="6" r=".5" fill="currentColor"/><circle cx="11" cy="6" r=".5" fill="currentColor"/></Icon>;
export const IconHanger = (p) => <Icon {...p}><path d="M12 7a2 2 0 1 1 2-2"/><path d="M12 7v3l-9 6.5a1 1 0 0 0 .6 1.8h16.8a1 1 0 0 0 .6-1.8L12 10"/></Icon>;
export const IconKitchen = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M7 6v0M11 6v0M9 13v5M15 13v5"/><circle cx="9" cy="13" r=".5" fill="currentColor"/><circle cx="15" cy="13" r=".5" fill="currentColor"/></Icon>;
export const IconCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="8"/></Icon>;
export const IconDot = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></Icon>;
export const IconTrash = (p) => <Icon {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/></Icon>;
export const IconEdit = (p) => <Icon {...p}><path d="M14 4l6 6L9.5 20.5 3 21l.5-6.5L14 4z"/></Icon>;
export const IconTrend = (p) => <Icon {...p}><path d="m3 17 6-6 4 4 8-9"/><path d="M14 6h7v7"/></Icon>;
export const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></Icon>;
export const IconBookmark = (p) => <Icon {...p}><path d="M6 4h12v17l-6-4-6 4z"/></Icon>;
export const IconBack = (p) => <Icon {...p}><path d="M15 6 9 12l6 6"/></Icon>;
export const IconStar = (p) => <Icon {...p}><path d="m12 3 2.7 5.5 6 .9-4.3 4.3 1 6L12 17l-5.4 2.7 1-6-4.3-4.3 6-.9z"/></Icon>;
export const IconDownload = (p) => <Icon {...p}><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></Icon>;
export const IconFilter = (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>;
export const IconKey = (p) => <Icon {...p}><circle cx="8" cy="14" r="4"/><path d="m11 12 9-9M16 7l3 3"/></Icon>;

export const DI = {
  IconHome, IconUser, IconUsers, IconWallet, IconCard, IconWrench, IconBuilding,
  IconChart, IconLock, IconBell, IconSearch, IconPlus, IconCheck, IconX,
  IconArrowLeft, IconArrowRight, IconChevR, IconChevL, IconCal, IconPhone,
  IconSettings, IconLogout, IconSparkle, IconWifi, IconSnow, IconFridge,
  IconBalcony, IconTV, IconWasher, IconHanger, IconKitchen, IconCircle, IconDot,
  IconTrash, IconEdit, IconTrend, IconClock, IconBookmark, IconBack, IconStar,
  IconDownload, IconFilter, IconKey,
};

export const amenityIcon = (a) => ({
  "แอร์": IconSnow, "ตู้เย็น": IconFridge, "Wi-Fi": IconWifi, "ระเบียง": IconBalcony,
  "ครัว": IconKitchen, "เครื่องซัก": IconWasher, "เคเบิล TV": IconTV, "ตู้เสื้อผ้า": IconHanger,
}[a] || IconDot);
