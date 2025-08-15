# Repository Structure and Dependencies (events-sample-app)

```markdown
# events-sample-app Repository Overview

## Top-Level Files and Folders
- **.vscode/**  
  Configuration for VS Code, including `launch.json` and `settings.json`.
- **plugins/**  
  Contains compiled native DLL plugins (e.g., `simple-io-plugin.dll`).
- **public/**  
  Static assets and HTML pages delivered by the app:
  - **assets/**: icons and images (e.g., `icon.png`, `desktop_icon.ico`).  
  - **windows/**: HTML files for each app window (`index.html`, `in-game.html`).  
  - `manifest.json`: Overwolf app manifest defining metadata, permissions, windows, and required modules.
- **src/**  
  TypeScript source code:
  - **constants/**: static values (e.g., `window-names.ts`).
  - **overwolf-platform/**: platform-specific integration:
    - **config/**: GEP configuration (e.g., `game-data.ts`).
    - **consumers/**: event consumers (`gep-consumer.ts`).
    - **services/**: core services (e.g., `gep-service.ts`, `game-detection-service.ts`, `communication-host-service.ts`).
  - **types/**: TypeScript type definitions for modules and services (both base and extended versions).
  - **utils/**: utility functions (e.g., `assert-overwolf-success.ts`).
  - **windows/**: UI logic for each window (`index.ts`, `in-game.ts`).
- **Configuration and Tooling**
  - `package.json`: npm scripts, dependencies, and devDependencies.
  - `tsconfig.json` & related configs: TypeScript compilation settings.
  - `.eslintrc.json` & `.prettierrc`: linting and formatting rules.
  - `webpack.config.js`: bundling configuration for development and production.
  - `yarn.lock`: exact dependency versions.

## Key Dependencies
- **Overwolf API Packages**  
  - `overwolf.games.events` (GEP)  
  - `@overwolf/ow-events` (event emitter utilities)
- **UI Frameworks & Helpers**  
  - `tailwindcss` (utility-first CSS for styling)
  - `lit-html` or similar (for rendering HTML templates)
- **Build & Tooling**  
  - `typescript`, `ts-loader`, `webpack` (build pipeline)
  - `eslint`, `prettier` (code quality and formatting)
  - `jest` or `mocha` (unit testing frameworks, if present)

## Architectural Patterns
- **Service-Oriented**  
  Core logic is encapsulated in services (e.g., GEP subscription, game detection, window management), promoting separation of concerns.
- **Event-Driven**  
  Uses Overwolf’s GEP to listen for live game events, with consumers handling event dispatch to UI components.
- **Modular Type Definitions**  
  Base and extended type definitions in `src/types` ensure strict typing across the platform and simplify event/data handling.
```


# Game Events Querying and Usage in an Overwolf App

```markdown
# Integrating Live Game Events for Counter-Strike 2

## 1. Setting Up GEP (Game Events Provider)
1. **Initialize Required Features**  
```

import { GameDataConfig } from './overwolf-platform/config/game-data';
// On game-launch detection
app.overwolf.packages.gep.setRequiredFeatures([
'gep_internal',
'live_data',
'match_info',
]);

```
2. **Subscribe to Game Events**  
```

app.overwolf.packages.gep.on('new-game-event', (event, gameId, payload) => {
switch (payload.name) {
case 'kill':
handleKill(payload.data);
break;
case 'death':
handleDeath(payload.data);
break;
// ... other events
}
});

```
3. **Fetch Initial Game Info**  
```

app.overwolf.packages.gep.getInfo(currentGameId)
.then((info) => initUIWithInfo(info));

```

## 2. Available Info Updates for CS2
| Feature       | Category   | Key                  | Since GEP Ver. |
|---------------|------------|----------------------|---------------:|
| gep_internal  | gep_internal | version_info         |        143.0   |
| live_data     | live_data   | provider, player     |        237.0   |
| match_info    | match_info  | roster, game_mode    |        236.0   |
| match_info    | match_info  | match_outcome, elo   |        237.0   |
| live_data     | live_data   | score, round_number  |        237.0   |
| match_info    | match_info  | is_ranked, mm_state  |     239.0–253.0 |

## 3. Events Emitted by GEP for CS2
| Event Name   | Payload Data       | Fired When                          | Since GEP Ver. |
|--------------|--------------------|-------------------------------------|---------------:|
| match_start  | ― (null)           | Start of a match                    |        228.0   |
| match_end    | ― (null)           | End of a match                      |        228.0   |
| kill         | total kills (int)  | When local player gets a kill       |        235.0   |
| death        | total deaths (int) | When local player dies              |        235.0   |
| assist       | total assists (int)| When local player assists           |        235.0   |
| kill_feed    | detailed kill info | Any death by any player             |        236.0   |
| round_start  | ― (null)           | Beginning of each round             |        237.0   |
| round_end    | ― (null)           | End of each round                   |        237.0   |

## 4. Handling Event Status & Uptime
- Use Overwolf’s **Event Status Endpoints** to retrieve real-time availability for each feature.
- Example:
```

fetch('https://api.overwolf.com/events-status/counter-strike-2')
.then((res) => res.json())
.then((status) => toggleUI(status.live_data));

```
- React to downtime by disabling related UI components or showing warnings.

## 5. Example: Displaying Kill Count in In-Game Window
```

// in-game.ts
import { onNewGameEvent } from '../overwolf-platform/consumers/gep-consumer';

let killCount = 0;

// Subscribe to events when window loads
window.addEventListener('load', () => {
onNewGameEvent((payload) => {
if (payload.name === 'kill') {
killCount = payload.data;
document.getElementById('kill-counter').textContent = `${killCount}`;
}
});
});

```

## 6. Best Practices
- **Register Features Early:** Immediately after game launch to avoid missing initial events.
- **Modular Consumers:** Keep event-handling logic separate from UI rendering.
- **Status Monitoring:** Continuously poll or subscribe to event-status changes to handle feature unavailability gracefully.
- **Type Safety:** Leverage TypeScript definitions from `src/types` to ensure correct payload handling.
```

[Counter-Strike 2 Live Game Events Documentation]

[^2]: https://github.com/overwolf/events-sample-app

[^3]: https://github.com/overwolf/events-sample-app/tree/main/src

[^4]: https://github.com/overwolf/events-sample-app/tree/main/public

[^5]: https://github.com/overwolf/events-sample-app/tree/main/src/overwolf-platform

[^6]: https://dev.overwolf.com/ow-native/live-game-data-gep/live-game-data-gep-intro

[^7]: https://dev.overwolf.com/ow-native/live-game-data-gep/supported-games/dark-and-darker/

[^8]: https://feedback.tracker.gg/t/how-does-live-match-tracking-work/44697

[^9]: https://dev.overwolf.com/ow-native/live-game-data-gep/supported-games/peak/

[^10]: https://www.overwolf.com/app/tracker_network-counter-strike_2_tracker

[^11]: https://dev.overwolf.com/ow-native/live-game-data-gep/supported-games/counter-strike-2/

[^12]: https://dev.overwolf.com/ow-native/live-game-data-gep/supported-games/rematch/

[^13]: https://www.overwolf.com/browse-by-game/counter-strike-2

[^14]: https://dev.overwolf.com/ow-native/live-game-data-gep/supported-games/deprecated/overview

[^15]: https://www.overwolf.com/supported-games/

