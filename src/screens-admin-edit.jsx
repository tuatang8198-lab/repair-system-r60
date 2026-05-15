// ============ Admin: Ticket editor + Reports ============

function AdminTicketEditor({ ticket, user, onUpdate, onClose }){
  const [status, setStatus] = useState(ticket.status);
  const [tech, setTech] = useState(ticket.tech || "");
  const [note, setNote] = useState("");

  const save = () => {
    const changed = status !== ticket.status || tech !== (ticket.tech || "");
    if (!changed && !note) return;
    const history = [...ticket.history];
    if (status !== ticket.status){
      history.push({
        ts: Date.now(),
        label: status==="DONE" ? "ปิดงานซ่อม" : `เปลี่ยนสถานะเป็น ${STATUS[status].label}`,
        by: user.name,
        note: note || (status==="DONE" ? "ดำเนินการเสร็จสมบูรณ์" : ""),
      });
    } else if (note) {
      history.push({
        ts: Date.now(), label: "บันทึกหมายเหตุ",
        by: user.name, note,
      });
    }
    if (tech !== (ticket.tech || "")){
      const t = TECHNICIANS.find(x=>x.id===tech);
      history.push({
        ts: Date.now(), label: "มอบหมายช่าง",
        by: user.name, note: "มอบหมายให้ " + (t?.name || "—"),
      });
    }
    onUpdate({ ...ticket, status, tech: tech || null, updatedAt: Date.now(), history });
    setNote("");
  };

  const isClosed = ticket.status==="DONE" || ticket.status==="CANCEL";
  const dev = DEVICE_TYPES.find(d=>d.key===ticket.deviceType);

  return (
    <div className="col" style={{gap:14}}>
      <div style={{display:"flex", gap:14, alignItems:"flex-start", flexWrap:"wrap"}}>
        <div style={{flex:1, minWidth:0}}>
          <div className="mono" style={{fontSize:11, color:"var(--text-dim)", letterSpacing:"0.06em"}}>{ticket.id}</div>
          <div style={{fontSize:18, fontWeight:600, marginTop:2}}>{ticket.title}</div>
          <div className="row" style={{gap:8, marginTop:8, flexWrap:"wrap"}}>
            <StatusPill status={ticket.status}/>
            <PriorityChip priority={ticket.priority}/>
            <span className="chip">{dev?.icon} {dev?.label}</span>
          </div>
        </div>
      </div>

      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 14px",
        padding:"14px 0", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)",
        fontSize:13,
      }}>
        <KV k="ครุภัณฑ์" v={<span className="mono">{ticket.asset}</span>}/>
        <KV k="สถานที่" v={ticket.department}/>
        <KV k="ผู้แจ้ง" v={ticket.reporter}/>
        <KV k="ติดต่อ" v={<span className="mono">{ticket.contact}</span>}/>
        <KV k="แจ้งเมื่อ" v={<span className="mono" style={{fontSize:12}}>{fmtDateTime(ticket.createdAt)}</span>}/>
        <KV k="อัพเดทล่าสุด" v={<span className="mono" style={{fontSize:12}}>{ago(ticket.updatedAt)}</span>}/>
      </div>

      {ticket.detail && (
        <div>
          <div style={{fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4}}>รายละเอียดจากผู้แจ้ง</div>
          <div style={{fontSize:13, color:"var(--text-dim)", lineHeight:1.6}}>{ticket.detail}</div>
        </div>
      )}

      {ticket.images && ticket.images.length > 0 && (
        <div>
          <div style={{fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8}}>
            ภาพประกอบจากผู้แจ้ง ({ticket.images.length})
          </div>
          <ImageGallery images={ticket.images} size={80}/>
        </div>
      )}

      {!isClosed && (
        <>
          <div className="field">
            <label>เปลี่ยนสถานะ</label>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(110px, 1fr))", gap:6}}>
              {STATUS_ORDER.map(s=>(
                <button key={s} onClick={()=>setStatus(s)} style={{
                  padding:"10px", borderRadius:10, fontSize:12, fontWeight:500,
                  background: status===s ? "var(--primary-soft)" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (status===s ? "rgba(88,101,255,0.5)" : "var(--border)"),
                  color: status===s ? "var(--text)" : "var(--text-dim)",
                  cursor:"pointer", transition:"all .15s",
                }}>{STATUS[s].label}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>มอบหมายช่าง</label>
            <select className="select" value={tech} onChange={e=>setTech(e.target.value)}>
              <option value="">— ยังไม่มอบหมาย —</option>
              {TECHNICIANS.map(t=><option key={t.id} value={t.id}>{t.name} (โหลด {t.load})</option>)}
            </select>
          </div>

          <div className="field">
            <label>หมายเหตุ / รายละเอียดการดำเนินการ</label>
            <textarea className="textarea" placeholder="เช่น เปลี่ยน HDD เป็น SSD 480GB แล้ว, สั่งอะไหล่จาก..."
              value={note} onChange={e=>setNote(e.target.value)}/>
          </div>

          <div className="row" style={{justifyContent:"flex-end", gap:8, flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            {status !== "CANCEL" && (
              <button className="btn btn-danger btn-sm" onClick={()=>setStatus("CANCEL")} style={{height:44, padding:"0 14px"}}>
                <Icon name="x" size={14}/> ยกเลิกงาน
              </button>
            )}
            {status !== "DONE" && (
              <button className="btn btn-accent" onClick={()=>{ setStatus("DONE"); }}>
                <Icon name="check" size={14}/> ตั้งเป็น "ซ่อมเสร็จ"
              </button>
            )}
            <button className="btn btn-primary" onClick={save}>
              <Icon name="check" size={14}/> บันทึก
            </button>
          </div>
        </>
      )}

      {isClosed && (
        <div style={{
          padding:14, background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.2)",
          borderRadius:12, color:"var(--success)", fontSize:13, display:"flex", gap:10, alignItems:"center"
        }}>
          <Icon name="check" size={18}/>
          งานนี้ถูกปิดเรียบร้อยแล้ว ไม่สามารถแก้ไขสถานะได้
        </div>
      )}

      <div>
        <div style={{fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10}}>
          ประวัติการดำเนินงาน ({ticket.history.length})
        </div>
        <div style={{maxHeight:200, overflowY:"auto", paddingRight:8}}>
          <Timeline items={ticket.history}/>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v }){
  return (
    <div>
      <div style={{fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2}}>{k}</div>
      <div>{v}</div>
    </div>
  );
}

// ============ Reports ============
function Reports({ tickets }){
  // device-type breakdown
  const byDevice = useMemo(()=>{
    return DEVICE_TYPES.map(d=>{
      const v = tickets.filter(t=>t.deviceType===d.key).length;
      return { label: d.label, icon: d.icon, value: v };
    }).sort((a,b)=>b.value-a.value);
  }, [tickets]);

  // by department
  const byDept = useMemo(()=>{
    const m = new Map();
    tickets.forEach(t=> m.set(t.department, (m.get(t.department)||0)+1));
    return [...m.entries()].map(([k,v])=>({label:k, value:v})).sort((a,b)=>b.value-a.value).slice(0,8);
  }, [tickets]);

  // by technician
  const byTech = useMemo(()=>{
    return TECHNICIANS.map(t=>{
      const own  = tickets.filter(x=>x.tech===t.id);
      const done = own.filter(x=>x.status==="DONE").length;
      const open = own.filter(x=>x.status!=="DONE" && x.status!=="CANCEL").length;
      return { ...t, total: own.length, done, open, rate: own.length ? Math.round(done/own.length*100) : 0 };
    });
  }, [tickets]);

  // avg time
  const avgHours = useMemo(()=>{
    const closed = tickets.filter(t=>t.status==="DONE");
    if (!closed.length) return 0;
    const sum = closed.reduce((a,t)=>a + (t.updatedAt - t.createdAt), 0);
    return Math.round(sum / closed.length / 1000 / 3600);
  }, [tickets]);

  const doneRate = useMemo(()=>{
    const c = tickets.filter(t=>t.status==="DONE").length;
    return tickets.length ? Math.round(c/tickets.length*100) : 0;
  }, [tickets]);

  return (
    <div className="col" style={{gap:14}}>
      <div className="stagger" style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:14}}>
        <KpiCard title="เวลาเฉลี่ยซ่อม" value={avgHours} color="var(--info)" sub="ชั่วโมง / งาน" icon="clock"/>
        <KpiCard title="อัตราซ่อมสำเร็จ" value={doneRate} color="var(--success)" sub="% จากทั้งหมด" icon="check"/>
        <KpiCard title="งานเดือนนี้" value={tickets.length} color="var(--primary)" sub="คำขอทั้งหมด" icon="calendar"/>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div className="glass" style={{padding:22}}>
          <div style={{fontWeight:600, marginBottom:14}}>แยกตามประเภทอุปกรณ์</div>
          <div className="col" style={{gap:10}}>
            {byDevice.map((d,i)=>{
              const max = Math.max(...byDevice.map(x=>x.value),1);
              return (
                <div key={i}>
                  <div className="row" style={{fontSize:13, marginBottom:4}}>
                    <span>{d.icon} {d.label}</span>
                    <div style={{flex:1}}/>
                    <span className="mono" style={{color:"var(--text-dim)"}}>{d.value}</span>
                  </div>
                  <div style={{height:8, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden"}}>
                    <div style={{
                      width: `${(d.value/max)*100}%`, height:"100%",
                      background:"linear-gradient(90deg, var(--primary), #67e8f9)",
                      borderRadius:99,
                      transition:"width .9s cubic-bezier(.2,.7,.2,1)",
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass" style={{padding:22}}>
          <div style={{fontWeight:600, marginBottom:14}}>แยกตามสถานที่ (Top 8)</div>
          <div className="col" style={{gap:10}}>
            {byDept.map((d,i)=>{
              const max = Math.max(...byDept.map(x=>x.value),1);
              return (
                <div key={i}>
                  <div className="row" style={{fontSize:13, marginBottom:4}}>
                    <span>{d.label}</span>
                    <div style={{flex:1}}/>
                    <span className="mono" style={{color:"var(--text-dim)"}}>{d.value}</span>
                  </div>
                  <div style={{height:8, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden"}}>
                    <div style={{
                      width: `${(d.value/max)*100}%`, height:"100%",
                      background:"linear-gradient(90deg, var(--accent), #ff8a3d)",
                      borderRadius:99,
                      transition:"width .9s cubic-bezier(.2,.7,.2,1)",
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass" style={{padding:22}}>
        <div className="row" style={{marginBottom:14}}>
          <div style={{fontWeight:600}}>ประสิทธิภาพช่างซ่อม</div>
          <div style={{flex:1}}/>
          <span className="chip"><Icon name="user" size={12}/> {TECHNICIANS.length} คน</span>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:12}}>
          {byTech.map(t=>(
            <div key={t.id} style={{
              padding:16, borderRadius:14,
              background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)",
            }}>
              <div className="row" style={{gap:12, marginBottom:12}}>
                <div style={{
                  width:42, height:42, borderRadius:99,
                  background:"linear-gradient(135deg, var(--primary), var(--info))",
                  display:"flex", alignItems:"center", justifyContent:"center", color:"white"
                }}>
                  <Icon name="user" size={18}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600, fontSize:14}}>{t.name}</div>
                  <div style={{fontSize:12, color:"var(--text-dim)"}}>รหัส {t.id}</div>
                </div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, marginBottom:10}}>
                <Stat label="ทั้งหมด" value={t.total} color="var(--text)"/>
                <Stat label="คงค้าง" value={t.open} color="var(--warn)"/>
                <Stat label="เสร็จ" value={t.done} color="var(--success)"/>
              </div>
              <div>
                <div className="row" style={{fontSize:11, color:"var(--text-dim)", marginBottom:4}}>
                  <span>อัตราสำเร็จ</span><div style={{flex:1}}/><span className="mono">{t.rate}%</span>
                </div>
                <div style={{height:6, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden"}}>
                  <div style={{
                    width:`${t.rate}%`, height:"100%",
                    background:"linear-gradient(90deg, var(--success), #67e8f9)",
                    transition:"width .9s cubic-bezier(.2,.7,.2,1)",
                  }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }){
  return (
    <div>
      <div style={{fontSize:10, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em"}}>{label}</div>
      <div className="mono" style={{fontSize:18, fontWeight:700, color}}>{value}</div>
    </div>
  );
}

Object.assign(window, { AdminTicketEditor, Reports });
