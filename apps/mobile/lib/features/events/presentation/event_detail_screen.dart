import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
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
                    onPressed: () => context.go(
                      RoutePaths.newAbstractSubmissionForEvent(selectedEvent.id),
                    ),
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
