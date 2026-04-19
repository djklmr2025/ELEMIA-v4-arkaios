import { handleToken } from "./oauth-core.mjs";

export default function handler(req, res) {
  return handleToken(req, res);
}
