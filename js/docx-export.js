// ═══════════════════════════════════════════════════════════════════════════
// GENERAR MEMO OFICIAL EN .DOCX REAL — usa la plantilla original (con logos,
// membrete y formato exactos) y solo inyecta los datos del docente elegido.
//
// Requiere 3 librerías cargadas antes de este script (ver index.html):
//   - PizZip        (lee el .docx como zip)
//   - docxtemplater (reemplaza los {marcadores})
//   - FileSaver.js  (saveAs, para descargar el resultado)
//
// La plantilla vive en: plantillas/memo_plantilla.docx
// Se generó a partir de tu Word original, reemplazando los valores que
// cambian por marcadores:
//   {fecha_hoy}      → fecha de hoy (ej. 8/julio/2026)
//   {numero_memo}    → el número que se captura al generar
//   {anio}           → año del memo
//   {nombre_persona} → NOMBRE APELLIDOS en mayúsculas
//   {periodo}        → periodo de análisis (ej. ENERO - MAYO 2026)
//   {#filas}...{/filas} → una fila de la tabla se repite por cada incidencia:
//       {no} {nombre_p} {apellidos_p} {fecha_inc} {observacion}
// ═══════════════════════════════════════════════════════════════════════════

const RUTA_PLANTILLA_MEMO = 'plantillas/memo_plantilla.docx';

const MESES_LARGO = ['enero','febrero','marzo','abril','mayo','junio','julio',
  'agosto','septiembre','octubre','noviembre','diciembre'];

/**
 * Genera el memo .docx para UN docente específico (por su número de empleado).
 * Se llama desde un botón "📄 Memo" en la fila de ese docente.
 */
async function generarMemoDocx(no){
  const r = resultados.find(x => x.no === no);
  if(!r){ alert('No se encontraron resultados para ese docente.'); return; }
  if(!r.incidencias || r.incidencias.length===0){ alert('Ese docente no tiene incidencias.'); return; }

  const numeroMemo = prompt('Ingresa el número de memo (ej. 070):');
  if(!numeroMemo) return;

  const btn = document.getElementById(`btnMemo_${no}`);
  if(btn){ btn.disabled = true; btn.textContent = 'Generando...'; }

  try{
    // 1. Cargar la plantilla original como binario
    const respuesta = await fetch(RUTA_PLANTILLA_MEMO);
    if(!respuesta.ok) throw new Error(`No se pudo cargar la plantilla (${respuesta.status}). Verifica que el archivo esté en ${RUTA_PLANTILLA_MEMO}`);
    const arrayBuffer = await respuesta.arrayBuffer();

    // 2. Abrir el .docx como zip
    const zip = new PizZip(arrayBuffer);
    const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // 3. Armar los datos
    const hoy = new Date();
    const fechaHoy = `${hoy.getDate()}/${MESES_LARGO[hoy.getMonth()]}/${hoy.getFullYear()}`;

    const periodoIni = document.getElementById('periodoInicio').value;
    const periodoFin = document.getElementById('periodoFin').value;
    const mIni = MESES_LARGO[parseInt(periodoIni.split('-')[1])-1].toUpperCase();
    const mFin = MESES_LARGO[parseInt(periodoFin.split('-')[1])-1].toUpperCase();
    const yFin = periodoFin.split('-')[0];

    const filas = r.incidencias.map(inc => {
      const fechaRef = inc.esAusencia ? fmtDia(inc.fecha) : (inc.refs[0] || fmtDia(inc.fecha));
      const observacion = inc.tipos.map(t => TIPO_LABELS[t] || t).join(' - ');
      return {
        no: r.no,
        nombre_p: r.nombre,
        apellidos_p: r.apellidos,
        fecha_inc: fechaRef,
        observacion: observacion,
      };
    });

    doc.render({
      fecha_hoy: fechaHoy,
      numero_memo: numeroMemo,
      anio: hoy.getFullYear(),
      nombre_persona: `${r.apellidos} ${r.nombre}`.toUpperCase(),
      periodo: `${mIni} - ${mFin} ${yFin}`,
      filas: filas,
    });

    // 4. Generar el .docx final y descargarlo
    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const nombreArchivo = `MEMO_RH_${numeroMemo}-${hoy.getFullYear()}_${r.apellidos.replace(/\s+/g,'_')}_${r.nombre.replace(/\s+/g,'_')}.docx`;
    saveAs(out, nombreArchivo);

  } catch(e){
    console.error(e);
    if(e.properties && e.properties.errors){
      // Errores típicos de docxtemplater: marcador no encontrado, etc.
      console.error(JSON.stringify(e.properties.errors, null, 2));
      alert('Error al generar el memo: revisa la consola para más detalle (posible marcador faltante en la plantilla).');
    } else {
      alert('Error al generar el memo: ' + e.message);
    }
  }

  if(btn){ btn.disabled = false; btn.textContent = '📄 Memo'; }
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERAR CONSTANCIA DE EXCELENCIA — mismo mecanismo que el memo, pero para
// docentes SIN ninguna incidencia en el periodo. Usa una plantilla aparte:
//
//   plantillas/constancia_plantilla.docx
//
// Marcadores de esa plantilla:
//   {fecha_hoy}      → fecha de hoy (ej. 8/julio/2026)      — esquina sup. der.
//   {numero_memo}    → número de memo capturado al generar
//   {anio}           → año del memo
//   {nombre_persona} → APELLIDOS NOMBRE en mayúsculas
//   {periodo_ini}    → inicio del periodo, ej. "07 de enero"
//   {periodo_fin}    → fin del periodo, ej. "22 de mayo de 2026"
//   {fecha_larga}    → fecha de hoy en letras, ej.
//                       "ocho días del mes de julio del dos mil veintiséis"
// ═══════════════════════════════════════════════════════════════════════════

const RUTA_PLANTILLA_CONSTANCIA = 'plantillas/constancia_plantilla.docx';

// Día del mes en letras (para "a los X días del mes de..."), índices 1–31
const DIAS_LETRAS = ['', 'uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez',
  'once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte',
  'veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve',
  'treinta','treinta y uno'];

/** Convierte un número entero (0–9999) a su forma en letras en español. Útil para el año. */
function numeroALetras(n){
  const UNIDADES = ['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
  const DIECI = ['diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve'];
  const DECENAS = ['','diez','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
  const VEINTIS = ['veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
  const CENTENAS = ['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];

  if(n===0) return 'cero';
  if(n<10) return UNIDADES[n];
  if(n<20) return DIECI[n-10];
  if(n<30) return VEINTIS[n-20];
  if(n<100){
    const d=Math.floor(n/10), u=n%10;
    return u===0 ? DECENAS[d] : `${DECENAS[d]} y ${UNIDADES[u]}`;
  }
  if(n<1000){
    if(n===100) return 'cien';
    const c=Math.floor(n/100), r=n%100;
    const cw = c===1?'ciento':CENTENAS[c];
    return r===0 ? cw : `${cw} ${numeroALetras(r)}`;
  }
  const m=Math.floor(n/1000), r=n%1000;
  const mw = m===1?'mil':`${numeroALetras(m)} mil`;
  return r===0 ? mw : `${mw} ${numeroALetras(r)}`;
}

/** "07 de enero" (sin año) — para el inicio del periodo */
function fechaCorta(d){
  return `${String(d.getDate()).padStart(2,'0')} de ${MESES_LARGO[d.getMonth()]}`;
}
/** "22 de mayo de 2026" (con año) — para el fin del periodo */
function fechaCortaConAnio(d){
  return `${fechaCorta(d)} de ${d.getFullYear()}`;
}
/** "ocho días del mes de julio del dos mil veintiséis" — fecha de hoy en letras */
function fechaLargaPalabras(d){
  const dia = DIAS_LETRAS[d.getDate()];
  const mes = MESES_LARGO[d.getMonth()];
  const anioLetras = numeroALetras(d.getFullYear());
  return `${dia} días del mes de ${mes} del ${anioLetras}`;
}

/**
 * Genera la constancia de excelencia .docx para UN docente sin incidencias.
 * Se llama desde el botón "📄 Constancia" en la fila de ese docente.
 */
async function generarConstanciaDocx(no){
  const p = profesores[no];
  if(!p){ alert('No se encontró información de ese docente.'); return; }

  const numeroMemo = prompt('Ingresa el número de memo (ej. 070):');
  if(!numeroMemo) return;

  const btn = document.getElementById(`btnConst_${no}`);
  if(btn){ btn.disabled = true; btn.textContent = 'Generando...'; }

  try{
    // 1. Cargar la plantilla de constancia como binario
    const respuesta = await fetch(RUTA_PLANTILLA_CONSTANCIA);
    if(!respuesta.ok) throw new Error(`No se pudo cargar la plantilla (${respuesta.status}). Verifica que el archivo esté en ${RUTA_PLANTILLA_CONSTANCIA}`);
    const arrayBuffer = await respuesta.arrayBuffer();

    // 2. Abrir el .docx como zip
    const zip = new PizZip(arrayBuffer);
    const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // 3. Armar los datos
    const hoy = new Date();
    const fechaHoy = `${hoy.getDate()}/${MESES_LARGO[hoy.getMonth()]}/${hoy.getFullYear()}`;

    const periodoIni = new Date(document.getElementById('periodoInicio').value+'T12:00:00');
    const periodoFin = new Date(document.getElementById('periodoFin').value+'T12:00:00');

    doc.render({
      fecha_hoy: fechaHoy,
      numero_memo: numeroMemo,
      anio: hoy.getFullYear(),
      nombre_persona: `${p.apellidos} ${p.nombre}`.toUpperCase(),
      periodo_ini: fechaCorta(periodoIni),
      periodo_fin: fechaCortaConAnio(periodoFin),
      fecha_larga: fechaLargaPalabras(hoy),
    });

    // 4. Generar el .docx final y descargarlo
    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const nombreArchivo = `CONSTANCIA_RH_${numeroMemo}-${hoy.getFullYear()}_${p.apellidos.replace(/\s+/g,'_')}_${p.nombre.replace(/\s+/g,'_')}.docx`;
    saveAs(out, nombreArchivo);

  } catch(e){
    console.error(e);
    if(e.properties && e.properties.errors){
      console.error(JSON.stringify(e.properties.errors, null, 2));
      alert('Error al generar la constancia: revisa la consola para más detalle (posible marcador faltante en la plantilla).');
    } else {
      alert('Error al generar la constancia: ' + e.message);
    }
  }

  if(btn){ btn.disabled = false; btn.textContent = '📄 Constancia'; }
}