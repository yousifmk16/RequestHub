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

| Name | Hex | Role |
|---|---|---|
| Ink | `#1B2B44` | Header band, primary buttons, headings |
| Paper | `#FFFFFF` | Main surface |
| Desk | `#F3F4F6` | Page background behind the work surface |
| Rule | `#DDE1E7` | Row dividers, input borders |
| Graphite | `#5B6575` | Secondary text |
| Alert | `#C2410C` | High priority, destructive actions |

Department routing colours (also chart colours):

| Category | Hex |
|---|---|
| IT | `#2563C9` cobalt |
| HR | `#9A3E8C` plum |
| Administration | `#1F8A6A` green |
| Other | `#7C8594` slate |

Status uses an **icon + word** pill with a light tint, never colour alone:
New (open circle, blue tint), In Progress (half-filled circle, amber tint),
Completed (check, green tint).

Priority uses **signal bars + word** (1 to 3 bars). High is drawn in Alert, so
it stands out in a long list even without reading.

## Type
- **Public Sans** (one family). It was designed for public-service interfaces:
  plain, very legible, neutral without being Inter/Geist.
- Scale (1.25 ratio): 12 / 14 (UI text) / 16 (body) / 20 / 25 / 31.
- Headings are 600 weight with slightly tight tracking. Numbers in tables and
  stats use tabular figures so columns line up.
- Sentence case everywhere. No all-caps labels, no eyebrows.

## Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ■ Request Hub    Dashboard   Requests          [ New request ] │  ink band
├─────────────────────────────────────────────────────────────┤
│  Requests                                       30 requests  │  desk bg
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [ Search title or description ] [Category][Status]... │  │  paper
│  ├───────────────────────────────────────────────────────┤  │
│  │▌ VPN drops every hour on office Wi-Fi   ▮▮▮ High  ◔ New │  │  ruled rows,
│  │▌ Update emergency contact details       ▮   Low   ○ New │  │  routing tab
│  └───────────────────────────────────────────────────────┘  │  on the left
└─────────────────────────────────────────────────────────────┘
```
- Left-aligned content in a max 72rem column. The page title row holds the
  title and the one primary action.
- Mobile (375px): the header collapses to wordmark + menu button + "New" icon
  button. Rows become stacked blocks that keep the routing tab.

## Principles
1. Colour is information: department = routing tab, urgency = signal bars,
   progress = status icon. No decorative gradients or shadows.
2. Radius follows hierarchy: controls and surfaces share the 10px base
   (`--radius`), the logo tile is smaller, and status pills are fully round.
3. Motion only answers actions (menu opening, dialog, toast). There are no
   entrance animations, and `prefers-reduced-motion` is respected.
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
