# Implementation Task List

Date: 2026-04-25

## High-Level Sequence

1. Reset backend planning around a new ground-zero schema baseline
2. Rebuild mobile-safe backend contracts and storage/privacy rules
3. Scaffold Flutter foundation with Riverpod v3 and Freezed 3
4. Implement auth, profile, home, events, and read-first flows
5. Implement write workflows after backend contracts are proven
6. Add notifications, CI, release automation, QA, and security verification

## Detailed Task Set

### 0. Branch Setup

- Create feature branch
- Preserve unrelated worktree changes
- Record branch and handoff context

### 1. Backend Baseline

- Reproduce current Supabase blockers
- Resolve local runtime conflict
- Define canonical schema baseline
- Replace drifted migration history
- Fold submission, revision, privacy, and access fixes into the baseline
- Add notification and device-token structures
- Verify RLS and grants

### 2. Mobile Scaffold

- Create `apps/mobile`
- Set `com.carbodex.eventy360`
- Add Flutter dependencies, codegen, lints, localization, Firebase, and Supabase
- Validate first build

### 3. Shared Foundation

- Build routing
- Build app shell
- Build theme system
- Build localization wiring
- Build shared primitives
- Build cache and preference storage

### 4. Researcher Core

- Auth
- Profile
- Home
- Events
- Bookmarks
- Topics

### 5. Submission And Trust Flows

- Submission list and detail
- Abstract submission
- Full-paper submission
- Revision submission
- Verification
- Subscription and premium guard
- Payment flow
- Repository access

### 6. Notifications

- Permission flow
- Token registration and refresh
- Inbox
- Preferences
- Deep-link navigation

### 7. Quality And Release

- Unit tests
- Widget tests
- Integration tests
- Accessibility verification
- Localization verification
- Security review
- CI updates
- Signed Android release workflow
- Checksum and release validation

## Full Detailed Checklist

The detailed checklist that used to live as a top-level planning file is intentionally collapsed here into the execution sequence above. Implementation teams should expand the current active workstream into sprint or issue-level tasks rather than maintain another competing master plan document.
