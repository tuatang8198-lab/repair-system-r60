// ============ Admin app: Dashboard / Tickets / Reports ============

function AdminApp({ tickets, updateTicket, user, go }){
  const [tab, setTab] = useState("dashboard");
  const [openTicket, setOpenTicket] = useState(null);

  return (
    <div className="page-enter" style={{maxWidth:1240, margin:"0 auto", padding:"24px 24px 80px"}}>
      <div className="row" style={{marginBottom:20, flexWrap:"wrap", gap:12}}>
        <div>
          <h1 style={{fontSize:26, fontWeight:700, margin:0, letterSpacing:"-0.01em"}}>
            Admin Console
          </h1>
          <div style={{color:"var(--text-dim)", fontSize:13, marginTop:2}}>
            สวัสดี {user.name} · {new Date().toLocaleDateString("th-TH", {weekday:"long", day:"numeric", month:"long", year:"numeric"})}
          </div>
        </div>
        <div style={{flex:1}}/>
        <div className="row" style={{gap:8}}>
          <AdminTab active={tab==="dashboard"} onClick={()=>setTab("dashboard")} icon="chart" label="ภาพรวม"/>
          <AdminTab active={tab==="tickets"} onClick={()=>setTab("tickets")} icon="list" label="งานซ่อม"
            badge={tickets.filter(t=>t.status!=="DONE" && t.status!=="CANCEL").length}/>
          <AdminTab active={tab==="reports"} onClick={()=>setTab("reports")} icon="device" label="รายงาน"/>
        </div>
      </div>

      {tab==="dashboard" && <Dashboard tickets={tickets} onOpen={setOpenTicket} go={(t)=>setTab(t)}/>}
      {tab==="tickets"   && <TicketsList tickets={tickets} onOpen={setOpenTicket}/>}
      {tab==="reports"   && <Reports tickets={tickets}/>}

      <Modal open={!!openTicket} onClose={()=>setOpenTicket(null)} title="จัดการงานซ่อม">
        {openTicket && (
          <AdminTicketEditor
            ticket={tickets.find(t=>t.id===openTicket.id) || openTicket}
            user={user}
            onUpdate={(updated)=>{
              updateTicket(updated);
              setOpenTicket(updated);
            }}
            onClose={()=>setOpenTicket(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function AdminTab({ active, onClick, icon, label, badge }){
  return (
    <button onClick={onClick}
      className={active?"":""}
      style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"10px 14px", borderRadius:12,
        background: active?"var(--primary-soft)":"var(--surface)",
        border:"1px solid "+(active?"rgba(88,101,255,0.4)":"var(--border)"),
        color: active?"var(--text)":"var(--text-dim)",
        fontSize:13, fontWeight:500, transition:"all .2s",
        cursor:"pointer",
      }}>
      <Icon name={icon} size={14}/> {label}
      {badge !== undefined && badge > 0 && (
        <span style={{
          background: active?"var(--primary)":"rgba(255,255,255,0.08)",
          color: active?"white":"var(--text-dim)",
          fontSize:11, padding:"2px 7px", borderRadius:99, fontWeight:600,
        }} className="mono">{badge}</span>
      )}
    </button>
  );
}

// ----- Dashboard -----
function Dashboard({ tickets, onOpen, go }){
  const stats = useMemo(()=>{
    const total = tickets.length;
    const open  = tickets.filter(t=>t.status!=="DONE" && t.status!=="CANCEL").length;
    const done  = tickets.filter(t=>t.status==="DONE").length;
    const newCount = tickets.filter(t=>t.status==="NEW").length;
    const prog  = tickets.filter(t=>t.status==="PROG").length;
    const wait  = tickets.filter(t=>t.status==="WAIT").length;
    const cancel= tickets.filter(t=>t.status==="CANCEL").length;
    const high  = tickets.filter(t=>t.priority==="HIGH" && t.status!=="DONE" && t.status!=="CANCEL").length;
    return { total, open, done, newCount, prog, wait, cancel, high };
  }, [tickets]);

  // last 14 days bar chart
  const trend = useMemo(()=>{
    const days = [];
    const now = new Date(); now.setHours(0,0,0,0);
    for (let i=13; i>=0; i--){
      const d = new Date(now.getTime() - i*86400000);
      const label = `${d.getDate()}/${d.getMonth()+1}`;
      const v = tickets.filter(t=>{
        const td = new Date(t.createdAt); td.setHours(0,0,0,0);
        return td.getTime() === d.getTime();
      }).length;
      days.push({ label, value: v });
    }
    return days;
  }, [tickets]);

  const donutData = [
    { name:"รับเรื่อง", value: stats.newCount, color:"#67e8f9" },
    { name:"กำลังซ่อม", value: stats.prog, color:"#facc15" },
    { name:"รออะไหล่", value: stats.wait, color:"#ffb547" },
    { name:"เสร็จแล้ว", value: stats.done, color:"#4ade80" },
    { name:"ยกเลิก", value: stats.cancel, color:"#ff6b8a" },
  ];

  const recent = useMemo(()=>[...tickets].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,5), [tickets]);

  return (
    <div className="col" style={{gap:14}}>
      {/* Top KPIs */}
      <div className="stagger" style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:14}}>
        <KpiCard title="งานคงค้าง" value={stats.open} color="var(--primary)" sub={`จาก ${stats.total} รายการ`} icon="wrench"/>
        <KpiCard title="วิกฤติ / ด่วน" value={stats.high} color="var(--danger)" sub="รออนุมัติเร่งด่วน" icon="alert"/>
        <KpiCard title="เสร็จเดือนนี้" value={stats.done} color="var(--success)" sub={`คิดเป็น ${Math.round(stats.done/Math.max(stats.total,1)*100)}%`} icon="check"/>
        <KpiCard title="ช่างประจำการ" value={TECHNICIANS.length} color="var(--accent)" sub={`Avg load ${Math.round(TECHNICIANS.reduce((a,b)=>a+b.load,0)/TECHNICIANS.length)} งาน/คน`} icon="user"/>
      </div>

      {/* Trend + Donut */}
      <div style={{display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:14}}>
        <div className="glass" style={{padding:22}}>
          <div className="row" style={{marginBottom:14}}>
            <div>
              <div style={{fontWeight:600}}>การแจ้งซ่อมรายวัน</div>
              <div style={{fontSize:12, color:"var(--text-dim)"}}>14 วันที่ผ่านมา</div>
            </div>
            <div style={{flex:1}}/>
            <span className="chip"><span className="dot" style={{color:"var(--primary)"}}/> งานเข้าใหม่</span>
          </div>
          <BarChart data={trend} color="#5865ff" height={160}/>
        </div>

        <div className="glass" style={{padding:22}}>
          <div style={{fontWeight:600, marginBottom:14}}>สถานะงานทั้งหมด</div>
          <div className="row" style={{gap:18, alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <Donut data={donutData} size={160}/>
              <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
                <div style={{fontSize:11, color:"var(--text-dim)"}}>ทั้งหมด</div>
                <div className="mono" style={{fontSize:26, fontWeight:700}}><CountUp value={stats.total}/></div>
              </div>
            </div>
            <div className="col" style={{gap:8, flex:1}}>
              {donutData.map((d,i)=>(
                <div key={i} className="row" style={{gap:8, fontSize:13}}>
                  <div style={{width:10, height:10, borderRadius:3, background:d.color}}/>
                  <div style={{flex:1, color:"var(--text-dim)"}}>{d.name}</div>
                  <div className="mono" style={{fontWeight:600}}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass" style={{padding:22}}>
        <div className="row" style={{marginBottom:14}}>
          <div style={{fontWeight:600}}>กิจกรรมล่าสุด</div>
          <div style={{flex:1}}/>
          <button className="btn btn-ghost btn-sm" onClick={()=>go("tickets")}>ดูทั้งหมด <Icon name="arrow" size={12}/></button>
        </div>
        <div className="col" style={{gap:8}}>
          {recent.map(t=>(
            <button key={t.id} onClick={()=>onOpen(t)} className="row reveal" style={{
              padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)",
              borderRadius:12, cursor:"pointer", textAlign:"left", gap:14
            }}>
              <div className="mono" style={{fontSize:12, color:"var(--text-dim)", minWidth:108}}>{t.id}</div>
              <div style={{flex:1, fontSize:14, fontWeight:500}}>{t.title}</div>
              <div className="hide-sm" style={{fontSize:12, color:"var(--text-dim)"}}>{t.department}</div>
              <StatusPill status={t.status} animated={false}/>
              <div className="mono" style={{fontSize:11, color:"var(--text-mute)", minWidth:90, textAlign:"right"}}>{ago(t.updatedAt)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, color, icon }){
  return (
    <div className="glass reveal" style={{padding:20, position:"relative", overflow:"hidden"}}>
      <div style={{
        position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%",
        background:`radial-gradient(circle at center, ${color}33, transparent 70%)`,
      }}/>
      <div className="row" style={{justifyContent:"space-between", marginBottom:8}}>
        <div style={{fontSize:12, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em"}}>{title}</div>
        <div style={{color, opacity:0.8}}><Icon name={icon} size={18}/></div>
      </div>
      <div className="mono" style={{fontSize:36, fontWeight:700, color, lineHeight:1, letterSpacing:"-0.01em"}}>
        <CountUp value={value}/>
      </div>
      <div style={{fontSize:12, color:"var(--text-dim)", marginTop:6}}>{sub}</div>
    </div>
  );
}

Object.assign(window, { AdminApp, AdminTab, Dashboard, KpiCard });
