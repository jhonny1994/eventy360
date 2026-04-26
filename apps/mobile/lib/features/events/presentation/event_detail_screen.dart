import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EventDetailScreen extends ConsumerWidget {
  const EventDetailScreen({
    required this.eventId,
    super.key,
  });

  final String eventId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final state = ref.watch(eventsControllerProvider);
    final events = state.asData?.value.events ?? const <EventSummary>[];
    EventSummary? event;
    for (final candidate in events) {
      if (candidate.id == eventId) {
        event = candidate;
        break;
      }
    }
    if (event == null) {
      return Scaffold(
        appBar: AppBar(title: Text(localizations.eventDetailsTitle)),
        body: Center(child: Text(localizations.eventNotFound)),
      );
    }
    final selectedEvent = event;
    return Scaffold(
      appBar: AppBar(title: Text(localizations.eventDetailsTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            selectedEvent.title,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            '${localizations.deadline}: '
            '${selectedEvent.deadline.toIso8601String().split("T").first}',
          ),
          const SizedBox(height: 8),
          Text('${localizations.location}: ${selectedEvent.location}'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: selectedEvent.topics
                .map((topic) => Chip(label: Text(topic)))
                .toList(),
          ),
          const SizedBox(height: 16),
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
        ],
      ),
    );
  }
}
