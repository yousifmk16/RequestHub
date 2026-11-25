# Priorities — How This Project Is Judged

Read this before starting any task. Every decision should serve one of the
seven evaluation criteria below. When goals conflict, follow the priority order.

## Priority order
1. Functional completeness and reliability
2. Code quality and maintainability
3. User interface and user experience
4. Creativity and attention to detail (extras come ONLY after 1–3 are done)

The other three criteria (AI tools, problem-solving, explainability) apply to
HOW every task is done, not to a phase.

---

## 1. Functional completeness and reliability
- Every requirement in docs/requirements.md works: create, view, edit, delete,
  status update, search, filters (category, status, priority), dashboard,
  data saved after refresh.
- Filters and search combine correctly and survive a page refresh (URL params).
- Nothing is "done" until it is tested in a real browser.
- Handle edge cases: empty list, no search results, missing request (404),
  very long titles/descriptions, database errors.

## 2. User interface and user experience
- Clean, modern, consistent: same spacing, colors and button styles everywhere.
- Fully responsive — check every page at 375px and desktop width.
- Clear feedback on every action: toast on success/failure, loading state,
  buttons disabled while saving.
- Confirmation dialog before delete.
- Helpful empty states ("No requests yet — create your first one").
- Form errors shown under the specific field, in plain language.
- Status and priority shown as colored badges, readable at a glance.

## 3. Effective use of AI-powered development tools
- Check current library docs before relying on an API (Next.js, Prisma,
  Tailwind, shadcn): context7, the docs bundled in `node_modules`, or the
  installed type definitions.
- Add shadcn components through the generator (shadcn MCP or CLI), not
  hand-written copies.
- Check for runtime and build errors (next-devtools MCP, or the dev overlay and
  server log).
- Verify flows in a real browser (Playwright MCP or the built-in browser), and
  turn them into repeatable Playwright tests.
- Log notable moments in docs/ai-log.md: what was asked, what the AI got wrong,
  how it was caught and fixed. This feeds the README.

## 4. Code quality and maintainability
- All DB access only in src/lib/services/. Routes and pages never call Prisma directly.
- One Zod schema per entity in src/lib/validation.ts, used on client AND server.
- Small, single-purpose components. No file over ~200 lines without reason.
- Clear names; no `any`; no dead code or leftover console.log.
- No new dependency without a stated reason.
- Small commits with clear messages.

## 5. Problem-solving and analytical thinking
- Before building a feature, state the approach and any trade-off in 2–3 lines.
- When there are real alternatives, list them and justify the choice in
  docs/decisions.md.
- When a bug appears, find the root cause — don't patch symptoms.
- Record significant problems and their fixes for the README "Challenges" section.

## 6. Creativity and attention to detail
- Realistic seed data, so the demo never starts empty.
- Relative timestamps ("2 hours ago"), sorting by date and priority.
- Status changeable directly from the list.
- Keyboard accessible, proper labels, visible focus states.
- Extras, only after everything above is solid (in this order):
  dark mode → CSV export → Arabic/English (RTL).

## 7. Ability to understand, explain, and modify the code
- Prefer simple, standard patterns over clever ones. If it can't be explained
  in an interview in one minute, simplify it.
- Comments explain WHY, not what.
- After each feature, give a short summary: files changed and how the data
  flows (UI → API route → validation → service → DB).
- Keep the add-request-field skill accurate so new fields can be added live.

---

## Avoid
- Over-engineering: no state-management libraries, no extra abstraction layers,
  no features outside the requirements (unless listed as extras above).
- Generic "AI-looking" design.
- Large unexplained code dumps or giant commits.
- Marking anything done without checking it in the browser.

## Definition of done (every task)
- [ ] Meets the requirement in docs/requirements.md
- [ ] `npm run lint` and `npm test` pass
- [ ] Checked in the browser at desktop and 375px, no console errors
- [ ] Loading, empty and error states handled
- [ ] Short explanation of the change given
