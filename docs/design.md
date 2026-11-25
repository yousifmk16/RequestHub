# Design direction: Request Hub

## Subject, audience, job
- **Subject:** an internal service desk where employees file requests to IT, HR
  and Administration.
- **Audience:** employees checking on their own requests, and staff working
  through the queue.
- **Primary job:** see what is open, how urgent it is and who it belongs to, at a
  glance, and act on it (change status, edit, delete) without friction.

## Concept: the routing slip
Before software, internal requests travelled on colour-coded routing slips and
filing tabs: the colour told you which department owned the paper before you
read a word. Request Hub keeps that one idea:

- **Every request carries a department routing tab**, a solid colour bar on its
  leading edge, in the department's colour. This is the single bold element. It
  appears on list rows, on the form's category picker and in the dashboard's
  category chart, so the colour means the same thing everywhere.
- Everything else stays quiet: ink-blue type and controls on white, ruled rows
  instead of floating cards, colour used only where it carries information.

## Tokens

The palette is **Lakeora's brand palette**, taken from the CSS custom properties
published on lakeora.ai (`--lakeora-navy`, `--lakeora-red`, the `--slate-*` and
`--navy-*` ramps). Each brand value is mapped to a semantic role in
`src/app/globals.css`:

| Role | Lakeora token | Hex | Used for |
|---|---|---|---|
| Navy | `--lakeora-navy` | `#1F2A44` | Header band, headings, primary buttons |
| Red | `--lakeora-red` | `#E8372A` | Brand marks only: active-tab underline, accents |
| Red, strong | `--link-hover` | `#C72C21` | Red surfaces with white text (New request), destructive actions, high priority text |
| Slate | `--lakeora-slate` | `#3E4C68` | Focus ring, IT routing tab |
| Page | `--slate-10` | `#F5F8FC` | Page background behind white surfaces |
| Tint | `--slate-20` | `#EAF0F8` | Secondary/muted fills, hover rows |
| Rule | `--navy-20` | `#D2D4DA` | Dividers |
| Input border | `--navy-60` | `#797F8F` | Form control borders (4:1, WCAG 1.4.11) |
| Muted text | `--slate-80` | `#5B6882` | Secondary text (5.6:1 on white) |

**Accessibility adjustment:** white text on `#E8372A` is 4.19:1, below WCAG AA
(4.5:1). Any red surface behind text uses the brand's own darker red `#C72C21`
(5.5:1). The bright red stays for marks that carry no text.

Department routing colours (also chart colours), from the same palette:

| Category | Lakeora token | Hex |
|---|---|---|
| IT | `--lakeora-slate` | `#3E4C68` |
| HR | `--lakeora-coral` | `#ED6E6B` |
| Administration | `--color-warning` | `#FCBC2B` gold |
| Other | `--navy-40` | `#A5AAB4` |

Status uses an **icon + word** pill with a light tint, never colour alone:
New (open circle, navy-10 tint), In Progress (half-filled circle, warm tint),
Completed (check, tint of `--color-success` green).

Priority uses **signal bars + word** (1 to 3 bars). High is drawn in strong red,
so it stands out in a long list even without reading.

Colour meanings never depend on colour alone. Gold (Administration) and the
warm In Progress tint appear in different forms (a solid tab vs a labelled
pill), and coral (HR) differs from High priority both in hue and in form
(tab vs bars).

## Type
- **Almarai** (one family): Lakeora's own typeface, so the app reads as part of
  the same brand. It covers Latin and Arabic, so the planned Arabic/RTL mode
  stays in one family instead of falling back to a system Arabic font.
- Weights: Almarai ships 300/400/700/800 only. Body is 400. `font-medium` and
  `font-semibold` (500/600, used by shadcn components) are mapped to 700 in
  the theme, so the browser never picks a weight on its own. Page titles and
  the wordmark use 800, as Lakeora's headlines do.
- Only the Latin files are preloaded. The Arabic faces are declared with a
  `unicode-range` and download only when Arabic text appears.
- Scale (1.25 ratio): 12 / 14 (UI text) / 16 (body) / 20 / 25 / 31. Numbers in
  tables and stats use tabular figures so columns line up.
- Sentence case everywhere. No all-caps labels, no eyebrows.

## Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ▮ Request Hub    Dashboard   Requests        ( + New request ) │  white header
│                  ‾‾‾‾‾‾‾‾‾ red underline on the active page     │  (sticky)
├─────────────────────────────────────────────────────────────┤
│ Every request, from submitted to solved.            ▂▄▆█    │  navy hero band
│ See what's open across IT, HR and Administration…            │  (dashboard only)
│ ( + New request )  ( View all requests )                     │
├─────────────────────────────────────────────────────────────┤
│  Requests                                       30 requests  │  slate-10 page
│  ┌───────────────────────────────────────────────────────┐  │
│  │▌ VPN drops every hour on office Wi-Fi   ▮▮▮ High  ◔ New │  │  white surface,
│  │▌ Update emergency contact details       ▮   Low   ○ New │  │  ruled rows
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```
- **Header:** Lakeora navy with white wordmark and links, a red underline on the
  active page, and the red pill for the main action. It stays visible while
  scrolling.
- **Logo mark = workload meter:** four pills lengthening top to bottom, each
  with a white end dot, in Lakeora's red ramp (pink, light red, coral, red).
  Bars light from the bottom as the share of completed requests grows: all
  grey when nothing is done, full colour when nothing is open. The tooltip
  says it in words ("14 of 30 requests completed, 16 open"). The favicon is
  the full-colour mark. See decisions.md D9.
- **Dashboard hero:** a full-width navy band (a hairline separates it from the
  navy header) with the headline, a short description and two pill actions.
  On the right is the same meter at large size with its sentence as a
  caption. Its bars drawing in once is the app's one orchestrated motion
  (skipped with reduced motion). It is hidden on small screens.
- Content sits in `PageContainer` (max 72rem, left-aligned) inside each page,
  not the root layout, so a page can add full-width bands.
- Mobile (375px): the header collapses to the mark and wordmark, a round red
  "+" button and the menu. Rows become stacked blocks that keep the routing tab.

## Principles
1. Colour is information: department = routing tab, urgency = signal bars,
   progress = status icon. No decorative gradients or shadows.
2. Radius follows hierarchy: controls and surfaces share the 10px base
   (`--radius`), the logo tile is smaller, and status pills are fully round.
3. Motion answers actions (menu opening, dialog, toast). The single exception
   is the hero bars growing once on the dashboard. `prefers-reduced-motion`
   is respected everywhere.
4. Copy names what happens: "Create request" makes a toast saying "Request
   created".

## Review against generic defaults
- First instinct was a cream background with a serif display. That's a known
  generated-design default and it doesn't fit an IT/HR tool, so it was dropped
  for white paper on a cool desk grey.
- Considered a card grid for requests (the SaaS-card kit). A queue is scanned
  top to bottom, so it became ruled rows, with the routing tab as the one
  distinctive mark.
- Rejected uppercase section labels and a mono face for metadata. Dates and
  counts use tabular figures in the same family.
