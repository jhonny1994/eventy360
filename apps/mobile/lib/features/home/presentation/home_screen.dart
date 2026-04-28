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
    final needsVerification = session?.isVerified != true;
    final needsSubscription = !hasPremiumSubscription;
    final attentionLabel = needsVerification
        ? localizations.notVerifiedStatus
        : localizations.subscriptionInactive;

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.homeTitle),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref
            ..invalidate(sessionControllerProvider)
            ..invalidate(eventsControllerProvider)
            ..invalidate(submissionsControllerProvider)
            ..invalidate(homeSubscriptionStatusProvider);
        },
        child: AppPageContainer(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 16),
            children: [
              AppPageHero(
                badge: localizations.authResearcherBadge,
                icon: Icons.space_dashboard_outlined,
                title: localizations.homeHeroTitle,
                subtitle: localizations.homeHeroBody,
                trailing: AppStatusBadge(
                  label: verificationStatus,
                  tone: session?.isVerified == true
                      ? AppStatusTone.success
                      : AppStatusTone.info,
                ),
              ),
              AppSectionCard(
                title: localizations.homeNextActionTitle,
                subtitle: nextActionDescription,
                leading: _SectionIcon(
                  icon: activeSubmissionCount > 0
                      ? Icons.assignment_outlined
                      : Icons.travel_explore_outlined,
                ),
                child: Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () => context.go(nextActionRoute),
                      icon: Icon(
                        activeSubmissionCount > 0
                            ? Icons.assignment_outlined
                            : Icons.travel_explore_outlined,
                      ),
                      label: Text(nextActionLabel),
                    ),
                  ),
                ),
              ),
              if (needsVerification || needsSubscription)
                AppSectionCard(
                  title: localizations.homeAttentionTitle,
                  subtitle: needsVerification
                      ? localizations.homeVerificationAttentionBody
                      : localizations.homeSubscriptionAttentionBody,
                  leading: _SectionIcon(
                    icon: needsVerification
                        ? Icons.verified_user_outlined
                        : Icons.workspace_premium_outlined,
                    tone: AppStatusTone.info,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppStatusBadge(
                        label: attentionLabel,
                        tone: AppStatusTone.info,
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: () => context.go(RoutePaths.account),
                          icon: Icon(
                            needsVerification
                                ? Icons.verified_user_outlined
                                : Icons.workspace_premium_outlined,
                          ),
                          label: Text(
                            needsVerification
                                ? localizations.trustCenterTitle
                                : localizations.accountTitle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              AppSectionCard(
                title: localizations.homeStateSummaryTitle,
                subtitle: localizations.homeStateSummaryBody,
                child: Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    _MetricTile(
                      icon: Icons.verified_user_outlined,
                      label: localizations.verificationStatusTitle,
                      value: verificationStatus,
                      tone: session?.isVerified == true
                          ? AppStatusTone.success
                          : AppStatusTone.info,
                    ),
                    _MetricTile(
                      icon: Icons.workspace_premium_outlined,
                      label: localizations.subscriptionStatusTitle,
                      value: hasPremiumSubscription
                          ? localizations.subscriptionActive
                          : localizations.subscriptionInactive,
                      tone: hasPremiumSubscription
                          ? AppStatusTone.success
                          : AppStatusTone.info,
                    ),
                    _MetricTile(
                      icon: Icons.event_available_outlined,
                      label: localizations.nearestDeadlineTitle,
                      value: nearestDeadline == null
                          ? localizations.noUpcomingDeadline
                          : _formatDate(nearestDeadline),
                    ),
                    _MetricTile(
                      icon: Icons.description_outlined,
                      label: localizations.activeSubmissionsTitle,
                      value: localizations.activeSubmissionsCount(
                        activeSubmissionCount,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.icon,
    required this.label,
    required this.value,
    this.tone = AppStatusTone.neutral,
  });

  final IconData icon;
  final String label;
  final String value;
  final AppStatusTone tone;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final width = (MediaQuery.sizeOf(context).width - 44).clamp(0.0, 840.0);
    final tileWidth = width >= 620 ? (width - 12) / 2 : width;
    final background = colorScheme.primaryContainer;
    final foreground = colorScheme.onPrimaryContainer;
    return SizedBox(
      width: tileWidth,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colorScheme.surfaceContainerLowest.withValues(alpha: 0.72),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: colorScheme.outlineVariant.withValues(alpha: 0.55),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: background,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: foreground, size: 20),
              ),
              const SizedBox(height: 14),
              Text(
                label,
                style: Theme.of(
                  context,
                ).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionIcon extends StatelessWidget {
  const _SectionIcon({
    required this.icon,
    this.tone = AppStatusTone.neutral,
  });

  final IconData icon;
  final AppStatusTone tone;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final (background, foreground) = switch (tone) {
      AppStatusTone.neutral => (
        colorScheme.primaryContainer,
        colorScheme.onPrimaryContainer,
      ),
      AppStatusTone.info => (
        colorScheme.secondaryContainer,
        colorScheme.onSecondaryContainer,
      ),
      AppStatusTone.success => (
        colorScheme.primaryContainer,
        colorScheme.onPrimaryContainer,
      ),
      AppStatusTone.error => (
        colorScheme.errorContainer,
        colorScheme.onErrorContainer,
      ),
    };
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(icon, color: foreground, size: 22),
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
