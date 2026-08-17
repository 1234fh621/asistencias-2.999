// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES GENERALES
// ═══════════════════════════════════════════════════════════════════════════
function setStep(n){
  ['sec1','sec2','sec3'].forEach((id,i)=>{
    document.getElementById(id).className = 'section'+(i+1===n?' visible':'');
    const s = document.getElementById(`step${i+1}`);
    s.className = 'step'+(i+1===n?' active':i+1<n?' done':'');
  });
}
function logMsg(id,msg,tipo=''){
  const el = document.getElementById(id);
  const cls = tipo==='ok'?'ok':tipo==='warn'?'warn':tipo==='err'?'err':tipo==='skip'?'skip':'';
  el.innerHTML += `<span class="${cls}">${msg}</span>\n`;
  el.scrollTop = el.scrollHeight;
}
function nuevaConsulta(){
  datosAsist=[]; justificaciones=[]; profesores={}; resultados=[]; sinIncidencias=[];
  document.getElementById('pasteAsist').value='';
  document.getElementById('pasteJust').value='';
  document.getElementById('logCarga').innerHTML='Esperando datos...';
  document.getElementById('logAnalisis').innerHTML='';
  document.getElementById('bodyResultados').innerHTML='';
  document.getElementById('bodyHorarios').innerHTML='';
  document.getElementById('btnSiguiente1').disabled=true;
  document.getElementById('previewWrap').style.display='none';
  document.getElementById('summaryBar').innerHTML='';
  document.getElementById('btnExportWord').style.display='none';
  setStep(1);
}