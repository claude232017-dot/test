# DayFlow — Design Brief

*A self-contained brief for a full UI/visual redesign. Everything needed is in
this document; no access to the codebase is assumed.*

---

## 1. The product

**DayFlow** is a personal productivity dashboard — a single-user "productivity
OS" that pulls the tools someone uses to run their day into one calm surface.
It's a web app that also installs as a mobile PWA.

- **Audience:** one person managing their own day. Not a team tool — there is
  no sharing, no collaboration, no multi-user anything.
- **The job:** replace five scattered apps (notes app, to-do list, habit
  tracker, calendar, timer) with one place, and make the day legible at a
  glance.
- **Current voice:** calm and focused. The hero line reads *"Your day at a
  glance / Everything you're tracking, in one calm place."* Quiet confidence
  over density or flash.
- **Usage pattern:** opened many times a day for short bursts. Scanned and
  operated far more than it's read. Long sessions are rare.

---

## 2. Hard constraints (must hold in any direction)

1. **Two themes, both first-class.** Dark and light must each be fully
   designed — not one inverted from the other. Users toggle explicitly, plus a
   "system" option.
2. **Responsive, mobile-first.** Real phone use is common (it installs to the
   home screen). Desktop gets a persistent sidebar; below ~768px that becomes a
   slide-in drawer.
3. **Touch-friendly.** No hover-only affordances — every action must be
   reachable by tap. Comfortable touch targets (~40px+). Text inputs must
   render at ≥16px on mobile or iOS auto-zooms the page on focus.
4. **Accessible.** WCAG AA contrast for text and meaningful UI. Visible
   keyboard focus states. Motion must be able to collapse under
   `prefers-reduced-motion`.
5. **Data-dense but calm.** Eight data domains coexist on one dashboard. The
   design must handle a lot of information without feeling like a cockpit.
6. **Feature set is fixed.** This is a visual/UI redesign only. Don't add,
   remove, merge, or re-scope features, and don't change the navigation
   structure.

---

## 3. Screens to design (13 routes)

### Authentication (2)
- **Login** and **Sign up** — email + password forms. Currently a split screen:
  a branded panel on one side, the form on the other. Needs: labelled fields,
  inline validation errors, loading state on submit, a link between the two.

### App shell (persistent chrome, present on every dashboard screen)
- **Sidebar** (desktop): logo/wordmark, nav grouped into two sections —
  *Workspace* (Overview, Notes, Todos, Calendar) and *Tracking* (Activity,
  Habits, Goals, Pomodoro, Analytics) — an active-item indicator, a **count
  badge** on Todos (red = overdue, amber = due today), and a theme toggle.
- **Mobile drawer**: the same nav, as a slide-in panel with a scrim.
- **Top bar**: hamburger (mobile) / date + greeting (desktop), a search entry
  point, and an account avatar menu.

### Dashboard home (1)
- **Overview** — a hero line, a row of **KPI stat tiles** (focus time this
  week, habits done today, todos completed, pomodoros today — each with an
  icon, a big number, and a trend indicator), then a responsive grid of
  **widget cards**. Each card has a small header with a title and an "open →"
  link, and contains a compact version of a feature. Cards are grouped under
  *Workspace* and *Tracking* labels.

### Feature screens (8) — each is a full page with a header (icon, title, one-line subtitle)
| Screen | Contains |
|---|---|
| **Notes** | Master–detail: a searchable list of note cards beside an editor (title field + body textarea) with an auto-save indicator. On mobile the list and editor swap rather than sit side by side. |
| **Todos** | An add-task form (text, priority Low/Med/High, due date, repeat Once/Daily/Weekly/Monthly), filter tabs (All / Active / Done with counts), and a reorderable task list. Each row: drag handle, checkbox, title, a repeat icon, an **OVERDUE** or **TODAY** status pill, a due date, a priority tag, a "focus" action, and delete. |
| **Habits** | A daily completion summary with a progress bar, plus a reorderable list. Each habit: a name, a **7-day completion heatmap**, a streak counter with a flame, a large check toggle, and a "rest day" state for days it isn't scheduled. Add form: name, color swatch picker, weekday selector chips. |
| **Calendar** | A **Month / Week / Day** view switcher with prev/next/today controls. Month = a date grid with event dots; Week = 7 day-columns with event chips; Day = a large single-day list. Plus a side panel for the selected day with an inline "add event" form (title, description, color). |
| **Pomodoro** | A large **circular countdown timer** with a progress ring, mode tabs (Focus / Short Break / Long Break), play/pause/reset controls, four session pips, a today's-session count, and an optional "linked task" chip. |
| **Goals** | A list of goal cards, each with: title, description, a **progress bar with milestone ticks at 25/50/75%**, a current/target readout with a unit, a percentage, a deadline pill ("23d", "Today", "Overdue"), a quick +1 button, and a completion checkbox. Completed goals move to a separate section. Clicking a card opens a **detail modal** (see below). |
| **Activity** | Time logging: a category picker (six categories), hour/minute steppers, a log button, a stacked daily total bar, and a list of today's entries. |
| **Analytics** | Four **charts** — a stacked bar (weekly activity by category), an area chart with a rolling average (30-day productivity trend), a bar chart (pomodoro sessions, today emphasized), and a radial chart (habit completion) — plus KPI stat cards. Each chart needs an axis treatment, a grid, and a custom tooltip. |

### Utility (1)
- **Offline** — a small centered state shown when the installed app has no
  connection: icon, one line of explanation, a retry button.

---

## 4. Components needing a spec

**Primitives:** button (7 variants: primary, secondary, outline, ghost, link,
destructive, accent + 4 sizes incl. icon-only), text input, textarea, badge /
status chip, card/panel surface, dropdown menu, drag handle, error state.

**Composite:** command palette (a ⌘K modal with a search field, results
grouped by type — Notes / Todos / Calendar / Habits / Goals — each row with an
icon, title, and snippet, plus a keyboard-hint footer), export dialog, install
prompt banner, toast notification, modal/dialog shell, avatar menu, theme
toggle, empty states, loading skeletons.

**Goal detail modal** (the most complex single surface): title + description,
a large percentage, a progress bar with milestone ticks, +/− controls, a
timeline strip showing "Day 23 of 90" against elapsed time, a status badge
(Ahead / On track / Behind / Overdue / Complete), a 2-column stats grid (days
elapsed, days remaining, current pace, pace needed, projected finish,
deadline), an inline edit mode, and a footer with delete + complete actions.

---

## 5. States that must be designed

For lists and data surfaces: **empty** (no data yet), **loading** (skeleton),
**error**, and **populated**. For interactive elements: **default, hover,
focus-visible, active, disabled**, and **dragging** (lists are reorderable).
For status: overdue / due-today / completed / on-track / behind / rest-day.

Semantic status color (success / warning / danger) should be distinguishable
from the brand accent, so "needs attention" reads without relying on the
accent hue.

---

## 6. Current visual language — *context, not a constraint*

Included so you know what exists. **Treat it as replaceable**, not as a
starting point to preserve.

Today the app ships two selectable "skins": a **Studio** look (near-black
planes, a single gold accent, flat 1px hairline borders, monospace uppercase
letter-spaced labels, a faint gold grid in the background, ~12px radius) and a
**Classic** look (frosted glassmorphism, a purple→blue→cyan brand gradient,
soft ambient color blobs, ~14px radius). Type is Plus Jakarta Sans; icons are
Lucide; motion is short fade-and-rise with staggered list entrances.

If a redesign is stronger as a single coherent identity rather than two skins,
say so — the skin system is a convenience, not a requirement.

---

## 7. What to deliver back (this makes implementation cheap)

The app is built on a **semantic design-token layer** — components never
hardcode colors; they reference role-based tokens. A redesign expressed the
same way can be applied as a token swap rather than a rewrite. Please provide:

1. **A color system as named semantic tokens**, with a value for **both**
   light and dark:
   `background, foreground, card, popover, primary, primary-foreground,
   secondary, accent, muted, muted-foreground, border, input, ring,
   destructive, success, warning`
   — plus any feature-accent hues, and a categorical palette of ~6 colors for
   charts and the user-facing color pickers.
2. **Typography**: font families (display / body / mono if used), a type scale
   with sizes + weights + letter-spacing, and the treatment for small
   uppercase labels.
3. **Shape & depth**: corner radius scale, border/hairline treatment, elevation
   or shadow scale, and how a "card" surface is constructed.
4. **Component specs** for the primitives in §4 — each variant across the
   states in §5.
5. **Layout**: grid, spacing scale, page padding, sidebar width, and how the
   dashboard grid reflows across breakpoints.
6. **Motion**: durations, easing, and which transitions matter.
7. **Contrast notes**: call out any accent that needs a darkened variant to
   stay AA-legible as text on light backgrounds. (This bit us before — a bright
   gold accent works as a fill but fails as lettering on a pale surface.)

Visual mockups of the **dashboard home** and **one feature screen**, in both
themes, would be the most useful thing to see alongside the tokens.

---

## 8. Out of scope

Don't change: the feature set, the navigation structure or route names, the
information architecture of any screen, the data model, or the copy (beyond
labels that a new design would naturally rename). This is a visual redesign of
an app whose functionality is settled.
