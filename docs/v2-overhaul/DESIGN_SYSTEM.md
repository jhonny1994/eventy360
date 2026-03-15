# Eventy360 V2 Design System

**Status:** Active
**Version:** 2.0
**Philosophy:** "Modern Academic" — Clean, Content-First, Trustworthy, Minimalist.

This document serves as the **Single Source of Truth** for all UI/UX decisions in the V2 overhaul. All AI agents and developers must strictly adhere to these guidelines to ensure consistency, accessibility, and a premium user experience.

---

## 1. Core Principles

1.  **Content Over Chrome:** The UI frames the content (events, research, data). It does not compete with it. Avoid heavy backgrounds or excessive decoration.
2.  **Bento Grid Layouts:** Use grid-based, modular layouts for dashboards and content collections. This handles variable content sizes gracefully.
3.  **Strict Consistency (DRY):** Do not invent new styles. Use the defined tokens. If a component exists, use it. If it doesn't, build it generically.
4.  **Accessibility First:** All text must meet WCAG AA contrast. All interactive elements must have visible focus states.
5.  **Native i18n:** Every component must look perfect in both LTR (English/French) and RTL (Arabic).

---

## 2. Tech Stack & Configuration

*   **Framework:** Tailwind CSS v4 (CSS-first configuration).
*   **Component Library:** Flowbite React (Headless/Styled base).
*   **Icons:** Lucide React (Stroke width: 1.5px or 2px consistent).
*   **Fonts:** `Inter` (Latin) + `Noto Kufi Arabic` (Arabic).

---

## 3. Design Tokens

### 3.1. Color Palette (Semantic)

We use a **Semantic Color System**. Do not use raw hex codes in components. Use Tailwind utility classes that map to these variables.

| Token | Light Mode (`bg-white`) | Dark Mode (`bg-zinc-950`) | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `blue-800` (#0D47A1) | `blue-500` (#3B82F6) | Main actions, active states, links. |
| **Secondary** | `amber-500` (#F59E0B) | `amber-400` (#FBBF24) | High-priority calls to action (Register, Alert). |
| **Background** | `slate-50` (#F8FAFC) | `black` (#000000) | Page background. |
| **Surface** | `white` (#FFFFFF) | `zinc-900` (#18181B) | Cards, Modals, Sidebars. |
| **Border** | `slate-200` (#E2E8F0) | `zinc-800` (#27272A) | Dividers, Card borders, Input borders. |
| **Text Main** | `slate-900` (#0F172A) | `slate-50` (#F8FAFC) | Headings, primary body text. |
| **Text Muted** | `slate-500` (#64748B) | `slate-400` (#94A3B8) | Subtitles, metadata, hints. |
| **Destructive** | `red-600` (#DC2626) | `red-500` (#EF4444) | Delete, Error, Critical actions. |

### 3.2. Typography

*   **Font Family:** `font-sans` (Inter + Noto Kufi).
*   **Headings:** `font-bold`, `tracking-tight`.
    *   H1: `text-3xl md:text-4xl`
    *   H2: `text-2xl md:text-3xl`
    *   H3: `text-xl md:text-2xl`
*   **Body:** `text-base`, `leading-relaxed`.
*   **Small:** `text-sm`, `font-medium` (for UI labels).

### 3.3. Spacing & Radius

*   **Radius:** `rounded-xl` (12px) is the default for Cards, Inputs, and Modals. `rounded-lg` (8px) for small buttons.
*   **Padding:**
    *   Page Container: `px-4 md:px-6 lg:px-8`
    *   Card Content: `p-6`
    *   Section Gap: `gap-6` or `gap-8`

### 3.4. Depth & Elevation

Prefer **borders** over shadows for a cleaner look.
*   **Default:** `border border-border` (Flat, clean).
*   **Hover:** `hover:border-primary/50` or subtle `hover:shadow-sm`.
*   **Floating (Modals/Dropdowns):** `shadow-xl border border-border`.

---

## 4. Component Patterns

### 4.1. Buttons
*   **Primary:** `bg-primary text-white hover:bg-primary/90 shadow-sm`.
*   **Secondary:** `bg-white text-slate-900 border border-slate-200 hover:bg-slate-50`.
*   **Ghost:** `text-slate-600 hover:bg-slate-100 hover:text-slate-900`.
*   **Destructive:** `bg-red-50 text-red-600 hover:bg-red-100`.
*   **Size:** `h-10 px-4` (Standard), `h-12 px-6` (Large/CTA).

### 4.2. Inputs & Forms
*   **Style:** `bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl`.
*   **Focus:** `ring-2 ring-primary/20 border-primary`.
*   **Labels:** Top-aligned, `text-sm font-medium text-slate-700 dark:text-slate-300`.
*   **Validation:** Inline error messages in `text-red-600 text-sm mt-1`.

### 4.3. Cards (The "Bento" Block)
*   **Container:** `bg-surface border border-border rounded-xl overflow-hidden`.
*   **Header:** `p-6 border-b border-border` (Optional).
*   **Body:** `p-6`.
*   **Footer:** `p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-border`.

### 4.4. Status Badges
*   **Success:** `bg-green-50 text-green-700 border border-green-200`.
*   **Warning:** `bg-amber-50 text-amber-700 border border-amber-200`.
*   **Error:** `bg-red-50 text-red-700 border border-red-200`.
*   **Neutral:** `bg-slate-100 text-slate-700 border border-slate-200`.
*   **Shape:** `rounded-full px-2.5 py-0.5 text-xs font-medium`.

---

## 5. Layout & Navigation

### 5.1. Page Shell
*   **Navbar:** Sticky top, `backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-border`.
*   **Sidebar (Admin/Dashboard):** Fixed left, `w-64 bg-surface border-r border-border`.
*   **Main Content:** `max-w-7xl mx-auto w-full`.

### 5.2. Dashboard (Bento Grid)
Use CSS Grid for dashboards:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="col-span-1 md:col-span-2">Main Chart</div>
  <div className="col-span-1">Stats Column</div>
</div>
```

---

## 6. Accessibility & Internationalization (i18n)

### 6.1. Accessibility Standards (WCAG 2.1 AA)
*   **Contrast Ratios:**
    *   **Normal Text:** Must have a contrast ratio of at least **4.5:1** against the background.
    *   **Large Text (18pt+ or 14pt+ bold):** Must have a contrast ratio of at least **3:1**.
    *   **UI Components (Inputs, Buttons):** Borders and icons must have a contrast ratio of at least **3:1**.
*   **Focus Indicators:**
    *   **Never** remove outline (`outline: none`) without providing an alternative.
    *   Use `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` for clear visibility.
*   **Screen Readers:**
    *   All images must have `alt` text.
    *   Icon-only buttons must have `aria-label`.
    *   Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`) to define page structure.

### 6.2. RTL Support
*   **Never** use `ml-*` or `mr-*`. Use `ms-*` (margin-start) and `me-*` (margin-end).
*   **Never** use `pl-*` or `pr-*`. Use `ps-*` (padding-start) and `pe-*` (padding-end).
*   **Never** use `text-left` or `text-right` unless strictly necessary. Use `text-start` and `text-end`.

### 6.3. Dark Mode
*   Use the `dark:` modifier for all color overrides.
*   **Avoid Pure Black:** Use `bg-zinc-950` or `bg-black` with `bg-zinc-900` surfaces to reduce eye strain.
*   **Borders:** Dark mode borders should be subtle (`border-zinc-800`), not stark white.

### 6.4. Motion
*   Use `framer-motion` for layout transitions.
*   **Duration:** Fast (200ms - 300ms).
*   **Easing:** `ease-out`.
*   **Reduced Motion:** Respect `prefers-reduced-motion`.

---

## 7. Implementation Checklist (For AI Agents)

When creating a new UI component:
1.  [ ] Does it use the semantic color tokens? (No hardcoded hex).
2.  [ ] Is it responsive? (Mobile, Tablet, Desktop).
3.  [ ] Does it support Dark Mode?
4.  [ ] Does it support RTL (Arabic)? (Check margins/paddings).
5.  [ ] Is it accessible? (Focus states, aria-labels).
6.  [ ] Does it follow the "Modern Academic" aesthetic? (Clean, bordered, rounded-xl).
