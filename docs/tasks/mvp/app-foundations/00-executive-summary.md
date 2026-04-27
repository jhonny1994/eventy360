# Executive Summary

Date: 2026-04-25
Program: Eventy360 Flutter Researcher App
Package: `com.carbodex.eventy360`
Release shape: Android-first, GitHub Releases first, researcher-only

## Summary

Eventy360 already operates as a web product backed by Supabase. The next product milestone is a production Flutter mobile app for researchers. This is a full researcher-feature release, not a companion shell.

The mobile product must support the researcher lifecycle end to end: onboarding, discovery, bookmarks, topic interests, submissions, verification, subscription and payment, repository access, notifications, and account management. The app must be mobile-native, Arabic-first with English support, secure around documents and payments, and disciplined in release engineering.

## Why This Matters

Researchers use deadline-driven, status-sensitive workflows that do not fit well into a web-only operating model. Mobile can improve:

- researcher retention through short-session usability,
- response time to deadlines and decisions through critical notifications,
- workflow completion for submissions, verification, and payment,
- product credibility by making Eventy360 feel like a serious research operations platform.

## Strategic Decisions

- The app is researcher-only in v1.
- Organizer and admin flows remain web-only.
- Android is the first release platform.
- GitHub Releases is the first distribution channel.
- Arabic RTL and English are release-blocking.
- Dynamic persistent theme is part of v1.
- Critical push notifications are part of v1.
- The backend must be rebuilt from a clean ground-zero database baseline before mobile write workflows are treated as production-ready.

## Grounding From Current Product

The current web product already establishes several important researcher truths that mobile should preserve:

- full access is gated by complete profile state,
- the researcher dashboard emphasizes profile completion, verification, and subscription state,
- submissions are researcher-only,
- starting a submission happens from event discovery or event detail,
- topic subscriptions and repository access are premium-gated,
- payments are handled through a history plus reporting workflow,
- verification combines status, guidance, and document upload.

Mobile should inherit those feature semantics while replacing web layout and shell patterns with mobile-native flows.

## Program Outcome

Ship a production-grade Flutter app that enables researchers to complete their core Eventy360 workflows on mobile with secure backend contracts, strong UX clarity, and release-ready operational quality.
