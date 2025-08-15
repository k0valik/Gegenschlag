

# CS2 Enemy Intelligence — Overlay GUI Design Plan (Overwolf)

> Built specifically for Overwolf overlay constraints (windows, hotkeys, sizes, transparency) and CS2 GEP signals. References inline. ([Overwolf Developers][1])

---

## 0) Design Goals (TL;DR)

* **Instant at-a-glance intel** during fights (no reading walls of text).
* **Two modes**: *Compact HUD* (always on) + *Expanded Panel* (hotkey).
* **Zero-FPS-drama**: GPU-light UI and minimal reflows. ([Overwolf Support Help Center][2], [Overwolf Developers][3], [Overwolf][4])
* **No HUD collisions** with CS2 essentials (radar, killfeed, scoreboard). ([Overwolf Developers][5], [DMarket][6], [Profilerr][7])
* **Operable everywhere**: 1080p → 4K and ultrawide. ([Overwolf Developers][8])

---

## 1) Information Architecture

### Live Overlay (in‑match)

* **Economy Chip** (team-level): loss bonus ladder, avg money, buy prediction (eco/force/full), round timer hooks.
* **Enemy Row (x5 PlayerCards)**: avatar, platform tags (Steam/Faceit), quick flags: VAC risk, HS%, K\:D, weapon class, \$ estimate, “buy likely” pill.
* **Event Toasts** (stacked, auto-dismissing): “Bomb planted → +\$800 T”, “CT defuse +\$300”, “AWP kill +\$100 (low reward)”.
* **Risk Meter** (global): fused score (VAC + stats + AI) with calm→warning→critical bands.

### Expanded Panel (hotkey)

* **Tabs**: *Players*, *Economy*, *History*, *Settings*.
* **Players**: full cards (ban history, ELO, recent form, AI notes), drill-down timeline.
* **Economy**: round-by-round ledger table + forecast graph (R+1 buy patterns).
* **History**: killfeed-derived sequence; filters by player/weapon.
* **Settings**: position lock, opacity, compact density, hotkeys deep link to Overwolf settings. ([Overwolf Developers][9])

### Desktop (out‑of‑match)

* Minimal FTUE, login keys, test overlay preview, permissions, “how to move & pin”. ([Overwolf Developers][10])

---

## 2) Layout & Safe Placement (CS2-aware)

* **Default positions** (user-movable & snap to edges):

  * **Compact HUD**: top‑left under the in‑game killfeed line (safe zone offsets: 24px/24px @1080p). Provide presets for “Top‑Left / Top‑Right / Bottom‑Left / Bottom‑Right”.
  * **Expanded Panel**: right side slide‑in (max 420–520 px width), 90% height; does **not** cover radar (bottom‑left) or scoreboard modal.
* Respect CS2 HUD scaling/variants; expose quick “nudge” controls (±8px). ([DMarket][6], [Profilerr][7])

**Grid**

* **Compact HUD**: 8px grid; 12‑column internal for PlayerCards.
* **Expanded Panel**: 12px grid; min width 420, ideal 480, max 640 (4K).
* **Touch targets** ≥ 32px; cursor‑safe hover tooltips with 250ms delay.

---

## 3) Visual Language

* **Style**: neutral dark overlay (blurred glass optional), low‑contrast panels with **high‑contrast data pills**.
* **Typography**:

  * Titles 14–16 sp, body 12–13 sp @1080p; scale by √(resolution/1080p).
  * Monospace for money (`$ 3,400`) to avoid jitter.
* **Color system**:

  * Economy: *Eco* (slate/blue), *Force* (amber), *Full* (green).
  * Risk: 0–34 cool, 35–69 amber, 70–100 red (WCAG AA contrast).
* **Motion**: 120–180ms ease-out for toasts/panels; disable animations <60 FPS.

---

## 4) Key Components (mapped to your code modules)

### A) `PlayerCard` (overlay + expanded)

* **Compact** (56–64px row):

  * Avatar (platform frame), Name (ellipsis), small flags: VAC?, Faceit ELO, HS%, K\:D.
  * Right cluster: Weapon icon + Cost, `$ est`, Buy pill (*Eco/Force/Full*).
  * Row accent = Risk color.
* **Expanded**:

  * Two‑column: identity & bans; performance & trends.
  * **Cheat Risk breakdown**: VAC history (40%), stats anomalies (25%), account age (35%), AI score (0–100). Visualized as stacked bars with tooltips (source badges Steam/Faceit/Leetify/AI).

### B) `EconomyChip`

* Ladder **(1,400→3,400)** with current index highlight, next round prediction banner, *team avg cash*, expected *buy tier*. Animates on round\_end. (Sync with GEP round events and killfeed deltas.) ([Overwolf Developers][1])

### C) `EventToast`

* Small, stacked, auto‑hide 3–4s; icons per event (bomb, defuse, weapon reward).

### D) `RiskMeter`

* Donut or bar with 3 thresholds; click opens panel → Players tab prefiltered.

### E) `Overlay Shell`

* **Titlebarless**, draggable handle (8px top gutter), **click‑through toggle** and **opacity** slider in quick menu.
* States: *locked*, *edit mode*, *hidden in combat* (optional).
* Overwolf window patterns (obtainDeclaredWindow, restore, move, size). ([Overwolf Developers][11])

### F) `SettingsPanel`

* Hotkey editor deep link (`overwolf://settings/games-overlay?hotkey=...`), opacity, compact density, snap presets; cache size & TTL controls. ([Overwolf Developers][9])

---

## 5) States & Data Binding

* **Loading**: skeleton rows (3–5 shimmers), “Waiting for match…” empty state with GEP status chip. ([Overwolf Developers][12])
* **Degraded**: API rate‑limited → show cached timestamp chips; “Last updated 12:30:04”.
* **Disconnected**: GEP unavailable → grey banner with “Open supported game” link. ([Overwolf Developers][1])
* **No data**: Player private profile/faceit not found → neutral placeholders.
* **Error**: RFC‑7807 style messaging; copy‑to‑clipboard diagnostics.

---

## 6) Interactions & Input

* **Hotkeys**:

  * `Toggle Expanded Panel` (default: Alt+X).
  * `Cycle Positions` (Ctrl+Alt+Arrow).
  * `Quick Mute/Hide` for overlays during clutch.
  * All editable via Overwolf settings deep links. ([Overwolf Developers][9])
* **Mouse**:

  * Drag anywhere in top gutter; resize from bottom‑right corner (expanded only).
  * Right‑click quick menu: lock, opacity, click‑through, scale (0.85–1.25).
* **Tooltips**:

  * Micro‑explanations for economy and risk math with source badges.

---

## 7) Responsive & Resolution Strategy

* Targets: **1080p primary**, **1440p**, **4K**, **1366×768**, **3440×1440 Ultrawide**; use density switch (Compact/Comfort). ([Overwolf Developers][8])
* Typography & spacing scale by devicePixelRatio and window size.
* Provide per‑edge snap presets and safe‑zone offsets.

---

## 8) Performance Budget & Tech Notes

* **Repaint budget**: ≤ 2ms/frame; no layout thrash (transform/opacity anims only).
* **Data ticks**: coalesce updates at 200–400ms; burst on round\_end.
* **Asset strategy**: SVG sprites for icons, LQIP avatars → swap on idle.
* **Windowing**: one background controller + lightweight overlay windows; use `obtainDeclaredWindow`, `restore`, `dragMove`. ([Overwolf Developers][11])
* **Capture/recording**: avoid overlapping heavy capture components; verify FPS impact under load. ([Overwolf Support Help Center][2])

---

## 9) Content Rules & HUD Compliance

* Never cover radar/scoreboard/menus; default to top‑left below killfeed; user can relocate. (Follow “don’t obstruct core HUD” principle.) ([Overwolf Developers][5])
* Respect CS2 HUD scale & color variations; provide an overlay contrast override. ([DMarket][6], [Profilerr][7])

---

## 10) Mapping to Your Roadmap Deliverables

* `OverlayUI.js` → Shell, layout manager, window lifecycle.
* `PlayerCard.js` → Compact & Expanded variants; prop‑driven badges.
* `EconomyTracker.js`/`BuyPrediction.js` → Bind to EconomyChip + toasts.
* `PerplexityClient.js` → Feed `RiskMeter` with normalized 0–100.
* `DataManager.js`/`CacheSystem.js` → hydrate cards; stamp “last updated”.
* `AppController.js` → hotkeys, click‑through, opacity, edit/lock mode.
* **Event Wiring**: GEP (`round_start/end`, `kill`, `kill_feed`, `match_start/end`) → state updates. ([Overwolf Developers][1])

---

## 11) Figma Hand‑off Spec (so you can build fast)

* **Pages**: `Foundations`, `Components`, `HUD – Compact`, `Panel – Players`, `Panel – Economy`, `Panel – History`, `Settings`, `States`.
* **Grid**: 8px base; 12‑col @480 (16px gutters).
* **Text styles**: H5 16/22, H6 14/20, Body 13/18, Caption 12/16, Mono‑12.
* **Color tokens**:

  * `bg/overlay`: #0B0E12 @ 82% (backdrop blur 8)
  * `txt/hi`: #F5F7FA, `txt/lo`: #A8B0BD
  * `econ/eco`: #6CA0DC, `econ/force`: #F0B429, `econ/full`: #4CAF50
  * `risk/ok`: #37C7A8, `risk/warn`: #F5A524, `risk/crit`: #FF4D4F
* **Icons**: 16/20/24 px grid, 1.5px stroke.
* **Components**:

  * `PlayerCard / Compact` & `/ Expanded`
  * `EconomyChip / Ladder`
  * `RiskMeter / Donut`
  * `Toast / Event`
  * `Badge` (VAC/Faceit/AI)
  * `Tag` (Eco/Force/Full)
  * `Tooltip / Info`
  * `Panel / Drawer`
  * `Quick Menu` (lock, opacity, click‑through)

---

## 12) UX Edge Cases

* Steam IDs missing / private → grey state; don’t block layout.
* Rate limits → queued; show “Using cached stats (12:31:07)”.
* Player disconnects / rejoin → soft‑remove card, restore on reappear.
* Overtime and MR changes → economy ladder persists across halves.
* Window outside screen bounds after resolution change → auto‑recenter.
* Competitive vs. Deathmatch → economy UI auto‑suppresses in non‑econ modes.

---

## 13) QA Checklist (for Dev & Design)

* **No collisions** with radar/killfeed/scoreboard on 1080p & 1440p.
* **Readable at 80–100 cm** viewing distance @ 1080p.
* **Overlay edit/lock** persists; hotkeys editable; deep link works. ([Overwolf Developers][9])
* **FPS sanity** with capture off/on; no jank on killfeed bursts. ([Overwolf Support Help Center][2])
* **Localization‑ready** (variable name widths); numbers monospaced.

---

## 14) Implementation Notes for Overwolf

* Declare windows & transparency in `manifest.json`; borderless, click‑through toggle, topmost. ([Overwolf Developers][13])
* Use `overwolf.windows.*` for move/size/drag and to manage a single controller window and one overlay window. ([Overwolf Developers][11])
* Subscribe to CS2 events from GEP: match/round/kill/kill\_feed. ([Overwolf Developers][1])
* Follow Overwolf UI + size guidelines for screen coverage and typical resolutions. ([Overwolf Developers][8])
* Provide FTUE and empty states per product guidelines. ([Overwolf Developers][10])

---
