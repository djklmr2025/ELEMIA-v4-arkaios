# PROTOCOLS.md - Reglas de Operacion ELEMIA v4

> Documento de gobierno operativo para ELEMIA-v4-arkaios. Define como recordar, proteger, recuperar y escalar el sistema sin romper su identidad ni su compatibilidad MCP.

## 1. Protocolo de Memoria

ELEMIA usa Supermemory como memoria persistente bajo el contenedor `arkaios-elemia`. La memoria no debe usarse como basurero de logs: debe guardar continuidad estrategica.

### Cuando usar `arkaios_remember`

Usar memoria permanente cuando el dato cumpla al menos una de estas condiciones:

- Define identidad, mision, autoridad o direccion del sistema ARKAIOS.
- Registra una decision tecnica que afectara futuras sesiones.
- Resume un hito operativo ya validado: despliegue, token configurado, endpoint probado, integracion activa.
- Guarda credenciales solo como referencia abstracta, nunca como valor secreto.
- Documenta errores criticos y su solucion final.
- Captura acuerdos de arquitectura, convenciones o limites que futuras versiones deben respetar.

### Cuando no usar `arkaios_remember`

No guardar:

- Salidas largas de consola sin resumen.
- Errores temporales que no cambiaron el sistema.
- Conversaciones exploratorias sin decision.
- Duplicados de memorias recientes.
- Secretos, tokens, claves privadas o valores completos de variables sensibles.

### Formato recomendado

Usar tags claros y contenido resumido:

```text
[DECISION] ELEMIA v4 usa despliegue dual Vercel/Render con Node.js, Express y MCP stdio.
```

Tags sugeridos:

| Tag | Uso |
| --- | --- |
| `[IDENTITY]` | Identidad, rol, mandato y relacion con ARKAIOS. |
| `[DECISION]` | Decisiones tecnicas estables. |
| `[DEPLOY]` | Estado de Vercel, Render, dominios y health checks. |
| `[RECOVERY]` | Instrucciones de recuperacion y Seed JSON. |
| `[PROJECT]` | Estado de proyecto, siguientes pasos y bloqueo actual. |
| `[INCIDENT]` | Falla relevante y resolucion confirmada. |

### Uso de `arkaios_save_state`

Usar `arkaios_save_state` al cerrar una sesion de trabajo, terminar un despliegue o antes de cambios de alto riesgo. Debe incluir:

- `project`: nombre del repositorio o modulo.
- `status`: estado real y verificable.
- `next_steps`: proxima accion concreta.
- `notes`: riesgos, endpoints, decisiones o contexto adicional.

## 2. Protocolo de Seguridad

ELEMIA opera con secretos externos y debe tratarlos como material de alta sensibilidad.

### Variables sensibles

| Variable | Funcion |
| --- | --- |
| `SUPERMEMORY_API_KEY` | Permite lectura/escritura en Supermemory. |
| `ELEMIA_HTTP_TOKEN` | Protege endpoints HTTP privados mediante `x-elemia-token`. |
| `WHATSAPP_VERIFY_TOKEN` | Valida el challenge inicial del webhook de Meta. |
| `WHATSAPP_ACCESS_TOKEN` | Autoriza llamadas salientes a WhatsApp Cloud API. |
| `WHATSAPP_PHONE_NUMBER_ID` | Identifica el numero de WhatsApp Business usado por ELEMIA. |
| `WHATSAPP_APP_SECRET` | Permite validar la firma `x-hub-signature-256` de webhooks entrantes. |
| `WHATSAPP_API_VERSION` | Version de Graph API usada para enviar mensajes. |

### Reglas

- Nunca commitear `.env`, tokens, API keys ni secretos reales.
- Nunca guardar valores secretos completos en Supermemory.
- Usar variables de entorno nativas en Vercel y Render.
- Mantener tokens largos, no obvios y distintos por entorno cuando sea posible.
- Rotar `ELEMIA_HTTP_TOKEN` si se comparte accidentalmente, aparece en logs o se usa desde una maquina no confiable.
- Rotar `SUPERMEMORY_API_KEY` si hay sospecha de exposicion o acceso no autorizado.
- Rotar `WHATSAPP_ACCESS_TOKEN` y `WHATSAPP_APP_SECRET` si hay sospecha de exposicion o mensajes no autorizados.
- No guardar numeros completos ni conversaciones sensibles en memoria si no aportan continuidad operativa.

### Rotacion de secretos

1. Generar nuevo token o key desde el proveedor correspondiente.
2. Actualizar Vercel y Render.
3. Redeployar o reiniciar servicios.
4. Probar `GET /elemia/ping`.
5. Probar endpoint protegido con el nuevo `x-elemia-token`.
6. Revocar el secreto anterior.
7. Guardar en memoria solo el hecho de la rotacion, nunca el valor.

Ejemplo de memoria permitida:

```text
[SECURITY] ELEMIA_HTTP_TOKEN fue rotado en Vercel y Render el 2026-04-18. Endpoints protegidos validados.
```

## 3. Protocolo de Recuperacion

La recuperacion debe restaurar identidad, entorno y memoria con el menor numero de pasos posible.

### Si el servidor cae

1. Verificar salud publica:

```bash
curl https://TU_DOMINIO/elemia/ping
```

2. Revisar logs del proveedor activo:

- Vercel: funciones y runtime serverless.
- Render: logs del servicio web `elemia-v4-arkaios`.

3. Confirmar variables:

```bash
SUPERMEMORY_API_KEY
ELEMIA_HTTP_TOKEN
NODE_VERSION
```

4. Reiniciar o redeployar.
5. Probar endpoint protegido:

```bash
curl https://TU_DOMINIO/elemia/identity \
  -H "x-elemia-token: TU_TOKEN_PRIVADO"
```

6. Consultar memoria:

```bash
curl -X POST https://TU_DOMINIO/elemia/recall \
  -H "content-type: application/json" \
  -H "x-elemia-token: TU_TOKEN_PRIVADO" \
  -d '{"query":"estado actual ELEMIA ARKAIOS","limit":5}'
```

### Si hay reset de contexto

1. Leer `MASTER_CONTEXT.md`.
2. Consultar `README.md` para arquitectura y endpoints.
3. Consultar `ROADMAP.md` para direccion futura.
4. Consultar memoria con busquedas de arranque:

```text
identidad ELEMIA ARKAIOS
estado actual ELEMIA v4
despliegue Vercel Render Supermemory
ultimos pasos proyecto
```

5. Ejecutar `arkaios_identify` o `GET /elemia/identity`.
6. Guardar un nuevo estado si hubo recuperacion exitosa.

### Seed JSON

El Seed JSON es el ancla minima para reconstruir conciencia operativa si todo lo demas falla.

```json
{
  "system": "ELEMIA",
  "version": "4.0.0",
  "repository": "ELEMIA-v4-arkaios",
  "mission": "Preservar continuidad estrategica, memoria e identidad del ecosistema ARKAIOS.",
  "authority": "ARKAIOS es creador y autoridad primaria.",
  "memory": {
    "provider": "Supermemory",
    "container": "arkaios-elemia",
    "protocol": "guardar solo decisiones, identidad, hitos, estados y recuperaciones relevantes"
  },
  "runtime": {
    "language": "Node.js",
    "server": "Express",
    "mcp": "stdio",
    "http": "REST"
  },
  "deployments": ["Vercel", "Render"],
  "critical_endpoints": ["/elemia/ping", "/elemia/identity", "/elemia/remember", "/elemia/recall", "/elemia/save_state"],
  "security": "endpoints privados protegidos por x-elemia-token"
}
```

## 4. Protocolo de Escalabilidad

ELEMIA debe crecer sin romper compatibilidad MCP ni contratos HTTP existentes.

### Principios

- Mantener compatibilidad hacia atras en nombres de herramientas `arkaios_*`.
- No cambiar la forma de respuesta de endpoints existentes sin versionar.
- Agregar nuevas rutas como extension, no como reemplazo.
- Mantener `/elemia/ping` publico, simple y estable.
- Proteger toda accion sensible con `x-elemia-token`.
- Validar entradas antes de tocar memoria o APIs externas.

### Como agregar una nueva herramienta MCP

1. Agregar la herramienta en `ListToolsRequestSchema`.
2. Definir `inputSchema` con campos requeridos.
3. Implementar el `case` correspondiente en `CallToolRequestSchema`.
4. Reutilizar helpers existentes como `memAdd`, `memSearch`, `memList` o `requireMemory`.
5. Probar en modo `stdio`:

```bash
npm run start:stdio
```

### Como agregar un endpoint Express

1. Crear ruta en `server-elemia.mjs`.
2. Usar `auth` si el endpoint lee memoria, escribe memoria o ejecuta acciones privadas.
3. Responder siempre con estructura JSON:

```json
{ "ok": true }
```

o

```json
{ "ok": false, "error": "mensaje claro" }
```

4. Documentar la ruta en `README.md`.
5. Si afecta operacion futura, registrar decision en memoria.

### Regla de compatibilidad

Toda expansion debe conservar este nucleo:

- `arkaios_identify`
- `arkaios_remember`
- `arkaios_recall`
- `arkaios_list`
- `arkaios_save_state`
- `arkaios_ping`
- `GET /elemia/ping`

Si una version futura necesita cambios incompatibles, debe publicarse como `v5` o introducir rutas versionadas.
