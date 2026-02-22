# ASSISTANT FILE LEDGER (LOCKED)
This ledger tracks every assistant-created/updated file so we can always reference the current state.

## 2026-02-22
### Updated
1) public/translation/request.html
- Purpose: Premium Request/Quote page layout (upload-left, pricing-right, quote card below) + clean header container.
- Notes: Header is centered generally; subtitle uses narrower font stack + clamp sizing to prevent overflow on mobile (no wrap, no disappearing).

2) public/translation/request.css
- Purpose: Premium styling + hover/active states + rim styling (green/red/blue outlines) + scrollable layout.
- Notes: General header fix applied (not mobile-only). Uses clamp sizing + condensed font stack for subtitle.

3) public/translation/request.js
- Purpose: Drag/drop + file select + POST /api/quote + render quote + click Standard/Express => payment.html?amount=...
- Notes: Keeps existing payment.html amount param behavior.

