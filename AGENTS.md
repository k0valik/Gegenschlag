# Agent.md - CS2 Economy Helper Development Instructions

## Project Context & Objectives

You are developing a **CS2 Economy Helper** - an Overwolf-based application that provides real-time enemy economy tracking, bomb timer, and scoped crosshair assistance. This is a **performance-critical gaming application** that must maintain <2% CPU usage and <50MB memory footprint while providing accurate tactical information.

**Key Requirements:**
- Overwolf platform integration (NOT standalone Electron.js)
- Real-time game data processing via Overwolf Game Events API
- VAC-compliant implementation (no memory manipulation/DLL injection)
- Precise enemy economy calculations with team synchronization
- Sub-100ms UI responsiveness during gameplay

## Architecture Overview Reference
1. **Strict Adherence to `Architecture.md`**

   * All code **must follow the architecture guidelines**.
   * Before implementing new features, **review `Architecture.md`** to ensure design integrity.
   * Changes impacting architecture must be documented in a `Proposals/` folder for review.
    Key architectural principles:

### Core Components
- **Background Service**: Persistent game event processing and data management
- **Economy Engine**: Mathematical model for enemy money estimation using kill feed, round outcomes, and statistical analysis  
- **Overlay System**: High-performance transparent UI with adaptive opacity
- **Synchronization Layer**: Team coordination via REST API with conflict resolution

2. **Overwolf SDK Usage**

   * Interact with the **Overwolf GEP (Game Events Provider)** for CS2 kill feed & telemetry.
   * Implement hotkey bindings, toggles, and UI overlays using Overwolf’s API.
   * Ensure **low CPU/GPU footprint** to avoid FPS drops.
   * Features must **work in standalone mode** without a central server (fallback mode).

3. **Performance Standards**

   * Minimize DOM reflows & repaints.
   * Avoid blocking the **main thread**.
   * Use **requestAnimationFrame** for UI updates where applicable.
   * Batch DOM updates, debounce expensive operations.

### Data Flow
```
CS2 Game Events → Overwolf API → Economy Engine → UI Overlay
                                      ↓
                              Server Sync ← → Team Members
```

## Development Standards & Quality Requirements

### Code Quality Standards
- **ES2022+ JavaScript** with modern async/await patterns
- **Error boundaries** with graceful degradation 
- **Memory leak prevention** - explicit cleanup in destructors
- **Performance profiling** - sub-10ms processing targets
- **Unit tests** for critical economy calculations

### Core Modules to Implement

src/
├── main/                     # Electron main process
├── renderer/                 # UI and overlay components  
├── economy/                  # Economy calculation engine
├── data/                     # CS2 economy data and rules
├── sync/                     # Team synchronization
├── utils/                    # Shared utilities
└── types/                    # TypeScript definitions

5. **Code Quality Requirements**

   * **TypeScript** for type safety.
   * **ESLint + Prettier** for linting & formatting.
   * Modular code organization:

     * `main/` → Overwolf main process logic
     * `renderer/` → UI & renderer logic
     * `services/` → data, game event handlers
     * `shared/` → constants, utility functions
   * All functions **must** have:

     * Clear JSDoc or TSDoc comments
     * Proper parameter validation
   * Zero **magic numbers** — use named constants.

### Performance Optimization
// Example: Efficient event processing
class EventProcessor {
    constructor() {
        this.eventQueue = new Map();
        this.processingThrottle = 16; // 60fps limit
    }
    
    processEvent(event) {
        // Batch processing to avoid frame drops
        requestAnimationFrame(() => this.batchProcess());
    }
}

   * Minimize DOM reflows & repaints.
   * Avoid blocking the **main thread**.
   * Use **requestAnimationFrame** for UI updates where applicable.
   * Batch DOM updates, debounce expensive operations.

### Performance Requirements
- **Memory Usage**: < 200MB total application footprint
- **CPU Usage**: < 5% during active gameplay
- **Startup Time**: < 3 seconds from launch to ready state
- **Response Time**: < 100ms for UI interactions
// Use efficient data structures
const playerMoney = new Map<string, number>(); // Not object literals
const economyHistory = new Array<EconomySnapshot>(30); // Fixed size arrays

// Implement object pooling for frequent allocations
class EconomyCalculator {
  private calculationPool = new Array<CalculationContext>(10);
  
  getCalculationContext(): CalculationContext {
    return this.calculationPool.pop() || new CalculationContext();
  }
}

### Memory Management
- **Explicit cleanup** in window close handlers
- **WeakMap/WeakSet** for temporary references  
- **Object pooling** for frequent allocations
- **Event listener cleanup** to prevent leaks
```typescript
// Proper cleanup patterns required
class EconomyTracker {
  private listeners: Set<Function> = new Set();
  
  dispose(): void {
    this.listeners.clear();
    // Clean up all references
  }
}

// Use weak references where appropriate
const cache = new WeakMap<Player, EconomyState>();
```

## Overwolf-Specific Implementation Guidelines

### Critical Overwolf Patterns
javascript
// Correct window communication
overwolf.windows.sendMessage(windowId, message, (result) => {
    if (!result.success) {
        this.handleCommunicationError(result);
    }
});

// Proper game events handling  
overwolf.games.events.setRequiredFeatures(['live_data', 'match_info'], (result) => {
    if (result.success) {
        this.initializeGameEventListeners();
    }
});

### State Management

// Immutable state patterns
interface AppState {
  readonly players: ReadonlyArray<Player>;
  readonly currentRound: number;
  readonly economyState: Readonly<EconomyState>;
}

// Use reducers for state transitions
function economyReducer(state: EconomyState, action: EconomyAction): EconomyState {
  switch (action.type) {
    case 'ROUND_END':
      return calculateNewEconomyState(state, action.payload);
    default:
      return state;
  }
}

### Async Operations

// Proper async/await usage with timeouts
async function fetchGameState(timeout = 5000): Promise<GameState> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch('/api/gamestate', { 
      signal: controller.signal 
    });
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

### Performance Requirements
- **Overlay rendering**: 60fps minimum, use `requestAnimationFrame`
- **Event processing**: <10ms per game event
- **Memory usage**: Monitor with `performance.memory`
- **Network requests**: Batch synchronization calls

## Task Breakdown & Implementation Order

### Phase 1: Foundation (Priority: CRITICAL)
1. **Manifest Configuration**
   - Game targeting (CS2 ID: 21640)
   - Required permissions and features
   - Window declarations with proper sizing

2. **Background Service Core**
   - Overwolf API initialization with error handling
   - Game event listener setup with feature validation
   - Window lifecycle management

3. **Economy Engine Foundation**
   - Kill reward constants (weapon-specific)
   - Round outcome processing logic
   - Player money estimation algorithms

### Phase 2: Core Features (Priority: HIGH)
4. **Game Event Processing**
   - Kill feed parsing with weapon identification
   - Round state tracking (live/freezetime/over)
   - Player roster data integration

5. **Overlay System**
   - Transparent window with clickthrough
   - Adaptive opacity based on game phase
   - Performance-optimized rendering

6. **Economy Calculations**
   - Enemy team money estimation ranges
   - Confidence scoring algorithms
   - Buy scenario predictions

### Phase 3: Advanced Features (Priority: MEDIUM)
7. **Team Synchronization**
   - REST API client with retry logic
   - Conflict resolution for estimate disagreements
   - Offline mode fallback

8. **Enhanced UI Components**
   - Bomb timer with precise countdown
   - Scoped crosshair for sniper rifles
   - Settings panel with hotkey configuration

## Code Implementation Standards


### Function Documentation Template
javascript
/**
 * Calculates enemy player money estimation based on game events
 * @param {Object} player - Player data from roster
 * @param {Array} killEvents - Recent kill feed events
 * @param {Object} roundData - Round outcome information
 * @returns {Object} Money estimation with min/max/likely values and confidence
 * @performance Target: <5ms execution time
 * @memory Allocates temporary objects - ensure cleanup
 */
function calculatePlayerEconomy(player, killEvents, roundData) {
    // Implementation with error handling and performance monitoring
}


### Error Handling Pattern
javascript
class EconomyEngine {
    processGameEvent(event) {
        try {
            this.validateEventData(event);
            const result = this.calculateEconomyUpdate(event);
            this.notifyObservers(result);
        } catch (error) {
            this.logError('Economy processing failed', error);
            this.fallbackToSafeState();
        }
    }
}


### Performance Monitoring
javascript
// Add performance tracking to critical functions
function performanceWrapper(fn, name) {
    return function(...args) {
        const start = performance.now();
        const result = fn.apply(this, args);
        const duration = performance.now() - start;
        
        if (duration > 10) { // Log slow operations
            console.warn(`Slow operation ${name}: ${duration}ms`);
        }
        
        return result;
    };
}


## Critical Implementation Notes

### Overwolf
**IMPORTANT**: This project uses **Overwolf**, NOT standalone Electron.js. Key differences:
- Use `overwolf.windows` instead of `BrowserWindow`
- Game events via `overwolf.games.events` API
- No Node.js modules available
- Limited to web APIs and Overwolf APIs

### Game Events Reliability
- Always validate event data existence before processing
- Implement fallback mechanisms for missing data
- Handle Overwolf API failures gracefully

### Economy Calculation Accuracy
- Use CS2-specific constants (kill rewards, round bonuses)
- Account for consecutive loss bonuses (1400→3400)
- Factor in equipment costs and survival bonuses
- Implement confidence decay over time

### UI Performance Optimization
- Use CSS transforms instead of changing layout properties
- Minimize DOM manipulations during game events
- Implement virtual scrolling for large player lists
- Cache computed styles and reuse elements

## Testing & Validation

### Unit Testing Priorities
1. **Economy calculations** - All money estimation functions
2. **Event processing** - Kill feed parsing accuracy  
3. **Synchronization logic** - Conflict resolution algorithms
4. **Performance benchmarks** - Memory and CPU usage validation

### Integration Testing
- Test with live CS2 matches
- Validate accuracy against known economy states
- Performance testing under high event load
- Team synchronization with multiple clients

### Quality Gates
- **Memory leaks**: Must pass 30-minute stress test
- **Performance**: <2% CPU usage during active gameplay
- **Accuracy**: Economy estimates within ±$500 (80% confidence)
- **Reliability**: <0.1% crash rate per gaming session

## Development Workflow

1. **Reference Architecture**: Always check architecture document for design decisions
2. **Performance First**: Profile before and after each implementation
3. **Incremental Testing**: Test each component with live CS2 data
4. **Error Logging**: Comprehensive logging for debugging in production
5. **Code Review**: Self-review against these standards before completion

## State-of-the-Art Practices

### Modern JavaScript Patterns
- Use `AbortController` for cancellable async operations
- Implement proper cleanup with `WeakRef` for observer patterns
- Utilize `IntersectionObserver` for efficient UI updates
- Apply `requestIdleCallback` for non-critical background tasks

### Performance Optimization Techniques
- **Object pooling** for frequently created game event objects
- **Batch API calls** to reduce Overwolf communication overhead  
- **Differential updates** - only sync changed economy data
- **Lazy loading** - defer initialization of inactive features

### Memory Management Best Practices
- **Explicit nullification** of references in cleanup methods
- **Event delegation** to reduce listener count
- **Circular reference detection** in complex object graphs
- **Regular garbage collection hints** during low-activity periods


# Success Metrics

Your implementation will be measured against:
1. **Accuracy**: Economy predictions within 15% of actual values
2. **Performance**: Consistent 60+ FPS overlay rendering
3. **Reliability**: <1% crash rate during 1000+ round testing
4. **User Experience**: <500ms response time for all interactions
5. **Code Quality**: Maintainability score >8/10 via static analysis

When you encounter design decisions or need clarification:
1. Reference this document and the conversation context
2. Propose solutions with trade-off analysis
3. Provide code examples for complex implementations
4. Ask specific, actionable questions

## **Final Notes**

* Always **think ahead for extendability** — the code should be easy to expand for future games/features.
* Optimize **build size and startup time**.
* Prioritize **user experience** — overlays should never disrupt gameplay.
* **Security is critical** — sandbox renderer, validate all inputs, prevent injection.
Remember: This is a **tactical advantage tool** for competitive CS2 players. Every millisecond of delay or inaccuracy impacts real gameplay outcomes. Code accordingly.