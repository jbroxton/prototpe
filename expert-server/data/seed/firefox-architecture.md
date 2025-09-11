# Firefox Architecture (excerpt)

Source: https://firefox-source-docs.mozilla.org

- Firefox is built on the Gecko platform (layout, networking, JS engine SpiderMonkey).
- The `browser/` directory contains desktop UI components.
- `toolkit/` provides shared components used across products.
- Multi-process architecture (e10s) separates content and chrome processes for stability.
