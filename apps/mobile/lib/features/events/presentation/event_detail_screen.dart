import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class EventDetailScreen extends ConsumerStatefulWidget {
  const EventDetailScreen({
    required this.eventId,
    super.key,
  });

  final String eventId;

  @override
  ConsumerState<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends ConsumerState<EventDetailScreen> {
  var _loadingMissingEvent = true;

  @override
  void initState() {
    super.initState();
    unawaited(
      Future<void>.microtask(
        () async {
          await ref
              .read(eventsControllerProvider.notifier)
              .ensureEventLoaded(widget.eventId);
          if (!mounted) {
            return;
          }
          setState(() => _loadingMissingEvent = false);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final state = ref.watch(eventsControllerProvider);
    final submissionsState = ref.watch(submissionsControllerProvider).asData?.value;
    final events = state.asData?.value.events ?? const <EventSummary>[];
    EventSummary? event;
    for (final candidate in events) {
      if (candidate.id == widget.eventId) {
        event = candidate;
        break;
      }
    }
    if (event == null) {
      return Scaffold(
        appBar: AppBar(title: Text(localizations.eventDetailsTitle)),
        body: AppPageContainer(
          child: Center(
            child: _loadingMissingEvent
                ? const CircularProgressIndicator.adaptive()
                : Text(localizations.eventNotFound),
          ),
        ),
      );
    }
    final selectedEvent = event;
    final existingSubmission = submissionsState?.submissions.where(
      (entry) => entry.eventId == selectedEvent.id,
    ).firstOrNull;
    return Scaffold(
      appBar: AppBar(title: Text(localizations.eventDetailsTitle)),
      body: AppPageContainer(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            AppPageHero(
              badge: localizations.eventsTitle,
              icon: Icons.event_outlined,
              title: selectedEvent.title,
              subtitle: localizations.eventDetailsOverviewBody,
            ),
            AppSectionCard(
              title: localizations.eventDetailsTitle,
              subtitle:
                  '${localizations.location}: ${selectedEvent.location} • ${localizations.deadline}: ${selectedEvent.deadline.toIso8601String().split("T").first}',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: selectedEvent.topics
                    .map((topic) => Chip(label: Text(topic)))
                    .toList(),
              ),
            ),
            AppSectionCard(
              title: localizations.eventDecisionSupportTitle,
              subtitle: localizations.eventDecisionSupportBody,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _DetailPoint(
                    icon: Icons.schedule_outlined,
                    title: localizations.eventTimelineTitle,
                    body: localizations.eventTimelineBody(
                      selectedEvent.deadline.toIso8601String().split('T').first,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _DetailPoint(
                    icon: Icons.rule_folder_outlined,
                    title: localizations.eventEligibilityTitle,
                    body: localizations.eventEligibilityBody,
                  ),
                  const SizedBox(height: 12),
                  _DetailPoint(
                    icon: Icons.groups_2_outlined,
                    title: localizations.eventOrganizerTitle,
                    body: localizations.eventOrganizerBody,
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.submitAbstractAction,
              subtitle: localizations.eventDetailsOverviewBody,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FilledButton.icon(
                    onPressed: () => ref
                        .read(eventsControllerProvider.notifier)
                        .toggleBookmark(selectedEvent.id),
                    icon: Icon(
                      selectedEvent.isBookmarked
                          ? Icons.bookmark
                          : Icons.bookmark_border,
                    ),
                    label: Text(
                      selectedEvent.isBookmarked
                          ? localizations.removeBookmark
                          : localizations.addBookmark,
                    ),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: () {
                      if (existingSubmission != null) {
                        AppFeedback.showInfo(
                          localizations.existingSubmissionRedirectBody,
                        );
                        unawaited(
                          context.push(
                            RoutePaths.submissionDetail(existingSubmission.id),
                          ),
                        );
                        return;
                      }
                      unawaited(
                        context.push(
                          RoutePaths.newAbstractSubmissionForEvent(
                            selectedEvent.id,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.upload_file_outlined),
                    label: Text(localizations.submitAbstractAction),
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

class _DetailPoint extends StatelessWidget {
  const _DetailPoint({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(body),
            ],
          ),
        ),
      ],
    );
  }
}
