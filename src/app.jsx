// ============ App root with Supabase ============

function App(){
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [user, setUser]         = useState(null);
  const [route, setRoute]       = useState({ name: "home", param: null });
  const [toast, setToast]       = useState(null);

  const go = (name, param=null) => setRoute({ name, param });

  const sessionToUser = (session) => {
    const email = session.user.email || '';
    const meta  = session.user.user_metadata || {};
    const role  = meta.role || (email.startsWith('admin') ? 'admin' : 'tech');
    const name  = meta.name || (role === 'admin' ? 'ผู้ดูแลระบบ ICT' : 'ช่างเทคนิค');
    return { email, name, role };
  };

  // Load tickets + watch auth on mount
  useEffect(()=>{
    db.from("tickets").select("*").order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTickets(data.map(mapRow));
        setLoading(false);
      });

    db.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(sessionToUser(session));
    });

    const { data: { subscription } } = db.auth.onAuthStateChange((event, session) => {
      if (session) {
        const u = sessionToUser(session);
        setUser(u);
        if (event === 'SIGNED_IN') {
          setRoute({ name: "admin", param: null });
          setToast({ msg: `ยินดีต้อนรับ ${u.name}`, kind: "ok" });
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Guard: kick to login if admin route without session
  useEffect(()=>{
    if (route.name === "admin" && !user) setRoute({ name: "login", param: null });
  }, [route, user]);

  const submitTicket = async (ticket) => {
    // Upload images to Supabase Storage, replace base64 with public URLs
    const images = [];
    for (const img of ticket.images) {
      if (img._file) {
        const safeName = img.name.replace(/[^\w.\-]/g, '_');
        const path = `${ticket.id}/${Date.now()}_${safeName}`;
        const { error } = await db.storage
          .from("ticket-images")
          .upload(path, img._file, { contentType: img.type, cacheControl: "3600" });
        if (!error) {
          const { data: { publicUrl } } = db.storage.from("ticket-images").getPublicUrl(path);
          images.push({ name: img.name, size: img.size, type: img.type, url: publicUrl });
        }
      } else {
        images.push({ name: img.name, size: img.size, type: img.type, url: img.url });
      }
    }

    const row = {
      id: ticket.id, title: ticket.title, device_type: ticket.deviceType,
      asset: ticket.asset, department: ticket.department,
      reporter: ticket.reporter, contact: ticket.contact,
      priority: ticket.priority, detail: ticket.detail,
      status: "NEW", tech: null, images, history: ticket.history,
      created_at: ticket.createdAt, updated_at: ticket.updatedAt,
    };

    const { error } = await db.from("tickets").insert(row);
    if (!error) {
      const resolved = { ...ticket, images };
      setTickets(arr => [resolved, ...arr]);
      setToast({ msg: "บันทึกคำขอเรียบร้อย รหัส " + ticket.id, kind: "ok" });
      return resolved;
    } else {
      setToast({ msg: "เกิดข้อผิดพลาด กรุณาลองใหม่", kind: "err" });
      return null;
    }
  };

  const updateTicket = async (updated) => {
    const { error } = await db.from("tickets").update({
      status:     updated.status,
      tech:       updated.tech,
      history:    updated.history,
      updated_at: updated.updatedAt,
    }).eq("id", updated.id);

    if (!error) {
      setTickets(arr => arr.map(t => t.id === updated.id ? updated : t));
      setToast({ msg: "อัพเดทข้อมูลเรียบร้อย", kind: "ok" });
    } else {
      setToast({ msg: "เกิดข้อผิดพลาดในการบันทึก", kind: "err" });
    }
  };

  const onLogout = async () => {
    await db.auth.signOut();
    setRoute({ name: "home", param: null });
    setToast({ msg: "ออกจากระบบเรียบร้อย", kind: "ok" });
  };

  if (loading) return (
    <div style={{display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap:16}}>
      <div style={{
        width:48, height:48, borderRadius:12,
        background:"conic-gradient(from 200deg, #5865ff, #ffb547, #67e8f9, #5865ff)",
        animation:"meshDrift 1.5s linear infinite",
      }}/>
      <div style={{color:"var(--text-dim)", fontSize:14}}>กำลังโหลด...</div>
    </div>
  );

  return (
    <>
      <TopBar
        user={user}
        onHome={()=>go(user ? "admin" : "home")}
        onAdmin={()=>go("login")}
        onLogout={onLogout}
      />

      {route.name === "home"   && <HomeScreen tickets={tickets} go={go}/>}
      {route.name === "submit" && <SubmitScreen go={go} onSubmit={submitTicket}/>}
      {route.name === "track"  && <TrackScreen tickets={tickets} go={go} initialId={route.param}/>}
      {route.name === "login"  && <LoginScreen go={go}/>}
      {route.name === "admin"  && user && (
        <AdminApp tickets={tickets} updateTicket={updateTicket} user={user} go={go}/>
      )}

      {toast && <Toast msg={toast.msg} kind={toast.kind} onDone={()=>setToast(null)}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
