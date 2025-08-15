# Overwolf Application Architecture Guide

*This document distills the official Overwolf documentation into a pragmatic, implementation-oriented architecture blueprint for building a production-ready Overwolf **Counter-Strike 2** companion app that captures live game events and renders an interactive in-game overlay.*

---

## 1. High-Level Architecture

```text
┌────────────────────────────────────────┐
│                APP FOLDER              │
│                                        │
│  manifest.json                         │
│  +-windows/                            │
│  |   ├─background/  (logic only)       │
│  |   ├─in_game/    (overlay UI)        │
│  |                                     │
│  +-src/                                │
│  |   ├─events/      (GEP adapter)      │
│  |   ├─services/    (state, IPC)       │
│  |   └─ui/          (React/Vue/Svelte) │
│  +-assets/ (icons, css, images)        │
└────────────────────────────────────────┘
```

1. **manifest.json** is the single source of truth that wires permissions, game targeting, windows, and hot-keys.
2. **Background window** (hidden) orchestrates lifecycle: it detects game launch, registers required features with *overwolf.games.events*, and routes IPC messages to visible windows.
3. **In-game window** is a transparent HTML overlayed over Counter Strike 2. It subscribes to broadcasted game events, updates UI, and exposes hot-keys.
4. **Desktop window** provides richer analytics when the user is out of game.

> Keep game-critical logic in the background window to minimise render cost inside the overlay.

---

## 2. Manifest Skeleton

```jsonc
{
  "manifest_version": 1,
  "type": "WebApp",
  "meta": {
    "name": "CS2-Companion",
    "author": "Your Studio",
    "version": "0.1.0",
    "minimum-overwolf-version": "0.199.0",
    "dock_button_title": "CS2 Stats",
    "icon": "assets/IconMouseOver.png",
    "icon_gray": "assets/IconMouseNormal.png",
    "launcher_icon": "assets/desktop-icon.ico"
  },
  "permissions": ["GameInfo", "Hotkeys", "FileSystem"],
  "data": {
    "game_targeting": {
      "type": "dedicated",
      "game_ids": [10798] // Counter-Strike 2
    },
    "game_events": [10798],
    "start_window": "background",
    "windows": {
      "background": {
        "file": "windows/background/index.html",
        "is_background_page": true
      },
      "in_game": {
        "file": "windows/in_game/index.html",
        "transparent": true,
        "clickthrough": false,
        "in_game_only": true,
        "size": { "width": 400, "height": 250 },
        "topmost": true
      },
      "desktop": {
        "file": "windows/desktop/index.html",
        "desktop_only": true,
        "native_window": true,
        "size": { "width": 800, "height": 600 }
      }
    },
    "hotkeys": {
      "toggle_overlay": {
        "title": "Toggle Overlay",
        "action-type": "toggle",
        "default": "Alt+O"
      }
    },
    "launch_events": [{
      "event": "GameLaunch",
      "event_data": { "game_ids": [10798] },
      "start_minimized": true
    }]
  }
}
```

*Key points*
- **game_targeting** + **game_events** ensure injection **and** event access [6].
- Overlay is transparent, top-most, and bound to in-game context [5].

---

## 3. Background Controller

```ts
// windows/background/controller.ts
import { Features } from "../events/features";

const CS2_ID = 10798;
const REQUIRED_FEATURES = [
  "match_info", "live_data", "kill", "death", "assist", "round_start", "round_end"
];

function registerFeatures() {
  overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, res => {
    if (!res.success) {
      console.warn("GEP registration failed", res.error);
    }
  });
}

overwolf.games.onGameInfoUpdated.addListener(info => {
  if (info && info.gameChanged && info.gameInfo.classId === CS2_ID) {
    registerFeatures();
  }
});

// relay events to overlay
overwolf.games.events.onNewEvents.addListener(e => {
  Features.handle(e.events); // domain logic → broadcast
});
```

*Best practice*: call **setRequiredFeatures** only once the game is confirmed running to avoid wasted retries [3].

---

## 4. Game Event Adapter

```ts
// src/events/features.ts
import EventEmitter from "mitt";

export const bus = EventEmitter();

export const Features = {
  handle(events) {
    events.forEach(ev => {
      switch (ev.name) {
        case "kill":
          bus.emit("kill", parseInt(ev.data, 10));
          break;
        case "death":
          bus.emit("death", parseInt(ev.data, 10));
          break;
        // ...other cases
      }
    });
  }
};
```

The overlay listens to **bus** to update reactive UI components without direct coupling to the Overwolf SDK, simplifying unit testing.

---

## 5. In-Game Overlay Window

```html
<!-- windows/in_game/index.html -->
<body>
  <div id="hud" class="panel"></div>
  <script type="module" src="hud.js"></script>
</body>
```

```ts
// hud.js
import { bus } from "../../src/events/features.js";

const hud = document.getElementById("hud");
let kills = 0, deaths = 0;

bus.on("kill", k => { kills = k; render(); });
bus.on("death", d => { deaths = d; render(); });

function render() {
  hud.innerText = `K ${kills} / D ${deaths}`;
}

// hotkey toggle
overwolf.settings.hotkeys.onPressed.addListener(hk => {
  if (hk.name === "toggle_overlay") toggle();
});

function toggle() {
  overwolf.windows.getCurrentWindow(win => {
    if (win.window_state_ex === "hidden") {
      overwolf.windows.restore(win.window.id);
    } else {
      overwolf.windows.hide(win.window.id);
    }
  });
}
```

*UX tip*: avoid frequent DOM mutations; batch updates every 100 ms if you process many events.

---

## 6. Modular Window Management

```ts
// src/services/windows.ts
export async function open(name) {
  return new Promise(res => {
    overwolf.windows.obtainDeclaredWindow(name, w => {
      overwolf.windows.restore(w.window.id, res);
    });
  });
}

export async function bringToFront(name) {
  overwolf.windows.bringToFront(name, true, () => {});
}
```

Centralising window calls guarantees DPI safety and eases future refactors [5].

---

## 7. File & Build Layout

```
my-cs2-companion/
├─ manifest.json
├─ windows/
│   ├─ background/
│   │   ├─ index.html
│   │   └─ controller.ts
│   ├─ in_game/
│   │   ├─ index.html
│   │   └─ hud.js
│   └─ desktop/
│       └─ index.html
├─ src/
│   ├─ events/
│   │   └─ features.ts
│   ├─ services/
│   │   └─ windows.ts
│   └─ ui/  (framework code)
└─ assets/
    └─ icons, css, images
```

Use *Vite* or *Webpack* to output each window bundle into `windows/<name>`; keep shared code in `src/` for tree-shaking.

---

## 8. Testing Checklist

1. Load unpacked extension via **Overwolf → Dev Options → Load Unpacked**.
2. Validate manifest with the official schema (`ajv validate`) [8].
3. Start CS 2 → verify background logs `supportedFeatures` include requested keys and overlay appears.
4. Switch CS 2 to *trusted fullscreen* → confirm overlay hides and `Exclusive Mode` fallback flow is handled (see `focus_game_takeover`) [5].
5. Record a full match and ensure no performance drop (<3 ms overlay render time per frame).

---

## 9. Deployment

1. Run `npm run build` to produce the **.opk** bundle.
2. Zip the `dist` folder contents and rename to `cs2-companion.opk` [14].
3. Submit via Dev Console, attaching icons, screenshots, and GDPR docs.

---

### Quick Reference

| Concern | API / Doc Section |
|---------|-------------------|
| Running game detection | `overwolf.games` – *onGameLaunched* [2] |
| Real-time events | `overwolf.games.events` – *setRequiredFeatures* [3] |
| CS 2 feature keys | GEP page – *live_data*, *match_info*, *kill* … [4] |
| Window creation & control | `overwolf.windows.*` [5] |
| Manifest schema | `manifest.json` reference [7] |
| Background controller pattern | Sample app components [9] |
| Exclusive Mode handling | Windows → Exclusive Mode guide [10] |

> **Tip:** Keep Overwolf SDK typings (`npm i -D @overwolf/types`) to enjoy IntelliSense across all the APIs.
