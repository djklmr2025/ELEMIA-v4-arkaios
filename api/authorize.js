import { handleAuthorize } from "./oauth-core.mjs";

export default function handler(req, res) {
  return handleAuthorize(req, res);
}
