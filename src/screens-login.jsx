// ============ Admin login (Supabase Auth) ============

function LoginScreen({ go }){
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pass) { setErr("กรุณากรอกอีเมลและรหัสผ่าน"); return; }
    setErr(""); setLoading(true);
    const { error } = await db.auth.signInWithPassword({ email: email.trim(), password: pass });
    setLoading(false);
    if (error) setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    // ถ้า login สำเร็จ App's onAuthStateChange จะ navigate ไป admin อัตโนมัติ
  };

  return (
    <div className="page-enter" style={{maxWidth:1080, margin:"0 auto", padding:"40px 24px 80px",
      display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:32, alignItems:"center"}}>
      <div className="hide-sm" style={{padding:"20px 0"}}>
        <div className="chip" style={{marginBottom:18}}>
          <span className="dot" style={{color:"var(--accent)"}}/> สำหรับเจ้าหน้าที่
        </div>
        <h1 style={{fontSize:42, fontWeight:700, lineHeight:1.1, margin:"0 0 16px", letterSpacing:"-0.02em"}}>
          จัดการงานซ่อม<br/>
          <span style={{background:"linear-gradient(135deg, #5865ff, #67e8f9)", WebkitBackgroundClip:"text", color:"transparent"}}>
            อย่างมีประสิทธิภาพ
          </span>
        </h1>
        <p style={{color:"var(--text-dim)", fontSize:16, lineHeight:1.6, maxWidth:420}}>
          มอบหมายช่าง อัพเดทสถานะ ปิดงานซ่อม และดูภาพรวมงานทั้งหมดของโรงเรียน ทุกอย่างในที่เดียว
        </p>
        <div style={{display:"flex", gap:10, marginTop:24, flexWrap:"wrap"}}>
          {[
            ["📊","Dashboard ภาพรวม"],
            ["✓","ปิดงาน / อัพเดทสถานะ"],
            ["📈","รายงานเชิงสถิติ"],
          ].map(([i,t])=>(
            <div key={t} className="chip" style={{height:34, padding:"0 14px"}}>{i} {t}</div>
          ))}
        </div>
      </div>

      <div className="glass" style={{padding:32}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>go("home")} style={{marginBottom:16}}>
          <Icon name="back" size={14}/> กลับ
        </button>
        <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:24}}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:"linear-gradient(135deg, var(--primary), #3949e0)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"white",
            boxShadow:"0 12px 30px -10px rgba(88,101,255,.7)"
          }}>
            <Icon name="shield" size={26}/>
          </div>
          <div>
            <div style={{fontSize:22, fontWeight:700}}>เข้าสู่ระบบ</div>
            <div style={{color:"var(--text-dim)", fontSize:13}}>สำหรับผู้ดูแลและช่างเทคนิค</div>
          </div>
        </div>

        <div className="col" style={{gap:14}}>
          <div className="field">
            <label>อีเมล</label>
            <input className="input" type="email" value={email}
              onChange={e=>setEmail(e.target.value)} placeholder="admin@r60.ac.th"/>
          </div>
          <div className="field">
            <label>รหัสผ่าน</label>
            <input className="input" type="password" value={pass}
              onChange={e=>setPass(e.target.value)} placeholder="••••••"
              onKeyDown={e=>{ if(e.key==="Enter") submit(); }}/>
          </div>

          {err && (
            <div style={{
              padding:"10px 14px", borderRadius:10,
              background:"var(--danger-soft)", border:"1px solid rgba(255,107,138,0.3)",
              color:"var(--danger)", fontSize:13,
            }}>
              <Icon name="alert" size={14}/> {err}
            </div>
          )}

          <button className="btn btn-primary" onClick={submit} style={{height:48, marginTop:6}} disabled={loading}>
            {loading ? <><Icon name="spinner" size={16}/> กำลังเข้าสู่ระบบ...</> : <><Icon name="lock" size={14}/> เข้าสู่ระบบ</>}
          </button>

          <div style={{
            padding:12, borderRadius:10,
            background:"rgba(103,232,249,0.06)", border:"1px dashed rgba(103,232,249,0.2)",
            fontSize:12, color:"var(--text-dim)", lineHeight:1.6
          }}>
            <div style={{color:"var(--info)", fontWeight:600, marginBottom:4}}>ข้อมูลบัญชี</div>
            <div>ใช้อีเมลและรหัสผ่านที่ตั้งค่าไว้ใน Supabase Authentication</div>
            <div style={{marginTop:4}}>ตัวอย่าง: admin@r60.ac.th / tech@r60.ac.th</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
