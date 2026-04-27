# Phase 7 Rollback And Hotfix Procedure

Date: 2026-04-27
Status: Ready

## Rollback Rule

If the released APK introduces a blocker in authentication, navigation, submissions, trust, or repository access:

1. stop further distribution immediately
2. remove or replace the GitHub Release artifact
3. revert to the last known-good APK and checksum
4. log the blocking defect with exact route, device, and reproduction steps

## Hotfix Rule

Use a hotfix only when:

- the issue blocks sign-in or session restore
- the issue blocks event discovery or submission completion
- the issue breaks verification, payment reporting, or repository access
- the issue causes startup crash, route trap, or data loss

## Hotfix Steps

1. branch from the released commit
2. apply the minimal targeted fix
3. rerun:
   - `flutter analyze`
   - `flutter test`
   - `flutter build apk --release`
4. verify the exact broken flow on device
5. generate new checksum
6. publish replacement release notes with clear hotfix scope

## Evidence Required

- failing route or flow
- before/after reproduction result
- analyze output clean
- tests clean
- release artifact checksum
