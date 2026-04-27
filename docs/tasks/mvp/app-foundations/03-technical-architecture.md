# Technical Architecture

Date: 2026-04-25

## Stack Decisions

- Flutter
- Riverpod v3
- Freezed 3
- Supabase
- Firebase Cloud Messaging
- Production declarative routing

## App Architecture

The app uses a feature-first structure with four layers per feature:

- `presentation`
- `application`
- `domain`
- `infrastructure`

Dependency direction:

- `presentation -> application -> domain`
- `infrastructure` implements domain contracts

## State Management

- Use generated `@riverpod` providers by default
- Use `Notifier`, `AsyncNotifier`, and `StreamNotifier` for mutable or async state
- Use `ref.mounted` after async gaps before writing state or performing provider-driven side effects
- Avoid legacy provider patterns for feature state unless explicitly justified

## Modeling

- Use Freezed 3 for immutable models, failures, result types, and UI state unions
- Use explicit JSON factories for serializable types
- Prefer Dart pattern matching in modern code

## Routing

Routing must support:

- auth guards,
- unsupported-role routing,
- premium-gated destinations,
- deep links from auth and notifications,
- stable app shell navigation.

Routing should also preserve current product semantics confirmed in the web app:

- incomplete users route to profile completion,
- unsupported roles route out of researcher features,
- duplicate submission attempts route to the existing submission,
- submission creation is typically entered from event discovery or event detail.

## Theme And Localization

- Theme mode must be persisted locally
- Arabic RTL and English localization are release-blocking
- The app shell and all shared primitives must be localization-aware
- Flutter localization workflow should use the Localizely `flutter-intl` extension as the project-level authoring convention

## Data And Cache

- Online-first read model
- Local cache for read-heavy surfaces
- Per-user namespacing
- Locale-aware keys where content varies by locale
- Draft persistence for long forms
- Sensitive caches minimized and purged on sign-out

Current product logic worth preserving in the mobile architecture:

- profile completion and bookmark state affect dashboard progress signals,
- topic subscriptions are updated optimistically,
- payment flow is multi-step before document upload,
- repository download currently records analytics before opening the file.

## Notifications

The app must support:

- permission request timing after value is shown,
- token registration and refresh,
- foreground and background handling,
- terminated-state entry,
- in-app inbox and deep-link routing.

## Security Boundaries

- No service-role credentials in Flutter
- No direct FCM server calls from the app
- Protected documents must use authenticated or signed delivery paths
- Sensitive tokens, URLs, and payloads must not be logged casually

## Cross-Project Safety Rule

Changes outside `apps/mobile` must be treated as shared-system changes, not app-local shortcuts.

That means:

- if a backend, workflow, or shared configuration change affects web, it must remain correct for web too,
- mobile-specific hardening must not silently break existing researcher or organizer/admin paths,
- shared contracts should be updated deliberately and validated across the whole project,
- the mobile program should prefer additive or compatible changes until a shared contract is intentionally replaced.

## Quality Expectations

- Strict linting
- Code generation checks
- Unit tests
- Widget tests
- Integration tests on critical paths
- Accessibility and localization verification

## Detailed References

- [flutter-researcher-app-adr-index.md](C:/Users/raouf/projects/eventy360/docs/tasks/flutter-researcher-app-adr-index.md:1)
- [flutter-researcher-app-production-team-artifacts.md](C:/Users/raouf/projects/eventy360/docs/tasks/flutter-researcher-app-production-team-artifacts.md:1)
