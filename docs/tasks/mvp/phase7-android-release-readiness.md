# Phase 7 Android Release Readiness

Date: 2026-04-27
Status: In progress

## Purpose

This file defines the release-signing and artifact expectations for the Eventy360 mobile Android build.

## Release Signing Inputs

The mobile app now supports release signing through either:

1. `apps/mobile/android/key.properties`
2. environment variables

Supported environment variables:

- `ANDROID_STORE_FILE`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Example file template:

- `apps/mobile/android/key.properties.example`

## Current Build Behavior

- if release signing inputs are present, the Android release build uses the release signing config
- if release signing inputs are missing, the Android release build falls back to the debug signing config so local release verification can still run

This fallback is acceptable for local validation only.
It is not acceptable for a production publish.

## Production Release Rule

Before publishing to GitHub Releases or distributing externally:

- a real release keystore must be configured
- the produced APK must be built with release signing
- checksum must be generated from the final signed artifact
- release notes must match the exact version being published

## Required Files And Paths

- Android signing config:
  - `apps/mobile/android/app/build.gradle.kts`
- Signing template:
  - `apps/mobile/android/key.properties.example`
- Ignored local secrets:
  - `apps/mobile/.gitignore`

## Remaining Blockers

1. real keystore path and secrets are not yet present in the workspace
2. final publish step depends on GitHub release permissions and chosen release notes
