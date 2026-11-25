---
name: pre-submit-review
description: Use before every commit, and before final submission, to review changes against the project's quality bar — functionality, validation, error handling, UI states, responsiveness, accessibility and code quality.
---

# Pre-submit review

Review the current changes (`git diff` and new files). For each section, report
✅ pass or ❌ issue with file and line. Fix issues only after listing them.

## 1. Functionality
- [ ] Change meets its requirement in `docs/requirements.md`
- [ ] Nothing previously working is broken (create, edit, delete, status, filters, dashboard)

## 2. Validation and errors
- [ ] Input validated with the shared Zod schema on client AND server
- [ ] API returns correct status codes (400 / 404 / 500) with JSON `{ error }`
- [ ] Failed requests show a toast, never a blank screen or crash

## 3. UI states
- [ ] Loading state present
- [ ] Empty state present where a list could be empty
- [ ] Buttons disabled while submitting
- [ ] Success/failure feedback for every action

## 4. Responsive and accessible
- [ ] Checked at 375px and desktop with Playwright MCP — screenshot any issues
- [ ] All inputs have labels; buttons have accessible names
- [ ] Keyboard navigation works; focus is visible
- [ ] Color is not the only way status/priority is shown

## 5. Code quality
- [ ] Prisma used only inside `src/lib/services/`
- [ ] No `any`, `@ts-ignore`, `console.log` or dead code
- [ ] Files under ~200 lines; clear names
- [ ] No unexplained new dependencies
- [ ] No secrets or `.env` files staged

## 6. Checks
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] No errors reported by next-devtools MCP

## 7. Records
- [ ] Any real trade-off added to `docs/decisions.md`
- [ ] Any AI mistake caught added to `docs/ai-log.md`

Finish with a suggested commit message (conventional commits style, e.g.
`feat: add status update from request list`).
