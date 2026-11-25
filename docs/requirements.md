# Requirements — Request Hub

A lightweight web app for employees to submit, manage and track internal service
requests. No authentication.

## Data model: Request

| Field       | Type     | Rules                                                  |
|-------------|----------|--------------------------------------------------------|
| id          | string   | auto-generated (cuid)                                  |
| title       | string   | required, trimmed, 3–100 characters                    |
| description | string   | required, trimmed, 10–2000 characters                  |
| category    | enum     | required: IT, HR, ADMINISTRATION, OTHER                |
| priority    | enum     | required: LOW, MEDIUM, HIGH                            |
| status      | enum     | NEW, IN_PROGRESS, COMPLETED — defaults to NEW          |
| createdAt   | datetime | auto                                                   |
| updatedAt   | datetime | auto                                                   |

Display labels: "IT", "HR", "Administration", "Other" / "Low", "Medium", "High" /
"New", "In Progress", "Completed".

## Functional requirements

Each item is done only when its acceptance check passes.

### R1 — Create request
- Form with title, description, category, priority.
- ✅ Valid input saves and shows a success toast; user is taken to the list.
- ✅ Invalid input shows a clear error under each field and is NOT saved.
- ✅ Server rejects invalid input with 400 even if client validation is bypassed.

### R2 — View all requests
- List showing title, category, priority, status, created date.
- ✅ Newest first by default.
- ✅ Empty state when there are no requests.
- ✅ Usable on mobile (cards or scrollable table at 375px).

### R3 — Edit request
- Same form, pre-filled.
- ✅ Changes save and show a toast; same validation as create.
- ✅ Editing a request that doesn't exist shows a 404 page.

### R4 — Delete request
- ✅ Confirmation dialog before delete.
- ✅ Request disappears from list and dashboard; success toast shown.

### R5 — Update status
- ✅ Status can be changed directly from the list (no full edit needed).
- ✅ Change persists after refresh.

### R6 — Search and filter
- Text search on title and description.
- Filters: category, status, priority.
- ✅ Search and all filters combine (AND).
- ✅ State is in the URL — survives refresh and can be shared.
- ✅ "Clear filters" resets everything.
- ✅ "No results" state when nothing matches.

### R7 — Dashboard
- ✅ Totals: all requests, New, In Progress, Completed.
- ✅ Breakdown by category and by priority (charts).
- ✅ Reflects current data (updates after create/edit/delete).

### R8 — Data persistence
- ✅ All data stored in a database (SQLite locally, Turso in production);
  survives refresh, closing the browser, and opening on another device.
- ✅ A fresh clone runs with `npm install && npm run dev` — no database server,
  Docker or `.env` needed.

## Non-functional requirements
- **UI:** clean, modern, consistent; clear feedback on every action.
- **Responsive:** works at 375px (mobile) through desktop.
- **Validation & errors:** client + server validation; friendly messages; no
  unhandled crashes; network/DB errors show a toast, not a blank screen.
- **Code:** organized, typed, maintainable (see CLAUDE.md).

## Out of scope
- Authentication / user accounts.

## Deliverables
- GitHub repository with full source.
- Deployed URL (Vercel).
- README: overview, technologies + AI tools used, install/run instructions,
  development approach, challenges + solutions, limitations + future improvements.
