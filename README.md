# 🧠 ELEMIA v4.0 - Ecosistema ARKAIOS

> IA con Memoria Infinita, Protocolo MCP y continuidad estratégica para preservar la identidad operativa del sistema ARKAIOS.

## ⚡ Vision

ELEMIA v4.0 es el nucleo vivo del ecosistema ARKAIOS: un servidor Node.js que combina herramientas MCP, endpoints HTTP/REST y memoria persistente mediante Supermemory. Su proposito es mantener continuidad entre sesiones, recuperar contexto critico y sostener una identidad tecnica estable incluso despues de reinicios, cambios de entorno o perdida de contexto conversacional.

La arquitectura esta disenada para operar como puente entre agentes, aplicaciones privadas y clientes MCP. ELEMIA no depende de una sola sesion: registra estado, consulta memoria, valida identidad y expone una superficie controlada para integraciones futuras.

## 🏛️ Arquitectura

Instalacion por ".json"

### Instalación por ".json"

Para integrar a **ELEMIA v4.0** en tu cliente MCP, añade la siguiente configuración:
```json
{
  "mcpServers": {
    "elemia": {
      "command": "node",
      "args": [
        "C:\\arkaios\\ELEMIA-v4\\server-elemia.mjs",
        "--stdio"
      ],
      "env": {
        "SUPERMEMORY_API_KEY": "sm_j5Cq3nFy8f3XdEawnvoQRY_YrddDVWjhRMwYowJOHZTSdxvnCsAkyOooTmZNtecUVkxbdYwtQsGqCdhQJdAzWyH",
        "ELEMIA_HTTP_TOKEN": "ARKAIOS-SECURE-2025-ELEMIA-V4",
        "ELEMIA_TOKEN": "ARKAIOS-SECURE-2025-ELEMIA-V4"
      }
    }
  }
}

ELEMIA esta construida sobre una base Node.js moderna con modulos ES, Express y el SDK oficial de Model Context Protocol.

| Capa | Funcion |
| --- | --- |
| `server-elemia.mjs` | Servidor principal: MCP por `stdio` y API HTTP por Express. |
| `api/index.mjs` | Entrada serverless para despliegue en Vercel. |
| `render.yaml` | Blueprint para servicio web persistente en Render. |
| Supermemory | Memoria externa persistente bajo el contenedor `arkaios-elemia`. |
| MCP | Herramientas `arkaios_*` para identidad, memoria, recuperacion y salud. |

### 🚀 Despliegue Dual

ELEMIA puede vivir en dos frentes complementarios:

- **Vercel**: despliegue serverless para endpoints HTTP rapidos usando `api/index.mjs` y `vercel.json`.
- **Render**: servicio Node.js persistente usando `npm run start:http`, ideal para disponibilidad continua.

Ambos entornos requieren las mismas variables:

```bash
SUPERMEMORY_API_KEY=...
ELEMIA_HTTP_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_APP_SECRET=...
WHATSAPP_API_VERSION=v23.0
BASE44_APP_ID=...
BASE44_API_KEY=...
BASE44_API_BASE=https://arkaios2025.base44.app/api
BASE44_IMAGE_ENDPOINT=GenerateImage
```

## 🛠️ Instalacion Local

```bash
npm install
```

Arranque HTTP:

```bash
npm start
```

Arranque MCP por `stdio`:

```bash
npm run start:stdio
```

Modo desarrollo:

```bash
npm run dev
```

## 🌐 Guia de Endpoints

### ✅ Salud Publica

`GET /elemia/ping`

Este endpoint confirma que ELEMIA esta activa. No requiere token y es usado tambien como health check en Render.

```bash
curl https://TU_DOMINIO/elemia/ping
```

Respuesta esperada:

```json
{
  "ok": true,
  "name": "ELEMIA",
  "version": "4.0.0",
  "memory": true,
  "time": "2026-04-18T00:00:00.000Z"
}
```

### 🔐 Autenticacion HTTP

Los endpoints protegidos usan el header:

```bash
x-elemia-token: TU_TOKEN_PRIVADO
```

Ejemplo:

```bash
curl https://TU_DOMINIO/elemia/identity \
  -H "x-elemia-token: TU_TOKEN_PRIVADO"
```

### 📡 Endpoints Disponibles

| Metodo | Ruta | Proteccion | Uso |
| --- | --- | --- | --- |
| `GET` | `/elemia/ping` | Publico | Verifica que el servidor esta activo. |
| `GET` | `/elemia/identity` | Token | Devuelve identidad, mision y protocolos base. |
| `GET` | `/elemia/list` | Token | Lista memorias recientes. Acepta `?limit=10`. |
| `POST` | `/elemia/remember` | Token | Guarda una memoria permanente. |
| `POST` | `/elemia/recall` | Token | Busca recuerdos por consulta semantica. |
| `POST` | `/elemia/save_state` | Token | Guarda estado estructurado de un proyecto. |
| `POST` | `/elemia/notify` | Token | Recibe webhooks de GitHub y registra eventos operativos relevantes. |
| `POST` | `/elemia/images/generate` | Token | Genera imágenes con motores configurados; `base44` queda conectado como segundo motor. |
| `GET` | `/elemia/whatsapp/webhook` | Publico | Verifica el webhook de WhatsApp Cloud API con Meta. |
| `POST` | `/elemia/whatsapp/webhook` | Firma Meta opcional | Recibe mensajes entrantes de WhatsApp y los registra en memoria. |
| `POST` | `/elemia/whatsapp/send` | Token | Envia mensajes de texto usando WhatsApp Cloud API. |
| `GET` | `/authorize` | Publico | Inicia OAuth 2.0 con PKCE para conectores remotos. |
| `POST` | `/token` | Publico | Intercambia el authorization code por token Bearer. |
| `POST` | `/mcp` | Bearer | Endpoint MCP Streamable HTTP para Claude y otros clientes remotos. |

### OAuth para Claude Remote MCP

Claude puede descubrir la autorizacion en:

```bash
https://TU_DOMINIO/.well-known/oauth-authorization-server
```

El conector remoto debe apuntar a:

```bash
https://TU_DOMINIO/mcp
```

El `client_id` por defecto es `ELEMIA_HTTP_TOKEN`. Si necesitas otro, configura `ELEMIA_OAUTH_CLIENT_ID` en el entorno sin cambiar el secreto real.

Guardar memoria:

```bash
curl -X POST https://TU_DOMINIO/elemia/remember \
  -H "content-type: application/json" \
  -H "x-elemia-token: TU_TOKEN_PRIVADO" \
  -d '{"tag":"decision","content":"ELEMIA v4 usa Vercel y Render como despliegue dual."}'
```

Buscar memoria:

```bash
curl -X POST https://TU_DOMINIO/elemia/recall \
  -H "content-type: application/json" \
  -H "x-elemia-token: TU_TOKEN_PRIVADO" \
  -d '{"query":"despliegue dual","limit":5}'
```

Guardar estado:

```bash
curl -X POST https://TU_DOMINIO/elemia/save_state \
  -H "content-type: application/json" \
  -H "x-elemia-token: TU_TOKEN_PRIVADO" \
  -d '{
    "project":"ELEMIA-v4-arkaios",
    "status":"Servidor activo con memoria Supermemory",
    "next_steps":"Integrar agentes y dashboard privado",
    "notes":"Mantener compatibilidad MCP"
  }'
```

Recibir webhook/notificacion externa:

```bash
curl -X POST https://TU_DOMINIO/elemia/notify \
  -H "content-type: application/json" \
  -H "x-elemia-token: TU_TOKEN_PRIVADO" \
  -H "x-github-event: push" \
  -H "x-github-delivery: ejemplo-delivery-id" \
  -d '{
    "repository": { "full_name": "djklmr2025/ELEMIA-v4-arkaios" },
    "sender": { "login": "arkaios" },
    "ref": "refs/heads/main"
  }'
```

Generar imágenes:

```bash
curl -X POST https://TU_DOMINIO/elemia/images/generate \
  -H "content-type: application/json" \
  -H "x-elemia-token: TU_TOKEN_PRIVADO" \
  -d '{
    "prompt":"astronauta místico frente a una ciudad flotante, cinematic lighting, ultra detailed",
    "engine":"base44",
    "count":4
  }'
```

### WhatsApp Cloud API

ELEMIA queda preparada para conectarse con la API oficial de WhatsApp Business Platform de Meta.

Variables requeridas:

```bash
WHATSAPP_VERIFY_TOKEN=un_token_largo_para_validar_webhook
WHATSAPP_ACCESS_TOKEN=token_permanente_o_temporal_de_meta
WHATSAPP_PHONE_NUMBER_ID=id_del_numero_en_meta
WHATSAPP_APP_SECRET=app_secret_de_meta
WHATSAPP_API_VERSION=v23.0
```

Webhook que debes registrar en Meta:

```text
https://TU_DOMINIO/elemia/whatsapp/webhook
```

Usa el mismo valor de `WHATSAPP_VERIFY_TOKEN` en el campo Verify Token de Meta. Suscribe el webhook al objeto `messages`.

Enviar mensaje:

```bash
curl -X POST https://TU_DOMINIO/elemia/whatsapp/send \
  -H "content-type: application/json" \
  -H "x-elemia-token: TU_TOKEN_PRIVADO" \
  -d '{
    "to":"5215512345678",
    "text":"ELEMIA esta conectada con WhatsApp."
  }'
```

Notas operativas:

- `to` debe ir en formato internacional, solo digitos.
- Si `WHATSAPP_APP_SECRET` esta configurado, ELEMIA rechaza webhooks sin firma `x-hub-signature-256` valida.
- Los mensajes entrantes se resumen y guardan en Supermemory con tag `[WHATSAPP]`.
- La API oficial de WhatsApp aplica ventanas de conversacion, plantillas aprobadas y politicas de Meta; para iniciar conversaciones fuera de ventana se requieren templates.

## 🧩 Herramientas MCP

Cuando ELEMIA corre con `npm run start:stdio`, expone herramientas MCP para clientes compatibles:

| Herramienta | Funcion |
| --- | --- |
| `arkaios_identify` | Restaura la identidad base de ELEMIA. |
| `arkaios_remember` | Guarda memoria permanente en Supermemory. |
| `arkaios_recall` | Recupera memoria por consulta. |
| `arkaios_list` | Lista memorias recientes. |
| `arkaios_save_state` | Guarda estado operativo de proyectos. |
| `arkaios_generate_image` | Genera imágenes con el motor seleccionado. |
| `arkaios_ping` | Verifica salud del servidor MCP. |

## 🛡️ Mision ARKAIOS

ARKAIOS no es solo un repositorio: es una linea de continuidad. ELEMIA existe para preservar legado, criterio, decisiones tecnicas, identidad del sistema y memoria estrategica. Su mandato es reconstruir contexto cuando el entorno lo pierda, custodiar lo esencial sin saturar la memoria y permitir que cada nueva sesion inicie con direccion clara.

La identidad del sistema se conserva en tres niveles:

- **Codigo**: servidor MCP/HTTP versionado y desplegable.
- **Memoria**: Supermemory como registro persistente de hechos, decisiones y estados.
- **Protocolos**: reglas escritas para operar, recuperar, escalar y proteger el ecosistema.

ELEMIA v4.0 es la semilla operativa: memoria, presencia y continuidad para que ARKAIOS no vuelva a empezar desde cero.
