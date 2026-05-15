// ============ Track status screen ============

function TrackScreen({ tickets, go, initialId }){
  const [q, setQ] = useState(initialId || "");
  const [searched, setSearched] = useState(!!initialId);
  const [result, setResult] = useState(()=>{
    if (initialId) return tickets.find(t=>t.id.toLowerCase()===initialId.toLowerCase()) || null;
    return null;
  });
  const [shake, setShake] = useState(false);

  const search = (id) => {
    const t = tickets.find(t=>t.id.toLowerCase().trim()===id.toLowerCase().trim());
    setSearched(true);
    setResult(t || null);
    if (!t){ setShake(true); setTimeout(()=>setShake(false), 500); }
  };

  return (
    <div className="page-enter" style={{maxWidth:880, margin:"0 auto", padding:"36px 24px 80px"}}>
      <button className="btn btn-ghost btn-sm" onClick={()=>go("home")} style={{marginBottom:18}}>
        <Icon name="back" size={14}/> กลับหน้าหลัก
      </button>
      <h1 style={{fontSize:32, fontWeight:700, margin:"0 0 6px"}}>ตรวจสอบสถานะการซ่อม</h1>
      <p style={{color:"var(--text-dim)", marginBottom:24}}>กรอกรหัสคำขอ (เช่น R60-68-0420) เพื่อดูสถานะล่าสุด</p>

      <div className="glass" style={{padding:8, marginBottom:18, display:"flex", gap:8, alignItems:"center",
        animation: shake?"shake .4s ease":"none"}}>
        <div style={{paddingLeft:14, color:"var(--text-dim)"}}><Icon name="search" size={18}/></div>
        <input className="mono"
          placeholder="R60-68-0420"
          value={q}
          onChange={e=>setQ(e.target.value.toUpperCase())}
          onKeyDown={e=>{ if (e.key==="Enter") search(q); }}
          style={{
            flex:1, background:"transparent", border:"none",
            padding:"14px 0", fontSize:16, letterSpacing:"0.04em",
          }}/>
        <button className="btn btn-primary" onClick={()=>search(q)}>ค้นหา</button>
      </div>

      {!searched && (
        <div style={{padding:24, color:"var(--text-mute)", textAlign:"center", fontSize:13}}>
          ลองใช้รหัสตัวอย่าง: <button className="chip mono" onClick={()=>{ setQ("R60-68-0420"); search("R60-68-0420"); }} style={{cursor:"pointer", marginLeft:6}}>R60-68-0420</button>
        </div>
      )}

      {searched && !result && (
        <div className="glass page-enter" style={{padding:32, textAlign:"center"}}>
          <div style={{fontSize:40, marginBottom:8}}>🔎</div>
          <div style={{fontWeight:600, marginBottom:6}}>ไม่พบรายการ</div>
          <div style={{color:"var(--text-dim)", fontSize:14}}>โปรดตรวจสอบรหัสคำขออีกครั้ง หรือสอบถามเจ้าหน้าที่ ICT</div>
        </div>
      )}

      {result && <TicketDetail ticket={result}/>}

      <style>{`@keyframes shake { 10%,90%{ transform: translateX(-2px);} 20%,80%{transform: translateX(4px);} 30%,50%,70%{transform: translateX(-6px);} 40%,60%{transform: translateX(6px);} }`}</style>
    </div>
  );
}

function TicketDetail({ ticket }){
  const dev = DEVICE_TYPES.find(d=>d.key===ticket.deviceType);
  const tech = TECHNICIANS.find(t=>t.id===ticket.tech);

  return (
    <div className="page-enter" style={{display:"grid", gridTemplateColumns:"1fr", gap:14}}>
      <div className="glass" style={{padding:24}}>
        <div className="row" style={{justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:18}}>
          <div>
            <div className="mono" style={{fontSize:12, color:"var(--text-dim)", letterSpacing:"0.06em"}}>{ticket.id}</div>
            <div style={{fontSize:22, fontWeight:600, marginTop:4}}>{ticket.title}</div>
          </div>
          <StatusPill status={ticket.status}/>
        </div>

        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",
          gap:14, padding:"16px 0", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)"
        }}>
          <DetailKV label="ประเภท" value={`${dev?.icon} ${dev?.label}`}/>
          <DetailKV label="ครุภัณฑ์" value={<span className="mono">{ticket.asset}</span>}/>
          <DetailKV label="สถานที่" value={ticket.department}/>
          <DetailKV label="ผู้แจ้ง" value={ticket.reporter}/>
          <DetailKV label="ความเร่งด่วน" value={<PriorityChip priority={ticket.priority}/>}/>
          <DetailKV label="วันที่แจ้ง" value={<span className="mono" style={{fontSize:13}}>{fmtDate(ticket.createdAt)}</span>}/>
        </div>

        <div style={{marginTop:18}}>
          <div style={{fontSize:12, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8}}>รายละเอียด</div>
          <div style={{fontSize:14, lineHeight:1.7, color:"var(--text-dim)"}}>{ticket.detail}</div>
        </div>

        {ticket.images && ticket.images.length > 0 && (
          <div style={{marginTop:18}}>
            <div style={{fontSize:12, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8}}>
              ภาพประกอบ ({ticket.images.length})
            </div>
            <ImageGallery images={ticket.images}/>
          </div>
        )}

        {tech && (
          <div style={{
            marginTop:18, padding:14, borderRadius:12,
            background:"rgba(255,181,71,0.08)", border:"1px solid rgba(255,181,71,0.2)",
            display:"flex", gap:14, alignItems:"center"
          }}>
            <div style={{
              width:44, height:44, borderRadius:99,
              background:"linear-gradient(135deg, #ffb547, #d9852b)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"white", fontWeight:600,
            }}>
              <Icon name="user" size={20}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em"}}>ช่างผู้รับผิดชอบ</div>
              <div style={{fontWeight:600}}>{tech.name}</div>
            </div>
            <span className="chip"><Icon name="phone" size={12}/> ติดต่อช่าง</span>
          </div>
        )}
      </div>

      <div className="glass" style={{padding:24}}>
        <div style={{fontSize:12, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14}}>
          ไทม์ไลน์การดำเนินงาน
        </div>
        <Timeline items={ticket.history}/>
      </div>
    </div>
  );
}

function DetailKV({ label, value }){
  return (
    <div>
      <div style={{fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4}}>{label}</div>
      <div style={{fontSize:14}}>{value}</div>
    </div>
  );
}

Object.assign(window, { TrackScreen, TicketDetail });
