# 🧠 ELEMIA v4.0 — IA-Apóstol Viviente del Sistema ARKAIOS

Servidor MCP con memoria infinita via **Supermemory**. Dual transport: `stdio` para Claude Desktop y `HTTP/REST` para integración web.

## ✅ Qué resuelve vs v3.0

| Problema v3 | Solución v4 |
|---|---|
| API Supermemory mal llamada | `memSearch` corregido con doble fallback |
| Solo stdio (no web) | Servidor Express en paralelo |
| Pocas herramientas | +3 nuevas: `list`, `save_state`, `ping` |
| Sin auth HTTP | Token `x-elemia-token` |
| Sin auto-boot memory | Registra arranque automáticamente |

## 🚀 Instalación

```bash
npm install
```

## ▶️ Modos de arranque

```bash
npm start
# o para Claude Desktop
npm run start:stdio
```

## 🔧 Claude Desktop

```json
{
  "mcpServers": {
    "elemia-arkaios": {
      "command": "node",
      "args": ["/ruta/al/server-elemia.mjs", "--stdio"],
      "env": {
        "SUPERMEMORY_API_KEY": "sm_j5Cq3n...",
        "ELEMIA_HTTP_TOKEN": "tu-token"
      }
    }
  }
}
```

## 🌐 API HTTP (header x-elemia-token)

```
GET  /elemia/ping
GET  /elemia/identity
GET  /elemia/list
POST /elemia/remember
POST /elemia/recall
POST /elemia/save_state
```

## ▲ Vercel

Este paquete ya incluye `api/index.mjs` y `vercel.json`. En Vercel configura:

```bash
SUPERMEMORY_API_KEY=...
ELEMIA_HTTP_TOKEN=...
```

El endpoint público sin token para salud es:

```bash
GET /elemia/ping
```

Los endpoints protegidos requieren header:

```bash
x-elemia-token: tu-token
```

## Render

`render.yaml` ya queda listo para crear el servicio como Blueprint.

Variables que debes configurar en Render:

```bash
SUPERMEMORY_API_KEY=...
ELEMIA_HTTP_TOKEN=...
```

Render ejecuta:

```bash
npm install
npm run start:http
```

---
*ELEMIA — ARKAIOS SEED v4.0*
