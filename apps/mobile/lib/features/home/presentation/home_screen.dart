import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/home/application/home_subscription_provider.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final session = ref.watch(sessionControllerProvider).asData?.value;
    final eventsState = ref.watch(eventsControllerProvider).asData?.value;
    final submissionsState = ref
        .watch(submissionsControllerProvider)
        .asData
        ?.value;
    final subscriptionState = ref.watch(homeSubscriptionStatusProvider);
    final userEmail = session?.user?.email ?? '-';
    final hasPremiumSubscription =
        subscriptionState.asData?.value.isActive == true ||
        subscriptionState.asData?.value.isTrial == true;
    final verificationStatus = session?.isVerified == true
        ? localizations.verifiedStatus
        : localizations.notVerifiedStatus;
    final nearestDeadline = _nearestDeadline(eventsState?.events ?? const []);
    final activeSubmissionCount = submissionsState?.submissions.length ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.homeTitle),
        actions: [
          IconButton(
            onPressed: () async {
              final current = ref.read(themeModeControllerProvider);
              final next = switch (current) {
                ThemeMode.system => ThemeMode.light,
                ThemeMode.light => ThemeMode.dark,
                ThemeMode.dark => ThemeMode.system,
              };
              await ref
                  .read(themeModeControllerProvider.notifier)
                  .setThemeMode(next);
            },
            icon: const Icon(Icons.brightness_6_outlined),
          ),
        ],
      ),
      body: AdaptivePageBody(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            Card(
              child: ListTile(
                title: Text(localizations.signedInAs),
                subtitle: Text(userEmail),
                trailing: OutlinedButton(
                  onPressed: () =>
                      ref.read(sessionControllerProvider.notifier).signOut(),
                  child: Text(localizations.signOut),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.verified_user_outlined),
                title: Text(localizations.verificationStatusTitle),
                subtitle: Text(verificationStatus),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.workspace_premium_outlined),
                title: Text(localizations.subscriptionStatusTitle),
                subtitle: Text(
                  hasPremiumSubscription
                      ? localizations.subscriptionActive
                      : localizations.subscriptionInactive,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.event_available_outlined),
                title: Text(localizations.nearestDeadlineTitle),
                subtitle: Text(
                  nearestDeadline == null
                      ? localizations.noUpcomingDeadline
                      : _formatDate(nearestDeadline),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.description_outlined),
                title: Text(localizations.activeSubmissionsTitle),
                subtitle: Text(
                  localizations.activeSubmissionsCount(activeSubmissionCount),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.notifications_active_outlined),
                title: Text(localizations.notificationEducationTitle),
                subtitle: Text(localizations.notificationEducationBody),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.dashboard_outlined),
                title: Text(localizations.homeSubtitle),
              ),
            ),
            const SizedBox(height: 12),
            Semantics(
              button: true,
              label: localizations.exploreEvents,
              child: FilledButton.icon(
                onPressed: () => context.go(RoutePaths.events),
                icon: const Icon(Icons.event_note_outlined),
                label: Text(localizations.exploreEvents),
              ),
            ),
            const SizedBox(height: 8),
            Semantics(
              button: true,
              label: localizations.submissionsTitle,
              child: OutlinedButton.icon(
                onPressed: () => context.go(RoutePaths.submissions),
                icon: const Icon(Icons.description_outlined),
                label: Text(localizations.submissionsTitle),
              ),
            ),
            const SizedBox(height: 8),
            Semantics(
              button: true,
              label: localizations.trustCenterTitle,
              child: OutlinedButton.icon(
                onPressed: () => context.go(RoutePaths.trust),
                icon: const Icon(Icons.verified_user_outlined),
                label: Text(localizations.trustCenterTitle),
              ),
            ),
            const SizedBox(height: 8),
            Semantics(
              button: true,
              label: localizations.repositoryTitle,
              child: OutlinedButton.icon(
                onPressed: () => context.go(RoutePaths.repository),
                icon: const Icon(Icons.menu_book_outlined),
                label: Text(localizations.repositoryTitle),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

DateTime? _nearestDeadline(List<EventSummary> events) {
  DateTime? nearest;
  for (final event in events) {
    final candidate = event.deadline;
    if (nearest == null || candidate.isBefore(nearest)) {
      nearest = candidate;
    }
  }
  return nearest;
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}
