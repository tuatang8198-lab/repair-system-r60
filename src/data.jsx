// ============ Constants ============
const STATUS = {
  NEW:    { key:"NEW",    label:"รับเรื่อง",      cls:"s-new"  },
  PROG:   { key:"PROG",   label:"กำลังซ่อม",     cls:"s-prog" },
  WAIT:   { key:"WAIT",   label:"รออะไหล่",      cls:"s-wait" },
  DONE:   { key:"DONE",   label:"ซ่อมเสร็จ",     cls:"s-done" },
  CANCEL: { key:"CANCEL", label:"ยกเลิก",        cls:"s-cancel" },
};
const STATUS_ORDER = ["NEW","PROG","WAIT","DONE","CANCEL"];

const PRIORITY = {
  LOW:  { key:"LOW",  label:"ปกติ",     color:"#9aa0c5" },
  MED:  { key:"MED",  label:"เร่งด่วน", color:"#ffb547" },
  HIGH: { key:"HIGH", label:"วิกฤติ",   color:"#ff6b8a" },
};

const DEPARTMENTS = [
  "ห้องคอมพิวเตอร์ 1", "ห้องคอมพิวเตอร์ 2", "ห้องสมุด", "ห้องพยาบาล",
  "ห้องธุรการ", "ห้องวิชาการ", "ห้องการเงิน", "ห้องผู้อำนวยการ",
  "อาคารเรียน 1", "อาคารเรียน 2", "อาคารเรียน 3",
  "หอพักนักเรียนชาย", "หอพักนักเรียนหญิง", "โรงอาหาร",
];

const DEVICE_TYPES = [
  { key:"DESKTOP", label:"คอมพิวเตอร์ตั้งโต๊ะ", icon:"🖥" },
  { key:"LAPTOP",  label:"โน้ตบุ๊ก",            icon:"💻" },
  { key:"PRINTER", label:"เครื่องพิมพ์",        icon:"🖨" },
  { key:"PROJECT", label:"โปรเจคเตอร์",         icon:"📽" },
  { key:"NETWORK", label:"ระบบเครือข่าย",       icon:"📡" },
  { key:"OTHER",   label:"อื่น ๆ",              icon:"⚙" },
];

const TECHNICIANS = [
  { id:"T01", name:"ครูสมชาย วิเชียร",  load: 3 },
  { id:"T02", name:"ครูพิมพ์ใจ ศรีดา",    load: 5 },
  { id:"T03", name:"นายเอกชัย รัตนกุล",   load: 2 },
];

// ============ Supabase client ============
const { createClient } = window.supabase;
const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ============ Helpers ============
const makeId = () => {
  const y = String(new Date().getFullYear()+543).slice(-2);
  const r = Math.floor(Math.random()*9000+1000);
  return `R60-${y}-${r}`;
};

// Map DB row (snake_case) → app object (camelCase)
const mapRow = (r) => ({
  id:         r.id,
  title:      r.title,
  deviceType: r.device_type,
  asset:      r.asset,
  department: r.department,
  reporter:   r.reporter,
  contact:    r.contact,
  priority:   r.priority,
  detail:     r.detail,
  status:     r.status,
  tech:       r.tech,
  images:     r.images  || [],
  history:    r.history || [],
  createdAt:  r.created_at,
  updatedAt:  r.updated_at,
});

// Time helpers
const fmtDate = (ts) => {
  const d = new Date(ts);
  const m = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
};
const fmtTime = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} น.`;
};
const fmtDateTime = (ts) => `${fmtDate(ts)} · ${fmtTime(ts)}`;
const ago = (ts) => {
  const s = Math.floor((Date.now()-ts)/1000);
  if (s < 60) return "เมื่อสักครู่";
  const m = Math.floor(s/60); if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m/60); if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const d = Math.floor(h/24); if (d < 30) return `${d} วันที่แล้ว`;
  return fmtDate(ts);
};

Object.assign(window, {
  STATUS, STATUS_ORDER, PRIORITY, DEPARTMENTS, DEVICE_TYPES, TECHNICIANS,
  db, makeId, mapRow,
  fmtDate, fmtTime, fmtDateTime, ago,
});
