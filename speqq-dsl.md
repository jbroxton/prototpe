# Speqq DSL Demo — Source of Truth (PRD)

Purpose
- Help Product Managers rapidly draft PRDs and co-create clickable, low‑fi prototypes with an AI Copilot. Optimize for clarity, speed, and believable flows — not code export or persistence.

Users
- Product Managers, Designers, Founders conducting early product discovery.

Goals
- Turn an idea into a concise PRD and a believable click‑through in minutes.
- Keep PRD and prototype in sync with minimal manual effort.
- Present flows cleanly on web and mobile frames (fit‑to‑width, scroll, safe areas).

Non‑Goals
- No backend, auth, real AI, or persistence. No design‑system fidelity. No code export.

Core Concepts (What it does)
- PRD Editor: Markdown editor for Problems, Users, Goals, Journeys, Requirements, Acceptance Criteria, Risks, Metrics, and Open Questions.
- Prototype Canvas: Device frame (mobile/web) that renders wireframe components; fit‑to‑width scaling; internal scroll; crisp edges.
- Left Pane (Tabbed):
  - Components: drag‑and‑drop wireframe components.
  - Pages: switch screens quickly.
  - Inspector: edit selected component text/link.
- AI Copilot: Natural‑language prompts to add flows/screens, theme changes, and PRD sections; applies suggestions instantly.
- Sync From PRD: Heuristic sync ensuring screens referenced in PRD exist (e.g., Home, Details, Checkout, Confirmation, Dashboard, Login).

Wireframe Components (Lo‑fi, consistent styling)
- Header (web), Navbar (mobile), Sidebar (web), Bottom Nav (auto on mobile via Sidebar overlay), Text, Button, Input, Card, Card (image), List, Dropdown, Carousel, Video, Icon.

Key Behaviors
- Drag/drop creates components; dragging moves them, clamped to safe areas (below header, right of sidebar, above bottom nav).
- Sidebar on mobile becomes an overlay drawer (hamburger in top bar), not a layout column.
- Add Screen creates a new page with appropriate chrome (navbar/header) and switches to it.
- Fit‑to‑width auto scales the device to the canvas column; the inner screen scrolls without breaking the device mask.

Canonical Customer/User Journeys (CUJs)
1) Idea → PRD → Starter Prototype
  - As a PM, I describe my idea (“mobile coffee order”).
  - Copilot proposes PRD sections and a starter flow; I accept.
  - I click “Sync from PRD” to ensure screens exist (Home, Details, Checkout, Confirmation, Dashboard).

2) Add a Screen + Link a Flow
  - I click Add Screen (e.g., “Login”) → new page with navbar.
  - I drag a Button on Home, set Link To → Login; double‑click follows the link.

3) Adjust Layout Responsively
  - I drag Sidebar onto a web page → content shifts to the safe area.
  - I drag Sidebar onto a mobile page → hamburger opens an overlay menu; content stays put.

4) Edit Component Content
  - I select a component and change its Text in the Inspector.
  - I add a Dropdown or Carousel to make flows feel real.

5) Present the Flow
  - I toggle fit‑to‑width; device stays centered and pixel‑clean.
  - I demo the click‑through across screens with smooth, believable wireframes.

Requirements (must‑haves)
- PRD: Markdown editor with dark theme; predefined section template; copy to clipboard.
- Prototype: device frames (mobile 390×844, web 1280×800), fit‑to‑width scaling, internal scroll, crisp rounded mask; no outer page scroll bleed.
- Components: consistent white blocks, subtle borders, neutral placeholders; draggable and movable; no overlap with chrome; linkTo navigation; double‑click to follow links.
- Left Pane: Components/Pages/Inspector tabs; keyboard focusable; scroll independently.
- Copilot: Recognizes intents like “add login flow”, “dark mode”, “dashboard”, “search”; applies PRD and DSL updates.
- Sync from PRD: Creates missing screens referenced in PRD User Journeys.

Acceptance Criteria
- On load, a wireframe PRD and prototype are visible; device fits the column.
- Dragging a component places it within safe bounds; adding Header/Sidebar adjusts layout appropriately (overlay on mobile).
- Selecting a component shows editable Text and Link To in Inspector; double‑click follows link.
- Add Screen creates a navigable page and updates PRD (User Journeys bullet).
- Sync from PRD adds missing screens named in PRD.
- Copilot prompts can add screens/flows and update PRD; applied changes reflect in the canvas immediately.
- No console errors; scrollbars only inside the device scroller; edges look clean.

Open Questions
- Should we add anchors (left/right/top/bottom) for responsive constraints?
- Do we need simple transitions (slide, fade) between screens for demo polish?

Changelog Policy
- This document is the single source of truth. Update it with any change to components, panes, flows, or behaviors. Do not create additional specs.

