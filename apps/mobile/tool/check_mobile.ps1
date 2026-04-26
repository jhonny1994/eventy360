$ErrorActionPreference = "Stop"

flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
flutter pub run intl_utils:generate
flutter analyze
flutter test

# Fail if generated sources or tracked mobile app files changed during checks.
git diff --exit-code -- lib pubspec.lock
