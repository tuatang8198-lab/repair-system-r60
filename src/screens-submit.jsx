// ============ Submit ticket form ============

function SubmitScreen({ go, onSubmit }){
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    deviceType: "DESKTOP",
    asset: "",
    department: "",
    title: "",
    detail: "",
    priority: "MED",
    reporter: "",
    contact: "",
    images: [],
  });
  const set = (k,v)=>setForm(s=>({...s, [k]:v}));
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const valid1 = form.deviceType && form.asset && form.department.trim().length >= 2;
  const valid2 = form.title.length >= 5 && form.detail.length >= 10;
  const valid3 = form.reporter && form.contact.length >= 9;

  const doSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ticket = {
      id: makeId(),
      title: form.title,
      deviceType: form.deviceType,
      asset: form.asset,
      department: form.department,
      reporter: form.reporter,
      contact: form.contact,
      priority: form.priority,
      detail: form.detail,
      images: form.images,
      status: "NEW",
      tech: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      history: [{ ts: Date.now(), label:"รับเรื่องแจ้งซ่อม", by:"ระบบ", note:"บันทึกคำขอเข้าระบบ" }],
    };
    const result = await onSubmit(ticket);
    setSubmitting(false);
    if (result) setSubmitted(result);
  };

  if (submitted) return <SubmitSuccess ticket={submitted} go={go}/>;

  return (
    <div className="page-enter" style={{maxWidth:760, margin:"0 auto", padding:"36px 24px 80px"}}>
      <button className="btn btn-ghost btn-sm" onClick={()=>go("home")} style={{marginBottom:18}}>
        <Icon name="back" size={14}/> กลับหน้าหลัก
      </button>
      <h1 style={{fontSize:32, fontWeight:700, margin:"0 0 6px", letterSpacing:"-0.01em"}}>แจ้งซ่อมอุปกรณ์</h1>
      <p style={{color:"var(--text-dim)", marginBottom:24}}>กรอกรายละเอียดเพื่อแจ้งเรื่องเข้าระบบ ใช้เวลาประมาณ 2 นาที</p>

      <Stepper step={step} steps={["ข้อมูลอุปกรณ์","อาการเสีย","ผู้แจ้ง"]}/>

      <div className="glass" style={{padding:28, marginTop:18}}>
        {step===1 && (
          <div className="col page-enter" style={{gap:18}}>
            <div className="field">
              <label>ประเภทอุปกรณ์</label>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:8}}>
                {DEVICE_TYPES.map(d=>(
                  <button key={d.key}
                    onClick={()=>set("deviceType", d.key)}
                    className={form.deviceType===d.key?"":""}
                    style={{
                      padding:"14px 12px",
                      borderRadius:12,
                      border:"1px solid "+(form.deviceType===d.key?"var(--primary)":"var(--border)"),
                      background: form.deviceType===d.key?"var(--primary-soft)":"rgba(255,255,255,0.03)",
                      color: form.deviceType===d.key?"var(--text)":"var(--text-dim)",
                      transition:"all .2s",
                      textAlign:"left",
                      cursor:"pointer",
                    }}>
                    <div style={{fontSize:24, marginBottom:4}}>{d.icon}</div>
                    <div style={{fontSize:13, fontWeight:500}}>{d.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="row" style={{gap:18, flexWrap:"wrap"}}>
              <div className="field" style={{flex:1, minWidth:220}}>
                <label>หมายเลขครุภัณฑ์ / Asset</label>
                <input className="input mono" placeholder="เช่น R60-PC-022"
                  value={form.asset} onChange={e=>set("asset", e.target.value)}/>
              </div>
              <div className="field" style={{flex:1, minWidth:220}}>
                <label>สถานที่ตั้ง</label>
                <input className="input" placeholder="เช่น ห้องคอมพิวเตอร์ 2 อาคารเรียน 3"
                  value={form.department} onChange={e=>set("department", e.target.value)}
                  list="dept-suggestions"/>
                <datalist id="dept-suggestions">
                  {DEPARTMENTS.map(d=><option key={d} value={d}/>)}
                </datalist>
                <div style={{fontSize:11, color:"var(--text-mute)", marginTop:2}}>ระบุห้อง / อาคารให้ละเอียด เพื่อให้ช่างหาตำแหน่งได้เร็วขึ้น</div>
              </div>
            </div>
            <div className="row" style={{justifyContent:"flex-end", marginTop:6}}>
              <button className="btn btn-primary" disabled={!valid1}
                style={{opacity:valid1?1:0.5}}
                onClick={()=>setStep(2)}>
                ถัดไป <Icon name="arrow" size={14}/>
              </button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="col page-enter" style={{gap:18}}>
            <div className="field">
              <label>หัวข้อ / อาการเสีย</label>
              <input className="input" placeholder="เช่น เปิดเครื่องไม่ติด, จอภาพไม่แสดงผล"
                value={form.title} onChange={e=>set("title", e.target.value)} maxLength={80}/>
              <div style={{fontSize:11, color:"var(--text-mute)", textAlign:"right"}} className="mono">{form.title.length}/80</div>
            </div>
            <div className="field">
              <label>รายละเอียดเพิ่มเติม</label>
              <textarea className="textarea" placeholder="อธิบายอาการ ลักษณะปัญหา ความถี่ที่เกิด หรือสิ่งที่ลองแก้แล้ว..."
                value={form.detail} onChange={e=>set("detail", e.target.value)} maxLength={500}/>
              <div style={{fontSize:11, color:"var(--text-mute)", textAlign:"right"}} className="mono">{form.detail.length}/500</div>
            </div>
            <div className="field">
              <label>ภาพประกอบอาการเสีย (ถ้ามี)</label>
              <ImageUploader images={form.images} onChange={(imgs)=>set("images", imgs)}/>
            </div>
            <div className="field">
              <label>ความเร่งด่วน</label>
              <div className="row" style={{gap:8, flexWrap:"wrap"}}>
                {Object.values(PRIORITY).map(p=>(
                  <button key={p.key} onClick={()=>set("priority", p.key)}
                    style={{
                      padding:"10px 16px", borderRadius:99,
                      border:"1px solid "+(form.priority===p.key?p.color:"var(--border)"),
                      background: form.priority===p.key?`${p.color}22`:"rgba(255,255,255,0.03)",
                      color: form.priority===p.key?p.color:"var(--text-dim)",
                      fontWeight: 500, fontSize:13, cursor:"pointer", transition:"all .2s",
                    }}>
                    <span style={{display:"inline-block", width:8, height:8, borderRadius:99, background:p.color, marginRight:8}}/>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="row" style={{justifyContent:"space-between", marginTop:6}}>
              <button className="btn btn-ghost" onClick={()=>setStep(1)}><Icon name="back" size={14}/> ก่อนหน้า</button>
              <button className="btn btn-primary" disabled={!valid2} style={{opacity:valid2?1:0.5}} onClick={()=>setStep(3)}>
                ถัดไป <Icon name="arrow" size={14}/>
              </button>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="col page-enter" style={{gap:18}}>
            <div className="row" style={{gap:18, flexWrap:"wrap"}}>
              <div className="field" style={{flex:1, minWidth:220}}>
                <label>ชื่อ-นามสกุล ผู้แจ้ง</label>
                <input className="input" placeholder="เช่น อ.สุภาพร เทพา"
                  value={form.reporter} onChange={e=>set("reporter", e.target.value)}/>
              </div>
              <div className="field" style={{flex:1, minWidth:220}}>
                <label>เบอร์โทรติดต่อ</label>
                <input className="input mono" placeholder="081-234-5678"
                  value={form.contact} onChange={e=>set("contact", e.target.value)}/>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background:"rgba(88,101,255,0.08)",
              border:"1px solid rgba(88,101,255,0.2)",
              borderRadius:14, padding:18,
            }}>
              <div style={{fontSize:12, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10}}>
                สรุปก่อนยืนยัน
              </div>
              <div style={{display:"grid", gridTemplateColumns:"110px 1fr", gap:"8px 12px", fontSize:14}}>
                <span style={{color:"var(--text-dim)"}}>อุปกรณ์</span>
                <span>{DEVICE_TYPES.find(d=>d.key===form.deviceType)?.label} · <span className="mono">{form.asset}</span></span>
                <span style={{color:"var(--text-dim)"}}>สถานที่</span>
                <span>{form.department}</span>
                <span style={{color:"var(--text-dim)"}}>อาการ</span>
                <span>{form.title || <em style={{color:"var(--text-mute)"}}>—</em>}</span>
                <span style={{color:"var(--text-dim)"}}>เร่งด่วน</span>
                <span><PriorityChip priority={form.priority}/></span>
                <span style={{color:"var(--text-dim)"}}>ภาพประกอบ</span>
                <span>{form.images.length > 0 ? `${form.images.length} รูป` : <span style={{color:"var(--text-mute)"}}>ไม่มี</span>}</span>
              </div>
            </div>

            <div className="row" style={{justifyContent:"space-between"}}>
              <button className="btn btn-ghost" onClick={()=>setStep(2)}><Icon name="back" size={14}/> ก่อนหน้า</button>
              <button className="btn btn-primary" disabled={!valid3 || submitting} style={{opacity:(valid3&&!submitting)?1:0.5}} onClick={doSubmit}>
                {submitting ? <><Icon name="spinner" size={14}/> กำลังบันทึก...</> : <><Icon name="check" size={14}/> ยืนยันแจ้งซ่อม</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ step, steps }){
  return (
    <div className="row" style={{gap:0}}>
      {steps.map((s,i)=>{
        const idx = i+1;
        const active = idx === step, done = idx < step;
        return (
          <React.Fragment key={i}>
            <div className="row" style={{gap:10}}>
              <div style={{
                width:32, height:32, borderRadius:99,
                display:"flex", alignItems:"center", justifyContent:"center",
                background: done?"var(--success)":active?"var(--primary)":"var(--surface)",
                color: (done||active)?"white":"var(--text-dim)",
                fontWeight:600, fontSize:13,
                border: "1px solid "+((done||active)?"transparent":"var(--border)"),
                transition:"all .3s",
              }}>
                {done ? <Icon name="check" size={14}/> : idx}
              </div>
              <div style={{fontSize:13, color: active?"var(--text)":"var(--text-dim)", fontWeight: active?600:400}}>{s}</div>
            </div>
            {i < steps.length-1 && (
              <div style={{flex:1, height:1, background:done?"var(--success)":"var(--border)", margin:"0 14px", transition:"all .3s"}}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SubmitSuccess({ ticket, go }){
  return (
    <div className="page-enter" style={{maxWidth:560, margin:"0 auto", padding:"60px 24px"}}>
      <div className="glass" style={{padding:32, textAlign:"center"}}>
        <div style={{
          width:72, height:72, borderRadius:"50%",
          background:"linear-gradient(180deg, var(--success), #3aa965)",
          margin:"0 auto 20px",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"white", boxShadow:"0 16px 40px -10px rgba(74,222,128,.5)",
          animation:"pageIn .5s .1s both",
        }}>
          <Icon name="check" size={36} stroke={2.2}/>
        </div>
        <div style={{fontSize:24, fontWeight:700, marginBottom:8}}>บันทึกคำขอเรียบร้อย!</div>
        <div style={{color:"var(--text-dim)", marginBottom:20, lineHeight:1.6}}>
          เจ้าหน้าที่จะรับเรื่องและติดต่อกลับโดยเร็ว สามารถใช้รหัสด้านล่างตรวจสอบสถานะได้ตลอดเวลา
        </div>
        <div style={{
          padding:"18px 16px",
          background:"rgba(88,101,255,0.1)",
          border:"1px dashed rgba(88,101,255,0.4)",
          borderRadius:14, marginBottom:22,
        }}>
          <div style={{fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.1em"}}>รหัสคำขอ</div>
          <div className="mono" style={{fontSize:28, fontWeight:700, color:"var(--primary)", letterSpacing:"0.04em", marginTop:4}}>
            {ticket.id}
          </div>
        </div>
        <div className="row" style={{justifyContent:"center", gap:10}}>
          <button className="btn btn-ghost" onClick={()=>go("home")}>กลับหน้าหลัก</button>
          <button className="btn btn-primary" onClick={()=>go("track", ticket.id)}>
            <Icon name="search" size={14}/> ตรวจสอบสถานะ
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SubmitScreen, Stepper, SubmitSuccess, ImageUploader });

// ============ Image Uploader ============
function ImageUploader({ images, onChange, max=4 }){
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");

  const addFiles = (files) => {
    setErr("");
    const arr = Array.from(files);
    const free = max - images.length;
    if (arr.length > free){
      setErr(`อัพโหลดได้สูงสุด ${max} ภาพ`);
    }
    const take = arr.slice(0, free);
    const reads = take.map(f => new Promise((res, rej) => {
      if (!f.type.startsWith("image/")){ res(null); return; }
      if (f.size > 5*1024*1024){ setErr("ขนาดไฟล์ต้องไม่เกิน 5MB ต่อภาพ"); res(null); return; }
      const r = new FileReader();
      r.onload = () => res({ name: f.name, size: f.size, type: f.type, url: r.result, _file: f });
      r.onerror = rej;
      r.readAsDataURL(f);
    }));
    Promise.all(reads).then(results => {
      const ok = results.filter(Boolean);
      if (ok.length) onChange([...images, ...ok]);
    });
  };

  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const remove = (idx) => onChange(images.filter((_,i)=>i!==idx));

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{display:"none"}}
        onChange={e=>{ if(e.target.files?.length) addFiles(e.target.files); e.target.value=""; }}/>

      <div
        onClick={()=>images.length<max && inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault(); setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={onDrop}
        style={{
          padding: 20,
          border: `1.5px dashed ${drag?"rgba(88,101,255,0.7)":"var(--border-strong)"}`,
          borderRadius: 14,
          background: drag ? "rgba(88,101,255,0.08)" : "rgba(255,255,255,0.02)",
          textAlign:"center",
          cursor: images.length<max ? "pointer" : "default",
          transition:"all .2s",
        }}>
        <div style={{
          width:46, height:46, borderRadius:12,
          background:"linear-gradient(135deg, var(--primary), #67e8f9)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"white", margin:"0 auto 10px",
          boxShadow:"0 10px 24px -10px rgba(88,101,255,0.6)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <path d="M17 8l-5-5-5 5"/>
            <path d="M12 3v12"/>
          </svg>
        </div>
        <div style={{fontWeight:600, fontSize:14}}>
          {images.length < max ? "ลากไฟล์มาวาง หรือคลิกเพื่ออัพโหลด" : "ครบจำนวนสูงสุดแล้ว"}
        </div>
        <div style={{fontSize:12, color:"var(--text-dim)", marginTop:4}}>
          รองรับ JPG, PNG, WEBP · ไม่เกิน 5MB · สูงสุด {max} ภาพ
        </div>
      </div>

      {err && (
        <div style={{
          marginTop:8, padding:"8px 12px", borderRadius:10,
          background:"var(--danger-soft)", border:"1px solid rgba(255,107,138,0.3)",
          color:"var(--danger)", fontSize:12,
        }}>{err}</div>
      )}

      {images.length > 0 && (
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",
          gap:10, marginTop:12,
        }}>
          {images.map((img, i)=>(
            <div key={i} style={{
              position:"relative", aspectRatio:"1/1",
              borderRadius:12, overflow:"hidden",
              border:"1px solid var(--border)",
              background:"#000",
              animation:"pageIn .35s ease both",
            }}>
              <img src={img.url} alt={img.name} style={{
                width:"100%", height:"100%", objectFit:"cover",
              }}/>
              <button onClick={(e)=>{ e.stopPropagation(); remove(i); }}
                aria-label="ลบรูป"
                style={{
                  position:"absolute", top:6, right:6,
                  width:26, height:26, borderRadius:99,
                  background:"rgba(20,22,40,0.9)", color:"white",
                  border:"1px solid rgba(255,255,255,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer",
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18"/>
                </svg>
              </button>
              <div style={{
                position:"absolute", bottom:0, left:0, right:0,
                padding:"4px 8px",
                background:"linear-gradient(180deg, transparent, rgba(0,0,0,0.8))",
                color:"white", fontSize:11,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              }}>{img.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
