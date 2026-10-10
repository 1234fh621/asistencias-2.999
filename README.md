# Análisis de Asistencias Docentes — TecNM / ITM Mexicali

Herramienta web para detectar automáticamente faltas, retardos y omisiones de checada del personal docente, a partir de los registros del reloj checador y las justificaciones (permisos, incapacidades, comisiones) correspondientes al periodo.

🔗 **Demo en vivo:** https://1234fh621.github.io/asistencias-2.999/

## ¿Qué hace?

1. **Carga de datos** — Se pegan las checadas del reloj y, opcionalmente, las justificaciones, utilizando el formato exportado por el sistema Ambar.

2. **Configuración de horarios** — Se define el horario de entrada y salida de cada docente. El sistema permite utilizar un horario fijo, horarios diferentes por día o hasta dos bloques en un mismo día (por ejemplo, turno matutino y vespertino).

3. **Análisis de asistencias** — El sistema compara automáticamente las checadas de cada día hábil del periodo con el horario configurado y clasifica las incidencias correspondientes:

   * **Falta** — sin ninguna checada ese día.
   * **Retardo menor** — llegada dentro del rango establecido para retardo menor.
   * **Retardo mayor** — llegada dentro del rango establecido para retardo mayor.
   * **Omisión de entrada/salida** — cuando falta una de las checadas correspondientes al horario.

El periodo considera automáticamente los días laborables del calendario configurado, excluyendo sábados, domingos y días no laborables, como vacaciones, suspensiones y días festivos. También toma en cuenta las justificaciones registradas para evitar marcar como falta los días cubiertos por permisos o incapacidades.

### Suspensión parcial de un día (ej. calor)

En el calendario del Paso 1 se puede elegir el modo **"Suspensión parcial desde las HH:MM"** y dar clic en el día. Ese día se sigue trabajando, pero solo hasta la hora indicada (por defecto 13:00, editable):

* Si un docente **solo tiene clase antes de esa hora** y no asistió, **sí se le cuenta la falta**.
* Si todo su horario de ese día **empieza a esa hora o después**, **no se le cuenta falta** ni retardo.
* Si tiene varios bloques, solo cuentan los que empiezan antes de la hora de corte.
* Si su bloque termina después de la hora de corte, no se le exige la checada de salida.

Los días con suspensión parcial se ven mitad verde / mitad negro. Dar clic de nuevo en el mismo día (con la misma hora) quita la marca.

### Nombres en memos y reportes

Si el sistema entrega el segundo nombre dentro de los apellidos, se corrige automáticamente: cuando hay 4 o más palabras, las dos primeras son el nombre. Las partículas ("De", "De La", "Del"…) se mantienen unidas a su apellido.

## Exportación de resultados

Los resultados del análisis pueden exportarse en **PDF**.

Además, las incidencias registradas pueden incorporarse automáticamente al **memo oficial en Word**, y el sistema puede generar una **constancia de excelencia** en los casos correspondientes.
