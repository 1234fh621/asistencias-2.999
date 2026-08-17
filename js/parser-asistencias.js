// ═══════════════════════════════════════════════════════════════════════════
// PARSEO DE ASISTENCIAS — maneja tab con "a. m." en columna separada
// ═══════════════════════════════════════════════════════════════════════════
function parseTxt(txt){
  // Normalizar a.m./p.m. primero
  let norm = normalizarAmPm(txt);

  // MÉTODO PRINCIPAL: dividir el texto justo antes de cada fecha "DD/MM/AAAA HH:MM am/pm"
  // Esto funciona sin importar si el separador entre campos es tab o espacios
  const registros = [];
  const RE_SPLIT = /(?=\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s*(?:am|pm))/i;
  const partes = norm.split(RE_SPLIT);

  for(const parte of partes){
    const mFecha = parte.match(/^(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s*(?:am|pm))/i);
    if(!mFecha) continue;
    const fecha = parseFecha(mFecha[1]);
    if(!fecha) continue;
    if(!esDiaHabil(fecha)) continue;

    // Todo lo que precede a la fecha en este fragmento son los campos del registro
    const idxFecha = parte.search(/\d{1,2}\/\d{1,2}\/\d{4}/);
    const prefijo = parte.substring(0, idxFecha).trim();

    // Tokenizar por tab o 2+ espacios
    const tokens = prefijo.split(/\t|  +/).map(t => t.trim()).filter(Boolean);

    let no = '', nombre = '', apellidos = '';
    if(tokens.length >= 3){ no=tokens[0]; nombre=tokens[1]; apellidos=tokens.slice(2).join(' '); }
    else if(tokens.length === 2){ no=tokens[0]; nombre=tokens[1]; }
    else if(tokens.length === 1){ no=tokens[0]; }

    if(!no || !/^\d+$/.test(no)) continue;
    registros.push({ no, nombre, apellidos, fecha });
  }

  // MÉTODO FALLBACK: regex completa si el método anterior no produjo resultados
  if(registros.length === 0){
    const RE = /(\d{3,6})[\t ]+(\S+)[\t ]+([\wÁÉÍÓÚÑáéíóúñ][\wÁÉÍÓÚÑáéíóúñ\s]*?)[\t ]+(\d{1,2}\/\d{1,2}\/\d{4}[\t ]+\d{1,2}:\d{2}[\t ]*(?:am|pm))/gi;
    let mr;
    while((mr = RE.exec(norm)) !== null){
      const fecha = parseFecha(mr[4]);
      if(!fecha || !esDiaHabil(fecha)) continue;
      registros.push({ no: mr[1], nombre: mr[2], apellidos: mr[3].trim(), fecha });
    }
  }

  return registros;
}
