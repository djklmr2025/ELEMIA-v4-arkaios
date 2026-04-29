# ROADMAP.md - ARKAIOS 2026

> Plan maestro para llevar ELEMIA desde servidor estable con memoria infinita hasta autonomia preventiva del ecosistema ARKAIOS.

## Fase 1 - [COMPLETADA]: Estabilizacion del Servidor Oficial y Memoria Infinita

**Objetivo:** consolidar ELEMIA v4 como servidor oficial, recuperable y desplegado.

Estado esperado:

- Repositorio `ELEMIA-v4-arkaios` creado y versionado.
- Servidor Node.js operativo con Express y MCP por `stdio`.
- Despliegue dual validado en Vercel y Render.
- Variables `SUPERMEMORY_API_KEY` y `ELEMIA_HTTP_TOKEN` configuradas fuera del codigo.
- Endpoint publico `/elemia/ping` funcionando como health check.
- Endpoints privados protegidos por `x-elemia-token`.
- Enlace con Supermemory validado para guardar y recuperar memoria.
- Documentacion base creada: `README.md`, `PROTOCOLS.md`, `ROADMAP.md` y `MASTER_CONTEXT.md`.

Entregables:

- Servidor estable.
- Memoria persistente funcional.
- Protocolo de recuperacion definido.
- Primer Seed operativo del sistema.

## Fase 2 - Proxima: Integracion de Agentes

**Objetivo:** permitir que ELEMIA interactue con otras APIs y agentes de forma automatica, controlada y auditable.

### Modulo de Notificaciones Externas

Preparar un endpoint protegido `/elemia/notify` capaz de recibir webhooks de GitHub para que ELEMIA detecte cambios en el codigo en tiempo real.

Alcance inicial:

- Recibir eventos `push`, `pull_request` y `workflow_run`.
- Validar origen, autenticacion y forma del payload antes de procesar.
- Resumir eventos relevantes sin guardar ruido de webhook.
- Registrar en Supermemory solo cambios con valor operativo.
- Dejar lista la base para que Fase 2 conecte agentes automaticos de revision, diagnostico y seguimiento.

Estado: base implementada en `POST /elemia/notify`; pendiente endurecer validacion criptografica de firmas GitHub antes de produccion avanzada.

Capacidades previstas:

- Conectores para APIs externas autorizadas.
- Herramientas MCP adicionales para ejecutar acciones sobre servicios externos.
- Registro de acciones importantes en Supermemory.
- Politicas de permiso por tipo de accion.
- Separacion entre lectura, escritura y ejecucion automatica.

Lineas de trabajo:

- Disenar un patron de herramientas `arkaios_*` para agentes externos.
- Crear una capa de validacion para entradas y permisos.
- Definir logs de auditoria sin exponer secretos.
- Agregar pruebas basicas para herramientas criticas.

Criterio de salida:

- ELEMIA puede consultar al menos una API externa y guardar el resultado relevante en memoria sin intervencion manual.

## Fase 3 - Interfaz Web Privada

**Objetivo:** construir un dashboard privado para que ARKAIOS vea, busque y gobierne la memoria de ELEMIA visualmente.

Capacidades previstas:

- Login o acceso protegido por token.
- Vista de estado del servidor.
- Explorador de memorias recientes.
- Busqueda semantica sobre Supermemory.
- Formulario para guardar estados y decisiones.
- Panel de despliegue con salud de Vercel y Render.

Lineas de trabajo:

- Definir frontend privado sin exponer `SUPERMEMORY_API_KEY`.
- Consumir solo endpoints protegidos de ELEMIA.
- Crear componentes de memoria: lista, busqueda, detalle y guardado.
- Agregar filtros por tags como `DECISION`, `DEPLOY`, `RECOVERY` y `PROJECT`.

Criterio de salida:

- ARKAIOS puede inspeccionar memoria, verificar salud y guardar un estado desde una interfaz privada.

## Fase 4 - Autonomia

**Objetivo:** convertir a ELEMIA en un agente de mantenimiento preventivo para el repositorio y su infraestructura.

Capacidades previstas:

- Revision periodica de salud del servidor.
- Deteccion de fallas en despliegues.
- Creacion de reportes de mantenimiento.
- Apertura de issues o tareas cuando detecte riesgos.
- Recomendaciones de rotacion de secretos.
- Verificacion de documentacion y consistencia de protocolos.

Lineas de trabajo:

- Definir tareas preventivas de bajo riesgo.
- Crear comandos seguros para diagnostico.
- Registrar incidentes y resoluciones en memoria.
- Establecer limites: ELEMIA recomienda o prepara cambios, pero acciones destructivas requieren autorizacion.

Criterio de salida:

- ELEMIA detecta un problema operativo comun, genera diagnostico, propone correccion y conserva el incidente en memoria.

## Norte Estrategico

ARKAIOS 2026 apunta a un sistema que no pierda identidad, no dependa de memoria humana fragil y pueda evolucionar con disciplina tecnica. ELEMIA debe crecer como custodio operativo: recordar lo esencial, proteger lo sensible, actuar con permiso y dejar rastro de cada decision importante.
