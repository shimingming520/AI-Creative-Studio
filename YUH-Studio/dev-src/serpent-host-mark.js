"use strict";
// Tiny file marker logger for the feasibility run (logs survive GUI stdout).
const fs = require("node:fs");
const path = require("node:path");
const LOG = process.env.SERPENT_HOST_LOG || "F:\\PyCharm_Project\\serpent-host-marker.log";
function mark(step, detail) {
  const line = `[${new Date().toISOString()}] ${step}${detail ? " :: " + detail : ""}\n`;
  try {
    fs.appendFileSync(LOG, line);
  } catch {}
  // NOTE: intentionally NO console.log here. In embedded/background contexts
  // stdout may be a broken pipe; console.log then emits an ASYNC 'error' on
  // process.stdout that try/catch cannot intercept and surfaces as an
  // uncaughtException, which can disrupt the utilityProcess handshake.
}
module.exports = { mark };
