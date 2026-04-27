import 'package:eventy360/app/router/route_paths.dart';
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
    final nextActionRoute = activeSubmissionCount > 0
        ? RoutePaths.submissions
        : RoutePaths.events;
    final nextActionLabel = activeSubmissionCount > 0
        ? localizations.reviewSubmissionsAction
        : localizations.exploreEvents;
    final nextActionDescription = activeSubmissionCount > 0
        ? localizations.homeResumeSubmissionBody
        : localizations.homeDiscoverEventsBody;

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.homeTitle),
      ),
      body: AppPageContainer(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            AppPageHero(
              badge: localizations.authResearcherBadge,
              icon: Icons.space_dashboard_outlined,
              title: localizations.homeHeroTitle,
              subtitle: localizations.homeHeroBody,
            ),
            AppSectionCard(
              title: localizations.homeNextActionTitle,
              subtitle: nextActionDescription,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FilledButton.icon(
                    onPressed: () => context.go(nextActionRoute),
                    icon: Icon(
                      activeSubmissionCount > 0
                          ? Icons.assignment_outlined
                          : Icons.travel_explore_outlined,
                    ),
                    label: Text(nextActionLabel),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    userEmail,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.homeStateSummaryTitle,
              subtitle: localizations.homeStateSummaryBody,
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
              title: localizations.homeQuickLinksTitle,
              subtitle: localizations.homeQuickLinksBody,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _QuickLinkTile(
                    icon: Icons.event_note_outlined,
                    title: localizations.exploreEvents,
                    subtitle: localizations.homeDiscoverEventsBody,
                    onTap: () => context.go(RoutePaths.events),
                  ),
                  const Divider(height: 1),
                  _QuickLinkTile(
                    icon: Icons.description_outlined,
                    title: localizations.submissionsTitle,
                    subtitle: localizations.homeResumeSubmissionBody,
                    onTap: () => context.go(RoutePaths.submissions),
                  ),
                  const Divider(height: 1),
                  _QuickLinkTile(
                    icon: Icons.bookmarks_outlined,
                    title: localizations.savedEventsTitle,
                    subtitle: localizations.homeSavedEventsBody,
                    onTap: () => context.go(RoutePaths.savedEvents),
                  ),
                  const Divider(height: 1),
                  _QuickLinkTile(
                    icon: Icons.manage_accounts_outlined,
                    title: localizations.accountTitle,
                    subtitle: localizations.homeManageAccountBody,
                    onTap: () => context.go(RoutePaths.account),
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.notificationEducationTitle,
              subtitle: localizations.notificationEducationBody,
              leading: const Icon(Icons.notifications_active_outlined),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => context.go(RoutePaths.account),
                    icon: const Icon(Icons.tune_outlined),
                    label: Text(localizations.notificationPreferencesTitle),
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

class _QuickLinkTile extends StatelessWidget {
  const _QuickLinkTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
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
