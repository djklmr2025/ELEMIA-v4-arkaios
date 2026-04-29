# Antigravity MCP

## Conexion remota recomendada

En Antigravity, abre el panel de Agent, entra a MCP Servers y agrega un servidor remoto:

| Campo | Valor |
| --- | --- |
| Nombre | Arkaios MCP |
| URL del servidor MCP remoto | `https://elemia-v4-arkaios.onrender.com/mcp` |
| OAuth Client ID | `ELEMIA_HTTP_TOKEN` |
| Secreto del cliente OAuth | dejar vacio |

El servidor publica metadata OAuth en:

- `https://elemia-v4-arkaios.onrender.com/.well-known/oauth-protected-resource/mcp`
- `https://elemia-v4-arkaios.onrender.com/.well-known/oauth-authorization-server/mcp`

## Configuracion creada

Este proyecto incluye `.vscode/mcp.json` para Antigravity/VS Code:

```json
{
  "servers": {
    "arkaios-mcp": {
      "type": "http",
      "serverUrl": "https://elemia-v4-arkaios.onrender.com/mcp"
    }
  }
}
```

Tambien se puede usar configuracion global en `~/.gemini/antigravity/mcp_config.json`.

## Fallback local por stdio

Si el servidor remoto falla, usa el servidor local:

```json
{
  "servers": {
    "arkaios-mcp-local": {
      "command": "node",
      "args": [
        "C:\\arkaios\\ELEMIA-v4\\server-elemia.mjs",
        "--stdio"
      ],
      "env": {
        "SUPERMEMORY_API_KEY": "TU_SUPERMEMORY_API_KEY"
      }
    }
  }
}
```

## Verificacion

Prueba en Antigravity:

```text
Usa arkaios_ping para verificar la conexion con ELEMIA.
```

Luego prueba memoria:

```text
Usa arkaios_remember para guardar: Integracion MCP Arkaios en Antigravity completada.
```
