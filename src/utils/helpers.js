// ── Utility functions: overlap check, localStorage, URL encoding, time format ──
function overlaps(a,b){return a.day===b.day&&a.start<b.end&&b.start<a.end}
// Times are stored as decimal hours (14.25 = 14:15). Integers stay valid (14 = 14:00).
function parseTime(s){if(typeof s==="number")return s;if(s==null||s==="")return 0;const p=String(s).split(":");const h=parseFloat(p[0])||0;const m=p[1]?parseFloat(p[1])||0:0;return h+m/60}
function fmtTime(t){const n=parseTime(t);const h=Math.floor(n);const m=Math.round((n-h)*60);return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`}
function fmtTimeShort(t){const n=parseTime(t);const h=Math.floor(n);const m=Math.round((n-h)*60);return m?`${h}:${String(m).padStart(2,"0")}`:`${h}`}
function save(s){try{localStorage.setItem(SK,JSON.stringify(s))}catch(e){}}
function load(){try{const s=localStorage.getItem(SK);return s?JSON.parse(s):null}catch(e){return null}}
function toURL(s){try{return location.origin+location.pathname+"?s="+btoa(unescape(encodeURIComponent(JSON.stringify(s))))}catch(e){return null}}
function fromURL(){try{const p=new URLSearchParams(location.search).get("s");return p?JSON.parse(decodeURIComponent(escape(atob(p)))):null}catch(e){return null}}
