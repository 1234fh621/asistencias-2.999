// ═══════════════════════════════════════════════════════════════════════════
// CALENDARIO ITM ENERO–MAYO 2026 — reglas por defecto
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

const MESES_CORTOS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
  'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA_CORTOS = ['L','M','X','J','V','S','D']; // empieza en lunes

// diasOverride[iso] = true (verde, SÍ se trabaja) | false (negro, NO se trabaja)
// Solo contiene los días donde el usuario dio clic para cambiar la regla por
// defecto (fin de semana / festivo ITM = negro; resto = verde).
let diasOverride = {};

// diasParcial[iso] = 'HH:MM' — suspensión PARCIAL (ej. día de calor): ese día SÍ
// se trabaja, pero solo hasta la hora indicada. Los bloques de horario que
// empiezan a esa hora o después NO cuentan (no hay falta ni retardo); los que
// empiezan antes siguen contando normal. Si un docente solo tiene clase en la
// mañana y no vino, se le sigue contando la falta.
let diasParcial = {};

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTENCIA LOCAL — periodo y el calendario marcado a mano sobreviven a
// recargar la página o cerrar el navegador (localStorage del dispositivo).
// ═══════════════════════════════════════════════════════════════════════════
const LS_KEY_OVERRIDE = 'itmAsist_diasOverride';
const LS_KEY_PARCIAL = 'itmAsist_diasParcial';
const LS_KEY_PERIODO_INI = 'itmAsist_periodoInicio';
const LS_KEY_PERIODO_FIN = 'itmAsist_periodoFin';

function guardarOverrideLS(){
  try{
    localStorage.setItem(LS_KEY_OVERRIDE, JSON.stringify(diasOverride));
    localStorage.setItem(LS_KEY_PARCIAL, JSON.stringify(diasParcial));
  }catch(e){}
}

function cargarOverrideLS(){
  try{
    const raw = localStorage.getItem(LS_KEY_OVERRIDE);
    if(raw){ const obj = JSON.parse(raw); if(obj && typeof obj==='object') diasOverride = obj; }
    const rawP = localStorage.getItem(LS_KEY_PARCIAL);
    if(rawP){ const obj = JSON.parse(rawP); if(obj && typeof obj==='object') diasParcial = obj; }
  }catch(e){ /* ignorar si el navegador bloquea localStorage */ }
}

function guardarPeriodoLS(){
  try{
    localStorage.setItem(LS_KEY_PERIODO_INI, document.getElementById('periodoInicio').value);
    localStorage.setItem(LS_KEY_PERIODO_FIN, document.getElementById('periodoFin').value);
  }catch(e){}
  renderCalendario();
}

function cargarPeriodoLS(){
  try{
    const ini = localStorage.getItem(LS_KEY_PERIODO_INI);
    const fin = localStorage.getItem(LS_KEY_PERIODO_FIN);
    if(ini) document.getElementById('periodoInicio').value = ini;
    if(fin) document.getElementById('periodoFin').value = fin;
  }catch(e){}
}

function initConfigPeriodo(){
  cargarOverrideLS();
  cargarPeriodoLS();
  renderCalendario();
}

// ═══════════════════════════════════════════════════════════════════════════
// REGLA DE DÍA HÁBIL
// ═══════════════════════════════════════════════════════════════════════════
function isoDay(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** Regla por defecto SIN overrides: Lun-Vie y no festivo ITM = se trabaja. */
function reglaBaseTrabaja(iso, dow){
  if(dow===0||dow===6) return false;
  return !FESTIVOS_BASE.includes(iso);
}

/** true = verde (se trabaja, cuenta falta si no hay checada) · false = negro (no se trabaja) */
function trabajaDia(iso, dow){
  // Suspensión parcial: el día se trabaja (hasta la hora de corte)
  if(Object.prototype.hasOwnProperty.call(diasParcial, iso)) return true;
  if(Object.prototype.hasOwnProperty.call(diasOverride, iso)) return diasOverride[iso];
  return reglaBaseTrabaja(iso, dow);
}

/** Hora de corte de una suspensión parcial, en minutos desde medianoche (ej. 13:00 → 780).
 *  Devuelve null si ese día no tiene suspensión parcial. Recibe la fecha en formato 'AAAA-MM-DD'. */
function corteParcialMin(iso){
  const c = diasParcial[iso];
  if(!c) return null;
  const [h, m] = c.split(':').map(Number);
  if(isNaN(h) || isNaN(m)) return null;
  return h*60 + m;
}

function esDiaHabil(d){
  return trabajaDia(isoDay(d), d.getDay());
}

function fmtIso(iso){
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
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

// ═══════════════════════════════════════════════════════════════════════════
// CALENDARIO VISUAL — clic en un día para alternar verde (labora) / negro (no labora)
// ═══════════════════════════════════════════════════════════════════════════

/** Devuelve [{year,month}] de cada mes que toca el rango periodoInicio..periodoFin */
function mesesDelPeriodo(ini, fin){
  const meses = [];
  let y = ini.getFullYear(), m = ini.getMonth();
  const yFin = fin.getFullYear(), mFin = fin.getMonth();
  while(y < yFin || (y===yFin && m<=mFin)){
    meses.push({year:y, month:m});
    m++;
    if(m>11){ m=0; y++; }
  }
  return meses;
}

/** Modo de clic elegido en el panel del calendario: 'alternar' (verde/negro) o 'parcial'. */
function modoCalendario(){
  return document.querySelector('input[name="calModo"]:checked')?.value || 'alternar';
}

function toggleDia(iso, dow){
  if(modoCalendario()==='parcial'){
    // Suspensión parcial: el día se trabaja solo hasta la hora de corte.
    const corte = document.getElementById('calCorte')?.value;
    if(!corte){ showAlert('Indica a partir de qué hora se suspende (ej. 13:00).', 'warning'); return; }
    if(diasParcial[iso]===corte){
      delete diasParcial[iso];          // mismo corte otra vez = quitar la marca
    } else {
      diasParcial[iso] = corte;
    }
    delete diasOverride[iso];           // la suspensión parcial reemplaza la marca verde/negro
    guardarOverrideLS();
    renderCalendario();
    return;
  }
  const actual = trabajaDia(iso, dow);
  delete diasParcial[iso];              // un clic normal siempre sale de la suspensión parcial
  diasOverride[iso] = !actual;
  guardarOverrideLS();
  renderCalendario();
}

async function resetCalendario(){
  if(Object.keys(diasOverride).length===0 && Object.keys(diasParcial).length===0) return;
  if(!(await showConfirm('¿Restablecer el calendario a los días festivos/fines de semana por defecto?\nSe perderán tus marcas manuales (incluidas las suspensiones parciales).'))) return;
  diasOverride = {};
  diasParcial = {};
  guardarOverrideLS();
  renderCalendario();
}

function renderCalendario(){
  const cont = document.getElementById('calCalendar');
  const resumen = document.getElementById('periodoResumen');
  if(!cont) return;

  const iniVal = document.getElementById('periodoInicio')?.value;
  const finVal = document.getElementById('periodoFin')?.value;
  if(!iniVal || !finVal){ cont.innerHTML=''; return; }
  const ini = new Date(iniVal+'T12:00:00');
  const fin = new Date(finVal+'T12:00:00');

  cont.innerHTML = '';
  const meses = mesesDelPeriodo(ini, fin);
  let nCambios = 0;

  for(const {year,month} of meses){
    const wrap = document.createElement('div');
    wrap.className = 'cal-month';

    const titulo = document.createElement('div');
    titulo.className = 'cal-month-title';
    titulo.textContent = `${MESES_CORTOS[month]} ${year}`;
    wrap.appendChild(titulo);

    const gridHead = document.createElement('div');
    gridHead.className = 'cal-month-grid cal-month-head';
    for(const dl of DIAS_SEMANA_CORTOS){
      const c = document.createElement('span');
      c.textContent = dl;
      gridHead.appendChild(c);
    }
    wrap.appendChild(gridHead);

    const grid = document.createElement('div');
    grid.className = 'cal-month-grid';

    const primerDia = new Date(year, month, 1);
    // offset: 0=lunes ... 6=domingo
    let offset = primerDia.getDay()-1; if(offset<0) offset=6;
    for(let i=0;i<offset;i++){
      const blank = document.createElement('span');
      blank.className = 'cal-day cal-day-blank';
      grid.appendChild(blank);
    }

    const diasEnMes = new Date(year, month+1, 0).getDate();
    for(let dia=1; dia<=diasEnMes; dia++){
      const d = new Date(year, month, dia, 12,0,0);
      const iso = isoDay(d);
      const dow = d.getDay();
      const dentroPeriodo = d>=new Date(ini.getFullYear(),ini.getMonth(),ini.getDate()) && d<=new Date(fin.getFullYear(),fin.getMonth(),fin.getDate());

      const celda = document.createElement('span');
      celda.textContent = dia;
      const trabaja = trabajaDia(iso, dow);
      const corte = diasParcial[iso];
      const esOverride = Object.prototype.hasOwnProperty.call(diasOverride, iso) || !!corte;
      if(esOverride) nCambios++;

      const claseColor = corte ? 'cal-day-parcial' : (trabaja ? 'cal-day-on' : 'cal-day-off');
      celda.className = 'cal-day ' + claseColor + (dentroPeriodo?'':' cal-day-fuera') + (esOverride?' cal-day-marcado':'');
      let tip = corte ? `Suspensión parcial: se trabaja hasta las ${corte}` : (trabaja ? 'Se trabaja' : 'No se trabaja');
      if(FESTIVOS_LABELS[iso]) tip += ` — ${FESTIVOS_LABELS[iso]}`;
      if(!dentroPeriodo) tip += ' (fuera del periodo)';
      tip += ' · clic para cambiar';
      celda.title = tip;
      celda.onclick = () => toggleDia(iso, dow);
      grid.appendChild(celda);
    }
    wrap.appendChild(grid);
    cont.appendChild(wrap);
  }

  if(resumen){
    resumen.textContent = `${fmtIso(iniVal)} → ${fmtIso(finVal)}${nCambios?` · ${nCambios} día(s) modificado(s) a mano`:''}`;
  }
}
