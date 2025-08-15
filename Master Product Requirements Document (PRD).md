<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Master Product Requirements Document (PRD)

## CS 2 Economy Helper Overlay

### Document Information

| Field | Value |
| :-- | :-- |
| Document Type | Product Requirements Document |
| Version | 1.0 (Consolidated) |
| Date | 2025-08-15 |
| Author | Consolidated Working Group |
| Status | Draft |
| Approvers | Product Owner, Tech Lead, UX Lead |


***

## 1  Executive Summary

Competitive Counter-Strike 2 (CS 2) players lack real-time insight into enemy and teammate economy, frequently misjudge force-buy windows, and lose rounds to mistimed bomb defuses. The **CS 2 Economy Helper Overlay** is a **VAC-compliant Overwolf application**—built with Electron under the hood—that delivers accurate economy estimation as its core value, with a modular architecture that accommodates a bomb timer, scoped-crosshair dot, and future analytical add-ons. The overlay aims to become the de-facto in-game decision aid while remaining lightweight, safe, and infinitely extensible.

***

## 2  Product Goals \& Objectives

| Goal | KPI / Success Metric |
| :-- | :-- |
| **Economy Insight** | ≥95% estimation accuracy by round 5; median error ≤ \$300 |
| **Low Overhead** | ≤3 s cold start; ≤5% CPU; ≤200 MB RAM; ≤2–3 FPS impact |
| **User Adoption** | 10 000 monthly active users in 6 months; ≥4.5 ★ store rating |
| **Retention** | 80% of users keep economy overlay enabled after 3 sessions |
| **Stability** | Crash-free session rate ≥99% |
| **Extensibility** | New feature module integrated in ≤1 sprint with no core refactor |


***

## 3  Target Users \& Personas

| Persona | Goals | Pain Points | Usage Pattern |
| :-- | :-- | :-- | :-- |
| **Alex – Competitive Player** | Rank up, win clutch rounds | Guesswork on enemy buys | Daily ranked, 2-4 h |
| **Sarah – IGL / Team Captain** | Call optimal strats | Hard to track full-team finances | Scrims \& tourneys |
| **Mike – Content Creator** | Entertain \& educate audience | Needs clear, stream-safe overlays | Streaming sessions |
| **Secondary:** Coaches, Analysts, Casual improvers, Stat enthusiasts |  |  |  |


***

## 4  Feature Scope \& Phasing

Primary value is **Economy Tracking**; timer and crosshair are complementary. Features are grouped into phased releases to reduce time-to-market and maintain clear priorities.

### 4.1  MVP (v0.9) — 8 weeks

| Feature | Description | Acceptance Criteria |
| :-- | :-- | :-- |
| **Economy Tracking Engine** | Real-time min/max/median money per enemy | -  Updates ≤100 ms after GEP event<br>-  Force-buy vs full-buy prediction<br>-  Confidence % indicator |
| **Economy Overlay Panel** | Compact draggable table | -  Player icons, money range, weapon probability<br>-  Hotkeys: toggle panel, “feedback” buttons (eco/force/full) |
| **Configuration Management** | Settings UI \& persistence | -  Enable/disable modules, hotkey remap, theme switch<br>-  Local JSON store (Overwolf storage API) |
| **Core Infrastructure** | Event bus, module loader, logging | -  Pure TS packages/core; no Overwolf imports<br>-  Test harness with mock GEP |

### 4.2  Phase 1 (v1.0) — +4 weeks

| Feature | Description |
| :-- | :-- |
| **Bomb Timer Module** | 40 s countdown, defuse helper, audio cues |
| **Scoped Crosshair Dot** | Smart center-dot when holding AWP/SSG08/SCAR20 |
| **Overlay Theme System** | Minimal / detailed / streamer presets |

### 4.3  Phase 2 (v1.1) — +6 weeks

| Feature | Description |
| :-- | :-- |
| **Historical Analytics** | Post-match economy charts, loss-bonus timelines |
| **Smart Notifications** | Context-aware buy suggestions, eco warnings |
| **Integration Hooks** | Discord Rich Presence \& WebSocket API |

### 4.4  Phase 3 (v1.2+) — Continuous

| Option | Notes |
| :-- | :-- |
| Mobile companion app | Push round summaries |
| Third-party stats | Leetify/FaceIt import adapters |
| Team sync server | Real-time shared economy board |


***

## 5  Functional Requirements

### 5.1  Data Acquisition

1. **Primary:** Overwolf Game Events Provider (GEP) for CS 2
2. **Fallback:** Console-log parsing (guard against GEP gaps)
3. **Optional Tertiary:** Pixel OCR module (future, disabled by default)

### 5.2  Economy Engine Rules

- Tracks \$800 pistol start, kill rewards, plant/defuse, equipment values
- Calculates min/max range per enemy; snaps median to \$50 increments
- Incorporates user feedback tags to tighten confidence intervals
- Emits `EconomySnapshot` at round end and on significant delta


### 5.3  Bomb Timer Logic

- Listens to `BombPlanted` event → starts high-resolution timer
- Projects CT defuse success with/without kit; colour-codes urgency
- Emits 10 s / 5 s audio pings (user-configurable)


### 5.4  Crosshair Overlay

- Monitors `WeaponChanged`; if scoped, shows dot with 500 ms persistence
- Zero CPU overlay: CSS transform, GPU compositing


### 5.5  Settings \& Persistence

- JSON schema‐validated settings file (`config.json`)
- Hot-reloads when edited; migration system for new versions

***

## 6  Non-Functional Requirements

| Category | Requirement |
| :-- | :-- |
| **Performance** | Cold start ≤3 s; overlay update ≤50 ms; ≤5% CPU |
| **Security / VAC** | No DLL injection; no memory reads; Overwolf sandbox only |
| **Reliability** | Graceful degradation; feature flags disable modules on failure |
| **Accessibility** | Color-blind palettes; font scaling |
| **Portability** | Portable ZIP; no admin install; auto-update via Overwolf store |
| **Privacy** | All processing local; telemetry opt-in; no PII |


***

## 7  Technical Architecture

```
            packages/core (TypeScript)
 ┌────────────────────────────────────────┐
 │  – event-bus       – economy engine    │
 │  – bomb timer      – crosshair state   │
 │  – store (JSON)    – telemetry (opt)   │
 └────────────┬───────────────────────────┘
              │
      packages/ow-bridge
   (Overwolf GEP wrapper)
              │
       apps/overwolf (Electron)
 ┌────────────────────────────────────────┐
 │  overlay windows  · settings window    │
 │  hotkey service   · auto-update        │
 └────────────────────────────────────────┘
              │
        packages/ui (React)
      – economy panel · bomb widget
      – crosshair canvas · theme system
```

**Key Design Tenets**

1. **Shared Core:** Business logic pure TS → trivial future migration
2. **Module Loader:** Dynamic import; feature flags in config
3. **Event-Driven:** Central bus → loose coupling; easy plugin injection
4. **Testability:** Mock GEP feed enables deterministic unit \& contract tests

***

## 8  User Experience \& Workflows

| Workflow | Steps |
| :-- | :-- |
| **First-Run Wizard** | Download → Launch → Autodetect CS 2 GSI cfg → Drag panels → Save |
| **In-Match** | Overlay auto-shows on match start → Player glances at economy ranges → Uses hotkey “eco” feedback → Bomb planted → Timer pops with audio ping |
| **Post-Match (Phase 2)** | Match summary screen → Economy accuracy graph → Export to JSON/Discord |

UI Principles: minimal footprint, drag-anywhere, opacity slider, consistent typography, colour-blind safe palettes.

***

## 9  Risk Assessment

| Risk | Impact | Probability | Mitigation |
| :-- | :-- | :-- | :-- |
| **Valve modifies GEP** | Medium | Medium | Adapter pattern; console log fallback |
| Overwolf windowed-mode limitation | High | Known | Educate users; monitor demand for standalone build |
| Performance regression | Medium | Low | Continuous FPS smoke tests |
| VAC false positives | Critical | Low | Strict Overwolf APIs; code audit |
| Competitive products | Medium | High | Differentiated by accuracy \& modularity |


***

## 10  Roadmap \& Timeline

| Month | Milestone |
| :-- | :-- |
| **0–2** | MVP complete → Closed beta |
| **3** | Public release on Overwolf store |
| **4–5** | Phase 1 features (timer + crosshair) live |
| **6** | 10 k MAU target; start Phase 2 analytics |
| **9+** | Evaluate standalone desktop variant if market demands |


***

## 11  Glossary

| Term | Definition |
| :-- | :-- |
| **GEP** | Game Events Provider API from Overwolf |
| **VAC** | Valve Anti-Cheat |
| **Economy Snapshot** | Data object containing min/max/median money per player |
| **Force Buy** | Round where team spends remaining cash despite low funds |
| **Scoped Dot** | Small static crosshair shown while using scoped rifles |


***

## 12  Change Log

| Version | Date | Author | Summary |
| :-- | :-- | :-- | :-- |
| 0.1 | 2025-08-15 | Consolidated WG | First harmonised draft |


***

### Conclusion

This consolidated PRD unifies the strengths of all three source documents: the modular architecture and dual-target insight from ChatGPT_PRD, the detailed business and user metrics from claude_prd, and the pragmatic implementation roadmap from perpl_prd. The result is a single, coherent blueprint that places **economy tracking** at the core while reserving clear expansion paths for bomb timer, crosshair overlay, and advanced analytics—all powered by a robust Overwolf + Electron foundation designed for longevity and rapid iteration.

<div style="text-align: center">⁂</div>

[^1]: ChatGPT_PRD.md

[^2]: claude_prd.md

[^3]: perpl_prd.md

