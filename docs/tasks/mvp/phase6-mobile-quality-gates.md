# Phase 6 Mobile Quality Gates

Date: 2026-04-26

## Purpose

This document defines the production-readiness gate for the Eventy360 mobile MVP.

It standardizes:

- one canonical local automated check command set
- CI requirements for `apps/mobile`
- milestone validation evidence and pass/fail policy
- push operational checks before release
- production UI audit expectations for mobile routes
- manual route parity and preference validation coverage

## 1. Canonical Local Automated Checks

Run the same command set locally before every mobile PR and before every release tag.

### Windows PowerShell

```powershell
cd C:\Users\raouf\projects\eventy360\apps\mobile
.\tool\check_mobile.ps1
```

### Bash

```bash
cd apps/mobile
bash tool/check_mobile.sh
```

### What the command set enforces

1. `flutter pub get`
2. `flutter pub run build_runner build --delete-conflicting-outputs`
3. `flutter pub run intl_utils:generate`
4. `flutter analyze`
5. `flutter test`
6. `git diff --exit-code -- lib pubspec.lock`

The final `git diff` guard ensures generated sources and tracked mobile artifacts are committed, not only generated locally.

## 2. CI Quality Gate

The `CI` workflow must enforce the same mobile checks used locally.

Required mobile CI steps:

1. install Flutter dependencies
2. run code generation
3. run localization generation
4. fail if tracked mobile sources changed after generation
5. run `flutter analyze`
6. run `flutter test`

This makes CI a real integrity gate rather than only a lint-and-test runner.

## 3. Milestone Manual Validation Template

Use this template for milestone validations `#1` through `#5`.

### Header

- Milestone id:
- Date:
- Tester:
- Branch or commit:
- Device model:
- Android version:
- Backend project:
- Firebase project:
- Supabase project:

### Objective

- What user outcome is being validated:

### Preconditions

- Authenticated researcher account available
- Required seed data or event records available
- Push-capable Android device available when milestone includes notifications
- Network connection stable

### Executed Steps

1. Step:
2. Expected result:
3. Actual result:
4. Evidence captured:

Repeat for every critical user step.

### Evidence Requirements

Required evidence for a passing milestone:

1. commit hash or build identifier
2. screenshots for key success states
3. screenshots or logs for failures encountered
4. exact timestamps for push validations
5. ids for affected records when testing writes:
   - submission id
   - verification request id
   - payment id
   - notification id or topic id when available

### Defect Log

- Severity:
- Summary:
- Reproduction steps:
- Evidence:
- Blocking:

### Outcome

- `Pass`
- `Pass with non-blocking issues`
- `Fail`

### Sign-off

- Tester:
- Follow-up owner:
- Re-test required:

## 4. Objective Acceptance Criteria

Milestones pass only if all conditions below are true:

1. every critical path step succeeds exactly as specified
2. no `blocker` or `high` severity defect remains open
3. no backend write ends in an ambiguous state
4. required evidence is attached
5. automated checks are green on the same commit or a newer fix commit

### Severity Policy

- `Blocker`: core flow cannot complete or data integrity is at risk
- `High`: flow completes incorrectly, misleadingly, or unsafely
- `Medium`: workaround exists but user confidence or polish is meaningfully impacted
- `Low`: cosmetic or minor usability issue with no integrity risk

### Pass/Fail Threshold

- `Pass`: zero blocker, zero high, zero medium defects
- `Pass with non-blocking issues`: zero blocker, zero high, medium issues documented and accepted explicitly
- `Fail`: any blocker or high defect, or missing required evidence

## 5. Push Operational Validation Checklist

Run this checklist for milestones that include topic push or release sanity.

1. Confirm notification permission is requested only after topic-intent action.
2. Confirm FCM token registration succeeds after permission grant.
3. Confirm topic subscription write succeeds in backend.
4. Confirm push is sent to a subscribed topic from the backend sender path.
5. Confirm the device receives the push while app is foregrounded.
6. Confirm the device receives the push while app is backgrounded.
7. Confirm tapping the notification deep-links into the expected event context.
8. Confirm Arabic profile language resolves Arabic content.
9. Confirm English profile language resolves English content.
10. Confirm failed delivery or invalid token cases are visible in observability queries.
11. Confirm stale or unregistered tokens are cleaned up by the backend path.
12. Confirm duplicate notifications are not emitted for a single event trigger.

Evidence to capture:

1. device timestamp
2. topic id
3. event id
4. backend delivery record or query output
5. screen recording or screenshots of receipt and deep-link result

## 6. Milestone Checklist Mapping

### Milestone #1

- auth
- onboarding
- profile gate
- home

### Milestone #2

- discovery
- bookmarks
- topics
- real subscribed-topic push

### Milestone #3

- abstract submission
- full-paper submission
- revision submission
- receipts and retry behavior

### Milestone #4

- verification upload
- payment reporting
- payment history
- repository list, detail, and download

### Milestone #5

- release candidate install
- end-to-end researcher sanity sweep
- rollback and hotfix readiness

## 7. UI Production Gate

The mobile release is not ready unless it also passes the UI production audit:

- [phase6-mobile-ui-production-audit.md](C:/Users/raouf/projects/eventy360/docs/tasks/mvp/phase6-mobile-ui-production-audit.md)

Mandatory UI gate checks:

1. all primary researcher routes use the shared page architecture
2. auth and gate flows use a coherent shared shell
3. status-heavy pages show current state before long descriptive content
4. forms use persistent labels, clear hierarchy, and obvious primary actions
5. loading, empty, blocked, error, and success states are visually explicit
6. Arabic, English, light, dark, and large-text validation are completed on critical flows
7. no critical route regresses to raw scaffold-like `ListView + Card + SizedBox` composition without shared primitives

## 8. Additional Manual Coverage Documents

Use these alongside this quality gate during phase 6:

1. [phase6-mobile-route-parity-checklist.md](C:/Users/raouf/projects/eventy360/docs/tasks/mvp/phase6-mobile-route-parity-checklist.md)
2. [phase6-mobile-manual-validation-coverage.md](C:/Users/raouf/projects/eventy360/docs/tasks/mvp/phase6-mobile-manual-validation-coverage.md)

These documents are the canonical source for:

1. route-by-route parity checks
2. settings discoverability checks
3. theme persistence checks
4. language switching checks
5. notification preference entry checks
6. large-text and RTL sweeps
7. cold-start and background-resume validation
