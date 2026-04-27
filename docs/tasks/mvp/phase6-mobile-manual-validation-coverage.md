# Phase 6 Mobile Manual Validation Coverage

Date: 2026-04-27
Status: Active manual validation coverage

## Purpose

This document expands the phase 6 quality gate into concrete manual coverage for:

- settings discoverability
- theme persistence
- language switching
- notification preference entry points
- large-text and RTL regressions
- cold-start, background-resume, and return-to-task behavior

It is the execution companion to:

- [phase6-mobile-quality-gates.md](C:/Users/raouf/projects/eventy360/docs/tasks/mvp/phase6-mobile-quality-gates.md)
- [phase6-mobile-route-parity-checklist.md](C:/Users/raouf/projects/eventy360/docs/tasks/mvp/phase6-mobile-route-parity-checklist.md)

## 1. Settings Discoverability Coverage

### Objective

Confirm that a real user can discover and understand account, settings, and preference controls without prior product knowledge.

### Required checks

1. From bottom navigation, user can clearly identify `Account`.
2. Account overview communicates:
   - verification status
   - subscription status
   - notification status
3. User can find:
   - language
   - theme
   - notification preferences
   - profile editing
   - security
   - trust center
   - saved events
   - topic subscriptions
4. User can reach payment reporting from both:
   - account subscription section
   - trust center
5. User can understand which screen owns:
   - preferences
   - identity
   - verification
   - billing

### Evidence

1. account home screenshot
2. subscription section screenshot
3. preferences section screenshot
4. trust entry screenshot

## 2. Theme Persistence Coverage

### Objective

Confirm theme behavior is user-facing, stable, and persistent.

### Required checks

1. Set theme to `Follow system`, close app, reopen, confirm state persists.
2. Set theme to `Light`, close app, reopen, confirm state persists.
3. Set theme to `Dark`, close app, reopen, confirm state persists.
4. Confirm theme choice affects:
   - home
   - events
   - submissions
   - repository
   - account
5. Confirm no route visually regresses into unreadable contrast.

### Evidence

1. one screenshot for light home
2. one screenshot for dark home
3. one screenshot for dark repository

## 3. Language Switching Coverage

### Objective

Confirm language changes are real product behavior, not hidden implementation state.

### Required checks

1. Switch from English to Arabic in Account.
2. Close app and reopen; Arabic persists.
3. Confirm key routes render in Arabic:
   - home
   - events
   - submissions
   - repository
   - account
4. Switch back to English.
5. Close app and reopen; English persists.

### Evidence

1. Arabic account screenshot
2. Arabic home screenshot
3. English account screenshot after switching back

## 4. Notification Preference Coverage

### Objective

Confirm notification preference entry points are understandable and operational.

### Required checks

1. User can find notification preferences in Account.
2. Topic subscription path requests permission only after topic-intent action.
3. Notification preference sheet offers:
   - permission request action
   - system settings handoff
4. Denied permission flow still gives a recoverable path.
5. Home notification education links back into Account preferences appropriately.

### Evidence

1. account notification preferences screenshot
2. topic subscription permission request screenshot or recording
3. system settings handoff screenshot

## 5. Large-Text Regression Coverage

### Required font scales

1. Android default
2. Android `1.3x`
3. Android `2.0x`

### Must check on each scale

1. home
2. events
3. event detail
4. submissions
5. submission detail
6. repository
7. account
8. trust
9. payment report

### Pass criteria

1. no clipped primary CTA
2. no overlapped title or status chip
3. no unusable filter control
4. no inaccessible bottom navigation destination

## 6. RTL Coverage

### Required routes

1. onboarding
2. sign in
3. profile gate
4. initial setup
5. home
6. events
7. event detail
8. submissions
9. repository
10. account
11. trust
12. payment report

### Pass criteria

1. content hierarchy still scans naturally
2. chips and badges align acceptably
3. form labels and helper text do not become ambiguous
4. section order still makes sense

## 7. Cold-Start And Resume Coverage

### Cold-start scenarios

1. first launch to onboarding
2. authenticated launch to home
3. authenticated launch to initial setup when not completed
4. authenticated launch to selected tab after prior use

### Background-resume scenarios

1. home after idle
2. event detail after idle
3. submission detail after idle
4. payment report after idle
5. account after idle

### Return-to-task scenarios

1. events list -> detail -> back
2. submissions list -> detail -> back
3. repository list -> detail -> back
4. topic permissions -> app settings -> return
5. payment report -> submit -> trust history

### Pass criteria

1. no route crash
2. no unexpected redirect loop
3. no lost primary context for critical workflows
4. no visual shell corruption after resume

## 8. Phase 6 Execution Sequence

Run manual coverage in this order:

1. settings discoverability
2. theme persistence
3. language switching
4. notification preferences
5. large-text sweep
6. RTL sweep
7. cold-start and resume sweep
8. route-by-route parity sweep

This order catches preference-system regressions before broader route QA.

## 9. Blocking Outcomes

Phase 6 cannot be considered complete if any of the following occur:

1. language or theme fails to persist
2. notification preferences are not discoverable
3. bottom navigation becomes unusable at large text
4. Arabic layout breaks a primary route
5. cold start or resume causes route crashes or context loss in a critical workflow
