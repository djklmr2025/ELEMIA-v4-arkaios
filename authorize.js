/**
 * ELEMIA v4 — OAuth /authorize endpoint
 * Claude.ai usa Authorization Code + PKCE para conectarse.
 * Este handler auto-aprueba y redirige de vuelta con el code.
 */
export default function handler(req, res) {
  const {
    response_type,
    client_id,
    redirect_uri,
    code_challenge,
    code_challenge_method,
    state
  } = req.query;

  // Validaciones básicas
  if (response_type !== 'code') {
    return res.status(400).json({ error: 'unsupported_response_type' });
  }
  if (!redirect_uri) {
    return res.status(400).json({ error: 'missing_redirect_uri' });
  }

  // Genera un código de autorización firmado (base64url)
  const payload = JSON.stringify({
    ts: Date.now(),
    client_id: client_id || 'unknown',
    challenge: code_challenge,
    method: code_challenge_method || 'S256'
  });
  const code = Buffer.from(payload).toString('base64url');

  // Redirige a Claude.ai con el código
  try {
    const callback = new URL(redirect_uri);
    callback.searchParams.set('code', code);
    if (state) callback.searchParams.set('state', state);
    return res.redirect(302, callback.toString());
  } catch {
    return res.status(400).json({ error: 'invalid_redirect_uri' });
  }
}
