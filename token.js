/**
 * ELEMIA v4 — OAuth /token endpoint
 * Intercambia el authorization code por el bearer token de ELEMIA.
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { grant_type, code } = req.body || {};

  if (grant_type && grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  // Valida que el code exista (vino de /authorize)
  if (!code) {
    return res.status(400).json({ error: 'missing_code' });
  }

  // Devuelve el token de acceso real de ELEMIA
  const token = process.env.ELEMIA_HTTP_TOKEN || process.env.VITE_AIDA_AUTH_TOKEN || 'elemia-token';

  return res.status(200).json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 86400,
    scope: 'mcp'
  });
}
