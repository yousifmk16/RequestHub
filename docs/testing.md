# Testing and accessibility

## How to run

```bash
npm test            # 135 unit + integration tests (Vitest, real SQLite test file)
npm run test:e2e    # end-to-end tests (Playwright), desktop and 375px, on a production build
npm run lint && npm run typecheck
```

End-to-end tests build the app into `.next-e2e` and run it against a fresh,
throwaway `prisma/e2e.db`, so they never touch development data and can run
while `npm run dev` is up. Every test creates its own uniquely named data
(`tests/e2e/helpers.ts`), so tests don't depend on each other or on file order.
CI (`.github/workflows/ci.yml`) runs all of the above on every push and pull
request.

## Requirements coverage

| Requirement | Unit / integration | End-to-end |
|---|---|---|
| **R1** Create, validation, server rejects bad input | `validation.test.ts`, `api-routes.test.ts` (400 on bypass, malformed JSON) | `request-form.spec.ts` (empty submit: errors under each field, focus, nothing saved; create succeeds; in-app links ask before discarding changes), `keyboard.spec.ts` (keyboard-only create) |
| **R2** List, newest first, empty state, mobile | `requests-service.test.ts` (ordering) | `requests-empty.spec.ts`, every spec also runs at 375px, `reflow.spec.ts` (320px) |
| **R3** Edit, same validation, missing → 404 page | `api-routes.test.ts` (PATCH rules, 404) | `request-form.spec.ts` (list → detail → edit flow, not-found page), `request-detail.spec.ts` (every field shown, missing id) |
| **R4** Delete with confirmation | `api-routes.test.ts` (204, then 404) | `requests-list.spec.ts` (cancel keeps it, confirm removes it, API 404 afterwards), `request-detail.spec.ts` (delete from the detail page returns to the list) |
| **R5** Status from the list, persists | `api-routes.test.ts` (status-only PATCH) | `requests-list.spec.ts` (change, toast, reload), `request-detail.spec.ts` (same from the detail page), `keyboard.spec.ts` |
| **R6** Search + filters + sort combine, in URL, clear, no results | `requests-service.test.ts` (AND, literal `%`/`_`, priority sort), `validation.test.ts` (tolerant URL parsing) | `requests-list.spec.ts` (chips + department + sort + search, reload, clear), `requests-empty.spec.ts` (bad URL values) |
| **R7** Dashboard totals and breakdowns, current | `requests-service.test.ts` (zero-filled stats), `workload.test.ts` | `dashboard.spec.ts` (totals match API, bar opens filtered list), `requests-list.spec.ts` (dashboard updates after a list change), `requests-empty.spec.ts` |
| **R8** Persistence | Service tests run against a real SQLite file | Every reload assertion above; fresh-clone run documented in the README |
| **Extra:** CSV export | `csv.test.ts` (quotes, commas, both line breaks, formula cells, non-ASCII, ISO dates), `export-route.test.ts` (headers, BOM, filters + sort match the list, invalid params, JSON 500), `client-helpers.test.ts` (export URL = list URL params) | `csv-export.spec.ts` (downloads the filtered, priority-sorted view; checks filename, BOM, row order and escaping) |
| **Ops:** `/api/health` | `health-route.test.ts` (ok with count; safe 503 category), `database-health.test.ts` (error classification) | `health.spec.ts` (on a production build, the count changes after a create, so the route isn't prerendered) |

## Accessibility audit (WCAG 2.1 AA)

**Date:** 2026-11-25. **Method:** axe-core scan of every page and key state
(form errors, open dialog) at desktop and 375px, keyboard-only end-to-end
tests, a 320px reflow test, computed contrast ratios, and accessible names read
from the browser's accessibility tree.

### Summary
**Issues found:** 6. **Fixed:** 6. **Open:** 0 known.

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 1 | Status chips and dashboard bars had `aria-label`s that didn't contain the visible text ("New, 9 requests" vs visible "New 9") | 2.5.3 Label in Name | Major | Name comes from the visible text, with hidden context appended after it: "New 9 requests", "HR 8 27% of all requests" |
| 2 | Dashboard bar read as "IT 1100%": count and percentage were adjacent inline spans separated only by margin | 1.3.1 / 4.1.2 | Major | A real space between them: "IT 1 100%…" |
| 3 | Delete buttons: red text on a pale red tint fell below 4.5:1 | 1.4.3 Contrast | Major | Solid red with white text (5.51:1) |
| 4 | Loading skeletons had `aria-label` on a `div` with no role | 4.1.2 | Minor | `role="status"`, which also announces "Loading…" |
| 5 | Skip link scrolled to the content but focus stayed in the header | 2.4.1 Bypass Blocks | Minor | `tabIndex={-1}` on `<main>`; tested |
| 6 | At 320px the requests page scrolled sideways: the chips' `sr-only` text (position absolute) escaped the chip row's overflow clipping | 1.4.10 Reflow | Major | `relative` on the chip row; `reflow.spec.ts` guards it |

### Colour contrast
| Element | Foreground | Background | Ratio | Required |
|---|---|---|---|---|
| Body text | `#1F2A44` | `#FFFFFF` / `#F5F8FC` | 14.26 / 13.39 | 4.5 |
| Muted text | `#5B6882` | white / page / tint | 5.60 / 5.26 / 4.89 | 4.5 |
| Header links | white at 75% | `#1F2A44` | 8.68 | 4.5 |
| Hero description | `#BCC6D8` | `#1F2A44` | 8.29 | 4.5 |
| Red pill, delete button, error text, High priority | white / `#C72C21` | `#C72C21` / white | 5.51 | 4.5 |
| Status: New / In Progress / Completed | navy / `#7A5200` / `#17713F` | their tints | 11.84 / 6.27 / 5.30 | 4.5 |
| Input borders (non-text) | `#797F8F` | white | 4.00 | 3 |
| Focus ring (non-text) | `#3E4C68` | white | 8.61 | 3 |

All pass. Brand red `#E8372A` is only used where there's no text (see D6).

**Dark theme** (computed before use; also covered by the dark-mode axe scans):

| Element | Foreground | Background | Ratio | Required |
|---|---|---|---|---|
| Body text | `#E7EBF3` | page `#0D1322` / card `#151D30` | 15.51 / 14.06 | 4.5 |
| Muted text | `#A3AEC4` | page / card / tint | 8.30 / 7.53 / 6.22 | 4.5 |
| Error, red links, High priority | `#FF7A70` | card | 6.61 | 4.5 |
| Status: New / In Progress / Completed | `#DCE3F0` / `#FFD27A` / `#7EDCA6` | their dark tints | 10.05 / 9.35 / 8.44 | 4.5 |
| Primary button, selected chip | `#0D1322` | `#E7EBF3` | 15.51 | 4.5 |
| Input border, focus ring (non-text) | `#6B7894` / `#8FA6D6` | card | 3.79 / 6.87 | 3 |
| Department tabs (non-text) | IT `#8894AB`, HR, Admin, Other | card | 5.50 – 9.89 | 3 |

### Keyboard
| Element | Behaviour |
|---|---|
| Skip link | First Tab stop; Enter moves focus to the main content |
| Header, nav, row actions | Tab order follows the visual order; visible focus outline |
| Status chips | Buttons with `aria-pressed`; Enter/Space toggles |
| Selects (filters, sort, inline status) | Enter/Space opens, arrows move, Enter picks, Escape closes |
| Form radio cards | Native radios: Tab enters the group, arrows move and select |
| Delete dialog | Focus starts on "Keep request"; Escape cancels; focus is trapped while open |

Touch targets: the smallest are 32px icon buttons. That meets WCAG 2.2's AA
target size (2.5.8, 24px). The 44px figure (2.5.5) is AAA.

### Not covered
- **No manual screen-reader session** (NVDA, VoiceOver) was done. Names, roles
  and states were checked through the browser's accessibility tree and axe,
  which catches most, but not all, screen-reader problems.
- Arabic/RTL is not built yet, so it wasn't audited.
