import { handleProtectedResourceMetadata } from "./oauth-core.mjs";

export default function handler(req, res) {
  return handleProtectedResourceMetadata(req, res);
}
