# Análisis de Asistencias Docentes — TecNM / ITM Mexicali

Herramienta web para detectar automáticamente faltas, retardos y omisiones de
checada del personal docente, a partir de los registros del reloj checador y
las justificaciones (permisos, incapacidades, comisiones) del periodo.

🔗 **Demo en vivo:** https://1234fh621.github.io/asistencias-2.999/

## ¿Qué hace?

1. **Carga de datos** — Se pegan las checadas del reloj y, opcionalmente, las
   justificaciones, en el formato que exporta el sistema Ambar.
2. **Configuración de horarios** — Se define el horario de entrada/salida de
   cada docente: horario fijo, horario distinto por día, o hasta dos bloques
   en el mismo día (ej. turno mañana y turno tarde).
3. **Resultados** — El sistema compara automáticamente cada día hábil del
   periodo contra el horario configurado y clasifica las incidencias:
   - **Falta** — sin ninguna checada ese día
   - **Retardo menor** — entre 10 y 20 minutos tarde
   - **Retardo mayor** — entre 21 y 30 minutos tarde
   - **Omisión de entrada/salida** — falta una de las dos checadas del día

El periodo excluye automáticamente sábados, domingos y los días no laborables
del calendario oficial ITM 2026 (vacaciones, suspensiones, días festivos),
y respeta las justificaciones registradas para no marcar como falta los días
cubiertos por un permiso o incapacidad.

Los resultados se pueden exportar a un archivo pdf, y todas las incidencias registadras, 
se movilizan al memo oficial en word, ademas de generar una constancia de excelencia, 
en casos especiales.

