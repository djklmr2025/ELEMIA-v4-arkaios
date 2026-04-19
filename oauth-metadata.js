/**
 * ELEMIA v4 — OAuth Authorization Server Metadata
 * Claude.ai descubre automáticamente estos endpoints desde:
 * GET /.well-known/oauth-authorization-server
 */
export default function handler(req, res) {
  const base = 'https://elemia-v4-arkaios.vercel.app';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  return res.status(200).json({
    issuer: base,
    authorization_endpoint: `${base}/authorize`,
    token_endpoint: `${base}/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none']
  });
}
