import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class EventsScreen extends ConsumerWidget {
  const EventsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final state = ref.watch(eventsControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.eventsTitle),
      ),
      body: state.when(
        data: (data) {
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(eventsControllerProvider.notifier).refresh(),
            child: AppPageContainer(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16),
                children: [
                  AppPageHero(
                    badge: localizations.eventsTitle,
                    icon: Icons.travel_explore_outlined,
                    title: localizations.eventsTitle,
                    subtitle: localizations.eventsOverviewBody,
                  ),
                  AppSectionCard(
                    title: localizations.eventsSearchHint,
                    subtitle: localizations.topicSubscriptionHint,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Semantics(
                          label: localizations.eventsSearchHint,
                          textField: true,
                          child: TextField(
                            onChanged: (value) {
                              unawaited(
                                ref
                                    .read(eventsControllerProvider.notifier)
                                    .updateQuery(value),
                              );
                            },
                            decoration: InputDecoration(
                              hintText: localizations.eventsSearchHint,
                              prefixIcon: const Icon(Icons.search),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: data.topics.map((topic) {
                            final selected = data.selectedTopicIds.contains(
                              topic.id,
                            );
                            return FilterChip(
                              label: Text(topic.name),
                              selected: selected,
                              onSelected: (_) {
                                unawaited(
                                  ref
                                      .read(eventsControllerProvider.notifier)
                                      .toggleTopicFilter(topic.id),
                                );
                              },
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          localizations.topicSubscriptionHint,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: data.topics.map((topic) {
                            final subscribed = data.subscribedTopicIds.contains(
                              topic.id,
                            );
                            return FilterChip(
                              selectedColor: Theme.of(
                                context,
                              ).colorScheme.secondaryContainer,
                              label: Text(topic.name),
                              selected: subscribed,
                              onSelected: (_) {
                                unawaited(
                                  ref
                                      .read(eventsControllerProvider.notifier)
                                      .toggleTopicSubscription(topic.id),
                                );
                              },
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                  if ((data.errorMessage ?? '').isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppInlineMessage.error(
                        message: data.errorMessage!,
                      ),
                    ),
                  if (data.events.isEmpty)
                    AppEmptyState(
                      icon: Icons.event_busy_outlined,
                      title: localizations.eventsTitle,
                      body: localizations.noEventsFound,
                    )
                  else
                    ...data.events.map((event) => _EventCard(event: event)),
                  if (data.isLoadingMore) const AppLoadingView(),
                  if (!data.isLoadingMore && data.events.isNotEmpty)
                    Center(
                      child: OutlinedButton(
                        onPressed: () => ref
                            .read(eventsControllerProvider.notifier)
                            .loadNextPage(),
                        child: Text(localizations.loadMore),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
        loading: () => const AppLoadingView(),
        error: (error, _) => AppErrorView(
          message: error.toString(),
          onRetry: () => ref.read(eventsControllerProvider.notifier).refresh(),
        ),
      ),
    );
  }
}

class _EventCard extends ConsumerWidget {
  const _EventCard({required this.event});

  final EventSummary event;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    return AppSectionCard(
      child: InkWell(
        onTap: () => context.go(RoutePaths.eventDetail(event.id)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                Icons.event_outlined,
                color: Theme.of(context).colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text('${event.location} • ${_formatDate(event.deadline)}'),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Semantics(
              label: event.isBookmarked
                  ? localizations.removeBookmark
                  : localizations.addBookmark,
              button: true,
              child: IconButton(
                onPressed: () => ref
                    .read(eventsControllerProvider.notifier)
                    .toggleBookmark(event.id),
                icon: Icon(
                  event.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}
