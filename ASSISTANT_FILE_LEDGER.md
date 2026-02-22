# SayBon Assistant File Ledger (LOCKED)

This file tracks every file ChatGPT provides/updates, and the intended current state.
DO NOT edit manually unless you explicitly unlock it.

## Format
- Date
- File path
- Purpose
- Notes

---
## Update — Translation Request Premium UI (Template Layout)
- Date: 2026-02-22
- Files:
  - public/translation/request.html  (template-style upload left, pricing right, quote card appears bottom)
  - public/translation/request.css   (premium styling, no encoding symbols)
  - public/translation/requestTranslation.js (calls /api/quote, renders quote + redirects to payment)
- Notes:
  - Fixes “question marks/diamonds” by removing special glyphs and forcing UTF-8.
  - Page is locked to 1-screen (no scroll) until quote appears.
## Update — Hero card + Always-scroll
- Date: 2026-02-22
- Files:
  - public/translation/request.html (moved headline/topline into hero card)
  - public/translation/request.css  (hero styling + better mobile typography)
  - public/translation/requestTranslation.js (removed no-scroll locking; smooth scroll to quote)
- Notes:
  - Page is scrollable on both desktop + mobile.
  - “Outside text clutter” resolved by hero container.
