## Relevant Files

- `docs/tasks/mvp/prd-eventy360-production-mobile-app.md` - Canonical PRD for this production app phase.
- `apps/mobile/pubspec.yaml` - Flutter dependencies, linting, and build configuration.
- `apps/mobile/lib/app/` - App bootstrap, router, theme, localization, and app-level providers.
- `apps/mobile/lib/features/auth/` - Authentication, onboarding, and session restore flows.
- `apps/mobile/lib/features/home/` - Researcher dashboard and next-action surfaces.
- `apps/mobile/lib/features/events/` - Discovery, detail, bookmarks, and topic subscriptions.
- `apps/mobile/lib/features/submissions/` - Abstract, full-paper, revision flows and status views.
- `apps/mobile/lib/features/trust/` - Verification and payment reporting/proof flows.
- `apps/mobile/lib/features/repository/` - Repository listing, detail, and downloads.
- `apps/mobile/lib/features/notifications/` - Push setup, permission flow, inbox, and deep links.
- `apps/mobile/test/` - Unit/widget/integration tests for app behavior.
- `apps/mobile/integration_test/` - Higher-value end-to-end mobile flow tests.
- `apps/mobile/android/` - Android signing, manifest, notification, and release config.
- `docs/tasks/mvp/phase6-mobile-quality-gates.md` - Mobile automated/manual release gate definition.
- `docs/tasks/mvp/phase6-mobile-ui-production-audit.md` - Mobile UI production standards and route-level audit baseline.
- `apps/web/src/` - Existing researcher semantics and behavior parity reference.
- `supabase/functions/` - Existing write and notification paths used by mobile.
- `supabase/migrations/` - Current schema and behavior reference for live integrations.

### Notes

- This plan uses real writes and real subscribed-topic push notifications.
- Minimal reliability guards are required for critical write flows.
- Automated checks are required each phase.
- Manual validation is required at milestones and final walkthrough.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature

- [x] 1.0 Initialize Flutter app foundation and architecture
  - [x] 1.1 Create or validate `apps/mobile` Flutter app scaffold
  - [x] 1.2 Configure package id `com.carbodex.eventy360` for Android
  - [x] 1.3 Add Riverpod v3, Freezed, routing, Supabase, Firebase Messaging, localization, and required build dependencies
  - [x] 1.4 Set up app bootstrap with layered feature-first structure: `presentation/application/domain/infrastructure`
  - [x] 1.5 Configure dynamic persistent theme and startup locale resolution
  - [x] 1.6 Configure `flutter-intl` workflow and generated localization files
  - [x] 1.7 Add baseline error/loading components and global app failure handling
  - [x] 1.8 Add initial automated checks: `flutter pub get`, code generation, `flutter analyze`, baseline tests

- [ ] 2.0 Implement authentication, onboarding, profile gating, and home
  - [x] 2.1 Implement sign in, sign up, logout, and session restore
  - [x] 2.2 Implement password reset and auth deep link handling
  - [x] 2.3 Build onboarding flow with contextual notification education (no first-launch permission prompt)
  - [x] 2.4 Implement researcher profile completion gate aligned with existing semantics
  - [x] 2.5 Build home dashboard with profile/verification/subscription/deadline/active-submission states
  - [x] 2.5.0 Re-architect post-auth mobile shell around stable top-level navigation
  - [x] 2.5.1 Replace stacked dashboard home with a task-first mobile home aligned to persistent app navigation
  - [x] 2.5.2 Add persistent bottom navigation for top-level researcher destinations
  - [x] 2.5.3 Add a dedicated settings/account destination for user preferences and account actions
  - [x] 2.5.4 Add in-app language switching wired to `localeControllerProvider`
  - [x] 2.5.5 Add discoverable theme controls inside settings/account instead of relying on home app-bar toggle
  - [x] 2.5.6 Add notification preferences visibility and platform-settings handoff in settings/account
  - [x] 2.5.7 Add account overview sections for profile state, verification state, subscription state, and sign out
  - [x] 2.5.8 Add dedicated profile edit flow from mobile account area
  - [x] 2.5.9 Add dedicated security entry point from mobile account area
  - [x] 2.5.10 Revisit onboarding completion so first-run flow leads into language/theme/topics/account-aware shell
  - [x] 2.6 Add auth/home tests: provider tests, widget flow tests, and basic navigation tests
  - [ ] 2.7 Run milestone manual validation #1: auth, onboarding, profile gate, home

- [ ] 3.0 Implement discovery, bookmarks, topics, and real subscribed-topic push
  - [x] 3.1 Implement event discovery list with filters and pagination behavior
  - [x] 3.2 Implement event detail with clear next action and deadline visibility
  - [x] 3.3 Implement bookmark toggle aligned to current backend behavior
  - [x] 3.4 Implement topic subscription management with real writes
  - [x] 3.5 Integrate FCM token registration and backend topic-notification targeting path
  - [x] 3.6 Implement push permission request only after topic-intent action
  - [x] 3.7 Implement push deep-link routing into event/topic context
  - [x] 3.8 Add discovery/topic/notification tests including permission and deep-link handling
  - [x] 3.8.3 Add dedicated topics management page under account
  - [x] 3.8.1 Separate event filtering from topic subscription management in UX and IA
  - [x] 3.8.2 Add dedicated saved or bookmarked events view
  - [x] 3.8.4 Preserve search, filters, and scroll context across event list/detail round-trips
  - [ ] 3.8.5 Expand event detail to include richer event description, timeline, organizer context, and eligibility guidance
  - [x] 3.8.6 Route duplicate abstract attempts back to the existing submission context instead of creating confusion
  - [ ] 3.9 Run milestone manual validation #2: discovery, bookmarks, topics, real subscribed-topic push

- [ ] 4.0 Implement real critical write flows with minimal reliability guards
  - [x] 4.0.1 Define and approve endpoint reliability matrix before implementation (`abstract`, `full-paper`, `revision`, `verification`, `payment`)
  - [x] 4.1 Implement abstract submission with real backend writes
  - [x] 4.2 Implement full-paper submission with real backend writes
  - [x] 4.3 Implement revision submission with real backend writes
  - [x] 4.4 Add minimal reliability guards: duplicate-submit guard, retry for transient failures, clear receipts
  - [x] 4.5 Add idempotency-key handling where backend path supports it
  - [x] 4.6 Add local draft/context preservation for interruption-safe forms
  - [x] 4.7 Add submission detail, status, and feedback timeline UI
  - [x] 4.8 Add write-flow tests including failure and retry behavior
  - [x] 4.8.1 Add reviewer feedback parity and human-readable status context to submission detail
  - [x] 4.8.2 Replace raw file URL exposure with safer file metadata, actions, and privacy framing
  - [x] 4.8.3 Add stronger event context and deadline context inside submission detail
  - [x] 4.8.4 Improve write-form guidance for accepted file types, file size expectations, and upload receipts
  - [x] 4.8.5 Add explicit draft restore UX and autosave communication in submission forms
  - [ ] 4.9 Run milestone manual validation #3: all submission write flows end-to-end

- [ ] 5.0 Implement verification, payment, and repository end-to-end flows
  - [x] 5.1 Implement verification document upload end-to-end
  - [x] 5.2 Implement payment report and payment-proof upload end-to-end
  - [x] 5.3 Implement payment history and status visibility
  - [x] 5.4 Implement repository list/detail and download behavior using real backend data
  - [x] 5.5 Add secure handling UX for sensitive docs and file operation errors
  - [x] 5.6 Add trust/repository tests including edge and error paths
  - [x] 5.6.1 Re-house trust flows under account while preserving clear verification and payment entry points
  - [x] 5.6.2 Add subscription overview and subscription resolution path in mobile account UX
  - [x] 5.6.3 Add payment history/report split that matches current product semantics
  - [x] 5.6.4 Add payment instructions and expectations before proof submission
  - [x] 5.6.5 Expand repository filters and repository detail metadata toward web parity
  - [x] 5.6.6 Add repository back-navigation, premium-context messaging, and download confidence cues
  - [ ] 5.7 Run milestone manual validation #4: verification, payment, repository

- [ ] 6.0 Add phase-by-phase automated checks and milestone manual validation
  - [x] 6.1 Create one command set for local automated checks and document it in project docs
  - [x] 6.2 Enforce analyze, tests, and code generation checks in CI for this app path
  - [x] 6.3 Define manual validation checklist template for each milestone
  - [x] 6.3.1 Define objective milestone acceptance criteria (required evidence, blocker policy, pass/fail threshold)
  - [x] 6.3.2 Define push operational validation checklist (delivery failures, stale token handling, retry/queue behavior)
  - [ ] 6.3.3 Add manual validation coverage for settings discoverability, theme persistence, language switching, and notification preference entry points
  - [ ] 6.3.4 Add route-by-route parity checklist against web semantics and `02-researcher-journey-and-ux.md`
  - [ ] 6.3.5 Add large-text and RTL regression checklist for every primary route
  - [ ] 6.3.6 Add cold-start, background-resume, and return-to-task validation for every critical workflow
  - [ ] 6.4 Execute full manual walkthrough across all core researcher flows
  - [ ] 6.5 Capture defects from walkthrough and resolve blocking issues
  - [ ] 6.6 Re-run automated checks after fixes and confirm clean status

- [ ] 7.0 Build Android release artifacts and publish to GitHub Releases
  - [ ] 7.1 Configure Android signing for release builds
  - [ ] 7.2 Build release APK and verify install/launch on target device(s)
  - [ ] 7.3 Validate versioning metadata and release notes
  - [ ] 7.4 Generate checksum for published artifact
  - [ ] 7.5 Publish APK and release notes to GitHub Releases
  - [ ] 7.5.1 Document rollback and hotfix procedure for release issues
  - [ ] 7.6 Run milestone manual validation #5: release candidate install and end-to-end sanity
