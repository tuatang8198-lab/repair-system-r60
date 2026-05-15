// ============ Public screens: Home, Submit, Track ============

function HomeScreen({ tickets, go }) {
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status !== "DONE" && t.status !== "CANCEL").length;
    const done = tickets.filter((t) => t.status === "DONE").length;
    return { open, done, total: tickets.length };
  }, [tickets]);

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 80px" }}>

      <div className="stagger" style={{ textAlign: "center", marginBottom: 48 }}>
        <div className="chip" style={{ margin: "0 auto 18px" }}>
          <span className="dot" style={{ color: "var(--accent)" }} />
          งานซ่อมบำรุงคอมพิวเตอร์ นายธนกร วุฒินันท ์สุระสิทธิ์
        </div>
        <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
          แจ้งซ่อมอุปกรณ์คอมพิวเตอร์<br />
          <span style={{ background: "linear-gradient(135deg, #5865ff, #ffb547 70%)", WebkitBackgroundClip: "text", color: "transparent" }}>
            ง่าย เร็ว ติดตามได้ทุกขั้นตอน
          </span>
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          กรอกรายละเอียดเพียงไม่กี่ขั้นตอน ทีมช่างจะรับเรื่องและอัพเดทสถานะให้ทราบตลอดการดำเนินงาน
        </p>
      </div>

      {/* Quick stats */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 36 }}>
        {[
        { label: "งานทั้งหมด", value: stats.total, color: "var(--primary)" },
        { label: "กำลังดำเนินการ", value: stats.open, color: "var(--warn)" },
        { label: "ซ่อมเสร็จแล้ว", value: stats.done, color: "var(--success)" },
        { label: "ช่างประจำการ", value: TECHNICIANS.length, color: "var(--accent)" }].
        map((s, i) =>
        <div key={i} className="glass" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: s.color }} className="mono">
              <CountUp value={s.value} />
            </div>
          </div>
        )}
      </div>

      {/* Action cards */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <ActionCard
          color="var(--primary)" icon="wrench"
          title="แจ้งซ่อม" subtitle="กรอกแบบฟอร์มแจ้งอาการเสีย"
          cta="เริ่มแจ้งซ่อม" onClick={() => go("submit")} />
        <ActionCard
          color="var(--accent)" icon="search"
          title="ตรวจสอบสถานะ" subtitle="ติดตามงานด้วยรหัสคำขอ"
          cta="ค้นหารายการ" onClick={() => go("track")} />
        <ActionCard
          color="var(--info)" icon="shield"
          title="สำหรับเจ้าหน้าที่" subtitle="เข้าระบบเพื่อจัดการงานซ่อม"
          cta="เข้าสู่ระบบ" onClick={() => go("login")} />
      </div>

      <div style={{ textAlign: "center", marginTop: 48, color: "var(--text-mute)", fontSize: 12 }}>การซ่อมจะทำตามลำดับ

      </div>
    </div>);

}

function ActionCard({ color, icon, title, subtitle, cta, onClick }) {
  return (
    <button className="glass reveal" onClick={onClick} style={{
      padding: 24, textAlign: "left", display: "flex", flexDirection: "column", gap: 14,
      cursor: "pointer", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%",
        background: `radial-gradient(circle at center, ${color}55, transparent 70%)`,
        filter: "blur(10px)"
      }} />
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `linear-gradient(180deg, ${color}, ${color}cc)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", boxShadow: `0 12px 30px -10px ${color}aa`,
        position: "relative"
      }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, color: "var(--text-dim)" }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color, fontWeight: 600, fontSize: 14, position: "relative" }}>
        {cta} <Icon name="arrow" size={14} />
      </div>
    </button>);

}

Object.assign(window, { HomeScreen, ActionCard });