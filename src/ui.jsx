// ============ Shared UI ============
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function Icon({ name, size = 18, stroke = 1.6 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "spark":return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>;
    case "wrench":return <svg {...common}><path d="M14.7 6.3a4 4 0 1 0 5 5L21 13l-2 2-7-7 .7-.7zM14 14l-7 7-3-3 7-7" /></svg>;
    case "search":return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    case "shield":return <svg {...common}><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3z" /></svg>;
    case "arrow":return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
    case "back":return <svg {...common}><path d="M19 12H5M11 5l-7 7 7 7" /></svg>;
    case "check":return <svg {...common}><path d="m5 12 5 5L20 7" /></svg>;
    case "x":return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case "user":return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "lock":return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
    case "logout":return <svg {...common}><path d="M15 12H4M11 5l-7 7 7 7" /><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /></svg>;
    case "list":return <svg {...common}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>;
    case "chart":return <svg {...common}><path d="M3 3v18h18M7 14v4M12 9v9M17 5v13" /></svg>;
    case "plus":return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "filter":return <svg {...common}><path d="M4 5h16l-6 8v6l-4-2v-4z" /></svg>;
    case "calendar":return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>;
    case "clock":return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "tool":return <svg {...common}><path d="M14.7 6.3a4 4 0 1 0 5 5L21 13l-2 2-7-7 .7-.7zM14 14l-7 7-3-3 7-7" /></svg>;
    case "alert":return <svg {...common}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>;
    case "device":return <svg {...common}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
    case "pin":return <svg {...common}><path d="M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>;
    case "spinner":return <svg {...common}><path d="M21 12a9 9 0 1 1-6.2-8.5" /></svg>;
    case "menu":return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
    case "ext":return <svg {...common}><path d="M14 5h5v5M9 15 19 5M19 13v6H5V5h6" /></svg>;
    case "phone":return <svg {...common}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" /></svg>;
    default:return null;
  }
}

function StatusPill({ status, animated = true }) {
  const s = STATUS[status] || STATUS.NEW;
  return (
    <span className={`status ${s.cls}`}>
      {animated && <span className="pulse" />}
      {s.label}
    </span>);

}

function PriorityChip({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.LOW;
  return (
    <span className="chip" style={{ color: p.color, borderColor: "rgba(255,255,255,0.1)" }}>
      <span className="dot" />{p.label}
    </span>);

}

function Toast({ msg, kind = "ok", onDone }) {
  useEffect(() => {const t = setTimeout(onDone, 2400);return () => clearTimeout(t);}, []);
  const color = kind === "ok" ? "var(--success)" : kind === "err" ? "var(--danger)" : "var(--info)";
  return (
    <div className="toast">
      <span style={{ color, fontSize: 18 }}>{kind === "ok" ? "✓" : kind === "err" ? "✕" : "•"}</span>
      <span>{msg}</span>
    </div>);

}

function TopBar({ user, onHome, onAdmin, onLogout }) {
  return (
    <div className="topbar">
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button className="brand" onClick={onHome} style={{ cursor: "pointer" }}>
          <div className="brand-mark"><img src="assets/logo.png" alt="Logo"/></div>
          <div style={{ textAlign: "left" }}>
            <div className="brand-title">ระบบแจ้งซ่อมคอมพิวเตอร์</div>
            <div className="brand-sub">โรงเรียนราชประชานุเคราะห์ 60 · จังหวัดเชียงใหม่</div>
          </div>
        </button>
        <div style={{ flex: 1 }} />
        <div className="row" style={{ gap: 8 }}>
          <span className="chip hide-sm">
            <span className="dot" style={{ color: "var(--success)" }} /> ระบบออนไลน์
          </span>
          {user ?
          <>
              <span className="chip" style={{ color: "var(--text)" }}>
                <Icon name="user" size={14} /> {user.name}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                <Icon name="logout" size={14} /> ออกจากระบบ
              </button>
            </> :

          <button className="btn btn-ghost btn-sm" onClick={onAdmin}>
              <Icon name="shield" size={14} /> เข้าสู่ระบบ
            </button>
          }
        </div>
      </div>
    </div>);

}

// Animated number
function CountUp({ value, duration = 900, suffix = "" }) {
  const [v, setV] = useState(0);
  const start = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    start.current = null;
    const from = 0,to = value;
    const tick = (t) => {
      if (!start.current) start.current = t;
      const p = Math.min(1, (t - start.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (to - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <>{v.toLocaleString("th-TH")}{suffix}</>;
}

// Sparkline (svg)
function Sparkline({ data, w = 120, h = 36, color = "var(--primary)" }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data),max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = i / (data.length - 1) * w;
    const y = h - (d - min) / range * h * 0.85 - h * 0.1;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  const gid = "sg-" + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>);

}

// Donut chart
function Donut({ data, size = 160, thickness = 22 }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} fill="none" />
      {data.map((d, i) => {
        const len = d.value / total * c;
        const dash = `${len} ${c - len}`;
        const off = -acc;
        acc += len;
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={r}
          stroke={d.color} strokeWidth={thickness} fill="none"
          strokeDasharray={dash} strokeDashoffset={off}
          strokeLinecap="butt"
          style={{ transition: "stroke-dasharray .9s ease, stroke-dashoffset .9s ease" }} />);


      })}
    </svg>);

}

// Bar chart vertical with animation
function BarChart({ data, color = "var(--primary)", height = 140 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "6px 0" }}>
      {data.map((d, i) =>
      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{
            width: "100%",
            height: `${d.value / max * 100}%`,
            background: `linear-gradient(180deg, ${color}, ${color}88)`,
            borderRadius: "8px 8px 4px 4px",
            boxShadow: `0 -4px 18px -4px ${color}aa`,
            transition: "height .9s cubic-bezier(.2,.7,.2,1)",
            position: "relative"
          }}>
              <div style={{
              position: "absolute", top: -22, left: 0, right: 0, textAlign: "center",
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)"
            }}>{d.value}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{d.label}</div>
        </div>
      )}
    </div>);

}

// Status timeline used on track + admin
function Timeline({ items }) {
  return (
    <div style={{ position: "relative", paddingLeft: 24 }}>
      <div style={{
        position: "absolute", left: 9, top: 6, bottom: 6, width: 2,
        background: "linear-gradient(180deg, var(--primary), transparent)"
      }} />
      {items.map((it, i) =>
      <div key={i} style={{ position: "relative", paddingBottom: i === items.length - 1 ? 0 : 18 }}>
          <div style={{
          position: "absolute", left: -19, top: 4,
          width: 14, height: 14, borderRadius: 99,
          background: i === items.length - 1 ? "var(--primary)" : "rgba(88,101,255,0.4)",
          border: "3px solid var(--bg)",
          boxShadow: i === items.length - 1 ? "0 0 0 4px rgba(88,101,255,0.2)" : "none"
        }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>{it.label}</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
            <span className="mono">{fmtDateTime(it.ts)}</span> · {it.by}
          </div>
          {it.note && <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.5 }}>{it.note}</div>}
        </div>
      )}
    </div>);

}

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(4,5,15,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "pageIn .25s ease"
    }} onClick={onClose}>
      <div className="glass" style={{ maxWidth: 560, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        {children}
      </div>
    </div>);

}

Object.assign(window, {
  Icon, StatusPill, PriorityChip, Toast, TopBar, CountUp, Sparkline, Donut, BarChart, Timeline, Modal, ImageGallery
});

// ============ Image gallery with lightbox ============
function ImageGallery({ images, size = 92 }) {
  const [open, setOpen] = useState(null);
  if (!images || !images.length) return null;
  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {images.map((img, i) =>
        <button key={i} onClick={() => setOpen(i)} style={{
          width: size, height: size, padding: 0,
          borderRadius: 10, overflow: "hidden",
          border: "1px solid var(--border)",
          background: "#000", cursor: "pointer",
          transition: "transform .15s, border-color .15s"
        }}
        onMouseEnter={(e) => {e.currentTarget.style.transform = "scale(1.04)";e.currentTarget.style.borderColor = "rgba(88,101,255,0.5)";}}
        onMouseLeave={(e) => {e.currentTarget.style.transform = "scale(1)";e.currentTarget.style.borderColor = "var(--border)";}}>
            <img src={img.url} alt={img.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </button>
        )}
      </div>

      {open !== null &&
      <div onClick={() => setOpen(null)} style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(2,3,12,0.92)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, animation: "pageIn .25s ease"
      }}>
          <button onClick={(e) => {e.stopPropagation();setOpen(null);}}
        style={{
          position: "absolute", top: 20, right: 20,
          width: 40, height: 40, borderRadius: 99,
          background: "rgba(255,255,255,0.08)", border: "1px solid var(--border-strong)",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
        }}>
            <Icon name="x" size={18} />
          </button>
          {images.length > 1 &&
        <>
              <button onClick={(e) => {e.stopPropagation();setOpen((open - 1 + images.length) % images.length);}}
          style={navBtnStyle("left")}><Icon name="back" size={20} /></button>
              <button onClick={(e) => {e.stopPropagation();setOpen((open + 1) % images.length);}}
          style={navBtnStyle("right")}><Icon name="arrow" size={20} /></button>
            </>
        }
          <img src={images[open].url} alt="" onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "92vw", maxHeight: "86vh",
          borderRadius: 14, boxShadow: "0 30px 80px -10px rgba(0,0,0,0.6)"
        }} />
          <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "var(--mono)",
          background: "rgba(20,22,40,0.7)", padding: "6px 12px", borderRadius: 99,
          border: "1px solid var(--border)"
        }}>{open + 1} / {images.length} · {images[open].name || ""}</div>
        </div>
      }
    </>);

}
function navBtnStyle(side) {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    [side]: 20,
    width: 44, height: 44, borderRadius: 99,
    background: "rgba(255,255,255,0.08)", border: "1px solid var(--border-strong)",
    color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
  };
}