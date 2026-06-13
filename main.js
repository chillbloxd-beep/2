import { OPEN_SITE_CONFIG as CFG } from "./config.js";

const statusEl = document.getElementById("status");
const detailsEl = document.getElementById("details");
const runButton = document.getElementById("runButton");

let ws = null;
let connectionTimer = null;
let hasRun = false;

function setStatus(text, details = "") {
  statusEl.textContent = text;
  detailsEl.textContent = details;
}

function normalizedWorkerBase() {
  return String(CFG.WORKER_BASE_URL || "")
    .trim()
    .replace(/^https:/i, "wss:")
    .replace(/^http:/i, "ws:")
    .replace(/\/$/, "");
}

function websocketUrl() {
  const params = new URLSearchParams({
    key: String(CFG.API_KEY || ""),
    role: "dashboard",
    deviceId: `open-site-launcher-${crypto.randomUUID()}`,
    deviceName: "Open Website Launcher"
  });

  return `${normalizedWorkerBase()}/ws/${encodeURIComponent(CFG.ROOM_ID)}?${params}`;
}

function getTargets() {
  const users = CFG.USERS && typeof CFG.USERS === "object" ? CFG.USERS : {};
  const requested = Array.isArray(CFG.TARGET_USERS) ? CFG.TARGET_USERS : [];
  const useAll = requested.some(name => String(name).toUpperCase() === "ALL");
  const selectedNames = useAll ? Object.keys(users) : requested;

  const targets = selectedNames.map(name => ({
    name,
    deviceId: users[name]
  })).filter(item => typeof item.deviceId === "string" && item.deviceId.trim());

  const seen = new Set();
  return targets.filter(item => {
    const id = item.deviceId.trim();
    if (seen.has(id)) return false;
    seen.add(id);
    item.deviceId = id;
    return true;
  });
}

function validOpenUrl() {
  try {
    const parsed = new URL(String(CFG.WEBSITE_TO_OPEN || ""));
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("Only http/https URLs are allowed");
    return parsed.href;
  } catch (error) {
    throw new Error(`Invalid WEBSITE_TO_OPEN: ${error.message}`);
  }
}

function commandMessage(targetDeviceId, url) {
  return {
    type: "command",
    id: `open-url-${crypto.randomUUID()}`,
    targetDeviceId,
    command: {
      type: "OPEN_URL",
      payload: { url }
    }
  };
}

function attemptFastClose() {
  if (!CFG.CLOSE_LAUNCHER_TAB) {
    setStatus("Commands sent.", "This launcher tab was left open by config.");
    return;
  }

  const minimumDelay = Math.max(0, Number(CFG.MIN_CLOSE_DELAY_MS) || 0);
  const maximumWait = Math.max(minimumDelay, Number(CFG.MAX_CLOSE_WAIT_MS) || 350);
  const started = performance.now();

  const waitForFlush = () => {
    const elapsed = performance.now() - started;
    const flushed = !ws || ws.readyState !== WebSocket.OPEN || ws.bufferedAmount === 0;

    if (elapsed >= minimumDelay && (flushed || elapsed >= maximumWait)) {
      try { window.close(); } catch (_) {}

      // Browsers normally block window.close() when the tab was opened manually.
      if (CFG.BLANK_IF_BROWSER_BLOCKS_CLOSE) {
        setTimeout(() => {
          try { window.location.replace("about:blank"); } catch (_) {}
        }, 60);
      }
      return;
    }

    setTimeout(waitForFlush, 10);
  };

  waitForFlush();
}

function sendOpenCommands() {
  if (hasRun || !ws || ws.readyState !== WebSocket.OPEN) return;

  const targets = getTargets();
  const url = validOpenUrl();

  if (!targets.length) {
    throw new Error("No valid users selected. Edit USERS and TARGET_USERS in config.js.");
  }

  hasRun = true;
  for (const target of targets) {
    ws.send(JSON.stringify(commandMessage(target.deviceId, url)));
  }

  const names = targets.map(target => target.name).join(", ");
  setStatus("Opening website…", `${url} → ${names}`);
  attemptFastClose();
}

function showError(error) {
  clearTimeout(connectionTimer);
  setStatus("Could not send the command.", error instanceof Error ? error.message : String(error));
  runButton.hidden = false;
}

function connectAndRun() {
  hasRun = false;
  runButton.hidden = true;
  setStatus("Connecting to managed devices.");

  try { if (ws) ws.close(); } catch (_) {}

  try {
    validOpenUrl();
    if (!getTargets().length) {
      throw new Error("No users selected in config.js.");
    }

    ws = new WebSocket(websocketUrl());
    connectionTimer = setTimeout(() => {
      try { ws.close(); } catch (_) {}
      showError(new Error("Worker connection timed out."));
    }, Math.max(1000, Number(CFG.CONNECTION_TIMEOUT_MS) || 5000));

    ws.addEventListener("open", () => {
      clearTimeout(connectionTimer);
      // Send on the first event-loop turn after WebSocket open.
      queueMicrotask(() => {
        try { sendOpenCommands(); } catch (error) { showError(error); }
      });
    });

    ws.addEventListener("error", () => {
      if (!hasRun) showError(new Error("WebSocket connection failed."));
    });
  } catch (error) {
    showError(error);
  }
}

runButton.addEventListener("click", connectAndRun);

if (CFG.AUTO_RUN !== false) {
  connectAndRun();
} else {
  runButton.hidden = false;
  setStatus("Ready.", "Press Run again to send the configured website.");
}
