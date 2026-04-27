import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
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
      body: AppPageContainer(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            AppPageHero(
              badge: localizations.authResearcherBadge,
              icon: Icons.space_dashboard_outlined,
              title: localizations.homeSubtitle,
              subtitle: localizations.homeOverviewBody,
              trailing: OutlinedButton(
                onPressed: () =>
                    ref.read(sessionControllerProvider.notifier).signOut(),
                child: Text(localizations.signOut),
              ),
            ),
            AppSectionCard(
              title: localizations.signedInAs,
              subtitle: userEmail,
              leading: const Icon(Icons.alternate_email_rounded),
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  AppStatusBadge(
                    label: verificationStatus,
                    tone: session?.isVerified == true
                        ? AppStatusTone.success
                        : AppStatusTone.neutral,
                  ),
                  AppStatusBadge(
                    label: hasPremiumSubscription
                        ? localizations.subscriptionActive
                        : localizations.subscriptionInactive,
                    tone: hasPremiumSubscription
                        ? AppStatusTone.info
                        : AppStatusTone.neutral,
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.homeTitle,
              subtitle: localizations.homeOverviewBody,
              child: Column(
                children: [
                  _MetricRow(
                    icon: Icons.verified_user_outlined,
                    label: localizations.verificationStatusTitle,
                    value: verificationStatus,
                  ),
                  const SizedBox(height: 12),
                  _MetricRow(
                    icon: Icons.workspace_premium_outlined,
                    label: localizations.subscriptionStatusTitle,
                    value: hasPremiumSubscription
                        ? localizations.subscriptionActive
                        : localizations.subscriptionInactive,
                  ),
                  const SizedBox(height: 12),
                  _MetricRow(
                    icon: Icons.event_available_outlined,
                    label: localizations.nearestDeadlineTitle,
                    value: nearestDeadline == null
                        ? localizations.noUpcomingDeadline
                        : _formatDate(nearestDeadline),
                  ),
                  const SizedBox(height: 12),
                  _MetricRow(
                    icon: Icons.description_outlined,
                    label: localizations.activeSubmissionsTitle,
                    value: localizations.activeSubmissionsCount(
                      activeSubmissionCount,
                    ),
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.notificationEducationTitle,
              subtitle: localizations.notificationEducationBody,
              leading: const Icon(Icons.notifications_active_outlined),
              child: const SizedBox.shrink(),
            ),
            AppSectionCard(
              title: localizations.exploreEvents,
              subtitle: localizations.homeSubtitle,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Semantics(
                    button: true,
                    label: localizations.exploreEvents,
                    child: FilledButton.icon(
                      onPressed: () => context.go(RoutePaths.events),
                      icon: const Icon(Icons.event_note_outlined),
                      label: Text(localizations.exploreEvents),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Semantics(
                    button: true,
                    label: localizations.submissionsTitle,
                    child: OutlinedButton.icon(
                      onPressed: () => context.go(RoutePaths.submissions),
                      icon: const Icon(Icons.description_outlined),
                      label: Text(localizations.submissionsTitle),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Semantics(
                    button: true,
                    label: localizations.trustCenterTitle,
                    child: OutlinedButton.icon(
                      onPressed: () => context.go(RoutePaths.trust),
                      icon: const Icon(Icons.verified_user_outlined),
                      label: Text(localizations.trustCenterTitle),
                    ),
                  ),
                  const SizedBox(height: 10),
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
          ],
        ),
      ),
    );
  }
}

class _MetricRow extends StatelessWidget {
  const _MetricRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: colorScheme.onPrimaryContainer, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(
                  context,
                ).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              Text(value),
            ],
          ),
        ),
      ],
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
