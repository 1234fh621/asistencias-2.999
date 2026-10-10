// ═══════════════════════════════════════════════════════════════════════════
// ANÁLISIS PRINCIPAL — detecta faltas, retardos y omisiones
// ═══════════════════════════════════════════════════════════════════════════
/** "08:30" → 510 (minutos desde medianoche) */
function hmAMin(hs){ const [h,m]=hs.split(':').map(Number); return h*60+m; }

/**
 * Bloques de horario que le tocan a un docente en cierto día de la semana (0=dom … 6=sáb).
 * Devuelve null si ese día es libre para él (horario por día con "Libre" marcado).
 */
function bloquesDeProfesor(p, dow){
  if(p.horarioVariable){
    const hv = p.horarioVariable[dow];
    if(hv?.libre) return null;
    if(hv?.bloques) return hv.bloques;
    // compatibilidad con formato antiguo (entrada/salida directo)
    if(hv?.entrada) return [{entrada:hv.entrada,salida:hv.salida}];
  }
  // Sin horario por día: un solo bloque con el horario global
  return [{entrada:p.horaEntrada,salida:p.horaSalida}];
}

function analizar(){
  logMsg('logAnalisis','Obteniendo días hábiles del periodo...','ok');
  const diasHabiles = getDiasHabilesPeriodo();
  logMsg('logAnalisis',`Período: ${diasHabiles.length} días hábiles.`,'ok');
  resultados = [];
  sinIncidencias = [];
  let totalConInc=0, totalOk=0, totalFaltasAusencia=0;

  for(const [no,p] of Object.entries(profesores)){
    const incidencias = [];

    // Días con checadas
    const porDia = {};
    for(const c of p.checadas){
      if(!esDiaHabil(c)) continue;
      const k = diaKey(c);
      if(!porDia[k]) porDia[k] = [];
      porDia[k].push(c);
    }

    // Días hábiles SIN NINGUNA checada = FALTA (respeta días libres del horario variable)
    for(const dk of diasHabiles){
      // Si tiene horario variable y ese día de semana es "libre", no contar falta
      if(p.horarioVariable){
        const dow = new Date(dk+'T12:00:00').getDay();
        if(p.horarioVariable[dow]?.libre) continue;
      }
      if(porDia[dk]) continue;
      // Suspensión parcial (ej. calor): si TODOS los bloques del docente ese día empiezan
      // a la hora de corte o después, no se le cuenta falta. Si tiene algún bloque
      // antes del corte (ej. solo da clase en la mañana), la falta se cuenta normal.
      const corteDia = corteParcialMin(dk);
      if(corteDia!==null){
        const bl = bloquesDeProfesor(p, new Date(dk+'T12:00:00').getDay());
        if(bl && !bl.some(b=>hmAMin(b.entrada)<corteDia)){
          logMsg('logAnalisis',`  ${no} ${fmtDia(new Date(dk+'T12:00:00'))}: suspensión parcial, sin horario antes del corte`,'skip');
          continue;
        }
      }
      if(estaJustificado(no, new Date(dk+'T12:00:00'))) continue;
      const dFalta = new Date(dk+'T00:00:00');
      incidencias.push({fecha:dFalta,tipos:['FALTA'],refs:[],esAusencia:true});
      totalFaltasAusencia++;
    }

    // Días CON checadas: analizar retardos/omisiones por bloque
    for(const [dk,checadas] of Object.entries(porDia)){
      checadas.sort((a,b)=>a-b);
      const primera = checadas[0];

      if(estaJustificado(no, primera)){
        logMsg('logAnalisis',`  ${no} ${fmtDia(primera)}: justificado`,'skip');
        continue;
      }

      // Determinar bloques del día (null = día libre del docente)
      let bloquesDia = bloquesDeProfesor(p, primera.getDay());
      if(!bloquesDia) continue;
      const etiquetarBloque = bloquesDia.length>1;

      // Suspensión parcial: los bloques que empiezan a la hora de corte o después no cuentan
      // (sin falta de bloque ni retardo). Si ya no queda ningún bloque, no hay nada que revisar.
      const corteDia = corteParcialMin(dk);
      if(corteDia!==null){
        bloquesDia = bloquesDia.filter(b=>hmAMin(b.entrada)<corteDia);
        if(bloquesDia.length===0){
          logMsg('logAnalisis',`  ${no} ${fmtDia(primera)}: suspensión parcial, sin horario antes del corte`,'skip');
          continue;
        }
      }

      // Asignar cada checada al bloque más cercano
      function checadaMin(c){ return c.getHours()*60+c.getMinutes(); }

      // Para cada bloque: calcular minuto inicio y fin
      const bloquesInfo = bloquesDia.map(b=>({
        entradaMin: hmAMin(b.entrada),
        salidaMin: hmAMin(b.salida),
        entrada: b.entrada,
        salida: b.salida,
        checadas: []
      }));

      // Asignar cada checada al bloque cuya ventana (entrada-45min .. salida+45min) la contenga
      // Si cae entre dos bloques, asignar al más cercano por tiempo de entrada
      for(const c of checadas){
        const cm = checadaMin(c);
        let mejorIdx=0, mejorDist=Infinity;
        for(let i=0;i<bloquesInfo.length;i++){
          const b = bloquesInfo[i];
          const ventanaIni = b.entradaMin-45;
          const ventanaFin = b.salidaMin+45;
          if(cm>=ventanaIni && cm<=ventanaFin){
            const dist = Math.abs(cm-b.entradaMin);
            if(dist<mejorDist){ mejorDist=dist; mejorIdx=i; }
          }
        }
        // Si no cayó en ninguna ventana, asignar al bloque más cercano
        if(mejorDist===Infinity){
          let minDist = Infinity;
          for(let i=0;i<bloquesInfo.length;i++){
            const d = Math.min(Math.abs(cm-bloquesInfo[i].entradaMin),Math.abs(cm-bloquesInfo[i].salidaMin));
            if(d<minDist){ minDist=d; mejorIdx=i; }
          }
        }
        bloquesInfo[mejorIdx].checadas.push(c);
      }

      // Analizar cada bloque independientemente
      for(const b of bloquesInfo){
        const bc = b.checadas;
        if(bc.length===0){
          // Sin checadas en este bloque = falta de bloque
          incidencias.push({fecha:primera,tipos:['FALTA'],refs:[`${fmtDia(primera)} bloque ${b.entrada}–${b.salida}`],esAusencia:false,bloque:`${b.entrada}-${b.salida}`});
          continue;
        }
        const bPrimera = bc[0], bUltima = bc[bc.length-1];
        const tieneSalida = bc.length>1 && (bUltima-bPrimera)>5*60*1000;
        const tipos=[], refs=[];
        const mins = minsDesde(bPrimera,b.entrada);
        const cmPrimera = checadaMin(bPrimera);

        // Si la primera (y única) checada llega DESPUÉS de la hora de salida del bloque
        // → el docente ya no asistió a ese bloque: Omisión de entrada
        const llegoDespuesDeSalida = !tieneSalida && cmPrimera>=b.salidaMin;

        if(llegoDespuesDeSalida){
          tipos.push('OMISION_ENTRADA'); refs.push(fmtFecha(bPrimera));
        } else {
          if(mins>10 && mins<=20){ tipos.push('RETARDO_MENOR'); refs.push(fmtFecha(bPrimera)); }
          else if(mins>20 && mins<=30){ tipos.push('RETARDO_MAYOR'); refs.push(fmtFecha(bPrimera)); }
          else if(mins>30){ tipos.push('FALTA'); refs.push(fmtFecha(bPrimera)); }
          // En suspensión parcial, si el bloque termina después del corte no se exige la
          // checada de salida (el docente pudo retirarse por la suspensión).
          const salidaExigida = !(corteDia!==null && b.salidaMin>corteDia);
          if(!tieneSalida && salidaExigida){
            tipos.push('OMISION_SALIDA');
            if(!refs.length) refs.push(fmtFecha(bPrimera));
          }
        }
        if(tipos.length>0){
          const bloqueLabel = etiquetarBloque ? ` [${b.entrada}–${b.salida}]` : '';
          incidencias.push({fecha:bPrimera,tipos,refs,esAusencia:false,bloqueLabel});
        }
      }
    }

    if(incidencias.length>0){
      incidencias.sort((a,b)=>a.fecha-b.fecha);
      resultados.push({no,nombre:p.nombre,apellidos:p.apellidos,
        horaEntrada:p.horaEntrada,horaSalida:p.horaSalida,
        horarioVariable:p.horarioVariable||null,incidencias});
      const nFaltas = incidencias.filter(i=>i.tipos.includes('FALTA')).length;
      const nRet = incidencias.filter(i=>i.tipos.some(t=>t.startsWith('RETARDO'))).length;
      logMsg('logAnalisis',`[!] ${no} ${p.nombre}: ${incidencias.length} incidencia(s) [${nFaltas} falta(s), ${nRet} retardo(s)]`,'warn');
      totalConInc++;
    } else {
      logMsg('logAnalisis',`[ok] ${no} ${p.nombre}: sin incidencias`,'ok');
      totalOk++;
      sinIncidencias.push({no,nombre:p.nombre,apellidos:p.apellidos,
        horaEntrada:p.horaEntrada,horaSalida:p.horaSalida,
        horarioVariable:p.horarioVariable||null});
    }
  }
  logMsg('logAnalisis',`\n✓ Finalizado. ${resultados.length} docente(s) con incidencias. ${totalOk} sin incidencias.`,'ok');

  const sb = document.getElementById('summaryBar');
  sb.innerHTML = `
    <div class="sum-pill"><strong>${Object.keys(profesores).length}</strong>Docentes</div>
    <div class="sum-pill sum-pill-warn"><strong>${totalConInc}</strong>Con incidencias</div>
    <div class="sum-pill sum-pill-ok"><strong>${totalOk}</strong>Sin incidencias</div>
    <div class="sum-pill sum-pill-danger"><strong>${totalFaltasAusencia}</strong>Faltas por ausencia</div>
  `;
  renderResultados();

  if(resultados.length > 0){
    document.getElementById('btnExportWord').style.display = 'inline-block';
  }
}