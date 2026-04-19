import { handleAuthorizationMetadata } from "./oauth-core.mjs";

export default function handler(req, res) {
  return handleAuthorizationMetadata(req, res);
}
