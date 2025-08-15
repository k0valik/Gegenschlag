# CS2 Helper Overlay Project Structure  Boilerplate

## Main Takeaway

A modular, service-oriented Overwolf app using TypeScript/JavaScript with clear separation of concerns (window management, game-data services, UI rendering, fallback logic) ensures both **plug-and-play** simplicity and **future extensibility**.

***

## 1. Repository Layout

```
cs2-helper-overlay/
├── .gitignore
├── package.json
├── tsconfig.json
├── overwolf-app-manifest.json
├── src/
│   ├── background/
│   │   └── background.js
│   ├── services/
│   │   ├── windowsService.js
│   │   ├── gameEventsService.js
│   │   ├── gsiService.js
│   │   ├── consoleLogService.js
│   │   └── economyCalculatorService.js
│   ├── ui/
│   │   ├── overlay.html
│   │   └── overlay.js
│   ├── utils/
│   │   └── fallbackManager.js
│   └── index.js
├── public/
│   └── assets/
└── README.md
```


***

## 2. Core Files \& Responsibilities

### 2.1 overwolf-app-manifest.json

Defines windows, permissions, and entry points.

```json
{
  "manifest_version": 1,
  "type": "WebApp",
  "data": {
    "start_window": "background",
    "windows": {
      "background": { "is_background_page": true },
      "overlay": {
        "file": "src/ui/overlay.html",
        "in_game_only": true,
        "opaque": true,
        "size": { "width": 300, "height": 150 },
        "position": "top_right"
      }
    }
  },
  "permissions": [
    "GameEvents",
    "Windows",
    "Storage",
    "Media",
    "ImageCapture"
  ]
}
```


### 2.2 src/index.js

Bootstraps background and overlay initialization.

```js
import Background from './background/background.js';

window.addEventListener('load', () => {
  Background.initialize();
});
```


### 2.3 src/background/background.js

Orchestrates services, listens for game start, and opens overlay.

```js
import WindowsService from '../services/windowsService.js';
import GameEventsService from '../services/gameEventsService.js';
import FallbackManager from '../utils/fallbackManager.js';

class Background {
  static async initialize() {
    await WindowsService.obtainWindow('overlay');
    GameEventsService.init();
    FallbackManager.setup();
  }
}

export default Background;
```


***

## 3. Service Layer

### 3.1 windowsService.js

Standardized Overwolf window handling.

```js
class WindowsService {
  static obtainWindow(name) {
    return new Promise((resolve, reject) => {
      overwolf.windows.obtainDeclaredWindow(name, result => {
        result.success ? resolve(result) : reject(result.error);
      });
    });
  }
}

export default WindowsService;
```


### 3.2 gameEventsService.js

Primary data source via GED; emits event updates.

```js
import EconomyCalculatorService from './economyCalculatorService.js';

class GameEventsService {
  static init() {
    overwolf.games.events.onNewEvents.addListener(this.handleEvents);
  }

  static handleEvents(events) {
    const roundData = EconomyCalculatorService.processGED(events);
    // Send to overlay
    overwolf.windows.sendMessage('overlay', { event: 'update-economy', data: roundData });
  }
}

export default GameEventsService;
```


### 3.3 gsiService.js

Fallback: Valve Game State Integration via periodic polling.

```js
class GSIService {
  static init() {
    this.interval = setInterval(() => this.fetchGSI(), 5000);
  }

  static async fetchGSI() {
    const response = await fetch('http://localhost:3000/gsi'); 
    const gsiData = await response.json();
    overwolf.windows.sendMessage('overlay', { event: 'update-gsi', data: gsiData });
  }

  static teardown() {
    clearInterval(this.interval);
  }
}

export default GSIService;
```


### 3.4 consoleLogService.js

Secondary fallback parsing CS2 console logs.

```js
class ConsoleLogService {
  static init() {
    // Example: subscribe via Overwolf Media or file reader
  }

  static handleLogEntry(line) {
    const data = this.parseLine(line);
    overwolf.windows.sendMessage('overlay', { event: 'update-log', data });
  }
}

export default ConsoleLogService;
```


### 3.5 economyCalculatorService.js

Aggregates inputs \& computes per-round stats.

```js
class EconomyCalculatorService {
  static processGED(events) {
    // Extract kills, buys, round end
    // Use weapon values map to compute earnings
    return { enemyTeamEstimate: 3400, players: [...] };
  }

  static combineSources(gedData, gsiData, logData) {
    // Fallback logic
    return gedData || gsiData || logData;
  }
}

export default EconomyCalculatorService;
```


***

## 4. Fallback Manager

### fallbackManager.js

Switches between GED → GSI → ConsoleLog based on availability.

```js
import GSIService from '../services/gsiService.js';
import ConsoleLogService from '../services/consoleLogService.js';

class FallbackManager {
  static setup() {
    overwolf.games.events.getInfo(info => {
      if (!info.supportedFeatures.includes('live_game_data')) {
        GSIService.init();
        ConsoleLogService.init();
      }
    });
  }
}

export default FallbackManager;
```


***

## 5. UI Overlay

### overlay.html

Minimal HTML for rendering.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CS2 Helper</title>
</head>
<body>
  <div id="economy-info"></div>
  <script src="../services/economyCalculatorService.js"></script>
  <script src="overlay.js"></script>
</body>
</html>
```


### overlay.js

Listens for background messages and updates UI.

```js
overwolf.windows.onMessageReceived.addListener(msg => {
  if (msg.event === 'update-economy') {
    document.getElementById('economy-info').innerText =
      `Enemy team likely has $${msg.data.enemyTeamEstimate}`;
  }
});
```


***

## 6. Extensibility \& Best Practices

- **Service-Oriented Design**: Each service handles a single responsibility (guide patterns)[…overwolf-patterns-guide.md].
- **TypeScript Option**: Swap `.js` to `.ts` and enable strict configs with `@overwolf/types`.
- **Window Management**: Define all windows in manifest, use a single service for lifecycle.
- **Event-Driven**: Use Overwolf GameEvents API first; fallback to GSI or console logs.
- **Performance**: Keep overlay lightweight and only update on relevant events.

***

## 7. Getting Started

1. Clone repository.
2. `npm install` (include `overwolf-api-types`).
3. `npm run dev` → loads background and overlay windows.
4. Test in CS2 to validate event flow and overlay rendering.

---
This scaffold provides a **plug-and-play** CS2 overlay with a robust fallback system, modular services, and clear separation—ideal for rapid feature expansion and maintenance.

<div style="text-align: center">⁂</div>

[^1]: overwolf-patterns-guide.md

