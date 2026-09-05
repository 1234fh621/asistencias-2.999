// ═══════════════════════════════════════════════════════════════════════════
// PASO 2 — CONFIGURACIÓN DE HORARIOS
// ═══════════════════════════════════════════════════════════════════════════
function irPaso1(){ setStep(1); }

function irPaso2(){
  if(!datosAsist.length){ alert('Primero procese los datos.'); return; }
  profesores = {};
  for(const r of datosAsist){
    if(!profesores[r.no]) profesores[r.no] = {nombre:r.nombre,apellidos:r.apellidos,depto:'',checadas:[]};
    profesores[r.no].checadas.push(r.fecha);
  }

  const DIAS = [
    {key:'lun',label:'Lunes',dow:1},
    {key:'mar',label:'Martes',dow:2},
    {key:'mie',label:'Miércoles',dow:3},
    {key:'jue',label:'Jueves',dow:4},
    {key:'vie',label:'Viernes',dow:5},
  ];

  const tbody = document.getElementById('bodyHorarios');
  tbody.innerHTML = '';

  for(const [no,p] of Object.entries(profesores)){
    const tr = document.createElement('tr');
    // Build per-day rows (flex layout, sin rowspan) — soporta 2 bloques por día
    // sin que el 2° bloque desordene el resto de la fila al mostrarse/ocultarse.
    const subRows = DIAS.map(d=>`
      <div class="sched-day-row">
        <div class="sched-day-name">${d.label}</div>
        <div class="sched-day-blocks">
          <div class="sched-block">
            <span class="bloque-badge">1°</span>
            <input type="time" id="entrada_${no}_${d.key}" value="08:00"/>
            <span class="arrow">→</span>
            <input type="time" id="salida_${no}_${d.key}" value="09:00"/>
          </div>
          <div class="sched-block bloque2" id="bloque2_${no}_${d.key}">
            <span class="bloque-badge bloque-badge-2">2°</span>
            <input type="time" id="entrada2_${no}_${d.key}" value="15:00"/>
            <span class="arrow">→</span>
            <input type="time" id="salida2_${no}_${d.key}" value="16:00"/>
          </div>
        </div>
        <div class="sched-day-actions">
          <label class="day-off"><input type="checkbox" id="libre_${no}_${d.key}" onchange="toggleDayOff('${no}','${d.key}')"/> Libre</label>
          <button class="btn-bloque" onclick="toggleBloque2('${no}','${d.key}')" id="btnb2_${no}_${d.key}">+ 2° bloque</button>
        </div>
      </div>`).join('');

    tr.innerHTML = `
      <td>${no}</td>
      <td style="font-size:11px">${p.nombre} ${p.apellidos}</td>
      <td><input type="text" placeholder="Ej. Sistemas" id="depto_${no}"/></td>
      <td><input type="time" id="entrada_${no}" value="08:00" oninput="syncDayTimes('${no}','entrada')"/></td>
      <td><input type="time" id="salida_${no}" value="16:00" oninput="syncDayTimes('${no}','salida')"/></td>
      <td>
        <label class="sched-mode-toggle">
          <input type="checkbox" id="varcheck_${no}" onchange="toggleVarSched('${no}')"/>
          <span>Activar horario por día</span>
        </label>
        <div class="sched-days" id="scheddays_${no}">
          <div class="sched-days-head">
            <span>Día</span><span>Bloques de horario</span><span></span>
          </div>
          ${subRows}
        </div>
      </td>`;
    tbody.appendChild(tr);
  }
  setStep(2);
}

function toggleVarSched(no){
  const chk = document.getElementById(`varcheck_${no}`);
  const div = document.getElementById(`scheddays_${no}`);
  if(chk.checked){
    div.classList.add('open');
    syncDayTimes(no,'entrada');
    syncDayTimes(no,'salida');
  } else {
    div.classList.remove('open');
  }
}

function syncDayTimes(no,tipo){
  const base = document.getElementById(`${tipo}_${no}`)?.value;
  if(!base) return;
  const dias = ['lun','mar','mie','jue','vie'];
  for(const d of dias){
    const inp = document.getElementById(`${tipo}_${no}_${d}`);
    if(inp) inp.value = base;
  }
}

function toggleDayOff(no,dia){
  const chk = document.getElementById(`libre_${no}_${dia}`);
  const ent = document.getElementById(`entrada_${no}_${dia}`);
  const sal = document.getElementById(`salida_${no}_${dia}`);
  const ent2 = document.getElementById(`entrada2_${no}_${dia}`);
  const sal2 = document.getElementById(`salida2_${no}_${dia}`);
  if(ent) ent.disabled = chk.checked;
  if(sal) sal.disabled = chk.checked;
  if(ent2) ent2.disabled = chk.checked;
  if(sal2) sal2.disabled = chk.checked;
}

function toggleBloque2(no,dia){
  const bloque = document.getElementById(`bloque2_${no}_${dia}`);
  const btn = document.getElementById(`btnb2_${no}_${dia}`);
  if(!bloque) return;
  const visible = bloque.classList.toggle('visible');
  btn.textContent = visible ? '− Quitar 2° bloque' : '+ 2° bloque';
}

function irPaso3(){
  const DIAS_KEYS = ['lun','mar','mie','jue','vie'];
  const DOW_MAP = {lun:1,mar:2,mie:3,jue:4,vie:5};

  for(const no of Object.keys(profesores)){
    profesores[no].depto = document.getElementById(`depto_${no}`)?.value || '';
    const varActivo = document.getElementById(`varcheck_${no}`)?.checked || false;
    profesores[no].horaEntrada = document.getElementById(`entrada_${no}`)?.value || '08:00';
    profesores[no].horaSalida = document.getElementById(`salida_${no}`)?.value || '16:00';

    if(varActivo){
      profesores[no].horarioVariable = {};
      for(const dk of DIAS_KEYS){
        const libre = document.getElementById(`libre_${no}_${dk}`)?.checked || false;
        const tieneBloque2 = document.getElementById(`bloque2_${no}_${dk}`)?.classList.contains('visible') || false;
        const bloques = [{
          entrada: document.getElementById(`entrada_${no}_${dk}`)?.value || profesores[no].horaEntrada,
          salida: document.getElementById(`salida_${no}_${dk}`)?.value || profesores[no].horaSalida,
        }];
        if(tieneBloque2){
          bloques.push({
            entrada: document.getElementById(`entrada2_${no}_${dk}`)?.value || '15:00',
            salida: document.getElementById(`salida2_${no}_${dk}`)?.value || '16:00',
          });
        }
        profesores[no].horarioVariable[DOW_MAP[dk]] = { libre, bloques };
      }
    } else {
      profesores[no].horarioVariable = null;
    }
  }

  setStep(3);
  document.getElementById('logAnalisis').innerHTML = '';
  document.getElementById('summaryBar').innerHTML = '';
  document.getElementById('btnExportWord').style.display = 'none';
  setTimeout(analizar, 80);
}
