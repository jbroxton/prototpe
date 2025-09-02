export const initialPRD = `# Coffee Cart — Mobile Ordering

## Problem
Customers spend too long queuing for coffee and lose orders during peak times.

## Users
- Commuters ordering ahead
- Baristas fulfilling mobile orders

## Goals
- Reduce order time to < 60s
- Increase completed orders by 20%

## Non-Goals
- Payments beyond card and Apple Pay
- Delivery logistics

## User Journeys
1. Browse menu → pick drink → customize → add to cart → checkout → confirmation
2. View previous orders → re-order

## Requirements
- [ ] Search bar on Home
- [ ] Dropdown filter on Home
- [ ] Carousel on Details
- [ ] Video on Details
- [ ] Cart summary and payment on Checkout

## Acceptance Criteria
- Tapping a menu item opens details
- Checkout shows total and payment option
- Confirmation screen with order number

## Metrics
- Conversion rate, time to order, drop-off at checkout

## Risks
- Network failures, payment declines, high-load performance

## Open Questions
- Loyalty integration? Pickup scheduling?

## Solution
Mobile order-ahead for a single coffee shop with a simple web dashboard for staff. Customers browse and customize drinks, pay, and receive a pickup confirmation. Staff view orders on the dashboard.

## Milestones
### V0
- CUJ: Home → Details (Happy Path)
- Feature: List on Home
- Feature: Button on Home (View Item) navigates to Details
- AC: Button on Home navigates to Details

### V1
- CUJ: Details → Checkout → Confirmation (Order Completion)
- Feature: Search bar on Home
- Feature: Carousel on Details
- Feature: Cart summary and payment on Checkout
- AC: Checkout shows total and Pay button
- AC: Confirmation shows order number

### V2
- CUJ: Staff Dashboard (Web)
- Feature: Dashboard list for recent orders on Dashboard
- AC: Dashboard loads and shows orders section
`;

export const initialDSLYaml = `name: Coffee Cart (Wireframe)
theme: light
screens:
  - id: home
    name: Home
    device: mobile
    milestone: M0
    components:
      - type: navbar
        frame: { x: 0, y: 0, w: 390, h: 56 }
        props: { title: "Coffee Cart" }
      - type: input
        frame: { x: 16, y: 72, w: 358, h: 40 }
        props: { placeholder: "Search..." }
        milestone: M1
      - type: list
        frame: { x: 16, y: 120, w: 358, h: 200 }
      - type: button
        frame: { x: 16, y: 336, w: 358, h: 48 }
        props: { text: "View Item" }
        linkTo: details
  - id: details
    name: Details
    device: mobile
    milestone: M0
    components:
      - type: navbar
        frame: { x: 0, y: 0, w: 390, h: 56 }
        props: { title: "Details" }
      - type: text
        frame: { x: 16, y: 72, w: 300, h: 24 }
        props: { text: "Item Details", weight: 600, size: 18 }
      - type: cardImage
        frame: { x: 16, y: 112, w: 358, h: 140 }
        milestone: M1
      - type: button
        frame: { x: 16, y: 262, w: 358, h: 48 }
        props: { text: "Add to Cart" }
        linkTo: checkout
  - id: checkout
    name: Checkout
    device: mobile
    milestone: M1
    components:
      - type: navbar
        frame: { x: 0, y: 0, w: 390, h: 56 }
        props: { title: "Checkout" }
      - type: list
        frame: { x: 16, y: 112, w: 358, h: 160 }
      - type: button
        frame: { x: 16, y: 288, w: 358, h: 48 }
        props: { text: "Pay" }
        linkTo: confirmation
  - id: confirmation
    name: Confirmation
    device: mobile
    milestone: M1
    components:
      - type: navbar
        frame: { x: 0, y: 0, w: 390, h: 56 }
        props: { title: "Done" }
      - type: text
        frame: { x: 16, y: 200, w: 358, h: 24 }
        props: { text: "Order Confirmed", weight: 700, size: 20 }
      - type: button
        frame: { x: 16, y: 260, w: 358, h: 48 }
        props: { text: "Back to Home" }
        linkTo: home
  - id: dashboard
    name: Dashboard
    device: web
    size: { width: 1280, height: 800 }
    milestone: M2
    components:
      - type: header
        frame: { x: 0, y: 0, w: 1280, h: 64 }
        props: { title: "Coffee Admin" }
      - type: sidebar
        frame: { x: 0, y: 64, w: 240, h: 736 }
      - type: list
        frame: { x: 260, y: 96, w: 600, h: 260 }
      - type: card
        frame: { x: 260, y: 372, w: 320, h: 120 }
`;
