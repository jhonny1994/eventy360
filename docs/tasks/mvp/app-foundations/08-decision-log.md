# Decision Log

Date: 2026-04-26

## Program Decisions

### Mobile Scope

- Mobile v1 is researcher-only
- Organizer and admin accounts remain web-only

### Release Shape

- Android-first
- GitHub Releases first
- Full researcher feature release

### Architecture

- Feature-first Flutter structure
- `presentation`, `application`, `domain`, `infrastructure`
- Riverpod v3
- Freezed 3

### Routing

- Production declarative routing with deep links and guarded destinations

### UX

- Bottom navigation for primary destinations
- One primary next action per state
- Arabic RTL and English are release-blocking
- Dynamic persistent theme is part of v1
- Mobile follows mobile and Flutter best practice, not the existing web shell
- Existing researcher feature semantics from the web app are reused unless deliberately changed

### Backend

- The database resets to a new ground-zero baseline
- Historical migration drift is not preserved as the authoritative stack
- Because the product is still pre-public, the team may replace drifted internal contracts directly during the baseline reset instead of preserving long-lived backward compatibility
- Mobile write workflows must use backend-owned contracts
- Sensitive documents must not use public URLs
- Shared backend changes must remain correct for the rest of the project, especially the web app
- `get_subscription_details` is treated as a critical shared contract and must be contract-tested before replacement or redesign
- Submission, repository, payment, and verification file contracts are shared-platform concerns, not mobile-only concerns
- Web must be migrated with backend contract changes where current behavior depends on those contracts

### Shared Contract Clarifications

- Do not preserve the current web multi-step submission write flow as the long-term system contract
- Do not preserve dual-write submission versioning between client actions and database triggers
- Do preserve existing researcher feature semantics unless the audit identifies inconsistency that needs explicit product resolution
- Do freeze canonical rules for trial access, topic subscriptions, bookmarks, and profile-completion semantics before mobile implementation

### Notifications

- Push notifications in v1 are primarily for subscribed-topic event discovery
- In-app inbox is part of v1
- Push delivery must use trusted server-side credentials

### Release

- Signed Android artifacts required
- Version tags must align with app version
- Checksums required

## Architectural Guidance

These decisions should be treated as constraints, not optional ideas, unless explicitly revised through a later architecture review.
