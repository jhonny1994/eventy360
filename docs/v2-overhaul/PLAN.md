# V2 Overhaul: Implementation Plan

**Status:** Planning Phase
**Branch:** `v2-overhaul`

This plan details the step-by-step execution of the v2 UI overhaul.

---

## Phase 1: Foundation & Setup (Critical)

### 1.1 Branch & Directory Prep
- [ ] Checkout `v2-overhaul` branch.
- [ ] **Rename & Replace:**
    - [ ] Rename `src/app` -> `src/app-v1`
    - [ ] Rename `src/components` -> `src/components-v1`
    - [ ] Create empty `src/app` and `src/components`.
- [ ] **Design System Implementation:**
    - [ ] **Read:** `docs/v2-overhaul/DESIGN_SYSTEM.md` (Source of Truth).
    - [ ] **Setup:** Define semantic color tokens in `src/app/globals.css` (CSS Variables).
    - [ ] **Components:** Create `src/components/ui` (Button, Input, Card, Modal, Badge) following the "Modern Academic" style.
    - [ ] **Fonts:** Ensure `Inter` and `Noto Kufi Arabic` are correctly configured in `layout.tsx`.

### 1.2 i18n Strategy
- [ ] Create `messages/v2.json` (or add `v2` key to `ar.json`).
- [ ] Ensure `src/i18n/request.ts` (or equivalent) loads the new messages.

---

## Phase 2: Core Infrastructure

### 2.1 Middleware Adaptation
- [ ] **Audit:** Review `middleware.ts` (Root).
- [ ] **Update:** Add `v2` paths to `UNAUTHENTICATED_USER_ACCESSIBLE_PATHS`.
- [ ] **Update:** Add `v2` patterns to `subscriptionGuardsConfig`.
- [ ] **Redirects:** Implement logic to redirect unauthenticated `/v2` access to `/v2/login`.

### 2.2 Global UX Components
- [ ] Create `src/app/[locale]/layout.tsx` (Root Layout v2).
- [ ] Create `src/app/[locale]/not-found.tsx`.
- [ ] Create `src/app/[locale]/error.tsx`.
- [ ] Create `src/app/[locale]/loading.tsx`.

---

## Phase 3: Feature Implementation (The Build)

### 3.1 Authentication & Onboarding (v2)
- [ ] Build `/v2/login` page.
- [ ] Build `/v2/register` page.
- [ ] Build `/v2/forgot-password` page.
- [ ] **Integration:** Connect to `src/lib/supabase/client` (Auth).
- [ ] **Onboarding:** Build `/complete-profile` page for extended profile data collection.

### 3.2 Workspace Shell
- [ ] Build `src/components/layout/Sidebar.tsx` (Role-based: Researcher/Organizer/Admin).
- [ ] Build `src/components/layout/Header.tsx` (User menu, Notifications trigger).
- [ ] Build `src/app/[locale]/v2/workspace/layout.tsx`.

### 3.3 Notifications System (New Feature)
- [ ] **Database:** Create `notifications` table (Additive -> Apply to Main).
- [ ] **Backend:** Create `process-notification-queue` Edge Function updates (if needed).
- [ ] **UI:** Build Notification Center (Dropdown/Panel).
- [ ] **Realtime:** Integrate Supabase Realtime for live updates.

### 3.4 Core Features (Researcher Role)
- [ ] **Dashboard:** Build `/v2/workspace/researcher` dashboard.
- [ ] **Repository:** Build `/v2/workspace/repository` for managing user files.
- [ ] **Bookmarks:** Build `/v2/workspace/bookmarks` for saved events/items.
- [ ] **Topics:** Build `/v2/workspace/topics` for managing topic interests.
- **Settings:**
    - [ ] Build `/v2/workspace/settings/security`.
    - [ ] Build `/v2/workspace/settings/verification`.

### 3.5 Core Features (Organizer Role)
- [ ] **Dashboard:** Build `/v2/workspace/organizer` dashboard.
- [ ] **Create Event:** Build `/v2/events/create` multi-step form.
- [ ] **Manage Event:** Build `/v2/events/manage` dashboard.
- [ ] **Edit Event:** Build `/v2/events/[id]/edit` form.
- [ ] **Submissions:** Build Submission Review interface.
- [ ] **Tools:** Implement Export Tools (CSV/PDF) and Email Authors Tool.

### 3.6 Admin Dashboard (v2)
- [ ] Rebuild Admin Layout.
- [ ] **Admins:** Build `/v2/admin/admins` for managing admin users.
- [ ] **Users:** Build `/v2/admin/users` for managing platform users.
- [ ] **Events:** Build `/v2/admin/events` for event approvals.
- [ ] **Payments:** Build `/v2/admin/payments` for recording/viewing payments.
- [ ] **Submissions:** Build `/v2/admin/submissions` for global oversight.
- [ ] **Topics:** Build `/v2/admin/topics` for managing research topics.
- [ ] **Verifications:** Build `/v2/admin/verifications` for reviewing documents.
- [ ] **System Health:** Build view using `admin_actions_log`.

---

## Phase 4: Public Pages & SEO

### 4.1 Public Profiles
- [ ] Build `/u/[username]` (Public Profile).
- [ ] SEO: Dynamic Metadata.

### 4.2 Public Events
- [ ] Build `/events/[slug]` (Public Event Page).
- [ ] SEO: JSON-LD Schema (Event).

### 4.3 Static Pages
- [ ] Landing Page (Home).
- [ ] Legal Pages (Terms, Privacy).

---

## Phase 5: Verification & Merge

### 5.1 Testing & Verification
- [ ] **Functional Testing:** Manual walkthrough of all user flows (Researcher, Organizer, Admin).
- [ ] **Visual Regression:** Check for layout shifts or broken styles.
- [ ] **Mobile Responsiveness:** Verify all pages on mobile viewports.
- [ ] **Accessibility Audit:**
    - [ ] Run Lighthouse Accessibility check (Target 90+).
    - [ ] Verify Keyboard Navigation (Tab order, Focus states).
    - [ ] Verify Screen Reader support (Alt text, Aria labels).
- [ ] **Dark Mode Verification:** Ensure no "flashbang" white backgrounds or unreadable text in dark mode.

### 5.2 The Switch
- [ ] Delete `src/app-v1` and `src/components-v1`.
- [ ] **Cleanup:** Route Normalization (Move `/v2/*` to `/`).
- [ ] Merge `v2-overhaul` -> `main`.
- [ ] Deploy & Monitor.
