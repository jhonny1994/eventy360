# Phase 6 Mobile Product Polish Audit

## Purpose
This audit captures the product-polish layer that sits between feature completeness and a user-ready mobile app. These are the issues real users notice immediately even when the backend and core flows technically work.

## Categories

### 1. State Consistency
Definition: two screens describe the same user/account state differently.

User symptom:
- Account says premium access is active.
- Repository says premium access is required.

Production rule:
- Access labels, entitlement gates, and renewal messaging must all resolve from one effective source of truth.
- UI copy must follow the same boolean access logic as route gates.

Action taken:
- aligned subscription headlines in Account and Trust with effective access (`isActive` or trial) instead of trusting the raw status label alone.

### 2. Reactive Refresh Gaps
Definition: the user completes an action, returns to the previous screen, and stale state remains until they manually refresh.

User symptom:
- payment/profile/account changes do not reliably rehydrate the previous surface on return.
- saved/bookmarked state can drift until another screen refresh occurs.

Production rule:
- returning from a state-changing screen should invalidate or refresh dependent providers automatically.
- saved lists, entitlement gates, and account summaries should update without user intervention.

Action taken:
- account now invalidates subscription/notification state after returning from related routes.
- repository blocked-state actions now return through push flows and re-evaluate subscription state on return.
- payment report submission invalidates subscription, trust, and repository state.
- bookmark actions invalidate saved-events state.
- submission detail now reloads itself after full-paper or revision child flows return.
- topic-subscription screen now supports pull-to-refresh and invalidates notification state after topic changes.

### 3. Lifecycle Hygiene
Definition: local controllers, listeners, and subscriptions outlive the screen or are not cleaned up correctly.

Why users feel it:
- keyboard/input oddities
- duplicate listeners
- stale callbacks
- unexplained lag after revisiting screens

Audit result:
- good coverage already exists for `TextEditingController` disposal on auth, account, trust, repository, and submission forms.
- `PageController` disposal exists on onboarding.
- push notification stream subscriptions are disposed through `ref.onDispose`.

Watchpoints still worth keeping in review:
- any new screen that introduces controllers or async listeners must follow the same dispose pattern.
- provider invalidation on navigation return matters as much as `dispose()` for perceived freshness.

### 4. Interaction Feedback Gaps
Definition: the user performs an action, but the interface gives weak or no confirmation.

User symptom:
- "Did that work or not?"
- actions silently close, redirect, or mutate state without closure.

Production rule:
- preference changes, redirects, saves, bookmark toggles, and secure document actions need explicit feedback.
- use one centralized feedback system instead of ad hoc snackbars.

Action taken:
- account language/theme/notification actions now use `AppFeedback`.
- profile save now uses `AppFeedback`.
- submission duplicate-redirect and successful submit flows use `AppFeedback`.
- bookmark actions use `AppFeedback`.
- payment report success uses `AppFeedback` before returning.
- topic-subscription changes now confirm success on the affected topic when the write succeeds.

### 5. Information Relevance
Definition: content appears in the right screen technically, but not in the right mental model.

User symptom:
- next-best-action card shows identity data or unrelated text.
- the user has to mentally filter the page instead of trusting it.

Production rule:
- decision surfaces should only contain decision-supporting content.
- identity belongs in account/profile surfaces, not in action cards unless directly needed.

Action taken:
- removed email from Home `Next best action`.

### 6. Hierarchy And Density Drift
Definition: a screen contains the right information, but too many sections, subtitles, and actions compete at the same visual level.

User symptom:
- the page feels stacked, crowded, or admin-like.
- back actions appear twice.
- context is repeated in hero, card subtitle, and card body.
- metadata looks heavier than the real next step.

Production rule:
- one screen should separate summary, detail, and action clearly.
- metadata rows should use one shared compact pattern.
- app bars already own back navigation; cards should not repeat it unless the flow truly needs a second escape route.
- trust, account, submission, and repository detail screens should avoid repeating the same explanation across multiple cards.

Action taken:
- repository detail now uses one context card, one abstract card, and one download card instead of repeating back/context metadata.
- submission detail now separates overview, abstract, files, feedback, timeline, and next action more clearly.
- account now treats identity, subscription, preferences, and researcher tools as separate layers with tighter internal spacing.
- trust now embeds secure-document guidance where it is needed instead of keeping a standalone empty guidance card.
- event detail now surfaces actions before the long-form reference content and groups deep content into one calmer section.
- repository discovery now keeps filters in a bottom sheet and preserves a faster scanning surface.
- submission write now groups context, content, and file upload into clearer stages instead of one long continuous form.

### 7. Natural Refresh Expectations
Definition: the app technically supports refresh, but not always through the gestures users expect on mobile.

User symptom:
- "I had to hunt for a refresh button."
- saved or submissions lists feel stale unless the user looks for a manual control.

Production rule:
- important list surfaces should support pull-to-refresh in addition to any explicit refresh controls.
- refresh should feel native and low-friction on mobile.

Action taken:
- submissions list now supports pull-to-refresh.
- saved events now supports pull-to-refresh.

## Real-User Expectations Checklist
A user-ready screen should answer all of these:
- Did the app show the same truth here as it showed elsewhere?
- If I finished a task and came back, did the previous page update on its own?
- If I tapped something important, did I get confirmation?
- If I reopen this area later, will there be duplicate listeners or stale local state?
- Is the content on this screen actually relevant to the decision I am making here?
- Does the screen make the next step obvious without crowding me?

## Screens Most Sensitive To Polish Regressions
- Account
- Repository access gate
- Trust and payment reporting
- Event detail and saved events
- Submission creation and duplicate-submission handoff
- Home summary cards

## Current Audit Status
- state consistency: improved
- refresh behavior: improved on the main state-changing flows
- lifecycle hygiene: acceptable on audited screens
- interaction feedback: improved, but every new action should be reviewed against `AppFeedback`
- information relevance: improved on Home, still a standing review rule for future edits
