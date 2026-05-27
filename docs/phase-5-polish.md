# Phase 5 — Polish, Animation & Optimization

## Goal
Elevate the dashboard from functional to exceptional — smooth animations, responsive layout, performance, error handling, and deployment.

---

## 5.1 Framer Motion Animations

Apply motion throughout the dashboard for a premium feel.

### Widget Entry Animations
```tsx
// Staggered bento grid entry on page load
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}
```

### Interaction Animations
| Interaction | Animation |
|-------------|-----------|
| Todo check | Strikethrough sweeps left-to-right + opacity fade |
| Habit complete | Scale pulse (1 → 1.1 → 1) with color flash |
| Note save | "Saved" badge slides in from right, fades out |
| Pomodoro ring | SVG stroke-dashoffset transitions smoothly |
| Calendar month switch | Slide left/right based on direction |
| Stat card values | Number count-up animation on mount |

### Page Transitions
- Fade + slight upward slide between dashboard sections
- Sidebar nav items highlight with animated background pill

---

## 5.2 Responsive Layout

### Bento Grid Breakpoints
```css
/* Mobile: single column stack */
/* Tablet (md): 2-column grid */
/* Desktop (lg): 3-column bento with varied widget sizes */
```

### Widget Size Classes
| Widget | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| Notes | full | 1 col | 1 col |
| Todos | full | 1 col | 1 col |
| Habits | full | 2 col | 2 col |
| Calendar | full | 2 col | 2 col |
| Pomodoro | full | 1 col | 1 col |
| Activity | full | 1 col | 1 col |
| Charts | full | 2 col | 3 col |

### Sidebar → Bottom Nav on Mobile
- Sidebar collapses to a bottom tab bar on screens < `md`
- Icons only, no labels

---

## 5.3 Glassmorphism Refinements

- [ ] Ensure `backdrop-blur` degrades gracefully (fallback solid dark bg)
- [ ] Add subtle noise texture overlay via SVG filter for depth
- [ ] Animate glass border glow on widget focus/hover
- [ ] Dark scrollbar styling (`scrollbar-width: thin` + custom thumb color)

---

## 5.4 Error Handling & Loading States

### Loading Skeletons
Every widget shows a skeleton loader (pulsing glass card) while data fetches:
```tsx
<Skeleton className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
```

### Error Boundaries
- Wrap each widget in an `<ErrorBoundary>` component
- Widget-level errors show a small inline error state (not full-page crash)

### Toast Notifications (shadcn/ui Sonner)
| Event | Toast |
|-------|-------|
| Supabase mutation error | Red error toast |
| Note saved | Silent (no toast — use inline indicator) |
| Habit streak milestone (7 days) | Celebration toast |
| Pomodoro session complete | Success toast + sound (optional) |

---

## 5.5 Performance Optimizations

- [ ] `React.memo` on pure widget components to prevent re-renders
- [ ] `useMemo` for expensive streak/chart data calculations
- [ ] Debounce note auto-save (500ms) — already planned in Phase 2
- [ ] Virtualize long todo/note lists with `@tanstack/react-virtual` if lists grow large
- [ ] Lazy-load the Analytics page with `next/dynamic`
- [ ] Supabase queries use `.select()` with only needed columns (no `select *`)

---

## 5.6 Accessibility

- [ ] All interactive elements keyboard-navigable
- [ ] ARIA labels on icon-only buttons
- [ ] Focus rings visible (override Tailwind's `outline-none` where needed)
- [ ] Color contrast meets WCAG AA on dark backgrounds
- [ ] Pomodoro timer announces time in screen reader via `aria-live`

---

## 5.7 PWA Support (Optional Stretch)

- [ ] Add `manifest.json` with app name, icons, theme color
- [ ] Configure `next-pwa` for offline support
- [ ] Allow "Add to Home Screen" on mobile

---

## 5.8 Deployment

- [ ] Deploy to **Vercel** (zero-config Next.js)
- [ ] Set Supabase env vars in Vercel project settings
- [ ] Configure Supabase Auth redirect URLs for production domain
- [ ] Test all Supabase RLS policies in production
- [ ] Enable Vercel Analytics for performance monitoring

---

## Final Checklist

- [ ] All 6 widgets functional on mobile and desktop
- [ ] All animations smooth at 60fps
- [ ] No console errors or TypeScript errors
- [ ] Supabase RLS verified (users cannot access other users' data)
- [ ] Auth flow tested: sign up → dashboard → refresh → still logged in → logout
- [ ] Charts render with real data
- [ ] Deployed and accessible via public URL

---

## Phase Complete When
The dashboard is deployed, fully responsive, animated, and production-ready.
