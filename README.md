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

## Exportación de resultados

Los resultados del análisis pueden exportarse en **PDF**.

Además, las incidencias registradas pueden incorporarse automáticamente al **memo oficial en Word**, y el sistema puede generar una **constancia de excelencia** en los casos correspondientes.
