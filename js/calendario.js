// ═══════════════════════════════════════════════════════════════════════════
// CALENDARIO ITM ENERO–MAYO 2026
// ═══════════════════════════════════════════════════════════════════════════
const FESTIVOS_BASE = [
  // 1–6 enero (inicio de año / sin clases)
  '2026-01-01','2026-01-02','2026-01-03','2026-01-04','2026-01-05','2026-01-06',
  // 2 febrero — Día de la Constitución
  '2026-02-02',
  // 23 febrero — Suspensión ITM
  '2026-02-23',
  // 16 marzo — Suspensión ITM
  '2026-03-16',
  // 28 marzo – 12 abril — Periodo vacacional / Semana Santa ITM
  '2026-03-28','2026-03-29','2026-03-30','2026-03-31',
  '2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05',
  '2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10',
  '2026-04-11','2026-04-12',
  // 1 mayo — Día del Trabajo
  '2026-05-01',
  // 5 mayo — Batalla de Puebla
  '2026-05-05',
  // 15 mayo — Día del Maestro
  '2026-05-15',
];

const FESTIVOS_LABELS = {
  '2026-01-01':'Sin clases','2026-01-02':'Sin clases','2026-01-03':'Sin clases',
  '2026-01-04':'Sin clases','2026-01-05':'Sin clases','2026-01-06':'Sin clases',
  '2026-02-02':'Constitución','2026-02-23':'Suspensión ITM',
  '2026-03-16':'Suspensión ITM',
  '2026-03-28':'Vacaciones ITM','2026-03-29':'Vacaciones ITM',
  '2026-03-30':'Vacaciones ITM','2026-03-31':'Vacaciones ITM',
  '2026-04-01':'Vacaciones ITM','2026-04-02':'Jue. Santo','2026-04-03':'Vie. Santo',
  '2026-04-04':'Vacaciones ITM','2026-04-05':'Vacaciones ITM',
  '2026-04-06':'Vacaciones ITM','2026-04-07':'Vacaciones ITM',
  '2026-04-08':'Vacaciones ITM','2026-04-09':'Vacaciones ITM','2026-04-10':'Vacaciones ITM',
  '2026-04-11':'Vacaciones ITM','2026-04-12':'Vacaciones ITM',
  '2026-05-01':'Día del Trabajo','2026-05-05':'Batalla de Puebla',
  '2026-05-15':'Día del Maestro',
};

let festivosExtra = [];

function buildHolidaySet(){
  const s = new Set(FESTIVOS_BASE);
  for(const f of festivosExtra) s.add(f);
  return s;
}

function isoDay(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function esDiaHabil(d){
  const dow = d.getDay();
  if(dow===0||dow===6) return false;
  return !buildHolidaySet().has(isoDay(d));
}

function fmtIso(iso){
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function renderCalGrid(){
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  const all = [...new Set(FESTIVOS_BASE)].sort();
  for(const iso of all){
    const t = document.createElement('span');
    t.className = 'cal-tag';
    t.innerHTML = `${fmtIso(iso)} <em style="font-weight:400;color:#666">${FESTIVOS_LABELS[iso]||''}</em>`;
    grid.appendChild(t);
  }
  for(const iso of festivosExtra.sort()){
    const t = document.createElement('span');
    t.className = 'cal-tag';
    t.innerHTML = `${fmtIso(iso)} <em style="font-weight:400;color:#777">Personalizado</em><span class="rm" onclick="removeHoliday('${iso}')">×</span>`;
    grid.appendChild(t);
  }
}

function addHoliday(){
  const v = document.getElementById('newHoliday').value.trim();
  const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(!m){ alert('Formato inválido. Use DD/MM/AAAA'); return; }
  const iso = `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  if(!festivosExtra.includes(iso)) festivosExtra.push(iso);
  document.getElementById('newHoliday').value = '';
  renderCalGrid();
}

function removeHoliday(iso){
  festivosExtra = festivosExtra.filter(f => f !== iso);
  renderCalGrid();
}

function getDiasHabilesPeriodo(){
  const ini = new Date(document.getElementById('periodoInicio').value+'T12:00:00');
  const fin = new Date(document.getElementById('periodoFin').value+'T12:00:00');
  const dias = [];
  for(let d=new Date(ini); d<=fin; d.setDate(d.getDate()+1)){
    if(esDiaHabil(new Date(d))) dias.push(isoDay(new Date(d)));
  }
  return dias;
}