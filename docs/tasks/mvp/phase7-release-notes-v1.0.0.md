# Eventy360 Mobile Release Notes

Version: `1.0.0+1`
Date: 2026-04-27
Artifact: `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`
SHA-256: `7890CA1EF4FA22995788F1841CE68BD7C0E3A76B7D4C979884FFD70E8B0192DB`

## Highlights

- rebuilt the mobile app around a stable bottom-navigation shell
- added dedicated account, trust, topics, saved-events, profile-edit, and security surfaces
- reworked onboarding and auth flow so users enter the real app shell without a forced setup takeover
- aligned event-driven abstract submission to the correct `Events -> Event -> Submit` workflow
- expanded event detail toward web parity with richer timing, organizer, contact, and reference content
- expanded submission detail, repository detail, and trust surfaces with clearer hierarchy and safer file handling
- added better refresh behavior, interaction feedback, and state consistency across major return paths
- kept localization, theme, notification preferences, and researcher settings visible and controllable in-product

## Verification

- `flutter analyze` passed
- full `flutter test` passed
- `flutter build apk --release` passed

## Known Release Blockers

- production release signing inputs are not yet present in the workspace
- no connected Android device or emulator was available for final release APK install verification
- GitHub CLI is not installed on this machine, so release publishing was not completed here

## Publish Checklist

1. add real Android release keystore inputs through `apps/mobile/android/key.properties` or supported environment variables
2. rebuild `flutter build apk --release`
3. install and verify on target Android device
4. publish `app-release.apk`, checksum, and these release notes to GitHub Releases
