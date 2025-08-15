# CS2 Economy & Strategic Overlay - Master PRD

## Document Information
- **Document Type:** Product Requirements Document  
- **Version:** 1.0
- **Focus:** Economy Tracking with Modular Overwolf Implementation
- **Architecture:** Complex modular system with shared core packages
- **Platform:** Overwolf (primary) with Electron development shell

---

## 1. Executive Summary

### 1.1 Product Overview
A modular Counter-Strike 2 strategic overlay application built on Overwolf platform, focusing primarily on **real-time economy tracking** with additional strategic modules (Bomb Timer, Crosshair Overlay). The application uses a sophisticated shared-core architecture enabling rapid feature development while maintaining VAC compliance through Overwolf's secure runtime.

### 1.2 Problem Statement
Competitive CS2 players lack visibility into enemy team economics and precise strategic timing information, leading to suboptimal tactical decisions and missed opportunities in high-stakes scenarios.

### 1.3 Solution Architecture
```
┌──────────────────────────────────┐  ← business logic, economy engine,
│  packages/core (TS)              │     bomb timer, crosshair state
│  - event bus, models             │
└──────────────┬───────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───────────────┐    ┌────────────────┐
│ Overwolf App  │    │ Electron Shell │  (dev/testing)
│ - OW windows  │    │ - mock GEP     │
│ - GEP bridge  │    │ - same UI      │
│ - OW hotkeys  │    │ - dev tools    │
└───────┬───────┘    └────────────────┘
        ▼
┌──────────────┐
│ UI (React)   │  ← packages/ui
│ - overlay    │
│ - modules    │
└──────────────┘
```

---

## 2. Product Goals & Objectives

### 2.1 Primary Goals
- **Economy Intelligence:** Provide accurate enemy team economy estimation with ±$300 median error by round 5
- **Strategic Advantage:** Real-time tactical information through minimal, performance-optimized overlay
- **Modular Growth:** Architecture supporting rapid addition of new strategic modules
- **VAC Safety:** 100% compliance through Overwolf's secure runtime environment

### 2.2 Success Metrics
- **Performance:** ≤50ms perceived update latency, <2-3 FPS impact, 99% crash-free sessions
- **Accuracy:** Economy estimates >95% within predicted ranges
- **Adoption:** 80% module retention after 3 sessions, 10,000 active users within 6 months
- **Technical:** <3s startup time, <5% CPU usage, <200MB RAM consumption

### 2.3 User Retention KPIs
- 80% of users keep at least one module enabled after 3 sessions
- 70%+ weekly active user retention
- >4.5/5 community rating
- <5% support ticket rate

---

## 3. Target Users & Personas

### 3.1 Primary Persona: Competitive Player "Alex"
- **Demographics:** 18-25, 2000+ hours CS2, Premier/FaceIt player
- **Primary Need:** Enemy economy visibility for tactical buy decisions
- **Usage:** Daily 2-4 hour sessions, primarily economy tracking module
- **Pain Points:** Uncertainty about force-buy rounds, missed strategic opportunities

### 3.2 Secondary Persona: Team IGL "Sarah" 
- **Demographics:** 20-28, In-Game Leader, semi-professional team
- **Primary Need:** Comprehensive tactical intelligence for team calls
- **Usage:** All modules active, team practice/scrimmage sessions
- **Pain Points:** Limited strategic intelligence, difficult team coordination

### 3.3 Content Creator "Mike"
- **Demographics:** 22-30, CS2 educational content, streaming
- **Primary Need:** Real-time analysis tools for audience engagement
- **Usage:** Streaming with visible overlays, educational content creation
- **Pain Points:** Need for explanatory tools, audience entertainment value

---

## 4. Core Feature Requirements

### 4.1 PRIMARY: Economy Tracking Engine

#### 4.1.1 Functional Requirements
**Core Engine (packages/core/economy)**
```typescript
interface EconomyEngine {
  // Per-player state tracking
  trackPlayer(steamId: string, team: 'CT' | 'T'): PlayerEconomyState
  
  // Event processing
  processKill(event: KillEvent): void
  processRoundEnd(event: RoundEndEvent): void
  processBombEvent(event: BombEvent): void
  
  // Estimation output
  generateSnapshot(): EconomySnapshot
  applyFeedback(playerId: string, tag: FeedbackTag): void
}

interface PlayerEconomyState {
  minMoney: number
  maxMoney: number
  medianEstimate: number  // rounded to $50
  confidence: number      // 0-100%
  lastSeenWeapons: string[]
  survivalBonus: boolean
}
```

**User Stories:**
- As a competitive player, I want real-time enemy economy ranges so I can predict force-buy rounds
- As an IGL, I want team feedback integration to refine economy estimates collaboratively  
- As a strategic player, I want confidence indicators to understand estimate reliability

**Acceptance Criteria:**
- Track individual player economy ranges (min/max/median rounded to $50)
- Process GEP events: kills, deaths, round results, bomb plants/defuses
- Handle loss bonus progression, kill rewards, objective bonuses
- Support feedback tags: `eco`, `force1`, `force2`, `full` to tighten ranges
- Emit `EconomySnapshot` each round with confidence levels
- Maintain accuracy >95% within predicted ranges
- Optional team sync for collaborative estimation refinement

#### 4.1.2 UI Requirements  
**Economy Panel (packages/ui/economy)**
- Compact table showing both teams with money ranges
- Color-coded confidence levels (high/medium/low)
- Quick feedback buttons for user input
- Expandable detailed view with individual player history
- Customizable positioning and transparency

### 4.2 Bomb Timer Module

#### 4.2.1 Functional Requirements
**Timer Engine (packages/core/bomb)**
```typescript
interface BombTimer {
  onPlant(timestamp: number): void
  onDefuseStart(timestamp: number): void  
  onDefuseStop(): void
  getCurrentState(): BombState
  
  // High-resolution timing
  getRemainingMs(): number
  getDefuseSuccess(): boolean
}
```

**User Stories:**
- As a clutch player, I want precise bomb countdown for defuse decisions
- As a player, I want visual/audio alerts at critical timing intervals
- As a spectator, I want clear timing information for round tension

**Acceptance Criteria:**
- Detect plant/defuse events from GEP with sub-second precision
- 40-second countdown with 10-20Hz visual updates  
- Defuse time calculation and success probability
- Configurable audio alerts (10s, 5s default)
- Visual countdown with customizable appearance

#### 4.2.2 UI Requirements
**Timer Widget (packages/ui/bomb)**
- Minimal countdown display with remaining time
- Progress bar or circular timer visualization
- Defuse success/failure prediction indicator
- Audio alert configuration
- Quick hide/show toggle

### 4.3 Crosshair Overlay Module

#### 4.3.1 Functional Requirements  
**Crosshair State (packages/core/crosshair)**
```typescript
interface CrosshairState {
  currentWeapon: string
  isScopeActive: boolean
  showDot: boolean
  quickScopeDecay: number // ms remaining
}

const SCOPED_WEAPONS = ['weapon_ssg08', 'weapon_awp', 'weapon_scar20']
```

**User Stories:**
- As a sniper, I want a center dot visible when using scoped weapons
- As a quick-scope player, I want dot persistence during weapon transitions
- As a customization user, I want configurable dot appearance and behavior

**Acceptance Criteria:**
- Detect scoped weapon equipped state from GEP
- Show customizable center dot (size, color, opacity)
- Quick-scope persistence with configurable decay (500-1000ms)
- Per-weapon settings and overrides
- Minimal performance impact on gameplay

#### 4.3.2 UI Requirements
**Crosshair Overlay (packages/ui/crosshair)**
- Canvas-based dot rendering for performance
- Real-time weapon state detection
- Customizable appearance (size, color, opacity)
- Quick-scope timing configuration
- Per-weapon enable/disable settings

---

## 5. Technical Architecture

### 5.1 Modular Package Structure
```
packages/
├── core/                     # Pure TypeScript business logic
│   ├── economy/             # Economy tracking engine
│   ├── bomb/                # Bomb timer logic  
│   ├── crosshair/           # Crosshair state management
│   ├── events/              # Event bus and normalization
│   ├── store/               # Persistence layer
│   └── net/                 # Optional networking (team sync)
├── ow-bridge/               # Overwolf integration layer
│   ├── gep.ts              # Game Events Provider wrapper
│   ├── windows.ts          # Overwolf window management
│   └── hotkeys.ts          # Overwolf hotkey system
├── ui/                      # React UI components
│   ├── economy/            # Economy panel components
│   ├── bomb/               # Bomb timer widgets
│   ├── crosshair/          # Crosshair overlay
│   └── settings/           # Configuration interface
└── types/                   # Shared TypeScript interfaces

apps/
├── overwolf/                # Production Overwolf app
│   ├── manifest.json       # Overwolf configuration
│   ├── windows/            # Overlay window definitions
│   └── src/                # Overwolf-specific bootstrap
└── electron/                # Development shell (optional)
    ├── main.ts             # Electron main process
    ├── mock-gep.ts         # Mock game events
    └── dev-tools.ts        # Development utilities
```

### 5.2 Data Sources Integration

#### 5.2.1 Primary: Game State Integration (GSI)
```typescript
interface GSIProvider {
  // Real-time game state from CS2's official API
  connect(): Promise<void>
  onRoundStart(callback: (data: RoundData) => void): void
  onPlayerUpdate(callback: (data: PlayerData) => void): void
  onWeaponChange(callback: (data: WeaponData) => void): void
}
```

#### 5.2.2 Secondary: Console Log Parsing  
```typescript
interface ConsoleLogProvider {
  // Parse CS2 console output for additional events
  watchLogFile(path: string): void
  parseKillFeed(line: string): KillEvent | null
  parseBombEvents(line: string): BombEvent | null
  parseEconomyHints(line: string): EconomyHint | null
}
```

#### 5.2.3 Tertiary: Screen Analysis (Future)
```typescript
interface ScreenAnalysisProvider {
  // Backup validation and data source
  captureGameRegion(region: Rectangle): ImageData
  detectBuyMenuState(): BuyMenuData | null
  validateEconomyEstimates(): ValidationResult
}
```

### 5.3 Event Flow Architecture
```
GEP/GSI Events → ow-bridge → Core Event Bus → Module Handlers → UI Updates
                    ↓
             Console Logs → Log Parser → Event Bus ← Screen Analysis (Future)
```

**Event Processing Pipeline:**
1. **Input Layer:** Multiple data sources feed normalized events
2. **Processing Layer:** Core modules update their state  
3. **Output Layer:** UI components reflect current state
4. **Persistence Layer:** Settings and session data storage
5. **Network Layer:** Optional team synchronization

### 5.4 Performance Optimization Strategy

#### 5.4.1 Rendering Performance
- React memoization for overlay components
- Canvas-based rendering for crosshair (GPU-optimized)
- RAF throttling for high-frequency updates
- Minimal DOM operations during gameplay

#### 5.4.2 Data Processing Performance  
- Batch GEP event processing (micro-queue)
- Efficient state diffing for UI updates
- Memory-efficient player state tracking
- Configurable update frequencies per module

#### 5.4.3 Resource Management
- Lazy module loading (disabled modules don't load)
- Memory cleanup on match end
- Efficient event listener management
- Background CPU usage monitoring

---

## 6. Overwolf Implementation Details

### 6.1 Overwolf Manifest Configuration
```json
{
  "manifest_version": 1,
  "type": "WebApp",
  "meta": {
    "name": "CS2 Strategic Overlay",
    "version": "1.0.0",
    "minimum-overwolf-version": "0.77.10",
    "author": "CS2 Strategic Team",
    "icon": "icon.png",
    "launcher_icon": "launcher_icon.ico",
    "description": "Real-time economy tracking and strategic overlay for CS2"
  },
  "permissions": ["Hotkeys", "GameInfo"],
  "data": {
    "start_window": "background",
    "windows": {
      "background": {
        "file": "background.html",
        "is_background_page": true,
        "allow_local_file_access": true
      },
      "overlay": {
        "file": "overlay.html",
        "transparent": true,
        "override_on_update": true,
        "size": {"width": 1920, "height": 1080},
        "start_position": {"top": 0, "left": 0}
      }
    },
    "game_targeting": {
      "type": "dedicated",
      "game_ids": [21640]
    },
    "game_events": [
      {"event_id": "live_client_data", "event_data": ["live_data"]},
      {"event_id": "match_info", "event_data": ["match_info"]}, 
      {"event_id": "kill_feed", "event_data": ["kill_feed"]}
    ]
  }
}
```

### 6.2 Game Events Integration
```typescript
class OverwolfGEPBridge {
  async initialize() {
    await overwolf.games.events.setRequiredFeatures(['live_data', 'match_info'])
    
    overwolf.games.events.onNewEvents.addListener(this.handleGameEvents.bind(this))
    overwolf.games.events.onInfoUpdates2.addListener(this.handleInfoUpdates.bind(this))
  }
  
  private handleGameEvents(events: OverwolfGameEvent[]) {
    events.forEach(event => {
      switch(event.name) {
        case 'kill':
          this.eventBus.emit('kill', this.normalizeKillEvent(event))
          break
        case 'round_end':  
          this.eventBus.emit('roundEnd', this.normalizeRoundEnd(event))
          break
        case 'bomb_planted':
          this.eventBus.emit('bombPlant', this.normalizeBombEvent(event))
          break
      }
    })
  }
}
```

### 6.3 Window Management
```typescript
class OverlayWindowManager {
  private windows: Map<string, OverwolfWindow> = new Map()
  
  async createModuleWindow(moduleId: string, config: WindowConfig) {
    const window = await overwolf.windows.obtainDeclaredWindow(moduleId)
    await overwolf.windows.restore(window.window.id)
    
    this.windows.set(moduleId, window)
    return window
  }
  
  async toggleModule(moduleId: string, visible: boolean) {
    const window = this.windows.get(moduleId)
    if (!window) return
    
    if (visible) {
      await overwolf.windows.restore(window.window.id)
    } else {
      await overwolf.windows.minimize(window.window.id)
    }
  }
}
```

---

## 7. Development Roadmap

### 7.1 Phase 1: Core Foundation (Weeks 1-4)

**Week 1-2: Architecture Setup**
- Repository structure and package configuration
- Core event bus and module system
- Overwolf GEP integration foundation
- Basic UI framework with React

**Week 3-4: Economy Engine MVP**
- Player state tracking implementation
- Kill/death/round event processing
- Basic economy calculation logic  
- Simple overlay panel UI

**Deliverables:**
- Functional economy tracking for basic scenarios
- Overwolf overlay displaying enemy team money ranges
- Core architecture supporting module expansion

### 7.2 Phase 2: Feature Completion (Weeks 5-8)

**Week 5-6: Bomb Timer & Crosshair**
- Bomb timer module implementation
- Crosshair overlay with weapon detection
- Module enable/disable system
- Settings persistence

**Week 7-8: Polish & Integration**
- User feedback system for economy refinement
- Hotkey controls and customization
- Performance optimization pass
- Comprehensive testing

**Deliverables:**
- Complete three-module system (Economy, Timer, Crosshair)
- Customizable overlay with user settings
- Production-ready Overwolf package

### 7.3 Phase 3: Advanced Features (Weeks 9-12)

**Week 9-10: Data Sources Expansion**
- Console log parsing implementation
- Multi-source data validation
- Enhanced accuracy through source correlation
- Confidence scoring improvements

**Week 11-12: Team Features & Analytics**
- Optional team synchronization
- Historical match data
- Performance analytics dashboard
- Advanced customization options

**Deliverables:**
- Multi-source data integration
- Team collaboration features
- Analytics and historical tracking

### 7.4 Phase 4: Optimization & Scale (Weeks 13-16)

**Weeks 13-14: Performance & Stability**
- Memory usage optimization
- CPU usage minimization  
- Error handling and recovery
- Stress testing with synthetic data

**Weeks 15-16: Distribution Preparation**
- Overwolf Store submission preparation
- Documentation and user guides
- Beta testing program
- Community feedback integration

**Deliverables:**
- Production-optimized application
- Overwolf Store ready package
- Comprehensive user documentation

---

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|---------|-------------|-------------------|
| GEP API Changes | High | Medium | Modular architecture, multiple data sources |
| Performance Issues | Medium | Low | Continuous profiling, optimization focus |
| Overwolf Platform Changes | Medium | Low | Direct communication, architectural flexibility |
| Data Source Reliability | Medium | Medium | Multi-source validation, graceful degradation |

### 8.2 Business Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|---------|-------------|-------------------|
| VAC Policy Changes | High | Low | Overwolf compliance, no direct game access |
| Market Competition | Medium | High | Unique feature focus, superior UX |
| User Adoption Challenges | Medium | Medium | Strong beta program, community engagement |
| Platform Revenue Share | Low | High | Accept 30% Overwolf share, focus on volume |

---

## 9. Compliance & Requirements

### 9.1 VAC Compliance
- **100% Overwolf Runtime:** No direct game process interaction
- **External Process Only:** All logic runs outside CS2 process space
- **Official APIs Only:** GSI, console logs, screen capture (no memory access)
- **Regular Validation:** Continuous compliance testing

### 9.2 Platform Requirements
- **Overwolf Client:** Minimum version 0.77.10 required
- **CS2 Compatibility:** Current and future game updates
- **Windows Support:** Windows 10/11 64-bit primary platform
- **Hardware Requirements:** CS2 minimum + 10% overhead

### 9.3 Privacy & Data Handling
- **Local Processing:** All data processed locally, no cloud transmission
- **Optional Telemetry:** Anonymous usage statistics with user consent
- **Team Sync:** Opt-in collaborative features with minimal data sharing
- **No PII Collection:** Steam IDs only, no personal information

---

## 10. Success Metrics & KPIs

### 10.1 Technical Performance Targets
- **Response Time:** <50ms GEP event to UI update
- **Resource Usage:** <5% CPU, <200MB RAM peak
- **Accuracy:** >95% economy estimates within predicted ranges  
- **Stability:** >99% crash-free sessions
- **Startup:** <3s application ready state

### 10.2 User Adoption Metrics
- **Downloads:** 1,000+ first month, 10,000+ within 6 months
- **Retention:** 80% module usage after 3 sessions, 70% weekly active
- **Satisfaction:** >4.5/5 community rating, <5% support tickets
- **Growth:** 20%+ month-over-month user growth

### 10.3 Feature Usage Analytics
- **Economy Module:** Primary feature, target 90%+ adoption
- **Bomb Timer:** Secondary feature, target 60%+ adoption  
- **Crosshair Overlay:** Specialized feature, target 40%+ adoption
- **Team Sync:** Advanced feature, target 20%+ adoption

---

## 11. Future Roadmap & Extensions

### 11.1 Short-term Extensions (6-9 months)
- Machine learning integration for predictive economy modeling
- Advanced screen analysis for buy menu detection
- Mobile companion app for team coordination
- Integration APIs for streaming software

### 11.2 Medium-term Expansion (9-18 months)  
- Multi-game support (Valorant, CS:GO compatibility)
- Professional tournament tools and analysis
- Advanced analytics and coaching features
- Educational platform integration

### 11.3 Long-term Vision (18+ months)
- AI-powered strategic recommendations
- Professional team partnership program  
- Tournament integration and official support
- Platform expansion beyond Windows

---

This master PRD consolidates all three original documents while maintaining focus on economy tracking as the primary feature, Overwolf as the primary platform, and complex modular architecture for extensibility. The document preserves all unique features and technical approaches from the source materials while presenting a coherent, implementable vision.