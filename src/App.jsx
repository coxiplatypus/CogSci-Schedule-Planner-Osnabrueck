// ══════════════════════════════════════════════════════════════
// Main App component — all UI and logic lives here
// ══════════════════════════════════════════════════════════════
function App(){
  // ── State: plan data ──
  const [ck,setCk]=useState("msc24");
  const [status,setStatus]=useState({});
  const [pres,setPres]=useState(()=>{const o={};C.forEach(c=>{o[c.id]="unclear"});return o});
  const [custom,setCustom]=useState([]);
  const [baseline,setBaseline]=useState({});
  const [edits,setEdits]=useState({}); // {courseId: {name,short,ects,a24,a19,slots,...}}
  const [dayF,setDayF]=useState(null);
  const [ob,setOb]=useState(true);
  const [copied,setCopied]=useState(null); // null | "local" | "shared"
  const [ready,setReady]=useState(false);
  const [hov,setHov]=useState(null);
  const [mousePos,setMousePos]=useState({x:0,y:0});
  const [expanded,setExpanded]=useState({});
  const [groupBy,setGroupBy]=useState("area"); // "area" | "status"
  const [showAdd,setShowAdd]=useState(false);
  const [addSlots,setAddSlots]=useState([]);
  const [addForm,setAddForm]=useState({name:"",short:"",ects:4,a24:"Free Elective",a19:"Free Elective",room:""});
  const [nextCid,setNextCid]=useState(1);
  // Edit/add course form state
  const [editingId,setEditingId]=useState(null);
  const [editForm,setEditForm]=useState(null);
  const [editSlots,setEditSlots]=useState([]);
  const [showBaselineEdit,setShowBaselineEdit]=useState(false);

  // Layout state (resizable panels)
  const LK=SK+"-layout";
  const [sideW,setSideW]=useState(300);
  const [ectsH,setEctsH]=useState(null);
  const [mobileGridH,setMobileGridH]=useState(null);
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"&&window.innerWidth<=768);
  const [dragging,setDragging]=useState(null); // null | "h" | "v" | "mv" | "corner"

  // Load/save layout separately from plan data
  useEffect(()=>{
    try{const d=JSON.parse(localStorage.getItem(LK));if(d){if(d.sideW)setSideW(d.sideW);if(d.ectsH)setEctsH(d.ectsH)}}catch(e){}
    const onResize=()=>setIsMobile(window.innerWidth<=768);
    window.addEventListener("resize",onResize);return()=>window.removeEventListener("resize",onResize);
  },[]);
  useEffect(()=>{try{localStorage.setItem(LK,JSON.stringify({sideW,ectsH}))}catch(e){}},[sideW,ectsH]);

  const resetLayout=()=>{setSideW(300);setEctsH(null);setMobileGridH(null);try{localStorage.removeItem(LK)}catch(e){}};

  // Drag handlers
  const startDragH=(e)=>{
    e.preventDefault();setDragging("h");
    const startX=e.clientX,startW=sideW;
    const onMove=(e2)=>setSideW(Math.max(200,Math.min(Math.round(window.innerWidth*0.66),startW+e2.clientX-startX)));
    const onUp=()=>{setDragging(null);document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp)};
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  };
  const startDragV=(e)=>{
    e.preventDefault();setDragging("v");
    const startY=e.clientY,startH=ectsH||e.target.previousElementSibling?.offsetHeight||200;
    const onMove=(e2)=>setEctsH(Math.max(80,Math.min(window.innerHeight*0.5,startH+e2.clientY-startY)));
    const onUp=()=>{setDragging(null);document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp)};
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  };
  const startDragMV=(e)=>{
    e.preventDefault();setDragging("mv");
    const startY=e.clientY,startH=mobileGridH||window.innerHeight*0.6;
    const onMove=(e2)=>setMobileGridH(Math.max(150,Math.min(window.innerHeight*0.85,startH+e2.clientY-startY)));
    const onUp=()=>{setDragging(null);document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp)};
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  };
  const startDragCorner=(e)=>{
    e.preventDefault();setDragging("corner");
    const startX=e.clientX,startY=e.clientY,startW=sideW,startH=ectsH||e.target.closest(".app-sidebar")?.querySelector("[data-ects]")?.offsetHeight||200;
    const onMove=(e2)=>{setSideW(Math.max(200,Math.min(Math.round(window.innerWidth*0.66),startW+e2.clientX-startX)));setEctsH(Math.max(80,Math.min(window.innerHeight*0.5,startH+e2.clientY-startY)))};
    const onUp=()=>{setDragging(null);document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp)};
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  };
  const [importError,setImportError]=useState(null);
  const [showRef,setShowRef]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [gridMenu,setGridMenu]=useState(null); // {id,x,y} — status menu on grid left-click
  const [presMenu,setPresMenu]=useState(null); // {id,x,y} — attendance menu on grid right-click

  const isOn=(id)=>!!status[id]&&status[id]!=="dropped";
  const stOf=(id)=>ST.find(s=>s.v===status[id])||null;
  const cfg=CFGS[ck];
  const isPo24=cfg.po24;
  const isMsc=cfg.msc;

  // Merge custom courses + edits into effective course list
  const allCourses=useMemo(()=>[...C,...custom],[custom]);
  const courses=useMemo(()=>allCourses.map(c=>edits[c.id]?{...c,...edits[c.id]}:c),[allCourses,edits]);
  const areaOf=(c)=>{
    if(c.cat==="colloquium")return "Colloquium";
    if(c.cat==="sp")return "Study Project";
    if(c.cat==="bsc-core")return "BSc Core";
    return isPo24?c.a24:c.a19;
  };

  // Filter courses by selected degree (BSc/MSc)
  const visible=useMemo(()=>courses.filter(c=>{
    if(c.deg==="msc"&&!isMsc)return false;
    if(c.deg==="bsc"&&isMsc)return false;
    if(c.cat==="sp"&&!isMsc)return false;
    if(c.cat==="bsc-core"&&isMsc)return false;
    return true;
  }),[ck,courses]);

  // Load (supports old format migration: on→status)
  useEffect(()=>{
    // Priority: URL params > localStorage. Supports old format migration (on→status)
    const u=fromURL(),s=load(),d=u||s;
    if(d){
      if(d.ck&&CFGS[d.ck])setCk(d.ck);
      if(d.status)setStatus(d.status);
      else if(d.on){const m={};Object.entries(d.on).forEach(([k,v])=>{if(v)m[k]="locked"});setStatus(m)}
      if(d.pres)setPres(p=>{const n={...p};Object.entries(d.pres).forEach(([k,v])=>{if(k in n)n[k]=v});return n});
      if(d.custom){setCustom(d.custom);d.custom.forEach(c=>{setPres(p=>({...p,[c.id]:p[c.id]||"unclear"}))})}
      if(d.edits)setEdits(d.edits);
      // Baseline: use URL's baseline if present, otherwise keep recipient's own from localStorage
      if(d.baseline)setBaseline(d.baseline);
      else if(u&&s&&s.baseline)setBaseline(s.baseline);
      setOb(false);
      if(u)history.replaceState({},"",location.pathname);
    }
    setReady(true);
  },[]);
  useEffect(()=>{if(ready)save({ck,status,pres,custom,edits,baseline})},[ck,status,pres,custom,edits,baseline,ready]);

  // Status: direct set (segmented control)
  const setSt=(id,v)=>setStatus(p=>{
    if(v===status[id]){const n={...p};delete n[id];return n}  // click active = deselect
    return{...p,[id]:v};
  });
  const dropCourse=(id)=>setStatus(p=>{const n={...p};delete n[id];return n});
  const cyclePres=(id)=>{const o=["yes","unclear","no"];setPres(p=>({...p,[id]:o[(o.indexOf(p[id])+1)%3]}))};

  // Add custom course (multi-slot)
  const addCustom=()=>{
    const f=addForm;if(!f.name.trim())return;
    const id=`custom-${nextCid}`;
    const nc={id,name:f.name.trim(),short:f.short.trim()||f.name.trim().split(/\s+/)[0],ects:parseInt(f.ects)||4,nr:"",
      deg:"both",cat:"course",a24:f.a24,a19:f.a19,room:f.room||"",slots:addSlots.map(s=>({day:parseInt(s.day),start:parseInt(s.start),end:parseInt(s.end),...(s.room?{room:s.room}:{})})),note:"Custom",isCustom:true};
    setCustom(p=>[...p,nc]);
    setStatus(p=>({...p,[id]:"considering"}));
    setPres(p=>({...p,[id]:"unclear"}));
    setNextCid(n=>n+1);
    setAddForm({name:"",short:"",ects:4,a24:"Free Elective",a19:"Free Elective",room:""});
    setAddSlots([]);
    setShowAdd(false);
  };
  const removeCustom=(id)=>{
    setCustom(p=>p.filter(c=>c.id!==id));
    setEdits(p=>{const n={...p};delete n[id];return n});
    setStatus(p=>{const n={...p};delete n[id];return n});
    setPres(p=>{const n={...p};delete n[id];return n});
  };

  // Edit any course
  const startEdit=(c)=>{
    setEditingId(c.id);
    setEditForm({name:c.name,short:c.short,ects:c.ects,a24:c.a24||"Free Elective",a19:c.a19||"Free Elective",nr:c.nr||"",room:c.room||""});
    setEditSlots(c.slots.map(s=>({day:String(s.day),start:String(s.start),end:String(s.end),label:s.label||"",room:s.room||""})));
  };
  const saveEdit=()=>{
    if(!editForm||!editingId)return;
    const f=editForm;
    const patch={name:f.name.trim(),short:f.short.trim(),ects:parseInt(f.ects)||4,a24:f.a24,a19:f.a19,nr:f.nr,room:f.room.trim(),
      slots:editSlots.map(s=>({day:parseInt(s.day),start:parseInt(s.start),end:parseInt(s.end),...(s.label?{label:s.label}:{}),...(s.room?{room:s.room}:{})}))};
    // For custom courses, update the custom array directly
    const isCustom=editingId.startsWith("custom-");
    if(isCustom){
      setCustom(p=>p.map(c=>c.id===editingId?{...c,...patch}:c));
    }else{
      setEdits(p=>({...p,[editingId]:patch}));
    }
    setEditingId(null);setEditForm(null);setEditSlots([]);
  };
  const cancelEdit=()=>{setEditingId(null);setEditForm(null);setEditSlots([])};
  const resetEdit=(id)=>{setEdits(p=>{const n={...p};delete n[id];return n})};

  // Conflicts: hard (locked/likely vs locked/likely, at least one locked) and soft (likely vs likely)
  const conflicts=useMemo(()=>{
    const hardSet=new Set(),softSet=new Set(),hardPairs=[],softPairs=[];
    const act=visible.filter(c=>(status[c.id]==="locked"||status[c.id]==="likely")&&c.slots.length>0);
    for(let i=0;i<act.length;i++)for(let j=i+1;j<act.length;j++){
      if(pres[act[i].id]==="no"||pres[act[j].id]==="no")continue;
      for(const sa of act[i].slots)for(const sb of act[j].slots){
        if(!overlaps(sa,sb))continue;
        const pair={a:act[i],b:act[j],day:sa.day,from:Math.max(sa.start,sb.start),to:Math.min(sa.end,sb.end)};
        if(status[act[i].id]==="likely"&&status[act[j].id]==="likely"){
          softSet.add(act[i].id);softSet.add(act[j].id);softPairs.push(pair);
        }else{
          hardSet.add(act[i].id);hardSet.add(act[j].id);hardPairs.push(pair);
        }
      }
    }
    return{hardSet,softSet,hardPairs,softPairs,allSet:new Set([...hardSet,...softSet])};
  },[status,pres,visible]);

  // ECTS: split confirmed (locked+likely) vs considering
  const proj=useMemo(()=>{
    const rl={},rk={},rc={};
    const init=(k)=>{rl[k]=0;rk[k]=0;rc[k]=0};
    cfg.areas.forEach(a=>init(a.key));init(cfg.fe.key);
    if(isMsc){init("Study Project");init("Colloquium")}
    if(!isMsc)init("BSc Core");
    visible.filter(c=>isOn(c.id)).forEach(c=>{
      const a=areaOf(c),lp=c.ects||0;
      if(status[c.id]==="considering"){rc[a]=(rc[a]||0)+lp}
      else if(status[c.id]==="locked"){rl[a]=(rl[a]||0)+lp}
      else if(status[c.id]==="likely"){rk[a]=(rk[a]||0)+lp}
    });
    return{locked:rl,likely:rk,considering:rc};
  },[status,ck,visible]);

  const wpTotal=cfg.areas.reduce((s,a)=>s+(proj.locked[a.key]||0)+(proj.likely[a.key]||0),0);
  const wpCons=cfg.areas.reduce((s,a)=>s+(proj.considering[a.key]||0),0);
  const feTotal=(proj.locked[cfg.fe.key]||0)+(proj.likely[cfg.fe.key]||0);
  const feCons=proj.considering[cfg.fe.key]||0;
  const selTotal=Object.keys(proj.locked).reduce((s,k)=>s+(proj.locked[k]||0)+(proj.likely[k]||0),0);
  const conTotal=Object.values(proj.considering).reduce((a,b)=>a+b,0);

  // ── Grid slot map: map each hour-cell to the courses that occupy it ──
  const slotMap=useMemo(()=>{
    const m={};DAYS.forEach((_,di)=>HOURS.forEach(h=>{m[`${di}-${h}`]=[]}));
    visible.forEach(c=>{if(!isOn(c.id))return;
      c.slots.forEach((sl,si)=>{for(let h=sl.start;h<sl.end;h++){const k=`${sl.day}-${h}`;if(m[k])m[k].push({course:c,slot:sl,si,isStart:h===sl.start})}});
    });return m;
  },[status,visible]);

  const visDays=dayF!==null?[dayF]:[0,1,2,3,4];
  const allConflictPairs=[...conflicts.hardPairs,...conflicts.softPairs];
  const fHardConf=dayF!==null?conflicts.hardPairs.filter(p=>p.day===dayF):conflicts.hardPairs;
  const fSoftConf=dayF!==null?conflicts.softPairs.filter(p=>p.day===dayF):conflicts.softPairs;

  const hasBaseline=Object.values(baseline).some(v=>v>0);
  // ── Share, export, reset ──
  const isHosted=location.protocol.startsWith("http");
  const share=(withBaseline)=>{const data={ck,status,pres,custom,edits};if(withBaseline)data.baseline=baseline;const url=toURL(data);if(url)navigator.clipboard.writeText(url).then(()=>{setCopied(withBaseline?"credits":"plan");setTimeout(()=>setCopied(null),5e3)}).catch(()=>prompt("Copy:",url))};
  const doExport=()=>exportICS(visible,status,pres,areaOf);
  const handleImport=(e)=>{
    const file=e.target.files[0];if(!file)return;
    setImportError(null);
    parseGradeCalc(file).then(b=>{setBaseline(b);setShowBaselineEdit(false)}).catch(err=>setImportError(String(err)));
    e.target.value="";
  };
  const reset=()=>{setStatus({});const p={};courses.forEach(c=>{p[c.id]="unclear"});setPres(p)};
  const deleteAllData=()=>{
    try{localStorage.removeItem(SK)}catch(e){}
    setStatus({});setEdits({});setBaseline({});setCustom([]);
    const p={};C.forEach(c=>{p[c.id]="unclear"});setPres(p);
    setCk("msc24");setConfirmDelete(false);
    if(location.search)history.replaceState({},"",location.pathname);
  };

  const toggleArea=(key)=>setExpanded(p=>({...p,[key]:!p[key]}));
  const expandAll=()=>{const e={};categories.forEach(g=>{e[g.key]=true});setExpanded(e)};
  const collapseAll=()=>{const e={};[...categories,...statusGroups].forEach(g=>{e[g.key]=false});setExpanded(e)};

  // Build area-based categories
  const categories=useMemo(()=>{
    const cats=[];
    const addCat=(key,cl,crs,extra={})=>{
      if(crs.length===0)return;
      const weekly=crs.filter(c=>c.slots.length>0);
      const block=crs.filter(c=>c.slots.length===0);
      const selN=crs.filter(c=>isOn(c.id)).length;
      const selLP=crs.filter(c=>isOn(c.id)).reduce((s,c)=>s+(c.ects||0),0);
      const hasConf=crs.some(c=>conflicts.allSet.has(c.id));
      cats.push({key,cl,...extra,courses:crs,weekly,block,selN,selLP,hasConf});
    };
    if(isPo24){
      cfg.areas.forEach(a=>{
        addCat(a.key,a.cl,visible.filter(c=>areaOf(c)===a.key),{cap:a.cap,spec:a.spec,info:a.info});
      });
    }
    addCat("Free Elective",CL.fe,visible.filter(c=>areaOf(c)==="Free Elective"&&c.cat==="course"));
    if(isMsc)addCat("Study Project",CL.sp,visible.filter(c=>c.cat==="sp"));
    addCat("Colloquium",CL.co,visible.filter(c=>c.cat==="colloquium"),{note:A24co.note});
    if(!isMsc)addCat("BSc Core",CL.bc,visible.filter(c=>c.cat==="bsc-core"));
    if(!isPo24){
      cfg.areas.forEach(a=>{
        addCat(a.key,a.cl,visible.filter(c=>areaOf(c)===a.key&&c.cat==="course"),{cap:a.cap,spec:a.spec});
      });
    }
    return cats;
  },[visible,ck,status,conflicts]);

  // Build status-based groups
  const statusGroups=useMemo(()=>{
    const groups=[
      {key:"locked",label:"Locked",icon:"✓",cl:{c:"#059669",bg:"#d1fae5",t:"#065f46"},courses:[]},
      {key:"likely",label:"Likely",icon:"~",cl:{c:"#2563eb",bg:"#dbeafe",t:"#1e40af"},courses:[]},
      {key:"considering",label:"Considering",icon:"?",cl:{c:"#8b5cf6",bg:"#ede9fe",t:"#5b21b6"},courses:[]},
      {key:"off",label:"Not selected",icon:"",cl:{c:"#9ca3af",bg:"#f3f4f6",t:"#6b7280"},courses:[]},
      {key:"dropped",label:"Dropped",icon:"✕",cl:{c:"#dc2626",bg:"#fef2f2",t:"#991b1b"},courses:[]},
    ];
    visible.forEach(c=>{
      const s=status[c.id];
      const g=groups.find(x=>x.key===(s||"off"));
      if(g)g.courses.push(c);
    });
    groups.forEach(g=>{
      g.weekly=g.courses.filter(c=>c.slots.length>0);
      g.block=g.courses.filter(c=>c.slots.length===0);
      g.selN=g.courses.length;
      g.selLP=g.courses.reduce((s,c)=>s+(c.ects||0),0);
      g.hasConf=g.courses.some(c=>conflicts.allSet.has(c.id));
    });
    return groups;
  },[visible,status,conflicts]);

  const getClForArea=(key)=>{const cat=categories.find(c=>c.key===key);return cat?cat.cl:CL.fe};

  // Slot editor component (reusable for add + edit forms)
  const SlotEditor=({slots,setSlots})=>(
    <div style={{marginBottom:3}}>
      {slots.map((sl,i)=>(
        <div key={i} style={{display:"flex",gap:3,marginBottom:2,alignItems:"center"}}>
          <select value={sl.day} onChange={e=>{const n=[...slots];n[i]={...n[i],day:e.target.value};setSlots(n)}} style={{flex:1,padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}}>
            {DAYS.map((d,di)=><option key={di} value={di}>{d}</option>)}
          </select>
          <select value={sl.start} onChange={e=>{const n=[...slots];n[i]={...n[i],start:e.target.value};setSlots(n)}} style={{width:52,padding:"3px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}}>
            {HOURS.map(h=><option key={h} value={h}>{h}:00</option>)}
          </select>
          <span style={{fontSize:9,color:"#9ca3af"}}>–</span>
          <select value={sl.end} onChange={e=>{const n=[...slots];n[i]={...n[i],end:e.target.value};setSlots(n)}} style={{width:52,padding:"3px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}}>
            {[...HOURS.filter(h=>h>parseInt(sl.start)),20].map(h=><option key={h} value={h}>{h}:00</option>)}
          </select>
          <input value={sl.room||""} onChange={e=>{const n=[...slots];n[i]={...n[i],room:e.target.value};setSlots(n)}} placeholder="Room" style={{width:60,padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}} title="Room for this slot"/>
          <button onClick={()=>setSlots(slots.filter((_,j)=>j!==i))} style={{width:14,height:14,borderRadius:2,border:"none",background:"#fef2f2",color:"#dc2626",fontSize:8,padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      ))}
      <button onClick={()=>setSlots([...slots,{day:"0",start:"10",end:"12"}])} style={{fontSize:12,color:"#2563eb",background:"none",border:"none",padding:"2px 0"}}>+ Add time slot</button>
    </div>
  );

  // Render a course row in sidebar
  const CourseRow=({c,g})=>{
    const st=stOf(c.id);const active=isOn(c.id);
    const hasConf=conflicts.allSet.has(c.id);
    const isHard=conflicts.hardSet.has(c.id);
    const hasSched=c.slots.length>0;
    const pr=PR.find(p=>p.v===pres[c.id]);
    const isEdited=!!edits[c.id];
    const isHovered=hov===c.id;

    // Inline edit form
    if(editingId===c.id)return(
      <div style={{padding:6,background:"#f8fafc",borderRadius:5,marginBottom:2,border:"1px solid #e5e7eb"}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:4,display:"flex",justifyContent:"space-between"}}>
          <span>Edit: {c.short}</span>
          {isEdited&&!c.isCustom&&<button onClick={()=>{resetEdit(c.id);cancelEdit()}} style={{fontSize:11,color:"#d97706",background:"none",border:"none"}} title="Reset to original data">Reset</button>}
        </div>
        <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} placeholder="Name" style={{width:"100%",padding:"2px 4px",borderRadius:3,border:"1px solid #d1d5db",fontSize:12,marginBottom:3}}/>
        <div style={{display:"flex",gap:3,marginBottom:3}}>
          <input value={editForm.short} onChange={e=>setEditForm(p=>({...p,short:e.target.value}))} placeholder="Short" style={{flex:1,padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}}/>
          <input type="number" value={editForm.ects} onChange={e=>setEditForm(p=>({...p,ects:e.target.value}))} style={{width:44,padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}} title="ECTS"/>
        </div>
        <select value={editForm.a24} onChange={e=>setEditForm(p=>({...p,a24:e.target.value,a19:e.target.value}))} style={{width:"100%",padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12,marginBottom:3}}>
          {[...cfg.areas.map(a=>a.key),"Free Elective","Study Project","Colloquium","BSc Core"].map(k=><option key={k} value={k}>{k}</option>)}
        </select>
        <input value={editForm.room} onChange={e=>setEditForm(p=>({...p,room:e.target.value}))} placeholder="Room (e.g. 93/E31) — fallback for slots without room" style={{width:"100%",padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12,marginBottom:3}}/>
        <SlotEditor slots={editSlots} setSlots={setEditSlots}/>
        <div style={{display:"flex",gap:3,marginTop:2}}>
          <button onClick={saveEdit} style={{flex:1,padding:"3px",borderRadius:3,border:"none",background:"#1d4ed8",color:"white",fontSize:12,fontWeight:600}}>Save</button>
          <button onClick={cancelEdit} style={{padding:"3px 6px",borderRadius:3,border:"1px solid #d1d5db",background:"white",fontSize:12,color:"#6b7280"}}>Cancel</button>
        </div>
      </div>
    );

    const isDropped=status[c.id]==="dropped";
    return(
      <div style={{
        display:"flex",alignItems:"center",gap:4,padding:"5px 6px",marginBottom:3,borderRadius:6,
        background:isHovered?"#eff6ff":"transparent",
        opacity:isDropped?.35:active?(status[c.id]==="considering"?.7:1):.55,
        textDecoration:isDropped?"line-through":"none",
        transition:"all .1s",
      }} onMouseEnter={()=>setHov(c.id)} onMouseMove={e=>setMousePos({x:e.clientX,y:e.clientY})} onMouseLeave={()=>setHov(null)}>
        {/* Segmented status control */}
        <div style={{display:"flex",borderRadius:5,overflow:"hidden",flexShrink:0,border:"1.5px solid #d1d5db"}}>
          {ST.map(s=>{
            const isCur=status[c.id]===s.v;
            return <button key={s.v} onClick={()=>setSt(c.id,s.v)} title={s.l} style={{
              width:22,height:22,padding:0,border:"none",borderRight:"1px solid #e5e7eb",
              background:isCur?`${s.c}25`:"white",color:isCur?s.c:"#c0c0c0",
              fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
            }}>{s.icon}</button>
          })}
        </div>
        <span style={{
          flex:1,fontSize:14,lineHeight:1.35,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
          fontWeight:active?600:400,color:isDropped?"#9ca3af":active?"#111827":"#6b7280",
        }}>
          {c.short} <span style={{fontWeight:400,color:"#9ca3af",fontSize:13}}>{c.ects||"?"}</span>
          {!hasSched&&<span style={{fontSize:11,color:"#9ca3af"}}> ∅</span>}
          {isEdited&&<span style={{fontSize:11,color:"#d97706"}}> ✎</span>}
        </span>
        {/* Edit icon on hover */}
        {isHovered&&!isDropped&&<button onClick={()=>startEdit(c)} title="Edit course data" style={{
          width:20,height:20,borderRadius:3,border:"none",background:"transparent",color:"#6b7280",
          fontSize:13,padding:0,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
        }}>✎</button>}
        {c.isCustom&&<button onClick={()=>removeCustom(c.id)} title="Remove custom course" style={{
          width:20,height:20,borderRadius:3,border:"none",background:"#fef2f2",color:"#dc2626",
          fontSize:12,padding:0,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
        }}>×</button>}
        {active&&hasSched&&!isDropped&&<button onClick={()=>cyclePres(c.id)} title={pr?`${pr.l} — click to change`:""} style={{
          width:26,height:22,borderRadius:5,border:`1.5px solid ${pr.c}44`,
          background:`${pr.c}15`,fontSize:13,padding:0,flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>{pr.icon}</button>}
      </div>
    );
  };

  // ── Onboarding ──
  if(ob)return(
    <div style={{maxWidth:540,margin:"0 auto",padding:"20px",height:"100vh",overflowY:"auto"}}>
      <div style={{background:"white",borderRadius:16,padding:"28px 24px",boxShadow:"0 4px 24px rgba(0,0,0,.07)"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#6b7280",marginBottom:4}}>Universität Osnabrück</div>
        <h1 style={{fontSize:22,fontWeight:800,marginBottom:4,letterSpacing:"-.4px"}}>CogSci Schedule Planner</h1>
        <div style={{fontSize:13,color:"#4b5563",marginBottom:16}}>Summer Semester 2026</div>
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:12,marginBottom:16,fontSize:12,color:"#92400e",lineHeight:1.5}}>
          <strong>⚠ Disclaimer:</strong> This tool was created by students, not the university. Course times, ECTS values, and module mappings may be incorrect or incomplete. Always verify against <strong>Stud.IP</strong> and your Prüfungsordnung.
        </div>
        <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:12,marginBottom:16,fontSize:12,color:"#991b1b",lineHeight:1.5}}>
          <strong>📅 Sunset notice:</strong> This tool will be taken down no later than <strong>November 30, 2026</strong>.
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>Degree & Prüfungsordnung</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {Object.entries(CFGS).map(([k,v])=>(
              <button key={k} onClick={()=>setCk(k)} style={{
                padding:"10px",borderRadius:9,fontSize:12,fontWeight:600,textAlign:"left",
                border:ck===k?"2px solid #2563eb":"2px solid #e5e7eb",
                background:ck===k?"#eff6ff":"white",color:ck===k?"#1d4ed8":"#4b5563",
              }}>
                <div style={{fontWeight:700,fontSize:13}}>{v.label}</div>
                <div style={{fontSize:10,fontWeight:400,marginTop:2,color:"#6b7280"}}>{v.total} LP total</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{background:"#f8fafc",borderRadius:10,padding:12,marginBottom:16,fontSize:12,color:"#4b5563",lineHeight:1.6}}>
          <div style={{fontWeight:700,marginBottom:4,fontSize:13}}>How it works</div>
          <div style={{marginBottom:3}}>1. <strong>Set status</strong> — use the <span style={{fontFamily:"monospace",background:"#e5e7eb",padding:"0 3px",borderRadius:3}}>[? ~ ✓ ✕]</span> controls next to each course. Click the state you want directly; click it again to deselect.</div>
          <div style={{marginBottom:3}}>2. <strong>Resolve conflicts</strong> — overlapping courses appear side-by-side in the grid. Use the attendance toggle (🏫/❓/💻) to set whether you'll attend in person. Remote courses don't trigger conflicts.</div>
          <div style={{marginBottom:3}}>3. <strong>Track ECTS</strong> — the sidebar shows LP per focus area. Green line = specialization threshold (20 LP). Red line = cap (32 LP).</div>
          <div style={{marginBottom:3}}>4. <strong>Import credits</strong> — upload the official Grade Calculator spreadsheet (.xlsx from cs-mentoring@uos.de) to include your already-completed LP in the projections.</div>
          <div style={{marginBottom:3}}>5. <strong>Export & share</strong> — download an .ics calendar file, or copy a link. Since there are no accounts, the share link is also how you transfer your plan to another device or back it up. "Share" excludes your personal credits; "Share + Credits" includes them.</div>
          <div style={{marginBottom:3}}>6. <strong>Edit courses</strong> — hover over any course and click ✎ to correct its name, ECTS, area, room, or time slots. Changes are saved locally.</div>
          <div>7. <strong>Custom courses</strong> — use the "+ Add custom course" button at the bottom of the sidebar to add courses not in the catalog.</div>
        </div>

        {/* Reference section (collapsible) */}
        <button onClick={()=>setShowRef(!showRef)} style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"1px solid #e5e7eb",background:showRef?"#f8fafc":"white",fontSize:12,fontWeight:600,color:"#374151",textAlign:"left",marginBottom:showRef?0:16}}>
          {showRef?"▾":"▸"} Detailed reference
        </button>
        {showRef&&<div style={{background:"#f8fafc",borderRadius:"0 0 10px 10px",padding:12,marginBottom:16,fontSize:11.5,color:"#4b5563",lineHeight:1.6}}>
          <div style={{marginBottom:8}}>
            <div style={{fontWeight:700,marginBottom:3}}>Status states</div>
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"2px 8px",fontSize:11}}>
              <span style={{color:"#8b5cf6",fontWeight:700}}>?</span><span><strong>Considering</strong> — tentative. Does NOT count toward conflicts. Shown faintly in the grid. ECTS shown as (+X?) in the sidebar.</span>
              <span style={{color:"#2563eb",fontWeight:700}}>~</span><span><strong>Likely</strong> — probably taking it. Counts toward ECTS and triggers soft conflicts (orange) with other likely courses.</span>
              <span style={{color:"#059669",fontWeight:700}}>✓</span><span><strong>Locked</strong> — confirmed choice. Counts toward ECTS and triggers hard conflicts (red) with other locked/likely courses.</span>
              <span style={{color:"#dc2626",fontWeight:700}}>✕</span><span><strong>Dropped</strong> — decided against. Hidden from grid and ECTS. Stays in sidebar (greyed out, collapsed) so you don't reconsider it.</span>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontWeight:700,marginBottom:3}}>Conflict detection</div>
            <div style={{fontSize:11}}>Conflicts are only detected between courses where both are <strong>locked or likely</strong> (not considering/dropped), both have overlapping time slots, and neither is set to 💻 Remote OK. Hard conflicts (red) involve at least one locked course. Soft conflicts (orange) are between two likely courses.</div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontWeight:700,marginBottom:3}}>ECTS progress bars</div>
            <div style={{fontSize:11}}>Each focus area bar has up to three segments: <strong>dark</strong> = imported past credits, <strong>medium</strong> = locked/likely selections, <strong>light</strong> = considering. The <span style={{color:"#059669"}}>green line</span> marks the specialization threshold (20 LP in PO 2024). The <span style={{color:"#dc2626"}}>red line</span> marks the cap (32 LP). Areas turn green when you reach specialization, red when you exceed the cap.</div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontWeight:700,marginBottom:3}}>Attendance modes</div>
            <div style={{fontSize:11}}>🏫 <strong>In-person</strong> and ❓ <strong>Unclear</strong> count as potential conflicts. 💻 <strong>Remote OK</strong> means this course won't conflict with anything — useful for hybrid/online courses. Right-click a course in the grid to quickly set its attendance mode.</div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontWeight:700,marginBottom:3}}>Importing past credits</div>
            <div style={{fontSize:11}}>The "Import credits" button in the ECTS panel accepts the official Grade Calculator spreadsheet (.xlsx) distributed by the CogSci mentoring program (cs-mentoring@uos.de). The tool reads your completed LP per focus area from specific cells. You can also enter values manually.</div>
          </div>
          <div>
            <div style={{fontWeight:700,marginBottom:3}}>Data & privacy</div>
            <div style={{fontSize:11}}>All data is stored locally in your browser (localStorage). Nothing is sent to any server. Share links encode your plan in the URL — if you're using the hosted version, anyone with the link can view your plan. If you're using the file locally (file://), the link only works on your own computer. To move your plan to another device or browser, use the "Share" button — the link contains your full plan and works as both a share link and a backup. The "Delete all data" button in the footer permanently removes everything.</div>
          </div>
        </div>}

        <button onClick={()=>setOb(false)} style={{
          width:"100%",padding:"11px",borderRadius:10,border:"none",
          background:"#1d4ed8",color:"white",fontSize:14,fontWeight:700,
        }}>Start planning →</button>
      </div>
    </div>
  );

  // ── Main ──
  const totalConf=conflicts.hardPairs.length+conflicts.softPairs.length;
  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",margin:"0 auto",padding:"10px 24px",overflow:"hidden"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5,flexWrap:"wrap",gap:6}}>
        <div>
          <h1 style={{fontSize:16,fontWeight:800,letterSpacing:"-.3px"}}>Schedule SoSe 2026</h1>
          <div style={{fontSize:10.5,color:"#9ca3af"}}>
            {cfg.label}
            {conflicts.hardPairs.length>0&&<span style={{color:"#dc2626"}}> · ⚠ {conflicts.hardPairs.length} conflict{conflicts.hardPairs.length>1?"s":""}</span>}
            {conflicts.softPairs.length>0&&<span style={{color:"#d97706"}}> · {conflicts.softPairs.length} potential</span>}
            {totalConf===0&&<span style={{color:"#059669"}}> · ✓ No conflicts</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
          <select value={ck} onChange={e=>setCk(e.target.value)} title="Choose your degree and Prüfungsordnung" style={{padding:"4px 7px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,fontWeight:600,background:"white"}}>
            {Object.entries(CFGS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={()=>share(false)} title="Copy link to share with others or open on another device (without personal credits)" style={{padding:"4px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,fontWeight:600,background:copied==="plan"?"#ecfdf5":"white",color:copied==="plan"?"#059669":"#374151"}}>{copied==="plan"?"✓ Copied!":"🔗 Share"}</button>
          {hasBaseline&&<button onClick={()=>share(true)} title="Copy link including imported credits — also works for transferring to another device" style={{padding:"4px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,fontWeight:600,background:copied==="credits"?"#ecfdf5":"white",color:copied==="credits"?"#059669":"#374151"}}>{copied==="credits"?"✓ Copied!":"🔗 Share + Credits"}</button>}
          {copied&&<span style={{fontSize:11,color:isHosted?"#059669":"#d97706",maxWidth:240,lineHeight:1.3}}>
            {isHosted?"✓ Link copied — anyone with this link can view your plan.":"⚠ This link only works on your computer. To share with others, use the hosted version."}
          </span>}
          <button onClick={doExport} title="Download .ics calendar file for selected weekly courses" style={{padding:"4px 10px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,fontWeight:600,background:"white",color:"#374151"}}>📅 Export .ics</button>
          <button onClick={()=>setOb(true)} title="Show guide & settings" style={{padding:"4px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,background:"white",color:"#6b7280"}}>?</button>
        </div>
      </div>

      {/* Status legend */}
      <div style={{display:"flex",gap:10,marginBottom:6,fontSize:12,color:"#4b5563",alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontWeight:600}}>Status:</span>
        {ST.map(s=><span key={s.v} style={{display:"flex",alignItems:"center",gap:3}}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:4,border:`1.5px solid ${s.c}`,background:`${s.c}15`,color:s.c,fontSize:11,fontWeight:700}}>{s.icon}</span>{s.l}</span>)}
      </div>

      {/* Day tabs */}
      <div style={{display:"flex",gap:0,marginBottom:7,borderBottom:"2px solid #e5e7eb",overflowX:"auto"}}>
        <button onClick={()=>setDayF(null)} title="Show all days" style={{background:"none",border:"none",padding:"4px 11px",fontSize:13,fontWeight:dayF===null?700:500,color:dayF===null?"#1d4ed8":"#6b7280",borderBottom:dayF===null?"2px solid #1d4ed8":"2px solid transparent",marginBottom:-2}}>All</button>
        {DAYS.map((d,i)=>{
          const n=visible.filter(c=>isOn(c.id)&&c.slots.some(s=>s.day===i)).length;
          const hc=conflicts.hardPairs.filter(p=>p.day===i).length;
          const sc=conflicts.softPairs.filter(p=>p.day===i).length;
          return <button key={i} onClick={()=>setDayF(i)} title={`Filter to ${d} only`} style={{background:"none",border:"none",padding:"4px 11px",fontSize:13,whiteSpace:"nowrap",fontWeight:dayF===i?700:500,color:dayF===i?"#1d4ed8":hc>0?"#dc2626":sc>0?"#d97706":"#6b7280",borderBottom:dayF===i?"2px solid #1d4ed8":"2px solid transparent",marginBottom:-2}}>{d}{n>0?` (${n})`:""}{hc>0?" ⚠":sc>0?" ~":""}</button>
        })}
      </div>

      <div className="app-flex" style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
        {/* ── Sidebar ── */}
        <div className="app-sidebar" style={{flex:`0 0 ${isMobile?"100%":sideW+"px"}`,minWidth:isMobile?"auto":200,display:"flex",flexDirection:"column",height:isMobile?(mobileGridH?"auto":"40vh"):"100%",overflow:"hidden"}}>
          {/* ECTS panel */}
          <div data-ects="1" style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:11,marginBottom:0,overflow:"auto",position:"relative",...(ectsH?{height:ectsH,flexShrink:0}:{flexShrink:0})}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>ECTS</div>
            {cfg.areas.map(a=>{
              const bl=baseline[a.key]||0;const lk=proj.locked[a.key]||0;const ly=proj.likely[a.key]||0;const cv=proj.considering[a.key]||0;
              const v=bl+lk+ly;const total=v+cv;const over=a.cap&&total>a.cap;const spec=a.spec&&total>=a.spec;
              const mx=a.cap||Math.max(total+4,20);
              const sel=lk+ly;
              return(<div key={a.key} style={{marginBottom:5}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,fontWeight:600}}>
                  <span style={{color:a.cl.t}}>{a.key}</span>
                  <span style={{color:over?"#dc2626":spec?"#059669":"#4b5563"}}>
                    {sel}{cv>0?<span style={{color:"#8b5cf6"}}>{` (+${cv}?)`}</span>:""} LP{spec?" ✓":""}{over?` ⚠>${a.cap}`:""}
                  </span>
                </div>
                <div style={{height:7,background:"#e5e7eb",borderRadius:4,overflow:"hidden",position:"relative"}}>
                  {bl>0&&<div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.min(100,(bl/mx)*100)}%`,background:a.cl.c,opacity:.75,transition:"width .2s"}}/>}
                  {lk>0&&<div style={{position:"absolute",left:`${Math.min(100,(bl/mx)*100)}%`,top:0,height:"100%",width:`${Math.min(100,(lk/mx)*100)}%`,background:a.cl.c,opacity:.55,transition:"width .2s"}}/>}
                  {ly>0&&<div style={{position:"absolute",left:`${Math.min(100,((bl+lk)/mx)*100)}%`,top:0,height:"100%",width:`${Math.min(100,(ly/mx)*100)}%`,background:a.cl.c,opacity:.3,transition:"width .2s"}}/>}
                  {cv>0&&<div style={{position:"absolute",left:`${Math.min(100,(v/mx)*100)}%`,top:0,height:"100%",width:`${Math.min(100-Math.min(100,(v/mx)*100),(cv/mx)*100)}%`,background:a.cl.c,opacity:.15,transition:"width .2s"}}/>}
                  {a.spec&&<div style={{position:"absolute",left:`${(a.spec/mx)*100}%`,top:0,height:"100%",width:1.5,background:"#059669"}}/>}
                  {a.cap&&a.cap<900&&<div style={{position:"absolute",left:`${(a.cap/mx)*100}%`,top:0,height:"100%",width:1.5,background:"#dc2626"}}/>}
                </div>
              </div>);
            })}
            <div style={{fontSize:12.5,color:"#4b5563",display:"flex",justifyContent:"space-between",marginTop:3}}>
              <span>Free Elective</span><span>{feTotal}{feCons>0?<span style={{color:"#8b5cf6"}}>{` (+${feCons}?)`}</span>:""}{cfg.feN?` / ${cfg.feN}`:""}</span>
            </div>
            {isMsc&&<div style={{fontSize:12.5,color:"#4b5563",display:"flex",justifyContent:"space-between"}}><span>Study Project</span><span>{(proj.locked["Study Project"]||0)+(proj.likely["Study Project"]||0)+(baseline["Study Project"]||0)}{(proj.considering["Study Project"]||0)>0?<span style={{color:"#8b5cf6"}}>{` (+${proj.considering["Study Project"]}?)`}</span>:""}</span></div>}
            <div style={{fontSize:12.5,color:"#4b5563",display:"flex",justifyContent:"space-between"}}><span>Colloquium</span><span>{(proj.locked["Colloquium"]||0)+(proj.likely["Colloquium"]||0)}{(proj.considering["Colloquium"]||0)>0?<span style={{color:"#8b5cf6"}}>{` (+${proj.considering["Colloquium"]}?)`}</span>:""}</span></div>
            {cfg.wp&&<div style={{marginTop:7,borderTop:"1px solid #e5e7eb",paddingTop:6,display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              <div title="Wahlpflichtbereich — LP from focus area courses. Final assignment to areas happens according to your Prüfungsordnung." style={{textAlign:"center",padding:3,background:"#f9fafb",borderRadius:6,border:"1px solid #e5e7eb"}}>
                <div style={{fontWeight:800,fontSize:16,color:wpTotal>=cfg.wp?"#059669":"#b45309"}}>{wpTotal}{wpCons>0?<span style={{fontSize:11,color:"#8b5cf6"}}>{` +${wpCons}?`}</span>:""}</div>
                <div style={{fontSize:10,color:"#6b7280"}}>/ {cfg.wp} LP Compulsory Electives</div>
              </div>
              <div style={{textAlign:"center",padding:3,background:"#f9fafb",borderRadius:6,border:"1px solid #e5e7eb"}}>
                <div style={{fontWeight:800,fontSize:16,color:"#374151"}}>{selTotal}{conTotal>0?<span style={{fontSize:11,color:"#8b5cf6"}}>{` +${conTotal}?`}</span>:""}</div>
                <div style={{fontSize:10,color:"#6b7280"}}>LP this semester</div>
              </div>
            </div>}
            {cfg.po24&&cfg.wp&&<div style={{fontSize:9.5,color:"#9ca3af",marginTop:4,lineHeight:1.3}}>Focus area assignments are preliminary. Final assignment happens according to your Prüfungsordnung.</div>}

            {/* Credit import */}
            <div style={{marginTop:7,borderTop:"1px solid #e5e7eb",paddingTop:6}}>
              {Object.keys(baseline).length>0?(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:600,color:"#374151"}}>📂 Imported credits</span>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>setShowBaselineEdit(!showBaselineEdit)} style={{fontSize:10,color:"#2563eb",background:"none",border:"none",fontWeight:500}}>{showBaselineEdit?"Hide":"Edit"}</button>
                      <button onClick={()=>setBaseline({})} style={{fontSize:10,color:"#dc2626",background:"none",border:"none",fontWeight:500}}>Clear</button>
                    </div>
                  </div>
                  {showBaselineEdit&&<div style={{marginBottom:3}}>
                    {[...cfg.areas.map(a=>a.key),"Free Elective","Study Project"].map(k=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:11,color:"#4b5563"}}>{k}</span>
                        <input type="number" value={baseline[k]||0} onChange={e=>setBaseline(p=>({...p,[k]:parseInt(e.target.value)||0}))} style={{width:44,padding:"2px 4px",borderRadius:4,border:"1px solid #d1d5db",fontSize:11,textAlign:"right"}}/>
                      </div>
                    ))}
                  </div>}
                </div>
              ):(
                <div>
                  <label style={{display:"block",fontSize:11,color:"#4b5563",marginBottom:3,cursor:"pointer"}}>
                    <span style={{fontWeight:600}}>📂 Import past credits</span>
                    <span style={{display:"block",fontSize:10,color:"#6b7280"}}>Upload the official Grade Calculator (.xlsx)</span>
                    <input type="file" accept=".xlsx,.xls" onChange={handleImport} style={{display:"none"}}/>
                    <div style={{marginTop:4,padding:"5px 0",textAlign:"center",borderRadius:5,border:"1px dashed #d1d5db",background:"#f9fafb",fontSize:11,color:"#2563eb",fontWeight:500}}>Choose file…</div>
                  </label>
                  <button onClick={()=>{setBaseline({"AI/ML":0,"Psych/Lang":0,"Neuroscience":0,"Ethics/Mind":0,"Methods":0,"Free Elective":0,"Study Project":0,"Colloquium":0,"BSc Core":0});setShowBaselineEdit(true)}} style={{width:"100%",fontSize:10,color:"#6b7280",background:"none",border:"none",marginTop:2}}>or enter manually</button>
                </div>
              )}
              {importError&&<div style={{fontSize:10,color:"#dc2626",marginTop:3,background:"#fef2f2",padding:"4px 6px",borderRadius:4}}>{importError}</div>}
            </div>
            {/* Corner drag handle */}
            {!isMobile&&<div className="splitter-corner" onPointerDown={startDragCorner}/>}
          </div>

          {/* Vertical splitter: ECTS ↔ course list */}
          <div className="splitter-v" onPointerDown={startDragV} onDoubleClick={resetLayout}/>

          {/* Course list (scrollable) */}
          <div style={{flex:1,overflow:"auto",padding:"0 0 4px"}}>

          {/* Grouping toggle */}
          <div style={{display:"flex",gap:3,marginBottom:5,alignItems:"center"}}>
            <div style={{display:"flex",borderRadius:5,overflow:"hidden",border:"1px solid #d1d5db",flex:1}}>
              <button onClick={()=>setGroupBy("area")} title="Group courses by focus area" style={{flex:1,padding:"3px 0",border:"none",fontSize:10,fontWeight:600,background:groupBy==="area"?"#1d4ed8":"white",color:groupBy==="area"?"white":"#6b7280"}}>By Area</button>
              <button onClick={()=>setGroupBy("status")} title="Group courses by planning status" style={{flex:1,padding:"3px 0",border:"none",borderLeft:"1px solid #d1d5db",fontSize:10,fontWeight:600,background:groupBy==="status"?"#1d4ed8":"white",color:groupBy==="status"?"white":"#6b7280"}}>By Status</button>
            </div>
          </div>

          {/* Course list */}
          {(groupBy==="area"?isPo24:true)&&<div style={{display:"flex",gap:3,marginBottom:5}}>
            <button onClick={expandAll} title="Expand all groups" style={{flex:1,padding:"2px 6px",borderRadius:4,border:"1px solid #d1d5db",fontSize:9,background:"white",color:"#6b7280"}}>Expand all</button>
            <button onClick={collapseAll} title="Collapse all groups" style={{flex:1,padding:"2px 6px",borderRadius:4,border:"1px solid #d1d5db",fontSize:9,background:"white",color:"#6b7280"}}>Collapse all</button>
          </div>}

          {(groupBy==="area"?categories:statusGroups).map(g=>{
            const isOpen=g.key==="dropped"?(expanded[g.key]===true):(expanded[g.key]!==false);
            const filtW=dayF!==null?g.weekly.filter(c=>c.slots.some(s=>s.day===dayF)):g.weekly;
            const filtB=g.block||[];
            const hasVisible=(filtW.length+filtB.length)>0;
            if(!hasVisible&&dayF!==null&&groupBy==="area")return null;
            if(g.courses.length===0&&groupBy==="status")return null;
            return(<div key={g.key} style={{marginBottom:4,background:"white",border:"1px solid #e5e7eb",borderRadius:7,overflow:"hidden"}}>
              <button onClick={()=>toggleArea(g.key)} style={{
                width:"100%",padding:"7px 10px",border:"none",background:g.cl.bg,
                display:"flex",justifyContent:"space-between",alignItems:"center",
                fontSize:14,fontWeight:700,color:g.cl.t,textAlign:"left",cursor:"pointer",
              }}>
                <span>{isOpen?"▾ ":"▸ "}{g.icon?g.icon+" ":""}{g.label||g.key}</span>
                <span style={{fontWeight:500,fontSize:12,display:"flex",alignItems:"center",gap:4}}>
                  {g.selN>0&&<span>{g.selN} · {g.selLP} LP</span>}
                  {g.hasConf&&<span style={{color:"#dc2626"}}>⚠</span>}
                </span>
              </button>
              {g.note&&isOpen&&<div style={{padding:"4px 8px",fontSize:9.5,color:"#92400e",background:"#fffbeb",lineHeight:1.4}}>{g.note}</div>}
              {isOpen&&<div style={{padding:"2px 4px"}}>
                {filtW.map(c=><CourseRow key={c.id} c={c} g={g}/>)}
                {filtB.length>0&&filtW.length>0&&<div style={{borderTop:"1px dashed #d1d5db",margin:"5px 0 3px",fontSize:11,color:"#6b7280",paddingLeft:4,fontWeight:500}}>Block / no fixed time</div>}
                {filtB.map(c=><CourseRow key={c.id} c={c} g={g}/>)}
              </div>}
            </div>);
          })}

          {/* Add custom course */}
          {!showAdd?
            <button onClick={()=>setShowAdd(true)} title="Add a custom course to the planner" style={{width:"100%",padding:"6px",borderRadius:7,border:"1px dashed #d1d5db",background:"white",fontSize:10,color:"#6b7280",marginTop:4}}>+ Add custom course</button>
          :
            <div style={{marginTop:4,background:"white",border:"1px solid #e5e7eb",borderRadius:7,padding:8}}>
              <div style={{fontSize:10,fontWeight:700,marginBottom:4}}>Add custom course</div>
              <input value={addForm.name} onChange={e=>setAddForm(p=>({...p,name:e.target.value}))} placeholder="Course name" style={{width:"100%",padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12,marginBottom:3}}/>
              <div style={{display:"flex",gap:3,marginBottom:3}}>
                <input value={addForm.short} onChange={e=>setAddForm(p=>({...p,short:e.target.value}))} placeholder="Short (auto)" style={{flex:1,padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}}/>
                <input type="number" value={addForm.ects} onChange={e=>setAddForm(p=>({...p,ects:e.target.value}))} style={{width:48,padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12}} title="ECTS"/>
              </div>
              <select value={addForm.a24} onChange={e=>setAddForm(p=>({...p,a24:e.target.value,a19:e.target.value}))} style={{width:"100%",padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:10,marginBottom:3}}>
                {[...cfg.areas.map(a=>a.key),"Free Elective"].map(k=><option key={k} value={k}>{k}</option>)}
              </select>
              <input value={addForm.room||""} onChange={e=>setAddForm(p=>({...p,room:e.target.value}))} placeholder="Room (e.g. 93/E31)" style={{width:"100%",padding:"3px 5px",borderRadius:4,border:"1px solid #d1d5db",fontSize:12,marginBottom:3}}/>
              <div style={{fontSize:11,fontWeight:600,marginBottom:2,color:"#6b7280"}}>Time slots</div>
              <SlotEditor slots={addSlots} setSlots={setAddSlots}/>
              <div style={{display:"flex",gap:4,marginTop:3}}>
                <button onClick={addCustom} style={{flex:1,padding:"4px",borderRadius:4,border:"none",background:"#1d4ed8",color:"white",fontSize:12,fontWeight:600}}>Add</button>
                <button onClick={()=>{setShowAdd(false);setAddSlots([])}} style={{padding:"4px 8px",borderRadius:4,border:"1px solid #d1d5db",background:"white",fontSize:10,color:"#6b7280"}}>Cancel</button>
              </div>
            </div>
          }
          </div>{/* end course list scroll */}
        </div>{/* end sidebar */}

        {/* Horizontal splitter: sidebar ↔ grid (desktop) */}
        {!isMobile&&<div className={`splitter-h${dragging==="h"?" active":""}`} onPointerDown={startDragH} onDoubleClick={resetLayout}/>}

        {/* Mobile splitter: grid ↔ sidebar (mobile only) */}
        {isMobile&&<div className={`splitter-v${dragging==="mv"?" active":""}`} onPointerDown={startDragMV} onDoubleClick={resetLayout} style={{order:1}}/>}

        {/* ── Grid ── */}
        <div className="app-grid" style={{flex:1,minWidth:0,overflow:"auto",...(isMobile&&mobileGridH?{height:mobileGridH,flex:"none"}:{})}}>
          <div style={{display:"grid",gridTemplateColumns:`34px repeat(${visDays.length},1fr)`,minWidth:visDays.length===1?200:400}}>
            <div/>
            {visDays.map(di=><div key={di} style={{textAlign:"center",fontSize:10.5,fontWeight:700,padding:"2px 0",borderBottom:"2px solid #e5e7eb"}}>{DAYS[di]}</div>)}
            {HOURS.map(h=>(
              <React.Fragment key={h}>
                <div style={{fontSize:9,color:"#9ca3af",textAlign:"right",paddingRight:4,paddingTop:2,height:RH,borderTop:"1px solid #f0f0f0"}}>{h}:00</div>
                {visDays.map(di=>{
                  const entries=slotMap[`${di}-${h}`]||[];
                  const starters=entries.filter(e=>e.isStart);
                  const single=visDays.length===1;
                  return(<div key={`${di}-${h}`} style={{height:RH,borderTop:"1px solid #f0f0f0",borderLeft:"1px solid #f0f0f0",position:"relative"}}>
                    {starters.map(entry=>{
                      const c=entry.course,sl=entry.slot,dur=sl.end-sl.start;
                      const area=areaOf(c);const acl=getClForArea(area);
                      const isHard=conflicts.hardSet.has(c.id);
                      const isSoft=conflicts.softSet.has(c.id);
                      const hasConf=isHard||isSoft;
                      const isRem=pres[c.id]==="no";
                      const isCons=status[c.id]==="considering";
                      const st=stOf(c.id);
                      const idx=entries.findIndex(e=>e.course.id===c.id&&e.si===entry.si);
                      const hi=hov===c.id;
                      return(<div key={c.id+entry.si}
                        onClick={e=>{e.stopPropagation();setPresMenu(null);setGridMenu({id:c.id,x:e.clientX,y:e.clientY})}}
                        onContextMenu={e=>{e.preventDefault();e.stopPropagation();setGridMenu(null);setPresMenu({id:c.id,x:e.clientX,y:e.clientY})}}
                        onMouseEnter={()=>setHov(c.id)} onMouseMove={e=>setMousePos({x:e.clientX,y:e.clientY})} onMouseLeave={()=>setHov(null)} style={{
                        position:"absolute",top:0,left:`${(idx/entries.length)*100}%`,width:`${100/entries.length}%`,
                        height:dur*RH-2,
                        background:hi?`${acl.c}18`:isHard?"#fef2f2":isSoft?"#fffbeb":acl.bg,
                        border:`1.5px solid ${isHard?"#ef4444":isSoft?"#f59e0b":hi?acl.c:acl.c+"77"}`,
                        borderRadius:4,padding:"2px 3px",fontSize:single?10.5:8.5,lineHeight:1.2,overflow:"hidden",
                        zIndex:hi?10:2,cursor:"pointer",opacity:isRem?.55:isCons?.5:1,transition:"all .12s",
                        boxShadow:hi?`0 0 0 2px ${acl.c}33`:isHard?"0 0 0 1.5px rgba(239,68,68,.2)":isSoft?"0 0 0 1.5px rgba(245,158,11,.2)":"none",
                      }}>
                        <div style={{fontWeight:700,color:isHard?"#dc2626":isSoft?"#92400e":acl.t,display:"flex",alignItems:"center",gap:2}}>
                          {isHard&&<span style={{fontSize:7}}>⚠</span>}
                          {isSoft&&<span style={{fontSize:7}}>~</span>}
                          {single?c.name:c.short}{sl.label?` ${sl.label}`:""}
                          {isRem&&<span style={{fontSize:7,opacity:.7}}>💻</span>}
                          {st&&<span style={{fontSize:7,color:st.c,marginLeft:"auto"}}>{st.icon}</span>}
                        </div>
                        {dur>=2&&(single||entries.length<=2)&&<div style={{color:"#6b7280",fontSize:single?9.5:7.5}}>{c.ects} LP</div>}
                        {single&&c.note&&dur>=2&&<div style={{color:"#92400e",fontSize:8.5,fontStyle:"italic"}}>{c.note}</div>}
                      </div>);
                    })}
                  </div>);
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Hard Conflicts */}
      {fHardConf.length>0&&(
        <div style={{marginTop:8,padding:"10px 14px",background:"#fef2f2",borderRadius:8,fontSize:13,color:"#991b1b",lineHeight:1.5}}>
          <div style={{fontWeight:700,marginBottom:3,fontSize:14}}>⚠ Conflicts{dayF!==null?` (${DAYS[dayF]})`:""} — locked/likely, both in-person/unclear:</div>
          {fHardConf.map((p,i)=>(
            <div key={i} style={{marginBottom:1}}>
              {DAYS[p.day]} {p.from}–{p.to}h: <strong>{p.a.short}</strong> vs <strong>{p.b.short}</strong>
              {" — "}<span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>dropCourse(p.a.id)}>drop {p.a.short}</span>
              {" | "}<span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>dropCourse(p.b.id)}>drop {p.b.short}</span>
            </div>
          ))}
        </div>
      )}

      {/* Soft Conflicts */}
      {fSoftConf.length>0&&(
        <div style={{marginTop:4,padding:"10px 14px",background:"#fffbeb",borderRadius:8,fontSize:13,color:"#92400e",lineHeight:1.5}}>
          <div style={{fontWeight:700,marginBottom:3,fontSize:14}}>~ Potential conflicts{dayF!==null?` (${DAYS[dayF]})`:""} — both likely:</div>
          {fSoftConf.map((p,i)=>(
            <div key={i} style={{marginBottom:1}}>
              {DAYS[p.day]} {p.from}–{p.to}h: <strong>{p.a.short}</strong> vs <strong>{p.b.short}</strong>
              {" — "}<span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>dropCourse(p.a.id)}>drop {p.a.short}</span>
              {" | "}<span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>dropCourse(p.b.id)}>drop {p.b.short}</span>
            </div>
          ))}
        </div>
      )}

        </div>{/* end grid scroll */}
      </div>{/* end flex */}

      {/* Footer */}
      <div style={{fontSize:11.5,color:"#6b7280",lineHeight:1.6,borderTop:"1px solid #e5e7eb",padding:"6px 0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",flexShrink:0}}>
        <div>
          💾 Auto-saved in this browser only. "Share" copies a link (also use it to sync between devices). "Export .ics" downloads a calendar file.
          <span style={{color:"#d97706"}}> ⚠ Unofficial student tool. Verify with Stud.IP & PO.</span>
          <span style={{color:"#991b1b"}}> 📅 Sunset: Nov 30, 2026.</span>
        </div>
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          <button onClick={reset} title="Remove all course selections and statuses. Your imported credits and custom courses are kept." style={{background:"#fffbeb",color:"#b45309",border:"1px solid #fde68a",borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:600}}>Clear course plan</button>
          {!confirmDelete?
            <button onClick={()=>setConfirmDelete(true)} title="Permanently delete everything: selections, imported credits, custom courses, and all local data" style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:5,padding:"4px 10px",fontSize:11,fontWeight:500}}>Delete all data</button>
          :
            <div style={{display:"flex",gap:3,alignItems:"center",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:5,padding:"4px 8px"}}>
              <span style={{fontSize:11,color:"#991b1b",fontWeight:500}}>Permanently removes all local data. Only recoverable via saved share link.</span>
              <button onClick={deleteAllData} style={{background:"#dc2626",color:"white",border:"none",borderRadius:4,padding:"3px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>Yes, delete</button>
              <button onClick={()=>setConfirmDelete(false)} style={{background:"white",color:"#6b7280",border:"1px solid #d1d5db",borderRadius:4,padding:"3px 8px",fontSize:11,whiteSpace:"nowrap"}}>Cancel</button>
            </div>
          }
        </div>
      </div>

      {/* Grid click menu (left-click: status) */}
      {gridMenu&&(()=>{
        const c=courses.find(x=>x.id===gridMenu.id);if(!c)return null;
        const mx=Math.min(gridMenu.x,window.innerWidth-170);
        const my=Math.min(gridMenu.y,window.innerHeight-180);
        const pick=(v)=>{if(v)setSt(gridMenu.id,v);else dropCourse(gridMenu.id);setGridMenu(null)};
        return(<>
          <div onClick={()=>setGridMenu(null)} style={{position:"fixed",inset:0,zIndex:999}}/>
          <div style={{position:"fixed",left:mx,top:my,zIndex:1000,background:"white",borderRadius:8,padding:"4px",boxShadow:"0 4px 20px rgba(0,0,0,.15)",border:"1px solid #e5e7eb",minWidth:150}}>
            <div style={{padding:"4px 8px",fontSize:11,color:"#9ca3af",fontWeight:600,borderBottom:"1px solid #f3f4f6",marginBottom:2}}>{c.short}</div>
            <button onClick={()=>pick(null)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 8px",border:"none",background:!status[gridMenu.id]?"#f3f4f6":"white",borderRadius:4,fontSize:13,color:"#374151",textAlign:"left",cursor:"pointer"}}>
              <span style={{width:18,height:18,borderRadius:4,border:"1.5px solid #d1d5db",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,background:"white"}}></span> Not selected
            </button>
            {ST.map(s=>(
              <button key={s.v} onClick={()=>pick(s.v)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 8px",border:"none",background:status[gridMenu.id]===s.v?`${s.c}10`:"white",borderRadius:4,fontSize:13,color:"#374151",textAlign:"left",cursor:"pointer"}}>
                <span style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${s.c}`,background:`${s.c}15`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,color:s.c,fontWeight:700}}>{s.icon}</span> {s.l}
              </button>
            ))}
          </div>
        </>);
      })()}

      {/* Grid right-click menu (attendance/presence mode) */}
      {presMenu&&(()=>{
        const c=courses.find(x=>x.id===presMenu.id);if(!c)return null;
        const mx=Math.min(presMenu.x,window.innerWidth-170);
        const my=Math.min(presMenu.y,window.innerHeight-140);
        const pick=(v)=>{setPres(p=>({...p,[presMenu.id]:v}));setPresMenu(null)};
        return(<>
          <div onClick={()=>setPresMenu(null)} style={{position:"fixed",inset:0,zIndex:999}}/>
          <div style={{position:"fixed",left:mx,top:my,zIndex:1000,background:"white",borderRadius:8,padding:"4px",boxShadow:"0 4px 20px rgba(0,0,0,.15)",border:"1px solid #e5e7eb",minWidth:150}}>
            <div style={{padding:"4px 8px",fontSize:11,color:"#9ca3af",fontWeight:600,borderBottom:"1px solid #f3f4f6",marginBottom:2}}>{c.short} — Attendance</div>
            {PR.map(p=>(
              <button key={p.v} onClick={()=>pick(p.v)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 8px",border:"none",background:pres[presMenu.id]===p.v?`${p.c}10`:"white",borderRadius:4,fontSize:13,color:"#374151",textAlign:"left",cursor:"pointer"}}>
                <span style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${p.c}`,background:`${p.c}15`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{p.icon}</span> {p.l}
              </button>
            ))}
          </div>
        </>);
      })()}

      {/* Floating tooltip */}
      {hov&&(()=>{const c=courses.find(x=>x.id===hov);if(!c)return null;const area=areaOf(c);const acl=getClForArea(area);const st=stOf(c.id);
        const tx=Math.min(mousePos.x+14,window.innerWidth-360);
        const ty=Math.min(mousePos.y+14,window.innerHeight-80);
        // Resolve rooms: collect unique rooms from slots, falling back to course-level room
        const slotRooms=c.slots.map(s=>s.room||c.room||"").filter(Boolean);
        const uniqueRooms=[...new Set(slotRooms)];
        const hasPerSlotRooms=c.slots.some(s=>s.room)&&uniqueRooms.length>1;
        return(<div style={{position:"fixed",left:tx,top:ty,zIndex:1000,background:"white",borderRadius:10,padding:"10px 14px",fontSize:14,lineHeight:1.6,maxWidth:360,border:"1px solid #bfdbfe",boxShadow:"0 4px 20px rgba(0,0,0,.12)",pointerEvents:"none"}}>
          <div style={{fontWeight:700,color:"#1f2937",marginBottom:2}}>{c.name}</div>
          <div style={{fontSize:13,color:"#4b5563"}}>{c.nr?`${c.nr} · `:""}{c.ects||"?"} LP · <span style={{color:acl.t,fontWeight:600}}>{area}</span>{st&&<span style={{color:st.c,fontWeight:600}}> · {st.l}</span>}</div>
          {c.note&&<div style={{fontSize:12,color:"#92400e",fontStyle:"italic",marginTop:2}}>{c.note}</div>}
          {c.slots.length>0&&<div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{c.slots.map((s,i)=>`${DAYS[s.day]} ${s.start}:00–${s.end}:00${s.label?" ("+s.label+")":""}`).join(", ")}</div>}
          {hasPerSlotRooms?<div style={{fontSize:12,color:"#4b5563",marginTop:2}}>Rooms: {c.slots.map((s,i)=>`${DAYS[s.day]} ${s.start}–${s.end}: ${s.room||c.room||"?"}`).join(", ")}</div>
          :uniqueRooms.length===1?<div style={{fontSize:12,color:"#4b5563",marginTop:2}}>Room: {uniqueRooms[0]}</div>
          :c.room?<div style={{fontSize:12,color:"#4b5563",marginTop:2}}>Room: {c.room}</div>
          :null}
          {c.slots.length===0&&<div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>No weekly schedule — check Stud.IP</div>}
        </div>);
      })()}
    </div>
  );
}
// ── Error boundary: catches render errors and shows them instead of white screen ──
class EB extends React.Component{
  constructor(p){super(p);this.state={err:null,info:null}}
  static getDerivedStateFromError(e){return{err:e}}
  componentDidCatch(e,i){this.setState({info:i})}
  render(){if(this.state.err)return React.createElement("div",{style:{padding:40,fontFamily:"monospace",color:"#dc2626"}},
    React.createElement("h2",null,"Something went wrong"),
    React.createElement("pre",{style:{whiteSpace:"pre-wrap",fontSize:13,marginTop:12}},String(this.state.err)),
    this.state.info&&React.createElement("pre",{style:{whiteSpace:"pre-wrap",fontSize:11,marginTop:8,color:"#6b7280"}},this.state.info.componentStack));return this.props.children}
}
ReactDOM.createRoot(document.getElementById("root")).render(<EB><App/></EB>);
