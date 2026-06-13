OPEN CLASSROOM / WEBSITE REMOTE LAUNCHER

WHAT IT DOES
1. You open index.html (normally after hosting the folder as a static website).
2. It connects to your existing Brick Cloudflare Worker.
3. It sends one OPEN_URL command to each selected Windows agent.
4. Each online selected Windows device opens WEBSITE_TO_OPEN.
5. The launcher tries to close its own tab immediately after the WebSocket
   send buffer is empty.

EDIT ONLY config.js

WEBSITE_TO_OPEN:
  The page that selected users should open.
  Default: https://classroom.google.com/

USERS:
  Friendly user/device names mapped to Windows agent device IDs.

  Example:
  USERS: {
    "NB Windows": "nb-windows",
    "Elliott Laptop": "elliott-windows",
    "Student 2": "student-2-windows"
  }

TARGET_USERS:
  ["ALL"]
    Opens the configured website for every device listed in USERS.

  ["NB Windows"]
    Opens it only for that user/device.

  ["NB Windows", "Student 2"]
    Opens it for those two users/devices.

FAST CLOSE
- The default minimum close delay is 40 ms.
- The page waits only until the WebSocket send buffer is empty, with a
  350 ms maximum.
- A browser usually allows a page to close itself only when that tab was
  opened by another script.
- When a manually opened tab cannot close itself, this launcher changes
  itself to about:blank instead.

IMPORTANT LIMITATIONS
- The selected Windows agent must already be installed, running and online.
- Device IDs in USERS must exactly match the agent device IDs.
- A static website cannot directly open pages on another computer. This
  launcher works because it sends OPEN_URL through your existing Worker to
  your installed Windows agent.
- "ALL" means all devices explicitly listed in USERS. It does not broadcast
  blindly, which avoids also triggering Chrome/Edge companion extensions.
- Use only on devices/accounts you manage or are authorised to control.

HOSTING
Upload all files together without renaming them:
- index.html
- main.js
- config.js
- style.css
