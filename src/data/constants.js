const {useState,useMemo,useEffect}=React;
// ── Constants: days, hours, grid size, localStorage key ──
const DAYS=["Mo","Tu","We","Th","Fr"],HOURS=[8,9,10,11,12,13,14,15,16,17,18,19],RH=42,SK="cogsci-pub-v1";
// Default new slot: 14:15–15:45 (German c.t. convention, 90 min)
const DEFAULT_SLOT={day:0,start:14.25,end:15.75};
// Presence/attendance modes: in-person, unclear, remote
const PR=[{v:"yes",l:"In-person",icon:"🏫",c:"#dc2626"},{v:"unclear",l:"Not known",icon:"❓",c:"#d97706"},{v:"no",l:"Remote possible",icon:"💻",c:"#059669"}];

// Colors
const CL={
  ai:{c:"#2563eb",bg:"#dbeafe",t:"#1e40af"},
  ps:{c:"#7c3aed",bg:"#ede9fe",t:"#5b21b6"},
  ns:{c:"#059669",bg:"#d1fae5",t:"#065f46"},
  em:{c:"#c2410c",bg:"#fff7ed",t:"#7c2d12"},
  mt:{c:"#6b7280",bg:"#f3f4f6",t:"#374151"},
  fe:{c:"#db2777",bg:"#fce7f3",t:"#9d174d"},
  sp:{c:"#0891b2",bg:"#cffafe",t:"#155e75"},
  co:{c:"#8b5cf6",bg:"#ede9fe",t:"#5b21b6"},
  bc:{c:"#64748b",bg:"#f1f5f9",t:"#334155"},
  // PO19 extras
  cp:{c:"#7c3aed",bg:"#ede9fe",t:"#5b21b6"},
  cl:{c:"#06b6d4",bg:"#cffafe",t:"#155e75"},
  ni:{c:"#059669",bg:"#d1fae5",t:"#065f46"},
  n2:{c:"#16a34a",bg:"#dcfce7",t:"#14532d"},
  ph:{c:"#c2410c",bg:"#fff7ed",t:"#7c2d12"},
};

// PO24 areas
const A24=[
  {key:"AI/ML",cl:CL.ai,cap:32,spec:20,info:"NI, AI, NAI, CL, CV"},
  {key:"Psych/Lang",cl:CL.ps,cap:32,spec:20,info:"CMP, CBC, LING"},
  {key:"Neuroscience",cl:CL.ns,cap:32,spec:20,info:"CNS"},
  {key:"Ethics/Mind",cl:CL.em,cap:32,spec:20,info:"EAI, PHIL"},
  {key:"Methods",cl:CL.mt,cap:4,spec:null,info:"MCS"},
];
const A24fe={key:"Free Elective",cl:CL.fe};
const A24sp={key:"Study Project",cl:CL.sp};
const A24co={key:"Colloquium",cl:CL.co,note:"Ask supervisors if ECTS/grades can be awarded and which module they count for."};
const A24bc={key:"BSc Core",cl:CL.bc};

// PO19 areas (flat, no collapse)
const A19=[
  {key:"AI",cl:CL.ai,cap:16,spec:16},{key:"Cog Psych",cl:CL.cp,cap:16,spec:16},
  {key:"Comp Ling",cl:CL.cl,cap:16,spec:16},{key:"Neuroinf",cl:CL.ni,cap:16,spec:16},
  {key:"Neuroscience",cl:CL.n2,cap:16,spec:16},{key:"Philosophy",cl:CL.ph,cap:16,spec:16},
];

// Degree + Prüfungsordnung configurations
const CFGS={
  "msc24":{label:"MSc · PO 2024",areas:A24,fe:A24fe,wp:44,feN:22,total:120,po24:true,msc:true},
  "msc19":{label:"MSc · PO 2019/20",areas:A19,fe:{key:"Free Elective",cl:CL.fe},wp:32,feN:22,total:120,po24:false,msc:true},
  "bsc24":{label:"BSc · PO 2024",areas:A24,fe:A24fe,wp:null,feN:null,total:180,po24:true,msc:false},
  "bsc19":{label:"BSc · PO 2019/20",areas:A19,fe:{key:"Free Elective",cl:CL.fe},wp:null,feN:null,total:180,po24:false,msc:false},
};

// Status states
const ST=[{v:"considering",l:"Considering",icon:"?",c:"#8b5cf6"},{v:"likely",l:"Likely",icon:"~",c:"#2563eb"},{v:"locked",l:"Locked",icon:"✓",c:"#059669"},{v:"dropped",l:"Dropped",icon:"✕",c:"#dc2626"}];
const ST_ORDER=["considering","likely","locked","dropped"];
