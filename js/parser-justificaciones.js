// ═══════════════════════════════════════════════════════════════════════════
// PARSEO DE JUSTIFICACIONES
// Formato real (tab-separado, a. m./p. m. puede ser columna propia):
//   Apellidos\tNo.\tFechaIni [HH:MM:SS]\t[a. m.|p. m.]\tFechaFin HH:MM:SS\t[a. m.|p. m.]\tMotivo\tReferencia\tFechaCaptura...
// Los registros pueden llegar todos en una sola línea o en líneas separadas.
// ═══════════════════════════════════════════════════════════════════════════
function parseJustificaciones(txt){
  const out = [];
  if(!txt.trim()) return out;

  // PASO 1 — Fusionar columnas de am/pm que quedaron separadas por tab.
  // Si un token es solo "a. m." o "p. m." (o variantes), pegarlo al anterior.
  function fusionarAmPm(cols){
    const res = [];
    for(let i = 0; i < cols.length; i++){
      const v = cols[i];
      if(/^(a\.?\s*m\.?|p\.?\s*m\.)$/i.test(v) && res.length > 0){
        res[res.length - 1] = res[res.length - 1] + ' ' + v;
      } else {
        res.push(v);
      }
    }
    return res;
  }

  // PASO 2 — Normalizar a. m./p. m. → am/pm para parseFecha
  function norm(s){ return normalizarAmPm(s); }

  // PASO 3 — Intentar parsear una columna como fecha (retorna Date o null)
  function tryFecha(s){
    const d = parseFecha(norm(s));
    return (d && !isNaN(d)) ? d : null;
  }

  // PASO 4 — El texto puede tener múltiples registros en la misma línea,
  // separados por el patrón "Apellido Apellido\tNúmero".
  // Dividimos por ese patrón para aislar cada registro.
  const RE_SPLIT_REG = /(?=[\wÁÉÍÓÚÑáéíóúñ][\wÁÉÍÓÚÑáéíóúñ\s]*\t\d{3,6}\t)/g;
  const bloques = txt.trim().split(RE_SPLIT_REG).filter(Boolean);

  for(const bloque of bloques){
    const rawCols = bloque.split('\t').map(c => c.trim()).filter(Boolean);
    if(rawCols.length < 3) continue;
    if(/^(apellido|nombre|no\.|num|fecha|justif)/i.test(rawCols[0])) continue;

    // Fusionar columnas am/pm sueltas
    const cols = fusionarAmPm(rawCols);

    // Col 0: apellidos (texto no numérico)
    // Col 1: número de empleado
    let offset = 0;
    if(isNaN(cols[0])) offset = 1;          // primer col es apellido
    const no = (cols[offset] || '').trim();
    if(!no || isNaN(no)) continue;

    // Desde offset+1 en adelante: recoger las fechas en orden de aparición.
    // Ignorar columnas que no sean fechas (motivo, referencia, etc.)
    const fechas = [];
    for(let j = offset + 1; j < cols.length; j++){
      const d = tryFecha(cols[j]);
      if(d) fechas.push(d);
    }

    if(fechas.length < 1) continue;

    // La 1ª fecha es inicio, la 2ª es fin (si existe).
    // Si la fecha de inicio no tiene hora (00:00), se toma como día completo.
    const ini = fechas[0];
    // Fin: si solo hay una fecha, el día completo de esa fecha.
    // Si la fecha fin no tiene hora se pone al final del día (23:59).
    let fin = fechas[1] || new Date(ini);
    if(fin.getHours()===0 && fin.getMinutes()===0 && fechas.length===1){
      fin = new Date(fin); fin.setHours(23,59,59,0);
    }

    out.push({ no, ini, fin });
  }

  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// LÓGICA DE JUSTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════
function estaJustificado(no, fecha){
  for(const j of justificaciones){
    if(j.no!==no) continue;
    const diaFecha = isoDay(fecha);
    const diaIni = isoDay(j.ini);
    const diaFin = isoDay(j.fin);
    if(diaFecha>=diaIni && diaFecha<=diaFin) return true;
  }
  return false;
}

function justificadoParcial(no, fecha){
  for(const j of justificaciones){
    if(j.no!==no) continue;
    if(fecha>=j.ini && fecha<=j.fin) return true;
  }
  return false;
}
