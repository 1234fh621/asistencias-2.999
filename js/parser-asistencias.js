// ═══════════════════════════════════════════════════════════════════════════
// PARSEO DE ASISTENCIAS — maneja tab con "a. m." en columna separada
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// NOMBRE vs APELLIDOS — el sistema a veces trae el segundo nombre dentro de los
// apellidos (ej. nombre "María", apellidos "Fernanda Pérez López"). Regla:
// si hay 4 o más palabras en total, las dos primeras son el nombre y el resto
// los apellidos. Las partículas ("De", "De La", "Del", "Los", "Y"…) se pegan a la
// palabra que sigue, para no confundir "De La Cruz" con tres palabras sueltas.
// Si el nombre ya viene con dos o más palabras, se respeta tal cual.
// ═══════════════════════════════════════════════════════════════════════════
const PARTICULAS_APELLIDO = ['de','del','la','las','los','el','y','e','san','santa','da','di','van','von','le'];

function tokenizarNombre(txt){
  const palabras = (txt||'').trim().split(/\s+/).filter(Boolean);
  const tokens = [];
  let pendiente = [];
  for(const w of palabras){
    if(PARTICULAS_APELLIDO.includes(w.toLowerCase())){ pendiente.push(w); continue; }
    tokens.push([...pendiente, w].join(' '));
    pendiente = [];
  }
  // Partículas sueltas al final (dato raro): se pegan al último token
  if(pendiente.length){
    if(tokens.length) tokens[tokens.length-1] += ' ' + pendiente.join(' ');
    else tokens.push(pendiente.join(' '));
  }
  return tokens;
}

function normalizarNombre(nombre, apellidos){
  nombre = (nombre||'').trim().replace(/\s+/g,' ');
  apellidos = (apellidos||'').trim().replace(/\s+/g,' ');
  const tokNombre = tokenizarNombre(nombre);
  if(tokNombre.length !== 1) return {nombre, apellidos};   // vacío o ya trae segundo nombre
  const tokApellidos = tokenizarNombre(apellidos);
  if(tokApellidos.length >= 3){                             // 1 + 3 o más = 4 o más en total
    return {
      nombre: `${nombre} ${tokApellidos[0]}`,
      apellidos: tokApellidos.slice(1).join(' '),
    };
  }
  return {nombre, apellidos};
}

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
    ({nombre, apellidos} = normalizarNombre(nombre, apellidos));
    registros.push({ no, nombre, apellidos, fecha });
  }

  // MÉTODO FALLBACK: regex completa si el método anterior no produjo resultados
  if(registros.length === 0){
    const RE = /(\d{3,6})[\t ]+(\S+)[\t ]+([\wÁÉÍÓÚÑáéíóúñ][\wÁÉÍÓÚÑáéíóúñ\s]*?)[\t ]+(\d{1,2}\/\d{1,2}\/\d{4}[\t ]+\d{1,2}:\d{2}[\t ]*(?:am|pm))/gi;
    let mr;
    while((mr = RE.exec(norm)) !== null){
      const fecha = parseFecha(mr[4]);
      if(!fecha || !esDiaHabil(fecha)) continue;
      const nom = normalizarNombre(mr[2], mr[3]);
      registros.push({ no: mr[1], nombre: nom.nombre, apellidos: nom.apellidos, fecha });
    }
  }

  return registros;
}
