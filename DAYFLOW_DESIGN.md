# DayFlow — Product & Design Overview

> A reference document written for both humans and AI agents. It explains what
> DayFlow is, then focuses in depth on **how it is designed** — the visual
> language, the token system, the theming architecture, the component model,
> the state/data design, and the interaction & platform design. An agent
> reading this should be able to make changes that feel native to the codebase
> without having to reverse-engineer conventions first.

---

## 1. What DayFlow Is

DayFlow is a **personal productivity dashboard** — a single-user "productivity
OS" that gathers the tools someone uses to run their day into one calm,
cohesive surface. It is a web app that also installs as a mobile PWA.

### Feature surface
| Area | What it does |
|------|--------------|
| **Notes** | Free-form notes with title + body, auto-saved as you type (debounced), searchable. |
| **Todos** | Tasks with priority (low/med/high), due dates, overdue/today badges, **recurrence** (daily/weekly/monthly — completing one spawns the next), drag-to-reorder, and a "focus" link into Pomodoro. |
| **Habits** | Daily habits with a **weekday schedule** (e.g. Mon/Wed/Fri), streak tracking that respects rest days, a 7-day heatmap, and drag-to-reorder. |
| **Calendar** | Events with color + description. **Three views**: Month, Week, Day. |
| **Pomodoro** | Focus timer (work/short/long) that **persists across navigation**, can be linked to a specific todo, and logs completed focus sessions. |
| **Goals** | Measurable goals (target value + unit + deadline). Progress bars with milestone ticks, milestone-crossing celebrations, a **detail modal** with pace/projection math, and completion tracking. |
| **Activity** | Time-tracking log per category (Work, Study, Exercise, Reading, Leisure, Sleep). |
| **Analytics** | Recharts visualizations derived from the above: weekly activity, productivity trend, pomodoro sessions, habit completion radial, plus KPI stat cards. |
| **Cross-cutting** | Global ⌘K command palette (searches notes/todos/events/habits/goals), data export (JSON backup + per-table CSV), dark/light/system theme, installable PWA with offline fallback. |

### Design intent (the "why")
The product's stated voice is **calm, focused, single place**: "Everything
you're tracking, in one calm place." Design decisions consistently favor
*quiet confidence* over density or flashiness — muted surfaces, restrained
motion, one saturated brand gradient used sparingly as an accent rather than a
flood.

---

## 2. Technology Substrate (design-relevant parts only)

- **Next.js 16.2.6** (App Router, Turbopack). Note: middleware is named
  `proxy.ts` in this version, not `middleware.ts`.
- **React 19**, **TypeScript** (strict).
- **Tailwind CSS v4** — configured entirely in CSS via `@import "tailwindcss"`
  and the `@theme inline { … }` directive in `globals.css`. There is **no
  `tailwind.config.js`**; tokens live in CSS.
- **Supabase** — auth, Postgres (with Row-Level Security), and realtime.
- **Zustand** — all client state (no Redux, no Context for data).
- **Framer Motion** — all animation.
- **Radix UI** primitives — accessible behavior for dropdown, dialog, etc.
- **lucide-react** — icon set (single visual family; do not mix icon packs).
- **sonner** — toast notifications.
- **Recharts** — analytics charts.
- **@dnd-kit** — drag-and-drop reordering.
- **next-themes** — theme switching via a `class` on `<html>`.

The design system is **hand-rolled on top of Tailwind + Radix**, not a
prepackaged component library. Primitives live in `src/components/ui/`.

---

## 3. Visual Design Language

The aesthetic is **dark-first glassmorphism** with a cool purple→blue→cyan
brand spectrum, soft ambient depth, and generous rounding.

### 3.1 Brand & accent colors
- **Brand gradient**: `linear-gradient(135deg, #7c3aed, #2563eb 55%, #06b6d4)`
  — purple → blue → cyan. Exposed as the `.brand-gradient` utility and used on
  the logo mark, primary avatars, and hero text (`.text-gradient`).
- **Primary** is purple (`#7c3aed` / hsl `262 83% ~60%`). It is the single
  "action" color: primary buttons, active nav, focus rings, progress.
- **Per-feature accents** give each domain a recognizable hue, always used at
  low opacity for icon chips and highlights:
  - Notes → amber, Todos → purple, Calendar/Pomodoro → cyan, Habits/Goals →
    green/amber, plus blue as a general secondary.
- **Activity categories** have fixed colors (Work purple, Study blue, Exercise
  green, Reading cyan, Leisure amber, Sleep indigo) defined once in
  `src/lib/activity-categories.ts` and reused by widget + charts + store.

### 3.2 The Glass System (signature look)
Surfaces are **frosted glass panels**, not flat cards. Defined in
`globals.css` as three layered utilities:

- `.glass` — the base panel: a subtle top-lit sheen gradient over a nearly
  transparent fill, a 1px translucent border, `backdrop-filter: blur(16px)
  saturate(140%)`, a medium drop shadow, plus a faint inset highlight. It also
  carries a **procedural noise texture** via a `::before` SVG `feTurbulence`
  overlay (`mix-blend-mode: overlay`, ~3% opacity) to avoid banding and add
  tactile depth.
- `.glass-strong` — heavier, more opaque, blur 22px. Used for chrome that must
  stay legible over scrolling content: sidebar, topbar, mobile drawer, modals,
  command palette.
- `.glass-hover` — adds a transition and a brightened fill/border on hover;
  applied to interactive cards.

There is a `@supports not (backdrop-filter)` fallback that swaps in solid
surface colors, so the UI degrades gracefully.

### 3.3 Depth & atmosphere
- **Ambient background blobs**: three large, blurred, low-opacity colored
  circles (`.bg-blob`, `filter: blur(90px)`) fixed behind everything (purple
  top-left, blue mid-right, cyan bottom). They give the dark canvas a sense of
  space. In light mode their opacity is reduced.
- **Body background gradient**: theme-specific radial gradients painted on
  `body` (rich dark-jewel tones in dark mode, barely-there tints in light).
- **Glow utilities** (`.glow-purple/-cyan/-blue`) for occasional emphasis.

### 3.4 Shape, type, spacing
- **Radius**: a single `--radius: 0.85rem` token drives `--radius-lg/md/sm`.
  Panels are generously rounded (`rounded-xl`/`rounded-2xl`); pills and chips
  are `rounded-lg`/`rounded-full`.
- **Type**: **Plus Jakarta Sans** (via `next/font`), weights 300–700, exposed
  as `--font-jakarta`. Numeric/timer displays use `.tabular` (tabular-nums).
- **Type scale is deliberately small and quiet**: section labels are
  `text-[10px]`–`text-xs`, uppercase, wide-tracked, low-contrast
  (`text-muted-foreground`); body is `text-sm`; only heroes and key figures go
  large (`text-2xl`–`text-3xl`, `font-bold`).
- **Iconography**: lucide-react throughout, typically `w-3.5`–`w-[18px]`,
  paired with `aria-hidden` when decorative.

---

## 4. Design Tokens & Theming Architecture

This is the most important section for making consistent changes. **Colors are
never hardcoded** in components — they resolve through tokens so that light and
dark modes both work automatically.

### 4.1 Where tokens live
All in `src/app/globals.css`, in three layers:

1. **Shared root tokens** (`:root`) — radius, z-index scale
   (`--z-nav/-drawer/-overlay/-toast`), and raw brand hex (`--purple`, `--blue`,
   `--cyan`, `--green`, `--amber`).
2. **Theme token blocks** — `.dark { … }` and `.light { … }` each define the
   full semantic palette as **HSL channel triples** (e.g.
   `--background: 240 28% 5%`, `--primary: 262 83% 63%`), plus glass variables
   (`--glass-bg`, `--glass-sheen`, `--glass-border`, `--glass-border-strong`,
   `--glass-blur`) and shadow tokens (`--shadow-sm/md/lg`).
3. **`@theme inline { … }`** — maps those CSS vars into Tailwind color
   utilities, e.g. `--color-primary: hsl(var(--primary))`. This is what makes
   `bg-primary`, `text-muted-foreground`, `border-border`, etc. exist and be
   theme-reactive.

Because semantic colors are stored as **HSL channels without the `hsl()`
wrapper**, components can apply opacity through Tailwind's slash syntax
(`bg-primary/10`, `border-border/40`) — the wrapper is added in `@theme`.

### 4.2 The `--overlay` pattern (critical convention)
Dark UIs lighten surfaces with translucent **white**; light UIs darken with
translucent **black**. A naive `bg-white/5` breaks in light mode. DayFlow
solves this with a single token:

```
.dark  { --overlay: 255, 255, 255; }
.light { --overlay: 0, 0, 0; }
```

Every incidental overlay — hover states, hairline borders, faint fills, input
backgrounds, ticks — is written as:

```
bg-[rgba(var(--overlay),0.05)]
border-[rgba(var(--overlay),0.1)]
ring-[rgba(var(--overlay),0.6)]
```

**Rule for agents:** never introduce `bg-white/…`, `border-white/…`, or a raw
`rgba(255,255,255,…)` in component code. Use `rgba(var(--overlay), <alpha>)`
(or a semantic token) so both themes stay correct. The only sanctioned
exceptions are surfaces that are *always* on a fixed-color background — e.g.
the auth split-screen panel that sits permanently on the brand gradient, where
`text-white/70` is intentional.

### 4.3 How theming is switched
- `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="dark"`,
  `enableSystem`, `disableTransitionOnChange`. It stamps `.dark`/`.light` on
  `<html>`.
- `<html>` has `suppressHydrationWarning` because the class is set client-side.
- A 3-way `ThemeToggle` (Dark / Light / System, moon/sun/monitor icons) lives
  in the sidebar and mobile drawer. It guards against hydration mismatch by
  rendering a placeholder until mounted.
- The glass utilities have explicit `.light .glass-strong`, `.light .glass`,
  `.light .glass-hover:hover` overrides so frosted panels read correctly on a
  light canvas (opaque whites instead of translucent lights).

### 4.4 Semantic color vocabulary (use these names)
`background, foreground, card, popover, primary, secondary, accent, muted,
muted-foreground, destructive, success, warning, border, input, ring` — each
with a matching Tailwind utility. Prefer these over literal colors; reach for
feature-accent hues (purple/cyan/green/amber/red/blue at low opacity) only for
domain identity.

---

## 5. Layout & Navigation Design

### 5.1 App shell
`src/app/dashboard/layout.tsx` composes the persistent shell:

```
RealtimeProvider
└── flex h-dvh
    ├── Sidebar        (desktop only, md:flex, w-60, glass-strong)
    └── flex-col
        ├── Topbar     (sticky, h-16, glass-strong)
        └── main       (scroll area, max-w-7xl, responsive padding)
+ TodoReminder, CommandPalette, InstallPrompt   (portaled / fixed overlays)
```

- **Sidebar** (desktop): logo mark + two grouped nav sections ("Workspace",
  "Tracking"), an animated active "pill" (`layoutId="sidebar-pill"`) and dot,
  a live **todo badge** (red = overdue, amber = due today) on the Todos item,
  and the theme toggle pinned at the bottom.
- **Topbar**: hamburger (mobile) / date + greeting (desktop), plus search
  trigger and the user menu (avatar → dropdown with Export data / Sign out).
- **Mobile drawer**: below `md`, the sidebar is replaced by a slide-in drawer.
  It is **portaled to `document.body`** (see §8.2) and mirrors the sidebar's
  nav, badge, theme toggle, and user footer.

Nav is defined once in `src/components/dashboard/nav-items.ts`
(`navItems`, `isNavActive`, `GROUP_LABELS`) and consumed by both the sidebar
and the drawer, so navigation never drifts between desktop and mobile.

### 5.2 The dashboard grid
The home page (`/dashboard`) is a **staggered grid of glass widget cards**.
Framer Motion `container`/`item` variants fade-and-rise each card in sequence
(`staggerChildren: 0.07`). Cards are grouped under quiet uppercase section
labels ("Workspace", "Tracking"), and the grid is
`grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with selective column spans (e.g.
Calendar spans two columns on large screens). Every widget card has an "Open →"
link to its full-page route and wraps its body in an `ErrorBoundary` so one
failing widget can't take down the dashboard.

Each widget exists in **two contexts**: compact (inside a dashboard card) and
full (its own `/dashboard/<feature>` route). The same widget component is
reused; the page route just gives it more room and a page header.

---

## 6. Component Architecture

```
src/components/
├── ui/          reusable primitives (button, card, input, textarea, badge,
│                dropdown-menu, theme-toggle, sortable-item, error-boundary)
├── dashboard/   shell + cross-cutting (sidebar, topbar, mobile-drawer,
│                user-menu, command-palette, export-dialog, install-prompt,
│                todo-reminder, overview-stats, nav-items)
├── widgets/     one folder per feature (notes, todos, habits, calendar,
│                pomodoro, goals, activity) — each with a *-widget entry plus
│                item/card/form/modal subcomponents
├── analytics/   Recharts chart components + stat-card
├── auth/        auth-shell, login-form, signup-form
└── providers/   theme-provider, realtime-provider, sw-register
```

### Primitive conventions
- **Button** (`ui/button.tsx`) uses `class-variance-authority` with variants
  `default` (brand-purple gradient + shadow), `destructive`, `outline` (glass),
  `secondary`, `ghost` (overlay hover), `link`, `cyan`; sizes
  `default/sm/lg/icon`. Supports Radix `asChild` via `Slot`. Base includes
  `active:scale-[0.98]` and `cursor-pointer`.
- **Card** = `.glass rounded-xl p-4` with `CardHeader/Title/Content/Footer`;
  titles are the small uppercase muted label style.
- **Input/Textarea**: glass-ish fill using `--overlay`, purple focus border,
  and — importantly — **`text-base sm:text-sm`** so mobile fonts are ≥16px
  (prevents iOS focus-zoom). Any new text field must follow this.
- **cn()** (`src/lib/utils.ts`) = `clsx` + `tailwind-merge`; always compose
  class names through it.
- **SortableItem** (`ui/sortable-item.tsx`) wraps dnd-kit's `useSortable` and
  renders a grip handle that is **visible-dimmed on mobile, hover-revealed on
  desktop** (touch screens have no hover). Reuse it for any reorderable list.

### Widget composition pattern (consistent across features)
`<Feature>Widget` (owns data hook + local UI state)
→ maps over items into `<Feature>Item`/`<Feature>Card`
→ an inline `Add<Feature>Form`
→ optional `<Feature>DetailModal`.
Lists animate with `<AnimatePresence>` + `layout`. Empty states are a centered
muted icon + one line of copy. Destructive actions reveal on hover (desktop)
and are always-visible (mobile).

---

## 7. State & Data Design

### 7.1 One store, stale-while-revalidate
`src/stores/useDataStore.ts` is a **single Zustand store** acting as an
in-memory cache for all dashboard data. Its design principles:

- **Module-scoped cache**: navigating between sections reads cached slices
  **instantly** instead of re-fetching with a skeleton every time.
- **Per-slice shape**: for each domain there is `data`, a `hydrated` flag, a
  `set<Slice>` updater (accepts a value or an updater fn), and a
  `load<Slice>()` async action that fetches from Supabase and marks hydrated.
- **Keyed slices** for time-ranged data: calendar events are cached per
  `"yyyy-MM"` month key, activity per `"yyyy-MM-dd"` date key.
- **Derived analytics** are computed inside `loadAnalytics()` from raw rows
  (weekly activity, 30-day trend with rolling average, pomodoro counts, habit
  radial that respects each habit's schedule, and KPI stat cards).

### 7.2 Feature hooks are the public API
Components never touch Supabase directly; they use hooks in `src/hooks/`
(`useTodos`, `useHabits`, `useGoals`, `useNotes`, `useCalendarEvents`,
`useActivityLogs`, `usePomodoroSessions`, `useAnalytics`, plus
`useGlobalSearch`, `useTodoBadge`). Each hook:
- reads its slice + hydrated flag from the store,
- kicks off a background `load…()` on mount,
- exposes CRUD functions that do **optimistic updates** (mutate the store
  immediately, write to Supabase, and roll back + `toast.error` on failure).

Examples of domain logic that lives in hooks, not components:
- **Recurring todos**: completing a recurring todo spawns the next occurrence
  (due date advanced), is idempotent (won't duplicate on re-toggle), reads
  current state from `useDataStore.getState()` to be race-safe, and un-completing
  removes the spawned occurrence.
- **Habit streaks**: `calculateStreak` walks backward skipping unscheduled
  rest days and does **not** break on an unlogged *today*.
- **Ordering**: new items get `position = max(existing)+1000`; reorder rewrites
  positions in 1000-step gaps.

### 7.3 Other stores
- `usePomodoroStore` — the timer as a **target-timestamp** model (`targetTime`
  + `pausedRemaining`) so it keeps counting correctly across route changes and
  remounts; also holds the linked-todo id/title.
- `useCommandPaletteStore` — just `open`/`setOpen`/`toggle`.
- `useDashboardStore` — misc dashboard UI state.

### 7.4 Realtime & auth
- `RealtimeProvider` opens **one** Supabase channel for the dashboard's
  lifetime and subscribes to Postgres changes on every table the UI caches,
  refreshing the affected store slice (and analytics) in the background. This
  is why the UI stays live across devices without polling.
- Auth is Supabase via `@supabase/ssr`; `proxy.ts` redirects unauthenticated
  users to `/login` (allowing `/login`, `/signup`, `/auth`, and the public
  `/offline`), and signed-in users away from auth routes. RLS scopes every row
  to `auth.uid()`, so exports and reads can never leak another user's data.

### 7.5 Data model (Supabase tables)
`notes, todos, habits, habit_logs, goals, activity_logs, calendar_events,
pomodoro_sessions`. Design-relevant columns: todos have
`priority/due_date/recurrence/position`; habits have `schedule_days integer[]`
(0=Sun…6=Sat, null=every day) + `position`; goals have
`target_value/current_value/unit/deadline/color/completed/position`; pomodoro
sessions carry an optional `todo_id`. Canonical schema in
`supabase/schema.sql`, incremental changes in `supabase/migrations/`.

---

## 8. Interaction & Motion Design

### 8.1 Motion vocabulary (Framer Motion)
- **Entrances**: fade + short rise (`opacity 0→1`, `y 8–18→0`), 0.3–0.35s,
  `easeOut`. Lists stagger children ~0.07s.
- **Layout transitions**: `layout` + `<AnimatePresence>` animate reordering,
  insertion, and removal (exit usually `opacity→0` + slight scale-down).
- **Shared-element highlights**: `layoutId` moves the active-nav pill/dot
  smoothly between items.
- **View transitions** (calendar month/week/day, month paging) slide by a
  signed `direction` value.
- **Micro-interactions**: buttons `active:scale-[0.98]`; count-up animation on
  KPI stat numbers (`easeOutQuart`, ~900ms).
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` collapses
  animation/transition durations globally in `globals.css`. Respect it.

### 8.2 Overlays, portals & stacking
- Modals, the command palette, and toasts sit above everything via the z-index
  token scale.
- The **mobile drawer and the command palette render through `createPortal`
  to `document.body`**. This is deliberate: the topbar uses `backdrop-filter`
  (glass), which makes it a *containing block* for `position: fixed`
  descendants — a fixed overlay nested inside it would be clipped to the header
  instead of covering the viewport. Portaling escapes that trap. **Any new
  full-screen fixed overlay created inside a glass/backdrop-filtered ancestor
  must be portaled to the body.**
- Overlays lock `document.body` scroll while open and close on `Esc` and
  backdrop click.

### 8.3 Feedback & affordances
- **Toasts** (sonner, bottom-right) confirm actions, celebrate milestones
  (habit streaks, goal thresholds), and surface errors. Toaster is themed via
  semantic classes, not hardcoded dark.
- **Focus**: a visible on-brand focus ring (`:focus-visible { outline: 2px
  solid hsl(var(--ring)) }`) for keyboard users.
- **Accessibility**: Radix primitives for menus/dialogs; `aria-label`,
  `aria-current`, `aria-modal`, `role="dialog"`, `sr-only` live regions
  (e.g. the Pomodoro timer announces remaining time); keyboard support in the
  command palette (↑/↓/Enter/Esc) and dnd-kit (keyboard sensor).

---

## 9. Responsive & Platform (Mobile / PWA) Design

DayFlow is **web-first but installable**. A hard rule in this codebase:
**mobile fixes must not alter the desktop rendering** — they are gated behind
breakpoints or use values that are inert on desktop.

### 9.1 Responsive strategy
- Mobile-first Tailwind breakpoints; the canonical split is `md` (sidebar vs
  drawer) and `sm` (compact vs full affordances).
- Touch adaptations that don't touch desktop: drag handles visible on mobile /
  hover on desktop; larger tap targets on mobile (`w-9 h-9 sm:w-7 sm:h-7`);
  the week view scrolls horizontally on phones (`min-w-[560px] md:min-w-0`);
  the search trigger is icon-only below `sm`.
- **iOS zoom guard**: all inputs/textareas are `text-base sm:text-sm` so mobile
  font-size is ≥16px, which stops iOS Safari from auto-zooming on focus.

### 9.2 PWA
- `public/manifest.json` — standalone display, brand theme color `#7c3aed`,
  PNG icons (192/512 + maskable) generated from the brand SVG mark, plus the
  SVG. `next/font` + `metadata`/`viewport` exports wire up icons, apple-touch
  icon, and `appleWebApp` (black-translucent status bar).
- `public/sw.js` — a service worker: **network-first for navigations** with a
  cached `/offline` fallback page, **stale-while-revalidate** for hashed build
  assets and static files, cache-versioned and self-cleaning. Registered
  **production-only** via `sw-register.tsx` (a stale worker in dev breaks HMR).
- `install-prompt.tsx` — because browsers no longer show an obvious install
  popup, DayFlow shows its **own** banner: a real Install button where
  `beforeinstallprompt` fires (Android/desktop Chrome), and Share → Add to Home
  Screen instructions on iOS. Hidden when already standalone, after install, or
  for 14 days after dismissal.
- **Safe-area handling**: the app opts into `viewport-fit: cover` and pads the
  sticky header, drawer, and install prompt by `env(safe-area-inset-*)` so
  content clears the iPhone notch/status bar in the installed PWA. These insets
  are `0` on non-notched devices, so desktop is unaffected.

---

## 10. Conventions Cheat-Sheet (for agents making changes)

1. **Colors** → semantic tokens (`bg-primary`, `text-muted-foreground`,
   `border-border/40`) or `rgba(var(--overlay), <alpha>)`. Never `white/…`,
   never raw hex/`rgba(255…)` in components (charts/SVG props included — use
   `rgba(var(--overlay),…)` or `hsl(var(--…))` there too).
2. **Both themes** must look right. If you add a surface, verify light + dark.
3. **Surfaces** are glass: reuse `.glass` / `.glass-strong` / `.glass-hover`,
   don't invent flat cards.
4. **Class names** always through `cn(...)`.
5. **Data** flows through a feature hook → `useDataStore`; do optimistic
   updates with rollback + a `toast` on error. Don't call Supabase from a
   component.
6. **New reorderable list** → wrap items in `SortableItem`, add a
   `reorder<Slice>` in the hook using 1000-step positions.
7. **New full-screen overlay** inside the glass shell → `createPortal` to
   `document.body`, lock body scroll, close on Esc + backdrop.
8. **Inputs** → `text-base sm:text-sm`; respect min-16px on mobile.
9. **Motion** → match the existing fade+rise/stagger/`layout` vocabulary and
   honor `prefers-reduced-motion`.
10. **Mobile changes** must be breakpoint-gated so the desktop web version is
    byte-for-byte unchanged.
11. **Icons** → lucide-react only.
12. **Nav** → edit `nav-items.ts` once; sidebar + drawer follow.

---

## 11. One-Paragraph Summary

DayFlow is a single-user productivity dashboard (notes, todos, habits,
calendar, pomodoro, goals, activity, analytics) built on Next.js 16 + React 19
+ Supabase, with all client state in a single stale-while-revalidate Zustand
cache fed by optimistic feature hooks and kept live by one realtime channel.
Its design is dark-first glassmorphism: frosted `backdrop-filter` panels with
noise and sheen over an atmospheric blob-lit background, a purple→blue→cyan
brand gradient used sparingly as accent, quiet small-caps labels, generous
rounding, and restrained fade-and-rise motion. Theming is token-driven —
semantic HSL CSS variables mapped into Tailwind via `@theme inline`, an
`--overlay` RGB token that flips white↔black so every incidental overlay works
in both light and dark, and `next-themes` toggling a class on `<html>`. The
same widgets serve both a staggered dashboard grid and full feature pages, the
shell adapts from a desktop sidebar to a body-portaled mobile drawer, and the
whole thing installs as an offline-capable PWA with careful iOS safe-area and
zoom handling — all under a strict rule that mobile fixes never change the
desktop rendering.
```
