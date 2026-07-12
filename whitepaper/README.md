# WFB Token — Whitepaper

The official **WFB Token** whitepaper — *“The AI-Powered Utility Token for the
Future of Intelligent Trading.”* A luxury, print-ready PDF (A4) for the
W Forex Bot ecosystem (BEP-20 · BNB Smart Chain).

> **44 pages** · luxury black / gold / royal-blue theme · glassmorphism ·
> custom SVG infographics · investor-grade typography.

---

## Output

| File | Description |
|------|-------------|
| `WFB_Whitepaper.pdf` | **Final deliverable** — high-resolution, print-ready PDF (A4) |
| `index.html` | Editable HTML source (open in any browser to preview) |
| `styles.css` | Design system / luxury stylesheet |

## Quick start

```bash
npm install          # installs Puppeteer + Chromium
npm run serve        # preview in browser → http://localhost:4321
npm run build        # full rebuild of HTML + export to WFB_Whitepaper.pdf
npm run pdf          # re-export the PDF from the current index.html
npm run check        # layout QA — verifies no content bleeds across pages
```

> **macOS note:** if Puppeteer’s bundled Chromium is blocked by Gatekeeper
> (error `-88`), the build scripts auto-detect and use the system
> Google Chrome / Edge instead.

## Document structure (44 pages)

```
01  Cover                         —  luxury full-page, gold halo, tech lines
02  Front Matter & Document Info
03–04  Table of Contents          —  clickable, two-page spread
05–06  Executive Summary          —  vision · mission · future · metrics
      ✦ Chapter divider
07–08  The Problem                —  6 pain points + value-leak chart
      ✦ Chapter divider
09–10  Our Solution               —  7 systems + intelligence pipeline
11     Market Opportunity         —  Forex ∩ Crypto convergence thesis
      ✦ Chapter divider
12–13  Ecosystem                  —  radial 9-module diagram + detail
      ✦ Chapter divider
14–15  Token Utility              —  9 use cases + demand flywheel
16     Use Case Scenarios         —  retail · institutional · creator
17     The Holder Journey         —  5-step participant path
      ✦ Chapter divider
18–19  Tokenomics                 —  donut chart · table · unlock schedule
      ✦ Chapter divider
20     Revenue Model              —  7 streams + treasury flow
      ✦ Chapter divider
21–22  Roadmap                    —  4-phase timeline
      ✦ Chapter divider
23–24  Technology                 —  layered architecture + AI/infra
25     AI in Trading              —  honest capabilities & limits
      ✦ Chapter divider
26     Security                   —  planned audits · multi-sig · cold storage
27     Compliance & Regulation
28     Competitive Advantages     —  comparison matrix
29     Community Strategy         —  6 programs + growth curve
      ✦ Chapter divider
30     Risk Factors               —  6 risks + mitigations
31     Legal Disclaimer
32     Glossary
33     Manifesto                  —  full-page vision quote
34     Closing & Contact          —  thank-you + 6 contact channels
```
*(Chapter dividers are interspersed full-bleed luxury section intros.)*

## Design system

- **Palette:** Black `#0B0B0B` · Gold `#D4AF37` · Royal Blue `#1565FF` · White
- **Type:** Playfair Display (display) · Sora (UI) · Inter (body) · JetBrains Mono (data)
- **Effects:** glassmorphism cards, grain overlay, gold/royal glows, soft shadows, gradient text, SVG infographics
- **Graphics (all custom inline SVG):** WFB monogram, radial ecosystem map, donut allocation chart, unlock-schedule curve, layered architecture stack, demand flywheel, comparison matrix, live-dashboard mockup, timeline

## Editing

- **Content:** edit the section generators (`_gen.js` → `_gen4.js`), then `npm run build`.
- **Styling:** edit `styles.css` (design tokens at the top).
- **Page count:** sections are modular — duplicate a `page(...)` block in any `_gen*.js` to add a page.

## Build pipeline

`build.js` runs: `_gen*.js` (generate fragments) → `_assemble.js` (interleave
sections + dividers into `index.html`) → renumber footers → `build-pdf.js`
(Puppeteer → `WFB_Whitepaper.pdf`).

---

© 2026 W Forex Bot. This whitepaper is for informational purposes only and does
not constitute investment, financial, legal, or tax advice. Digital assets
involve significant risk. See the full **Legal Disclaimer** on page 31.
