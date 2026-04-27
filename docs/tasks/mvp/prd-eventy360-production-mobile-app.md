# Product Requirements Document: Eventy360 Production Mobile App

Date: 2026-04-26
Status: Ready for implementation planning

## 1. Introduction/Overview

Eventy360 needs a convincing production researcher mobile app quickly, using existing platform behavior and real backend writes, while keeping risk controlled through targeted reliability guards and strict validation.

This feature delivers a researcher-only Flutter app that runs real end-to-end workflows for submissions, verification, payment, repository access, and subscribed-topic push notifications, and distributes Android builds through GitHub Releases.

## 2. Goals

1. Deliver a researcher-only Android app with real connected workflows.
2. Use real end-to-end writes for critical researcher actions.
3. Add minimal reliability protections suitable for mobile networks and retries.
4. Deliver real subscribed-topic push notifications.
5. Ship release artifacts through GitHub Releases.
6. Enforce milestone manual validation and final full walkthrough before sign-off.

## 3. User Stories

- As a researcher, I want to complete my core event and submission workflow from mobile without switching to web.
- As a researcher, I want topic-based push alerts to reach me and open the right screen.
- As a researcher, I want verification and payment proof workflows to actually submit and persist.
- As a product owner, I want a production app flow I can present with real data and real outcomes.

## 4. Functional Requirements

1. The app must support researcher-only authentication and session restore.
2. The app must implement onboarding, profile completion gate, and researcher home dashboard.
3. The app must implement event discovery, event detail, bookmarks, and topic subscriptions using real data.
4. The app must implement real subscribed-topic push notifications and deep-link routing.
5. The app must support abstract submission with real end-to-end write behavior.
6. The app must support full-paper submission with real end-to-end write behavior.
7. The app must support revision submission with real end-to-end write behavior.
8. The app must support verification document upload with real end-to-end write behavior.
9. The app must support payment report and proof upload with real end-to-end write behavior.
10. The app must support repository browse, detail, and download behavior backed by real backend data.
11. Critical write flows must include minimal reliability guards:
    - retry-safe UI behavior for transient failures,
    - duplicate-submit prevention in client flow,
    - idempotency key support where backend path allows it,
    - clear success/failure receipts for user trust.
12. The app must support Arabic RTL and English in key flows.
13. The app must support dynamic persistent theme.
14. Android release artifacts must be prepared and published through GitHub Releases.

## 5. Non-Goals (Out of Scope)

- Ground-zero backend migration and contract redesign
- Long-term production hardening beyond minimal mobile reliability guards
- Organizer/admin mobile experience
- iOS release in this phase
- Replacing the preserved long-term safe production plan

## 6. Design Considerations

- Mobile UX must follow mobile-native navigation and screen patterns, not web shell layouts.
- Home should emphasize next actions, deadlines, and status clarity.
- Forms and uploads must surface progress and failure clearly.
- Notification permission must be requested contextually, not immediately on first launch.

## 7. Technical Considerations

- Flutter architecture: feature-first with `presentation`, `application`, `domain`, `infrastructure`.
- State management: Riverpod v3.
- Model/state tooling: Freezed where appropriate.
- Localization workflow: `flutter-intl`.
- Routing: production-grade deep-link-ready navigation.
- Existing backend contracts are used in this phase, with minimal mobile reliability guards added in app-side flow handling.

## 8. Success Metrics

- Researcher can complete auth, discovery, topic subscribe, submissions, verification, payment, and repository flows from mobile using real data.
- Subscribed-topic push notifications are delivered and deep-link correctly.
- Automated checks pass at each phase.
- Manual milestone sign-offs pass:
  - auth/home,
  - discovery/topics/push,
  - submissions,
  - verification/payment/repository,
  - release candidate.
- Final full manual walkthrough passes before release publication.
- Android artifact is published in GitHub Releases for this phase.

## 9. Open Questions

- Exact idempotency-key support points in current backend paths that can be consumed immediately.
- Final milestone ownership and sign-off checklist format for manual validation records.
