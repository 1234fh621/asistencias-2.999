// ═══════════════════════════════════════════════════════════════════════════
// PASO 3 — RENDER DE RESULTADOS
// ═══════════════════════════════════════════════════════════════════════════
const TL = {
  FALTA:['tag-falta','Falta'],
  RETARDO_MENOR:['tag-retmenor','Retardo menor'],
  RETARDO_MAYOR:['tag-retmayor','Retardo mayor'],
  OMISION_ENTRADA:['tag-omision','Omisión de entrada'],
  OMISION_SALIDA:['tag-omision','Omisión de salida'],
};

function schedLabelHtml(p){
  return p.horarioVariable
    ? '<span class="bloque-badge" style="font-size:9px;margin-left:4px">HORARIO VARIABLE</span>'
    : `<span style="font-size:9px;color:var(--text-muted)">${p.horaEntrada}–${p.horaSalida}</span>`;
}

function renderResultados(){
  const tbody = document.getElementById('bodyResultados');
  tbody.innerHTML = '';
  if(!resultados.length && !sinIncidencias.length){
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:18px;font-size:11px">No hay datos que mostrar.</td></tr>';
    return;
  }

  // Docentes CON incidencias → botón Memo
  for(const r of resultados){
    let obs = '';
    for(const inc of r.incidencias){
      obs += `<div style="margin-bottom:5px"><span style="font-size:10px;font-weight:700;color:var(--text-main);margin-right:4px">${fmtDia(inc.fecha)}</span>`;
      if(inc.bloqueLabel) obs += `<span class="bloque-badge" style="font-size:9px;margin-right:3px">${inc.bloqueLabel}</span>`;
      for(const t of inc.tipos){ const [cls,lbl]=TL[t]||['',t]; obs += `<span class="tag ${cls}">${lbl}</span>`; }
      if(inc.esAusencia) obs += ` <span style="font-size:10px;color:var(--text-muted)">Sin checadas</span>`;
      for(const c of inc.refs) obs += `<div class="chk">${c}</div>`;
      obs += '</div>';
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.no}</td><td>${r.nombre} ${r.apellidos}<br>${schedLabelHtml(r)}</td>
      <td style="max-width:360px">${obs}</td>
      <td><button class="btn btn-word btn-sm" id="btnMemo_${r.no}" onclick="generarMemoDocx('${r.no}')">${appIcon('file')} Memo</button></td>`;
    tbody.appendChild(tr);
  }

  // Docentes SIN incidencias → botón Constancia (constancia de excelencia)
  for(const p of sinIncidencias){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.no}</td><td>${p.nombre} ${p.apellidos}<br>${schedLabelHtml(p)}</td>
      <td style="color:var(--ok-text);font-size:11px">${appIcon('check')} Sin incidencias en el periodo</td>
      <td><button class="btn btn-word btn-sm" id="btnConst_${p.no}" onclick="generarConstanciaDocx('${p.no}')">${appIcon('file')} Constancia</button></td>`;
    tbody.appendChild(tr);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR A PDF (reporte general, todos los docentes)
// ═══════════════════════════════════════════════════════════════════════════
const TIPO_LABELS = {
  FALTA: 'Falta',
  RETARDO_MENOR: 'Retardo menor',
  RETARDO_MAYOR: 'Retardo mayor',
  OMISION_ENTRADA: 'Omisión de entrada',
  OMISION_SALIDA: 'Omisión de salida',
};

function buildFilasWord(){
  const filas = [];
  for(const r of resultados){
    const nombre = `${r.nombre} ${r.apellidos}`.trim();
    const horario = r.horarioVariable ? 'Variable' : `${r.horaEntrada} – ${r.horaSalida}`;
    for(const inc of r.incidencias){
      const fechaRef = inc.esAusencia ? fmtDia(inc.fecha) : (inc.refs[0] || fmtDia(inc.fecha));
      const observacion = inc.tipos.map(t => TIPO_LABELS[t] || t).join(' - ').toUpperCase();
      filas.push({ no: r.no, nombre, horario, fecha: fechaRef, observacion });
    }
  }
  return filas;
}

function exportarTxt(){
  const btn = document.getElementById('btnExportWord');
  btn.disabled = true;
  btn.textContent = 'Generando...';
  try {
    const hoy = new Date();
    const fechaHoy = `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`;
    const periodoIni = fmtDia(new Date(document.getElementById('periodoInicio').value+'T12:00:00'));
    const periodoFin = fmtDia(new Date(document.getElementById('periodoFin').value+'T12:00:00'));

    const filas = buildFilasWord().map(f => `<tr>
          <td>${f.no}</td>
          <td>${f.nombre}</td>
          <td style="white-space:nowrap">${f.horario}</td>
          <td style="white-space:nowrap">${f.fecha}</td>
          <td>${f.observacion}</td>
        </tr>`).join('\n');

    const filasSinInc = sinIncidencias.map(p =>
      `<span class="chip-ok">${p.no} — ${p.nombre} ${p.apellidos}</span>`
    ).join('\n');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Asistencias ITM</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px 30px; color:#1a1a1a; }
  .header { text-align:center; margin-bottom: 14px; border-bottom: 2px solid #1a2b3c; padding-bottom: 10px; }
  .header p { font-size: 14px; font-weight: bold; color: #1a2b3c; }
  .header small { font-size: 10px; color: #444; }
  .meta { display:flex; justify-content:space-between; font-size:10px; color:#555; margin-bottom:14px; }
  h2 { font-size: 12px; color:#1a2b3c; text-transform:uppercase; letter-spacing:.3px; margin: 16px 0 8px; border-bottom:1px solid #ddd; padding-bottom:4px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a2b3c; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
  td { padding: 5px 8px; border: 1px solid #ddd; font-size: 11px; vertical-align:top; }
  tr:nth-child(even) td { background: #f6f6f6; }
  .sin-inc { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
  .chip-ok { display:inline-block; background:#eef6ee; border:1px solid #b8d8b8; color:#2a5a2a; border-radius:3px; padding:3px 8px; font-size:10px; }
  .empty { color:#888; font-size:11px; padding:10px 0; }
  @media print { body { padding: 10px 20px; } }
</style>
</head>
<body>

<div class="header">
  <p>Reporte general de asistencias</p>
  <small>TecNM · Instituto Tecnológico de Mexicali</small>
</div>

<div class="meta">
  <span>Periodo evaluado: <strong>${periodoIni} – ${periodoFin}</strong></span>
  <span>Generado: <strong>${fechaHoy}</strong></span>
</div>

<h2>Docentes con incidencias (${resultados.length})</h2>
${filas ? `<table>
  <thead>
    <tr>
      <th style="width:40px">No.</th>
      <th>Nombre</th>
      <th style="width:110px">Horario</th>
      <th style="width:110px">Fecha</th>
      <th>Observación</th>
    </tr>
  </thead>
  <tbody>
    ${filas}
  </tbody>
</table>` : `<div class="empty">Sin incidencias registradas.</div>`}

<h2>Docentes sin incidencias (${sinIncidencias.length})</h2>
${filasSinInc ? `<div class="sin-inc">${filasSinInc}</div>` : `<div class="empty">Ninguno.</div>`}

</body>
</html>`;

    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 600);

  } catch(e){
    console.error(e);
    showAlert('Error al generar el PDF: ' + e.message, 'error');
  }
  btn.disabled = false;
  btn.innerHTML = `${appIcon('download')} Exportar a PDF`;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTA: la función generarMemo() (memo en HTML/print, con membrete armado a
// mano en CSS) fue reemplazada por generarMemoDocx(no), que vive en
// js/docx-export.js y usa la plantilla real plantillas/memo_plantilla.docx.
// Se llama automáticamente desde el botón "📄 Memo" de cada fila en la tabla
// de resultados (ver renderResultados arriba) — ya no existe un botón único
// "Generar memo" para el primer docente de la lista.
//
// Para los docentes SIN incidencias, cada fila tiene su propio botón
// "📄 Constancia" que llama a generarConstanciaDocx(no), también en
// js/docx-export.js, usando plantillas/constancia_plantilla.docx.
// ═══════════════════════════════════════════════════════════════════════════