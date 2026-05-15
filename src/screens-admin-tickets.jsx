// ============ Admin: Tickets list ============

function TicketsList({ tickets, onOpen }){
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("ALL");

  const counts = useMemo(()=>{
    const c = { ALL: tickets.length };
    STATUS_ORDER.forEach(s => { c[s] = tickets.filter(t=>t.status===s).length; });
    return c;
  }, [tickets]);

  const filtered = useMemo(()=>{
    return tickets.filter(t=>{
      if (filter !== "ALL" && t.status !== filter) return false;
      if (priority !== "ALL" && t.priority !== priority) return false;
      if (q){
        const k = q.toLowerCase();
        return t.id.toLowerCase().includes(k) || t.title.toLowerCase().includes(k) ||
               t.reporter.toLowerCase().includes(k) || t.department.toLowerCase().includes(k) ||
               t.asset.toLowerCase().includes(k);
      }
      return true;
    }).sort((a,b)=>b.updatedAt - a.updatedAt);
  }, [tickets, filter, q, priority]);

  return (
    <div className="col" style={{gap:14}}>
      <div className="glass" style={{padding:14, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
        <div className="row" style={{
          flex:1, minWidth:240,
          background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"0 12px", border:"1px solid var(--border)"
        }}>
          <Icon name="search" size={14}/>
          <input placeholder="ค้นหา รหัส, อาการ, ผู้แจ้ง, แผนก..."
            value={q} onChange={e=>setQ(e.target.value)}
            style={{flex:1, background:"transparent", border:"none", padding:"10px 0", color:"var(--text)"}}/>
        </div>
        <select className="select" style={{width:"auto", padding:"10px 14px"}}
          value={priority} onChange={e=>setPriority(e.target.value)}>
          <option value="ALL">เร่งด่วน: ทั้งหมด</option>
          {Object.values(PRIORITY).map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:4}}>
        <FilterPill active={filter==="ALL"} onClick={()=>setFilter("ALL")} label="ทั้งหมด" count={counts.ALL}/>
        {STATUS_ORDER.map(s=>(
          <FilterPill key={s} active={filter===s} onClick={()=>setFilter(s)}
            label={STATUS[s].label} count={counts[s]} cls={STATUS[s].cls}/>
        ))}
      </div>

      <div className="glass" style={{padding:0, overflow:"hidden"}}>
        <div className="hide-sm" style={{
          display:"grid", gridTemplateColumns:"130px 1fr 160px 130px 100px 130px 110px",
          padding:"12px 18px", borderBottom:"1px solid var(--border)",
          fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em",
        }}>
          <div>รหัส</div><div>เรื่อง</div><div>แผนก</div><div>ผู้แจ้ง</div><div>เร่งด่วน</div><div>สถานะ</div><div style={{textAlign:"right"}}>อัพเดท</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{padding:48, textAlign:"center", color:"var(--text-dim)"}}>
            <div style={{fontSize:40, marginBottom:8, opacity:0.5}}>📋</div>
            ไม่มีรายการในตัวกรองนี้
          </div>
        ) : (
          <div>
            {filtered.map((t,i)=>(
              <button key={t.id} onClick={()=>onOpen(t)}
                className="ticket-row"
                style={{
                  width:"100%", display:"grid",
                  gridTemplateColumns:"130px 1fr 160px 130px 100px 130px 110px",
                  alignItems:"center", gap:10,
                  padding:"14px 18px", textAlign:"left", cursor:"pointer",
                  background: i%2 ? "rgba(255,255,255,0.01)" : "transparent",
                  border:"none", borderBottom:"1px solid var(--border)",
                  color:"var(--text)", transition:"background .2s",
                  fontSize:13,
                }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(88,101,255,0.06)"}
                onMouseLeave={e=>e.currentTarget.style.background = i%2?"rgba(255,255,255,0.01)":"transparent"}>
                <div className="mono" style={{fontSize:12, color:"var(--text-dim)"}}>{t.id}</div>
                <div style={{fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{t.title}</div>
                <div style={{fontSize:12, color:"var(--text-dim)"}}>{t.department}</div>
                <div style={{fontSize:12, color:"var(--text-dim)"}}>{t.reporter}</div>
                <div><PriorityChip priority={t.priority}/></div>
                <div><StatusPill status={t.status} animated={false}/></div>
                <div className="mono" style={{fontSize:11, color:"var(--text-mute)", textAlign:"right"}}>{ago(t.updatedAt)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, label, count, cls }){
  return (
    <button onClick={onClick} style={{
      padding:"8px 14px", borderRadius:99,
      background: active?"var(--primary-soft)":"var(--surface)",
      border:"1px solid "+(active?"rgba(88,101,255,0.4)":"var(--border)"),
      color: active?"var(--text)":"var(--text-dim)",
      fontSize:13, whiteSpace:"nowrap", cursor:"pointer",
      display:"flex", alignItems:"center", gap:8,
      transition:"all .2s",
    }}>
      {label}
      <span className="mono" style={{
        background:"rgba(255,255,255,0.06)", padding:"1px 7px", borderRadius:99, fontSize:11, fontWeight:600
      }}>{count}</span>
    </button>
  );
}

Object.assign(window, { TicketsList, FilterPill });
