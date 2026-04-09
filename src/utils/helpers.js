// ── Utility functions: overlap check, localStorage, URL encoding ──
function overlaps(a,b){return a.day===b.day&&a.start<b.end&&b.start<a.end}
function save(s){try{localStorage.setItem(SK,JSON.stringify(s))}catch(e){}}
function load(){try{const s=localStorage.getItem(SK);return s?JSON.parse(s):null}catch(e){return null}}
function toURL(s){try{return location.origin+location.pathname+"?s="+btoa(unescape(encodeURIComponent(JSON.stringify(s))))}catch(e){return null}}
function fromURL(){try{const p=new URLSearchParams(location.search).get("s");return p?JSON.parse(decodeURIComponent(escape(atob(p)))):null}catch(e){return null}}
