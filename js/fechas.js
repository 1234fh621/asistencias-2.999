// ═══════════════════════════════════════════════════════════════════════════
// NORMALIZACIÓN a.m./p.m.
// ═══════════════════════════════════════════════════════════════════════════
function normalizarAmPm(s){
  return s
    .replace(/a\.\s*m\./gi,'am')
    .replace(/p\.\s*m\./gi,'pm');
}

// ═══════════════════════════════════════════════════════════════════════════
// PARSEO DE FECHAS
// ═══════════════════════════════════════════════════════════════════════════
function parseFecha(val){
  if(!val) return null;
  if(val instanceof Date && !isNaN(val)) return val;
  if(typeof val==='number') return new Date(Math.round((val-25569)*86400*1000));
  if(typeof val==='string'){
    let s = normalizarAmPm(val.trim());
    // DD/MM/AAAA HH:MM am/pm
    let m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)/i);
    if(m){
      let h=parseInt(m[4]), mn=parseInt(m[5]), ap=m[6].toLowerCase();
      if(ap==='pm'&&h!==12) h+=12;
      if(ap==='am'&&h===12) h=0;
      return new Date(parseInt(m[3]),parseInt(m[2])-1,parseInt(m[1]),h,mn,0);
    }
    // DD/MM/AAAA HH:MM:SS (24h)
    m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})(?::\d{2})?/);
    if(m) return new Date(parseInt(m[3]),parseInt(m[2])-1,parseInt(m[1]),parseInt(m[4]),parseInt(m[5]),0);
    // Solo fecha DD/MM/AAAA
    m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if(m) return new Date(parseInt(m[3]),parseInt(m[2])-1,parseInt(m[1]),0,0,0);
    const d = new Date(s);
    if(!isNaN(d)) return d;
  }
  return null;
}

function fmtFecha(d){
  if(!d) return '';
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  let h = d.getHours();
  const mn = String(d.getMinutes()).padStart(2,'0');
  const ap = h>=12 ? 'p.m.' : 'a.m.';
  if(h>12) h-=12;
  if(h===0) h=12;
  return `${dd}/${mm}/${d.getFullYear()} ${h}:${mn} ${ap}`;
}

function fmtDia(d){
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function diaKey(d){
  return isoDay(d);
}

function minsDesde(c, hs){
  const [hh,mm] = hs.split(':').map(Number);
  const b = new Date(c);
  b.setHours(hh,mm,0,0);
  return Math.round((c-b)/60000);
}