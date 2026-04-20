import crypto from "node:crypto";

const DEFAULT_CLIENT_ID = "ELEMIA_HTTP_TOKEN";
const CODE_TTL_SECONDS = 300;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365;

export function getHttpToken() {
  return process.env.ELEMIA_HTTP_TOKEN || "elemia-arkaios-secret";
}

function getBaseUrl(req) {
  const configuredUrl = process.env.ELEMIA_PUBLIC_URL || process.env.PUBLIC_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");

  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`.replace(/\/$/, "");
}

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", getHttpToken()).update(value).digest("base64url");
}

function constantTimeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function json(res, status, body) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("location", location);
  res.end();
}

function errorRedirect(redirectUri, state, error, description) {
  const target = new URL(redirectUri);
  target.searchParams.set("error", error);
  target.searchParams.set("error_description", description);
  if (state) target.searchParams.set("state", state);
  return target.toString();
}

function createAuthorizationCode({ clientId, redirectUri, codeChallenge, codeChallengeMethod }) {
  const payload = base64Url(JSON.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + CODE_TTL_SECONDS
  }));

  return `${payload}.${sign(payload)}`;
}

function verifyAuthorizationCode(code) {
  const [payload, signature] = String(code || "").split(".");
  if (!payload || !signature || !constantTimeEqual(signature, sign(payload))) {
    throw new Error("authorization code invalido");
  }

  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("authorization code expirado");
  }
  return data;
}

function verifyPkce(codeVerifier, codeChallenge) {
  if (!codeVerifier || !codeChallenge) return false;
  const digest = crypto.createHash("sha256").update(String(codeVerifier)).digest("base64url");
  return constantTimeEqual(digest, codeChallenge);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    return Object.fromEntries(new URLSearchParams(req.body));
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) return JSON.parse(raw);
  return Object.fromEntries(new URLSearchParams(raw));
}

export function bearerTokenFromRequest(req) {
  const authorization = req.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

export function isAuthorizedRequest(req) {
  const expected = getHttpToken();
  const provided = req.headers["x-elemia-token"] || req.query?.token || bearerTokenFromRequest(req);
  return Boolean(provided) && constantTimeEqual(provided, expected);
}

export function sendUnauthorized(req, res) {
  const baseUrl = getBaseUrl(req);
  res.setHeader("WWW-Authenticate", `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource/mcp"`);
  return json(res, 401, { ok: false, error: "Token invalido" });
}

export function oauthAuthorizationServerMetadata(req) {
  const baseUrl = getBaseUrl(req);
  return {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    scopes_supported: ["mcp:tools"]
  };
}

export function oauthProtectedResourceMetadata(req) {
  const baseUrl = getBaseUrl(req);
  return {
    resource: `${baseUrl}/mcp`,
    authorization_servers: [baseUrl],
    bearer_methods_supported: ["header"],
    scopes_supported: ["mcp:tools"],
    resource_name: "ELEMIA ARKAIOS MCP"
  };
}

export function handleAuthorizationMetadata(req, res) {
  return json(res, 200, oauthAuthorizationServerMetadata(req));
}

export function handleProtectedResourceMetadata(req, res) {
  return json(res, 200, oauthProtectedResourceMetadata(req));
}

export function handleAuthorize(req, res) {
  const {
    response_type: responseType,
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    state
  } = req.query || {};

  if (!redirectUri) {
    return json(res, 400, { ok: false, error: "redirect_uri requerido" });
  }

  if (responseType !== "code") {
    return redirect(res, errorRedirect(redirectUri, state, "unsupported_response_type", "Solo response_type=code esta soportado"));
  }

  if (process.env.ELEMIA_OAUTH_CLIENT_ID && clientId !== process.env.ELEMIA_OAUTH_CLIENT_ID) {
    return redirect(res, errorRedirect(redirectUri, state, "invalid_client", "client_id no reconocido"));
  }

  if (!codeChallenge || codeChallengeMethod !== "S256") {
    return redirect(res, errorRedirect(redirectUri, state, "invalid_request", "PKCE S256 requerido"));
  }

  const code = createAuthorizationCode({
    clientId: clientId || DEFAULT_CLIENT_ID,
    redirectUri,
    codeChallenge,
    codeChallengeMethod
  });

  const target = new URL(redirectUri);
  target.searchParams.set("code", code);
  if (state) target.searchParams.set("state", state);
  return redirect(res, target.toString());
}

export async function handleToken(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "method_not_allowed" });
  }

  try {
    const body = await readBody(req);
    const codeData = verifyAuthorizationCode(body.code);

    if (body.grant_type !== "authorization_code") {
      return json(res, 400, { error: "unsupported_grant_type" });
    }

    if (body.client_id && body.client_id !== codeData.client_id) {
      return json(res, 400, { error: "invalid_client" });
    }

    if (body.redirect_uri && body.redirect_uri !== codeData.redirect_uri) {
      return json(res, 400, { error: "invalid_grant" });
    }

    if (!verifyPkce(body.code_verifier, codeData.code_challenge)) {
      return json(res, 400, { error: "invalid_grant", error_description: "PKCE invalido" });
    }

    return json(res, 200, {
      access_token: getHttpToken(),
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      scope: "mcp:tools"
    });
  } catch (err) {
    return json(res, 400, {
      error: "invalid_grant",
      error_description: err.message || "authorization code invalido"
    });
  }
}
