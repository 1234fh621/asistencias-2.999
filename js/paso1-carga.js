// ═══════════════════════════════════════════════════════════════════════════
// PASO 1 — PROCESAR DATOS PEGADOS
// ═══════════════════════════════════════════════════════════════════════════
function parsePaste(){
  const txtA = document.getElementById('pasteAsist').value.trim();
  const txtJ = document.getElementById('pasteJust').value.trim();
  if(!txtA){ logMsg('logCarga','Sin datos de asistencias.','warn'); return; }

  document.getElementById('logCarga').innerHTML='';
  logMsg('logCarga','Procesando asistencias...','ok');
  datosAsist = parseTxt(txtA);

  if(txtJ){
    justificaciones = parseJustificaciones(txtJ);
    logMsg('logCarga',`${justificaciones.length} justificación(es) cargada(s):`,'ok');
    for(const j of justificaciones){
      logMsg('logCarga',`  · No.${j.no}  ${fmtFecha(j.ini)}  →  ${fmtFecha(j.fin)}`,'skip');
    }
    if(justificaciones.length===0) logMsg('logCarga','  ⚠ No se reconoció ninguna justificación — revise el formato.','warn');
  } else {
    justificaciones = [];
  }

  if(datosAsist.length>0){
    logMsg('logCarga',`✓ ${datosAsist.length} registros en días hábiles.`,'ok');
    const box = document.getElementById('previewBox');
    box.innerHTML = datosAsist.slice(0,8).map(r=>`${r.no.padEnd(6)} ${(r.nombre+' '+r.apellidos).padEnd(28)} ${fmtFecha(r.fecha)}`).join('\n');
    if(datosAsist.length>8) box.innerHTML += `\n... y ${datosAsist.length-8} más`;
    document.getElementById('previewWrap').style.display='block';
    document.getElementById('btnSiguiente1').disabled=false;
  } else {
    logMsg('logCarga','No se detectaron registros válidos en días hábiles.','err');
    document.getElementById('previewWrap').style.display='none';
  }
}
