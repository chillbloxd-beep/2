export const OPEN_SITE_CONFIG = {
  // Existing Brick Worker connection
  WORKER_BASE_URL: "https://brick-classroom-d1.lumjayvian.workers.dev",
  ROOM_ID: "brick-room-001",
  API_KEY: "ZER0PING5GWIFI$$qwerty",

  // Website that will open on each selected Windows device.
  WEBSITE_TO_OPEN: "https://classroom.google.com/",

  // Give every managed Windows user/device a friendly name here.
  // The value MUST match that user's Windows agent deviceId.
  USERS: {
    "NB Windows": "nb-windows"
    // "User 2": "user-2-windows",
    // "User 3": "user-3-windows"
  },

  // Use ["ALL"] for every user listed above.
  // Or select one/more names exactly as written in USERS.
  // Example: ["NB Windows"]
  // Example: ["NB Windows", "User 2"]
  TARGET_USERS: ["ALL"],

  // Runs automatically the moment this launcher website is opened.
  AUTO_RUN: true,

  // Close this launcher tab after the OPEN_URL messages have left
  // the browser's WebSocket send buffer.
  CLOSE_LAUNCHER_TAB: true,

  // Earliest close attempt. Lower is faster, but 40 ms is already very fast.
  MIN_CLOSE_DELAY_MS: 20,

  // Safety ceiling if the browser keeps data buffered.
  MAX_CLOSE_WAIT_MS: 300,

  // A manually opened tab may not be allowed to close itself.
  // When blocked, replace it with a blank page instead.
  BLANK_IF_BROWSER_BLOCKS_CLOSE: true,

  // How long to wait for the Worker before showing a connection error.
  CONNECTION_TIMEOUT_MS: 3000
};
