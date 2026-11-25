# SayBon page-load audit (dump of 2026-11-25 22:39, git b26425a4)

564 HTML pages checked: doctype, charset, viewport, title, lang, auth guard, fade-in, duplicate/misplaced scripts, broken local links, stray tags.

## Fixed in this zip (241 files)
| Fix | Pages |
|---|---|
| Stray `</div>` removed from lesson pages (exactly one line each; markup now balanced) | 223 (all level lessons, Tout Public, Les Petits, and the `pro` lessons) |
| Hub pages had their unlock script after `</body>`; moved inside the body | 8 hubs (Les Petits, Tout Public, A1 to C2) |
| Les Petits hub ran the same unlock script 3 times (repeat server calls); now once | 1 |
| Missing `lang`, `charset`, `viewport`, `doctype`, `title` added | 10 pages: admin/jobs, admin/translation-admin, features/partner, levels/A0/lesson1, translation/ (editor-workspace, formatting-workspace, job-board, translation-desk, translator-dashboard, translator-login) |
Side effect worth knowing: features/partner showed a garbled globe emoji before (no charset); fixed.

## Needs your decision (not changed)
1. **Blank pages (21 files, 2 bytes each, nothing links to them):** admin/tester-feedback, admin/unlock, features/admin, features/admin/financials/expenses/add-expense, features/chat, features/delf (index, levels/index, exams/junior|prim|tout-public: index, lessons, pay), features/support/partner, features/talkletics, features/translation, onboarding/find-level, onboarding/why.
2. **Dead links:** features/delf/start-test.html and test.html send adult and junior learners to tests/adult.html and tests/junior.html, which don't exist (only tests/prim.html does). translators.html links to /translator-test.html, which doesn't exist.
3. **admin/jobs.html** still has `apiKey:"YOUR_API_KEY"` placeholder, so it can't load jobs.
4. **Load feel differs across the app.** 328 pages hide themselves until sign-in resolves and then pop in. About 20 hub pages fade in (`pageEnter`), the dashboard has its own blur-in, and the shared reveal system (page-reveal.css/js) is used by 1 page. Because the guard hides the page from a module script, the page can also paint once, vanish, then reappear. A proper fix is a synchronous hide plus one shared fade, applied to all 328 pages and tested against live sign-in. Say the word and I'll do it.
5. **Pages with no sign-in guard that look learner-facing:** feedback, library, support, placement, onboarding. May be intentional (public or pre-signup).
6. **Leftover from my first schools build (now unused):** public/schools/a0 a1 a2 b1 b2, schools-config.js, schools-guard.js, schools.css, lesson-engine.js. Cleanup commands are in the chat message.
7. Cosmetic only, left alone: 9 different spellings of the viewport tag (all equivalent); lesson-engine.js contains one block repeated 5 times.
