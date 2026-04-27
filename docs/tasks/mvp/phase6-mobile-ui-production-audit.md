# Phase 6 Mobile UI Production Audit

Date: 2026-04-27

## Purpose

This audit defines the mobile UI and UX production standard for the Eventy360 MVP.

It exists to stop the app from drifting into:

- screen-by-screen improvisation,
- duplicated layout patterns,
- weak information hierarchy,
- inconsistent auth and workflow treatment,
- default-looking Flutter pages that do not match the product requirements.

This is a standards document first and a remediation checklist second.

## External Standards Researched

This audit is grounded in the following current references:

1. Flutter adaptive design best practices
2. Flutter performance best practices
3. Flutter accessibility guidance
4. Android core app quality guidelines
5. Android UX quality guidance
6. Material 3 mobile layout and form expectations
7. Web form usability guidance for sign-in and sign-up ergonomics where it aligns with mobile form clarity
8. Apple settings and in-app customization guidance
9. Android settings design guidance
10. Flutter internationalization guidance

## Production UI Contract

The mobile app is not production-ready unless every primary researcher flow follows the standards below.

### 1. Page Architecture

Every primary screen must use a stable page structure:

- app bar or route header,
- page-level overview or hero context,
- clearly separated sections,
- one dominant next action,
- explicit loading, empty, error, blocked, and success treatment.

Pages must not be composed as:

- plain `ListView` with repeated `Card` + `SizedBox`,
- isolated form fields with no context block,
- raw title text followed by long unstructured vertical content.

### 2. DRY UI System

UI should be built from shared primitives, not re-authored layout patterns.

Required shared primitives:

- page container or backdrop,
- page hero,
- section card,
- empty state,
- status badge or status chip,
- shared auth shell,
- shared inline feedback treatment.

A new screen should compose these primitives before adding new surface-specific widgets.

### 3. Information Hierarchy

Each screen must answer, within the first viewport:

1. Where am I?
2. What state is this item or workflow in?
3. What should I do next?
4. What matters most right now?

This means:

- titles and subtitles must communicate workflow purpose,
- status must be visible before long descriptive text,
- deadlines, eligibility, blockers, and current phase come before history,
- primary actions must appear above secondary actions.

### 4. Forms And Workflow UX

All forms must follow these rules:

- persistent labels,
- autofill hints where applicable,
- password visibility controls,
- inline validation near the field,
- one obvious primary submit action,
- helper copy for high-stakes workflows,
- no plain file upload rows without context or accepted-file guidance.

High-stakes forms include:

- sign in,
- sign up,
- password reset,
- profile completion,
- abstract submission,
- full-paper upload,
- revision upload,
- verification upload,
- payment reporting.

### 5. State Design

Every major surface must define first-class UI for:

- loading,
- empty,
- error,
- gated or blocked,
- success or receipt,
- stale or refreshable data where applicable.

These states must be visually distinct and action-oriented.

### 6. Navigation And Flow Integrity

Navigation must feel stable and task-oriented.

Required rules:

- list-to-detail round trip preserves context where feasible,
- deep links land inside the right workflow context,
- auth and premium gates do not dump the user into generic screens without explanation,
- primary tabs and key destinations remain consistent after onboarding,
- top-level navigation is persistent and discoverable for all primary researcher destinations,
- action placement should not jump unpredictably between sibling screens.

### 7. Theme, Accessibility, And Locale

The app must support:

- system, light, and dark theme,
- English and Arabic,
- in-app theme selection UI,
- in-app language selection UI,
- notification preference visibility and platform-settings handoff,
- large text,
- clear semantics for interactive controls,
- readable contrast in status surfaces,
- stable layouts under RTL.

This is release-blocking, not polish.

### 8. Adaptive Layout

The UI must avoid narrow-phone assumptions.

Required behavior:

- no full-width text blocks that become unreadable on wider screens,
- no device-type branching for layout decisions,
- no orientation-locked logic assumptions in page composition,
- content width must remain readable on tablets and larger windows.

### 9. Visual Language

The app should feel:

- calm,
- serious,
- academic,
- trustworthy,
- operational rather than promotional.

This means:

- quiet backgrounds,
- strong section hierarchy,
- status-rich surfaces,
- restrained but deliberate color,
- minimal decorative noise,
- no generic template feel.

## Audit Findings Against Current App

Severity legend:

- `Blocker`: incompatible with production UX expectations
- `High`: creates a weak or misleading user experience in important flows
- `Medium`: works functionally but does not meet product quality expectations

### Finding 1: Repeated low-hierarchy page composition

Severity: `High`

Observed pattern:

- many screens were built as `AppBar + AdaptivePageBody + ListView + raw Card/ListTile`.

Impact:

- app feels like internal tooling rather than a product,
- no strong first-viewport orientation,
- workflows do not communicate urgency or trust clearly,
- users have to infer state from raw content placement.

Affected screen groups:

- home,
- events,
- repository,
- submissions,
- trust,
- auth edge flows,
- detail screens.

### Finding 2: Auth and gate screens were under-contextualized

Severity: `High`

Observed pattern:

- auth pages were mostly plain form fields with weak hierarchy,
- profile gate and unsupported-role states felt like raw scaffolds,
- password recovery did not feel like part of one coherent auth system.

Impact:

- weak first impression,
- lower trust in account-critical workflows,
- poor continuity between onboarding, auth, and profile completion.

### Finding 3: Workflow detail screens lacked operational framing

Severity: `High`

Observed pattern:

- detail screens presented data, but not enough workflow context,
- status and next action were not always visually dominant,
- timeline or metadata often appeared without a strong summary block.

Impact:

- increases cognitive load,
- weakens confidence in deadline-sensitive tasks,
- makes the app feel data-dense without being decision-oriented.

### Finding 4: UI system was not sufficiently DRY

Severity: `High`

Observed pattern:

- repeated layout structures across screens,
- repeated title/subtitle/status patterns implemented ad hoc,
- screen polish depended on local edits instead of shared composition.

Impact:

- inconsistent UI quality,
- slower future fixes,
- higher chance of divergence between Arabic and English layouts,
- harder production maintenance.

### Finding 5: State presentation was inconsistent

Severity: `Medium`

Observed pattern:

- loading, empty, blocked, and success states existed functionally,
- but they were not always promoted into visually coherent product states.

Impact:

- user experience feels technically complete but emotionally unfinished,
- some flows still read as backend adapters instead of polished mobile workflows.

### Finding 6: No persistent app navigation model

Severity: `Blocker`

Observed pattern:

- top-level destinations are exposed through stacked buttons and repeated cards inside the home screen,
- there is no persistent bottom navigation or equivalent mobile-native top-level wayfinding,
- route switching depends on scanning content instead of using stable app chrome.

Impact:

- users cannot build spatial memory of the app,
- home becomes crowded because navigation and status compete for the same screen real estate,
- the app feels like a collection of linked pages instead of one coherent mobile product.

### Finding 7: Settings information architecture is missing

Severity: `Blocker`

Observed pattern:

- settings-relevant capabilities exist in code, but there is no user-facing settings or account surface,
- sign out, theme, profile state, notification education, and future preferences are scattered or implicit,
- account and preferences do not have a stable destination.

Impact:

- users have no obvious place to manage their experience,
- preference-related actions leak into feature screens and clutter primary workflows,
- the app does not meet expected mobile-product conventions.

### Finding 8: Locale support exists technically but not as a user capability

Severity: `Blocker`

Observed pattern:

- locale persistence exists through `localeControllerProvider`,
- English and Arabic resources exist,
- there is no in-app language switch and no visible current-language state.

Impact:

- localization is implementation-only, not a product feature,
- bilingual users cannot intentionally control language,
- QA cannot validate the localized experience through normal user flows.

### Finding 9: Home is trying to do too many jobs

Severity: `High`

Observed pattern:

- home mixes dashboard metrics, account state, notification education, and top-level navigation,
- too many blocks carry similar visual weight,
- there is no single dominant next action.

Impact:

- first-open experience feels crowded and indecisive,
- critical researcher actions are diluted by secondary information,
- the screen reads as an admin dashboard rather than a mobile command center.

## Remediation Standard

The full app should be brought into alignment using this order:

### A. Foundation

- centralize page-level primitives,
- centralize auth shell,
- centralize status badge treatment,
- centralize empty-state treatment,
- centralize hero or overview treatment,
- strengthen global theme surfaces and shape system,
- define top-level mobile information architecture,
- define persistent navigation shell,
- define settings and account architecture.

### B. High-Traffic Flows

- app shell and bottom navigation,
- settings and account,
- theme selection,
- language selection,
- onboarding,
- sign in,
- sign up,
- password reset,
- profile gate,
- home,
- events list,
- event detail.

### C. Core Researcher Workflows

- submissions list,
- submission detail,
- abstract submission,
- full-paper submission,
- revision submission,
- trust center,
- payment reporting,
- repository list,
- repository detail.

### D. Release Gates

No UI flow is considered complete unless it passes:

1. hierarchy check,
2. blocked/empty/error/loading/success check,
3. Arabic and English check,
4. light/dark check,
5. large-text check,
6. route-entry and back-navigation check,
7. visual consistency check against shared primitives.

## Current Implementation Progress

Implemented or partially implemented in code:

- shared page scaffold primitives,
- shared auth scaffold,
- upgraded app theme surfaces and controls,
- persistent locale and theme controllers at the app layer,
- reworked onboarding,
- reworked sign-in, sign-up, password reset, profile gate, unsupported role,
- reworked home,
- reworked events list and event detail,
- reworked repository list and repository detail,
- reworked submissions list.

Still requiring full production-alignment pass:

- app-shell navigation model,
- settings or account hub,
- in-app language switching UX,
- notification preferences UX and platform handoff,
- home information architecture rewrite,
- trust center,
- payment report,
- submission detail,
- submission write flows,
- any remaining routes still using the old `raw cards in a list` pattern,
- cross-screen consistency sweep after all routes are migrated.

## Non-Negotiable Rules For Future UI Work

1. No new screen should start from `ListView + Card + SizedBox` without shared page primitives.
2. No auth or workflow-critical screen should ship without a contextual hero or purpose block.
3. No form should ship without explicit hierarchy, autofill where relevant, and strong primary action treatment.
4. No status-heavy screen should hide current state below long content.
5. No UI work should be accepted as “done” without Arabic, dark theme, and large-text verification.
6. No production-readiness claim is valid without a discoverable settings surface.
7. No multilingual release is valid without an in-app language switch or a documented product decision to rely solely on OS language.

## Relationship To Existing MVP UX Doc

This audit operationalizes the intent already defined in:

- `docs/tasks/mvp/app-foundations/02-researcher-journey-and-ux.md`

In particular, it enforces that the mobile app must feel:

- calm,
- serious,
- trustworthy,
- status-rich,
- mobile-native,
- oriented around researcher next actions.

It also enforces that the app must expose user-controlled preferences in a way that matches current platform expectations instead of hiding them as implementation details.

## Exit Criteria

This audit is satisfied only when:

- all primary mobile routes use the shared UI system,
- top-level navigation is persistent and understandable,
- settings, language, theme, and notification preferences are discoverable,
- no stale scaffold-like route remains in critical researcher flows,
- the app reads as one coherent product from onboarding to repository,
- production-quality standards are enforced through documentation and review, not memory.
