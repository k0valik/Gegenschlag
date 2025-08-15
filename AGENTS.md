# Agent Instructions: CS2 Helper Overlay Development

## Overview
You are tasked with developing a production-ready Overwolf Counter-Strike 2 companion app that captures live game events and renders an interactive in-game overlay. This project follows a service-oriented architecture with TypeScript, proper error handling, and multiple data source fallbacks.

**CRITICAL REFERENCE DOCUMENTS**: Always consult these files in priority order:
1. `architecture.md` - Primary architectural blueprint and implementation patterns
2. `CS2_Helper_boilerplate.md` - Service structure and modular design patterns
3. `overwolf-patterns-guide.md` - Universal development standards and TypeScript patterns
4. `sample_app.md` - Real-world implementation examples and GEP integration patterns

## Core Architecture Adherence

### 1. Follow the Established Architecture Pattern (architecture.md)
**CRITICAL**: Always reference `architecture.md` as your single source of truth for:
- High-level application structure with background/in-game/desktop windows
- Manifest configuration requirements (see Section 2: Manifest Skeleton)
- Background controller orchestration patterns (see Section 3: Background Controller)
- Game event adapter implementation (see Section 4: Game Event Adapter)
- Window management best practices (see Section 6: Modular Window Management)

```typescript
// From architecture.md - Background Controller Pattern
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
```

### 2. Service-Oriented Design Implementation (CS2_Helper_boilerplate.md)
Based on `CS2_Helper_boilerplate.md` Section 3 (Service Layer), implement these core services:

```typescript
// Required service structure from CS2_Helper_boilerplate.md
interface CoreServices {
  windowsService: WindowManagementService;     // Section 3.1 - Centralized window control
  gameEventsService: GameEventsService;       // Section 3.2 - Primary GEP data source
  gsiService: GSIService;                     // Section 3.3 - Valve GSI fallback
  consoleLogService: ConsoleLogService;       // Section 3.4 - Log parsing fallback
  economyCalculatorService: EconomyCalculatorService; // Section 3.5 - Business logic
  fallbackManager: FallbackManager;           // Section 4 - Data source orchestration
}
```

### 3. TypeScript Standards (overwolf-patterns-guide.md)
**MANDATORY**: Follow patterns from `overwolf-patterns-guide.md`:
- Use `@overwolf/types` package for strict typing (Section 2: TypeScript Standardization)
- Implement type-safe API wrappers around Overwolf SDK (Section 1: Service-Oriented Architecture)
- Enable strict TypeScript configurations (Best Practices Section 1)
- Create proper type definitions for all services and data structures

```typescript
// From overwolf-patterns-guide.md - Universal window management pattern
export class WindowsService {
  static obtainWindow = (name: string): Promise<WindowResult> => {
    return new Promise((resolve, reject) => {
      overwolf.windows.obtainDeclaredWindow(name, (result) => {
        result.success ? resolve(result) : reject(new Error(result.error));
      });
    });
  };
}
```

### 4. Real-World Implementation Examples (sample_app.md)
Reference `sample_app.md` for:
- Repository structure patterns (Top-Level Files and Folders section)
- GEP integration specifics (Section 1: Setting Up GEP)
- Available CS2 events and data (Sections 2-3: Info Updates and Events)
- Event handling best practices (Section 6: Best Practices)

## Development Standards & Quality Requirements

### Code Quality Standards (overwolf-patterns-guide.md Framework Integration)
1. **Zero Tolerance Policy**: No bugs, memory leaks, or performance issues
2. **TypeScript First**: All code must be strictly typed (overwolf-patterns-guide.md Section 2)
3. **Service Isolation**: Each service handles a single responsibility (overwolf-patterns-guide.md Section 1)
4. **Error Handling**: Comprehensive try-catch blocks and graceful degradation
5. **Performance**: <3ms overlay render time per frame (architecture.md Section 8)
6. **Memory Management**: Proper cleanup of listeners and intervals (overwolf-patterns-guide.md Section 3)

### Architecture Compliance Checklist (All Reference Documents)
Before implementing any component, verify:
- [ ] Does this follow the background → service → UI data flow? (architecture.md Section 1)
- [ ] Are window management calls centralized through WindowsService? (CS2_Helper_boilerplate.md Section 3.1)
- [ ] Is error handling implemented with proper fallbacks? (CS2_Helper_boilerplate.md Section 4)
- [ ] Are TypeScript types defined and used correctly? (overwolf-patterns-guide.md Section 2)
- [ ] Is the component properly cleaned up on destruction? (overwolf-patterns-guide.md Section 3)
- [ ] Are GEP features registered according to sample patterns? (sample_app.md Section 1)

## Task Breakdown & Implementation Approach

### Phase 1: Foundation Setup (architecture.md + sample_app.md)
```typescript
// 1. Create manifest.json following architecture.md Section 2 specifications
// 2. Implement WindowsService following overwolf-patterns-guide.md universal pattern
// 3. Setup background controller per architecture.md Section 3
// 4. Establish TypeScript build pipeline with sample_app.md dependency patterns
```

### Phase 2: Data Services Implementation (CS2_Helper_boilerplate.md + sample_app.md)
```typescript
// 1. GameEventsService - Primary GEP integration per sample_app.md Section 1
// 2. GSIService - HTTP polling fallback (CS2_Helper_boilerplate.md Section 3.3)
// 3. ConsoleLogService - File/media reading fallback (CS2_Helper_boilerplate.md Section 3.4)
// 4. FallbackManager - Intelligent source switching (CS2_Helper_boilerplate.md Section 4)
```

### Phase 3: Business Logic (CS2_Helper_boilerplate.md)
```typescript
// 1. EconomyCalculatorService - Core calculation engine (Section 3.5)
// 2. Data aggregation and validation across sources
// 3. Real-time update mechanisms with batching
```

### Phase 4: UI Implementation (architecture.md)
```typescript
// 1. In-game overlay per architecture.md Section 5
// 2. Desktop window for detailed analytics
// 3. Hotkey handling and window state management (architecture.md Section 2)
```

## Performance & Optimization Requirements

### Rendering Optimization (architecture.md Section 5)
- **Batch Updates**: Group DOM updates, render max every 100ms (architecture.md UX tip)
- **Efficient Selectors**: Cache DOM elements, avoid repeated queries
- **Memory Cleanup**: Remove all event listeners on component destruction (overwolf-patterns-guide.md Section 3)
- **Lightweight Overlay**: Keep in-game window minimal and focused (architecture.md Section 1)

### Data Processing Optimization (sample_app.md + CS2_Helper_boilerplate.md)
- **Debounce Events**: Prevent excessive processing of rapid game events
- **Smart Caching**: Cache calculated values, only recompute when necessary
- **Background Processing**: Keep heavy calculations in background window (architecture.md Section 1)
- **Fallback Logic**: Implement intelligent switching per CS2_Helper_boilerplate.md Section 4

## Error Handling & Resilience

### Comprehensive Error Strategy (overwolf-patterns-guide.md)
```typescript
// Template for all async operations - following overwolf-patterns-guide.md patterns
try {
  const result = await riskOperation();
  return processResult(result);
} catch (error) {
  console.error(`Operation failed: ${error.message}`);
  // Implement fallback strategy per CS2_Helper_boilerplate.md Section 4
  return await fallbackOperation();
}
```

### Specific Error Scenarios (CS2_Helper_boilerplate.md + sample_app.md)
1. **GEP Unavailability**: Automatic fallback to GSI → Console Logs (CS2_Helper_boilerplate.md Section 4)
2. **Window Management Failures**: Retry with exponential backoff (architecture.md Section 6)
3. **Data Parsing Errors**: Validate and sanitize all inputs (sample_app.md Section 6)
4. **Network Issues**: Implement timeout and retry mechanisms
5. **Feature Support**: Handle missing GEP features gracefully (sample_app.md Section 4)

## State-of-the-Art Practices (overwolf-patterns-guide.md)

### Modern Development Approaches (overwolf-patterns-guide.md Development Standards)
1. **Reactive State Management**: Use observables/event emitters for data flow
2. **Functional Programming**: Prefer pure functions and immutable operations
3. **Async/Await**: Modern async patterns instead of callbacks
4. **Module Boundaries**: Clear imports/exports with proper dependency injection
5. **Testing Strategy**: Unit tests for all services and critical functions

### Performance Monitoring (architecture.md Section 8)
```typescript
// Implement performance tracking per architecture.md testing requirements
class PerformanceMonitor {
  static trackRenderTime(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const duration = performance.now() - start;
    if (duration > 3) { // architecture.md <3ms requirement
      console.warn(`${componentName} render took ${duration}ms`);
    }
  }
}
```

## Implementation Guidelines

### When Writing Code (All Reference Documents)
1. **Start with Types**: Define interfaces before implementation (overwolf-patterns-guide.md Section 2)
2. **Service First**: Implement service layer before UI components (CS2_Helper_boilerplate.md approach)
3. **Test Boundaries**: Test each service in isolation (overwolf-patterns-guide.md Section 4)
4. **Progressive Enhancement**: Build core features first, add enhancements
5. **Documentation**: Comment complex algorithms and business logic
6. **GEP Integration**: Follow sample_app.md patterns for event handling

### Code Review Checklist (All Reference Documents)
Before submitting any code, verify:
- [ ] All TypeScript errors resolved (overwolf-patterns-guide.md standards)
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented (CS2_Helper_boilerplate.md Section 4)
- [ ] Memory cleanup verified (no leaked listeners) (overwolf-patterns-guide.md Section 3)
- [ ] Performance requirements met (architecture.md <3ms rule)
- [ ] Architecture patterns followed (architecture.md compliance)
- [ ] Fallback strategies implemented (CS2_Helper_boilerplate.md Section 4)
- [ ] GEP features properly registered (sample_app.md Section 1)

## Integration Points

### Overwolf SDK Integration (overwolf-patterns-guide.md + sample_app.md)
```typescript
// Always wrap Overwolf APIs with proper error handling
// Following overwolf-patterns-guide.md universal patterns
class OverwolfAPIWrapper {
  static async safeCall<T>(
    apiCall: (callback: (result: any) => void) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        apiCall((result) => {
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
```

### CS2-Specific Game Events (sample_app.md)
Reference sample_app.md for:
- **Available Events** (Section 3): kill, death, assist, round_start, round_end, match_start, match_end
- **Info Updates** (Section 2): live_data, match_info, gep_internal
- **Event Status Monitoring** (Section 4): Handle feature unavailability gracefully
- **Best Practices** (Section 6): Register features early, modular consumers, type safety

### External Dependencies (sample_app.md + overwolf-patterns-guide.md)
- **Build Tools**: Use Vite/Webpack for optimal bundle generation (sample_app.md tooling)
- **Testing**: Jest for unit tests, Overwolf dev tools for integration testing
- **TypeScript**: Follow sample_app.md dependency patterns with strict configs

## Quality Assurance

### Testing Requirements (overwolf-patterns-guide.md + architecture.md)
1. **Unit Tests**: All service methods must have corresponding tests
2. **Integration Tests**: Test service interactions and data flow
3. **Performance Tests**: Verify render times and memory usage (architecture.md Section 8)
4. **Manual Testing**: Full CS2 gameplay session validation (architecture.md Section 8)
5. **GEP Testing**: Validate event reception and feature availability (sample_app.md Section 6)

### Code Standards Enforcement (overwolf-patterns-guide.md)
- ESLint with strict rules for TypeScript (Development Standards Section)
- Prettier for consistent formatting
- Pre-commit hooks for quality gates
- Automated bundle analysis for size optimization (Best Practices Section)

## Final Deliverables

### Production Checklist (All Reference Documents)
- [ ] All services implemented with proper fallbacks (CS2_Helper_boilerplate.md)
- [ ] TypeScript compilation without errors or warnings (overwolf-patterns-guide.md)
- [ ] Performance benchmarks met (<3ms render time) (architecture.md)
- [ ] Memory leaks eliminated (verified with DevTools) (overwolf-patterns-guide.md)
- [ ] Error handling covers all edge cases (CS2_Helper_boilerplate.md Section 4)
- [ ] Full CS2 match testing completed (architecture.md Section 8)
- [ ] OPK bundle generated and validated (architecture.md Section 9)
- [ ] GEP features properly registered and tested (sample_app.md Section 6)

### Documentation Requirements
- Service API documentation with examples (referencing sample_app.md patterns)
- Architecture decision rationale (based on architecture.md principles)
- Performance optimization explanations (architecture.md Section 8)
- Troubleshooting guide for common issues (CS2_Helper_boilerplate.md fallback scenarios)
- GEP integration guide (sample_app.md implementation patterns)

---

**Remember**: This project's success depends on strict adherence to the architectural patterns outlined in all reference documents. Always prioritize code quality, performance, and user experience. When in doubt:
1. **Architecture Questions** → Refer to `architecture.md`
2. **Service Implementation** → Follow `CS2_Helper_boilerplate.md`
3. **TypeScript & Standards** → Check `overwolf-patterns-guide.md`
4. **GEP Integration** → Use `sample_app.md` examples

Maintain the service-oriented, fallback-enabled approach throughout development while following the established patterns from all reference documentation.
