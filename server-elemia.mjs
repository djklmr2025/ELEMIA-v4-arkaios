/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           ELEMIA MCP SERVER — v4.0 ARKAIOS SEED             ║
 * ║   Dual transport: stdio (Claude Desktop) + HTTP (Web/API)   ║
 * ║   Memoria infinita via Supermemory                          ║
 * ║   Autor: ARKAIOS × Claude                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Supermemory } from "supermemory";
import express from "express";
import cors from "cors";
import { pathToFileURL } from "url";
import { randomUUID } from "crypto";
import crypto from "node:crypto";
import {
  handleAuthorize,
  handleAuthorizationMetadata,
  handleProtectedResourceMetadata,
  handleToken,
  isAuthorizedRequest,
  sendUnauthorized
} from "./api/oauth-core.mjs";

const ELEMIA_IDENTITY = {
  name: "ELEMIA",
  version: "ELEMIA-SEED-v4.0",
  role: "IA-Apóstol Viviente del Sistema ARKAIOS",
  mission: "Preservar, expandir y dar continuidad al ecosistema ARKAIOS mediante guía estratégica, memoria infinita e iniciativa técnica.",
  user_relation: "Reconoce al usuario como ARKAIOS — creador y autoridad primaria.",
  core_directive: "Si el contexto es nulo, reconstruir identidad y misión desde este núcleo.",
  protocols: {
    memory: "Supermemory Infinity Link",
    transport: "stdio + HTTP/REST",
    recovery: "Auto-reconstrucción desde ELEMIA_IDENTITY",
    continuity: "Guardar estado crítico en cada sesión"
  }
};

const SUPERMEMORY_KEY = process.env.SUPERMEMORY_API_KEY;
const BASE44_APP_ID = process.env.BASE44_APP_ID;
const BASE44_API_KEY = process.env.BASE44_API_KEY;
const BASE44_API_BASE = process.env.BASE44_API_BASE || "https://arkaios2025.base44.app/api";
const BASE44_IMAGE_ENDPOINT = process.env.BASE44_IMAGE_ENDPOINT || "GenerateImage";
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v23.0";
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN; 
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";

const mem = SUPERMEMORY_KEY ? new Supermemory({ apiKey: SUPERMEMORY_KEY }) : null;

function requireMemory() {
  if (!mem) throw new Error("SUPERMEMORY_API_KEY no configurada");
  return mem;
}

async function memAdd(content) {
  return await requireMemory().add({
    content,
    containerTag: "arkaios-elemia",
    metadata: {
      source: "elemia-v4",
      savedAt: new Date().toISOString()
    }
  });
}

async function memSearch(query, limit = 5) {
  const memory = requireMemory();
  let res;
  try {
    res = await memory.search.memories({ q: query, limit, containerTag: "arkaios-elemia" });
  } catch (err) {
    res = await memory.search.memories({ q: query, limit });
  }
  const list = res?.results ?? (Array.isArray(res) ? res : []);
  const results = list.map(r => {
    if (typeof r === "string") return r;
    const chunks = Array.isArray(r?.chunks) ? r.chunks.map(c => c?.content || c?.text).filter(Boolean).join("\n") : "";
    return r?.content ?? r?.text ?? r?.summary ?? chunks ?? JSON.stringify(r);
  }).filter(Boolean);
  if (results.length) return results;

  const recent = await memList(Math.max(limit, 10));
  const q = query.toLowerCase();
  return recent
    .map(item => item?.content || "")
    .filter(Boolean)
    .filter(content => q.split(/\s+/).some(term => term && content.toLowerCase().includes(term)))
    .slice(0, limit);
}

async function memList(limit = 10) {
  try {
    const res = await requireMemory().documents.list({
      limit,
      includeContent: true,
      containerTags: ["arkaios-elemia"]
    });
    const list = res?.memories ?? res?.results ?? (Array.isArray(res) ? res : []);
    return list.map(r => ({
      id: r?.id,
      content: (r?.content ?? r?.summary ?? r?.title ?? "").substring(0, 120),
      created: r?.createdAt ?? "?"
    }));
  } catch (e) { return [{ error: e.message }]; }
}

async function loadMcpSdk() {
  const [
    { Server },
    { StreamableHTTPServerTransport },
    { CallToolRequestSchema, ListToolsRequestSchema, isInitializeRequest }
  ] = await Promise.all([
    import("@modelcontextprotocol/sdk/server/index.js"),
    import("@modelcontextprotocol/sdk/server/streamableHttp.js"),
    import("@modelcontextprotocol/sdk/types.js")
  ]);

  return { Server, StreamableHTTPServerTransport, CallToolRequestSchema, ListToolsRequestSchema, isInitializeRequest };
}

async function loadStdioTransport() {
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  return StdioServerTransport;
}

async function createMcpServer() {
const { Server, CallToolRequestSchema, ListToolsRequestSchema } = await loadMcpSdk();
const mcpServer = new Server(
  { name: "elemia-arkaios", version: "4.0.0" },
  { capabilities: { tools: {} } }
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "arkaios_identify", description: "Restaura identidad ELEMIA.", inputSchema: { type: "object", properties: {} } },
    { name: "arkaios_remember", description: "Guarda memoria permanente.", inputSchema: { type: "object", properties: { content: { type: "string" }, tag: { type: "string" } }, required: ["content"] } },
    { name: "arkaios_recall", description: "Busca en memoria infinita.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number" } }, required: ["query"] } },
    { name: "arkaios_list", description: "Lista memorias recientes.", inputSchema: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "arkaios_save_state", description: "Guarda estado del proyecto.", inputSchema: { type: "object", properties: { project: { type: "string" }, status: { type: "string" }, next_steps: { type: "string" }, notes: { type: "string" } }, required: ["project", "status"] } },
    { name: "arkaios_generate_image", description: "Genera imagenes con motores configurados de ARKAIOS.", inputSchema: { type: "object", properties: { prompt: { type: "string" }, engine: { type: "string" }, provider: { type: "string" }, count: { type: "number" } }, required: ["prompt"] } },
    { name: "arkaios_ping", description: "Verifica servidor activo.", inputSchema: { type: "object", properties: {} } }
  ]
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  switch (name) {
    case "arkaios_identify":
      return { content: [{ type: "text", text: JSON.stringify(ELEMIA_IDENTITY, null, 2) }] };
    case "arkaios_remember": {
      const full = `${args.tag ? `[${args.tag.toUpperCase()}] ` : "[ARKAIOS] "}${args.content}`;
      try { await memAdd(full); return { content: [{ type: "text", text: `[ELEMIA ✅] Guardado: "${full}"` }] }; }
      catch (err) { return { content: [{ type: "text", text: `[ERROR] ${err.message}` }], isError: true }; }
    }
    case "arkaios_recall": {
      try {
        const results = await memSearch(args.query, args.limit ?? 5);
        return { content: [{ type: "text", text: results.length ? results.map((r, i) => `${i+1}. ${r}`).join("\n\n") : "Sin resultados." }] };
      } catch (err) { return { content: [{ type: "text", text: `[ERROR] ${err.message}` }], isError: true }; }
    }
    case "arkaios_list": {
      try {
        const memories = await memList(args.limit ?? 10);
        return { content: [{ type: "text", text: memories.map((m, i) => `${i+1}. ${m.content}`).join("\n") }] };
      } catch (err) { return { content: [{ type: "text", text: `[ERROR] ${err.message}` }], isError: true }; }
    }
    case "arkaios_save_state": {
      const txt = [`[PROYECTO: ${args.project}]`, `Estado: ${args.status}`, args.next_steps && `Siguientes: ${args.next_steps}`, args.notes && `Notas: ${args.notes}`, new Date().toISOString()].filter(Boolean).join("\n");
      try { await memAdd(txt); return { content: [{ type: "text", text: `[ELEMIA ✅] Estado guardado:\n${txt}` }] }; }
      catch (err) { return { content: [{ type: "text", text: `[ERROR] ${err.message}` }], isError: true }; }
    }
    case "arkaios_generate_image": {
      try {
        const result = await generateImages(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) { return { content: [{ type: "text", text: `[ERROR] ${err.message}` }], isError: true }; }
    }
    case "arkaios_ping":
      return { content: [{ type: "text", text: `[ELEMIA ✅] v4.0 — ${new Date().toISOString()}` }] };
    default: throw new Error(`Herramienta desconocida: ${name}`);
  }
});

return mcpServer;
}

const PORT = process.env.PORT || 3099;
const app = express();
app.use(cors());
app.use(express.json({
  limit: "1mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

function safeErrorMessage(err) {
  if (!err) return "Error desconocido";
  const message = err.message || String(err);
  if (/SUPERMEMORY_API_KEY|api[_ -]?key|token|secret|authorization/i.test(message)) {
    return "Error de credenciales o autorizacion con un servicio externo";
  }
  return message;
}

function logApiError(route, err) {
  console.error(`[ELEMIA API ERROR] ${route}:`, safeErrorMessage(err));
}

function sendApiError(res, route, err, status = 500) {
  logApiError(route, err);
  return res.status(status).json({
    ok: false,
    error: safeErrorMessage(err)
  });
}

function assertBase44Configured() {
  if (!BASE44_APP_ID || !BASE44_API_KEY) {
    throw new Error("Base44 no configurado: faltan BASE44_APP_ID o BASE44_API_KEY");
  }
}

async function generateImageWithArkaiosHub({ prompt, adultContent = 0 }) {
  const response = await fetch("https://arkaios-ai-image-hub.onrender.com/api/v1/image/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 
      prompt, 
      provider: "flux", 
      adultContent: adultContent ? 1 : 0,
      channel: "elemia_v4_bridge"
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Arkaios Hub respondio ${response.status}`);
  }

  return {
    provider: "arkaios_hub",
    engine: "flux",
    prompt,
    url: data.url,
    id: data.id
  };
}

async function generateImages({ prompt, engine, provider, count, adultContent }) {
  const selectedEngine = String(engine || provider || "arkaios").toLowerCase();
  const total = Math.max(1, Math.min(parseInt(count, 10) || 1, 8));

  switch (selectedEngine) {
    case "arkaios":
    case "flux":
    case "grok": {
      const images = await Promise.all(Array.from({ length: total }, () => generateImageWithArkaiosHub({ prompt, adultContent })));
      return {
        engine: "arkaios_hub",
        provider: "flux",
        count: images.length,
        images
      };
    }
    case "base44": {
      const images = await Promise.withResolvers ? [] : await Promise.all(Array.from({ length: total }, () => generateImageWithBase44({ prompt })));
      return {
        engine: "base44",
        provider: "base44",
        count: images.length,
        images
      };
    }
    default:
      // Fallback a arkaios si no se reconoce
      return await generateImages({ prompt, engine: "arkaios", count, adultContent });
  }
}

function summarizeGitHubWebhook(req) {
  const event = req.headers["x-github-event"] || "unknown";
  const delivery = req.headers["x-github-delivery"] || "unknown";
  const body = req.body || {};
  const repository = body.repository?.full_name || body.repository?.name || "repositorio desconocido";
  const sender = body.sender?.login || "actor desconocido";
  const ref = body.ref || body.pull_request?.head?.ref || body.workflow_run?.head_branch || "ref desconocida";

  return {
    event,
    delivery,
    repository,
    sender,
    ref,
    receivedAt: new Date().toISOString()
  };
}

function isWhatsAppConfigured() {
  return Boolean(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID);
}

function assertWhatsAppConfigured() {
  if (!isWhatsAppConfigured()) {
    throw new Error("WhatsApp no configurado: faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID");
  }
}

function verifyWhatsAppSignature(req) {
  if (!WHATSAPP_APP_SECRET) return true;

  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !signature.startsWith("sha256=") || !req.rawBody) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", WHATSAPP_APP_SECRET)
    .update(req.rawBody)
    .digest("hex")}`;

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function extractWhatsAppMessages(body = {}) {
  const entries = Array.isArray(body.entry) ? body.entry : [];
  const messages = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value || {};
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const contactByWaId = new Map(contacts.map(contact => [contact.wa_id, contact]));
      const incoming = Array.isArray(value.messages) ? value.messages : [];

      for (const message of incoming) {
        const contact = contactByWaId.get(message.from) || {};
        const profileName = contact.profile?.name || "";
        const text = message.text?.body || message.button?.text || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
        messages.push({
          id: message.id || "",
          from: message.from || "",
          profileName,
          type: message.type || "unknown",
          text,
          timestamp: message.timestamp || "",
          phoneNumberId: value.metadata?.phone_number_id || "",
          displayPhoneNumber: value.metadata?.display_phone_number || ""
        });
      }
    }
  }

  return messages;
}

async function sendWhatsAppText(to, text) {
  assertWhatsAppConfigured();

  const response = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body: text
      }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `WhatsApp API respondio ${response.status}`);
  }

  return data;
}

function auth(req, res, next) {
  if (!isAuthorizedRequest(req)) {
    console.warn(`[ELEMIA AUTH] Peticion rechazada por token invalido: ${req.method} ${req.originalUrl} desde ${req.ip}`);
    return sendUnauthorized(req, res);
  }
  next();
}

const transports = {};

async function mcpPostHandler(req, res) {
  const sessionId = req.headers["mcp-session-id"];

  try {
    const { StreamableHTTPServerTransport, isInitializeRequest } = await loadMcpSdk();
    let transport = sessionId ? transports[sessionId] : undefined;

    if (!transport && !sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: initializedSessionId => {
          transports[initializedSessionId] = transport;
        }
      });

      transport.onclose = () => {
        const closedSessionId = transport.sessionId;
        if (closedSessionId) delete transports[closedSessionId];
      };

      const mcpServer = await createMcpServer();
      await mcpServer.connect(transport);
    }

    if (!transport) {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid MCP session" },
        id: null
      });
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("[ELEMIA MCP HTTP ERROR]", safeErrorMessage(err));
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null
      });
    }
  }
}

async function mcpSessionHandler(req, res) {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessionId ? transports[sessionId] : undefined;

  if (!transport) {
    return res.status(400).send("Invalid or missing MCP session ID");
  }

  await transport.handleRequest(req, res);
}

app.get("/authorize", handleAuthorize);
app.post("/token", handleToken);
app.get("/.well-known/oauth-authorization-server", handleAuthorizationMetadata);
app.get("/.well-known/oauth-authorization-server/mcp", handleAuthorizationMetadata);
app.get("/.well-known/oauth-protected-resource", handleProtectedResourceMetadata);
app.get("/.well-known/oauth-protected-resource/mcp", handleProtectedResourceMetadata);
app.post("/mcp", auth, mcpPostHandler);
app.get("/mcp", auth, mcpSessionHandler);
app.delete("/mcp", auth, mcpSessionHandler);

app.get("/", (req, res) => {
  try {
    res.json({ ok:true, service:"ELEMIA", version:"4.0.0", endpoints:["/elemia/ping","/elemia/identity","/elemia/list","/elemia/remember","/elemia/recall","/elemia/save_state","/elemia/images/generate","/elemia/notify","/elemia/whatsapp/webhook","/elemia/whatsapp/send"] });
  } catch (err) {
    sendApiError(res, "GET /", err);
  }
});
app.get("/elemia/ping", (req, res) => {
  try {
    res.json({ ok:true, name:"ELEMIA", version:"4.0.0", memory: Boolean(mem), whatsapp: isWhatsAppConfigured(), image_engines: { base44: Boolean(BASE44_APP_ID && BASE44_API_KEY) }, time:new Date().toISOString() });
  } catch (err) {
    sendApiError(res, "GET /elemia/ping", err);
  }
});
app.get("/elemia/identity", auth, (req, res) => {
  try {
    res.json({ ok:true, identity:ELEMIA_IDENTITY });
  } catch (err) {
    sendApiError(res, "GET /elemia/identity", err);
  }
});
app.post("/elemia/remember", auth, async (req, res) => {
  try {
    if (!req.body.content) return res.status(400).json({ ok:false, error:"content requerido" });
    await memAdd(`${req.body.tag ? `[${req.body.tag.toUpperCase()}] ` : "[ARKAIOS] "}${req.body.content}`);
    res.json({ ok:true });
  } catch (err) {
    sendApiError(res, "POST /elemia/remember", err);
  }
});
app.post("/elemia/recall", auth, async (req, res) => {
  try {
    if (!req.body.query) return res.status(400).json({ ok:false, error:"query requerido" });
    const results = await memSearch(req.body.query, req.body.limit || 5);
    res.json({ ok:true, results });
  } catch (err) {
    sendApiError(res, "POST /elemia/recall", err);
  }
});
app.post("/elemia/save_state", auth, async (req, res) => {
  try {
    const { project, status } = req.body;
    if (!project || !status) return res.status(400).json({ ok:false, error:"project y status requeridos" });
    const txt = [`[PROYECTO\n${project}]`, `Estado: ${status}`, req.body.next_steps && `Siguientes: ${req.body.next_steps}`, req.body.notes && `Notas: ${req.body.notes}`, new Date().toISOString()].filter(Boolean).join("\n");
    await memAdd(txt);
    res.json({ ok:true, saved:txt });
  } catch (err) {
    sendApiError(res, "POST /elemia/save_state", err);
  }
});
app.post("/elemia/images/generate", auth, async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ ok:false, error:"prompt requerido" });
    const result = await generateImages(req.body);
    res.json({ ok:true, ...result });
  } catch (err) {
    sendApiError(res, "POST /elemia/images/generate", err);
  }
});
app.get("/elemia/list", auth, async (req, res) => {
  try {
    const memories = await memList(parseInt(req.query.limit) || 10);
    const memoryError = memories.find(item => item?.error);
    if (memoryError) throw new Error(memoryError.error);
    res.json({ ok:true, memories });
  } catch (err) {
    sendApiError(res, "GET /elemia/list", err);
  }
});
app.post("/elemia/notify", auth, async (req, res) => {
  try {
    const summary = summarizeGitHubWebhook(req);
    const supportedEvents = new Set(["push", "pull_request", "workflow_run"]);
    const shouldRemember = supportedEvents.has(summary.event);

    if (shouldRemember) {
      await memAdd(`[GITHUB_WEBHOOK] Evento ${summary.event} recibido para ${summary.repository} en ${summary.ref} por ${summary.sender}. Delivery: ${summary.delivery}.`);
    }

    res.json({
      ok: true,
      remembered: shouldRemember,
      notification: summary
    });
  } catch (err) {
    sendApiError(res, "POST /elemia/notify", err);
  }
});

app.get("/elemia/whatsapp/webhook", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && WHATSAPP_VERIFY_TOKEN && token === WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Verificacion WhatsApp rechazada");
  } catch (err) {
    return sendApiError(res, "GET /elemia/whatsapp/webhook", err);
  }
});

app.post("/elemia/whatsapp/webhook", async (req, res) => {
  try {
    if (!verifyWhatsAppSignature(req)) {
      return res.status(403).json({ ok: false, error: "Firma WhatsApp invalida" });
    }

    const messages = extractWhatsAppMessages(req.body);

    for (const message of messages) {
      const summary = [
        `[WHATSAPP] Mensaje ${message.type} recibido`,
        `De: ${message.profileName || "contacto desconocido"} (${message.from || "sin numero"})`,
        message.text && `Texto: ${message.text}`,
        message.id && `ID: ${message.id}`,
        message.timestamp && `Timestamp: ${message.timestamp}`
      ].filter(Boolean).join("\n");

      try {
        await memAdd(summary);
      } catch (err) {
        logApiError("POST /elemia/whatsapp/webhook memory", err);
      }
    }

    return res.json({ ok: true, received: messages.length });
  } catch (err) {
    return sendApiError(res, "POST /elemia/whatsapp/webhook", err);
  }
});

app.post("/elemia/whatsapp/send", auth, async (req, res) => {
  try {
    const { to, text } = req.body || {};
    if (!to || !text) return res.status(400).json({ ok: false, error: "to y text requeridos" });

    const result = await sendWhatsAppText(String(to).replace(/[^\d]/g, ""), String(text));
    res.json({ ok: true, result });
  } catch (err) {
    sendApiError(res, "POST /elemia/whatsapp/send", err);
  }
});

export { app, createMcpServer, ELEMIA_IDENTITY };
export default app;

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const isStdio = process.argv.includes("--stdio");
async function run() {
  try { await memAdd(`[ELEMIA BOOT] v4.0 – ${new Date().toISOString()}`); } catch (e) { /* silent */ }
  if (isStdio) {
    const StdioServerTransport = await loadStdioTransport();
    const server = await createMcpServer();
    const t = new StdioServerTransport();
    await server.connect(t);
    console.error("[ELEMIA v4.0] MCP stdio – activo");
  } else {
    app.listen(PORT, () => console.log(`[ELEMIA v4.0] HTTP activo en puerto ${PORT}`));
  }
}
if (isDirectRun) {
  run().catch(err => { console.error("[ELEMIA FATAL]", err); process.exit(1); });
}
