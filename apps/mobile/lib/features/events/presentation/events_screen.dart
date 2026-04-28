import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_modal_sheet.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/application/events_state.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/events/presentation/saved_events_screen.dart';
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
                key: const PageStorageKey<String>('events-list'),
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
                        _FilterSummaryRow(
                          selectedCount: data.selectedTopicIds.length,
                          topicCount: data.topics.length,
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _showTopicFilters(
                                  context,
                                  ref,
                                  data: data,
                                ),
                                icon: const Icon(Icons.filter_list_rounded),
                                label: Text(localizations.filterTopicsAction),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: FilledButton.tonalIcon(
                                onPressed: () async {
                                  await context.push(RoutePaths.savedEvents);
                                  ref
                                    ..invalidate(eventsControllerProvider)
                                    ..invalidate(bookmarkedEventsProvider);
                                },
                                icon: const Icon(Icons.bookmarks_outlined),
                                label: Text(
                                  localizations.savedEventsShortTitle,
                                ),
                              ),
                            ),
                          ],
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

Future<void> _showTopicFilters(
  BuildContext context,
  WidgetRef ref, {
  required EventsState data,
}) async {
  final localizations = S.of(context);
  await showAppModalSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (context) {
      return AppModalSheet(
        title: localizations.filterTopicsAction,
        subtitle: localizations.eventsTopicFilterBody,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.4,
              child: SingleChildScrollView(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: data.topics.map((topic) {
                    final selected = data.selectedTopicIds.contains(topic.id);
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
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => context.push(RoutePaths.topics),
                    icon: const Icon(Icons.tune_outlined),
                    label: Text(localizations.manageTopicsAction),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(localizations.doneAction),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    },
  );
}

class _EventCard extends ConsumerWidget {
  const _EventCard({required this.event});

  final EventSummary event;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    return AppSectionCard(
      child: InkWell(
        onTap: () async {
          await context.push(RoutePaths.eventDetail(event.id));
          ref
            ..invalidate(eventsControllerProvider)
            ..invalidate(bookmarkedEventsProvider);
        },
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
                onPressed: () async {
                  await ref
                      .read(eventsControllerProvider.notifier)
                      .toggleBookmark(event.id);
                  ref.invalidate(bookmarkedEventsProvider);
                  if (!context.mounted) {
                    return;
                  }
                  AppFeedback.showSuccess(
                    event.isBookmarked
                        ? localizations.removeBookmark
                        : localizations.addBookmark,
                  );
                },
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

class _FilterSummaryRow extends StatelessWidget {
  const _FilterSummaryRow({
    required this.selectedCount,
    required this.topicCount,
  });

  final int selectedCount;
  final int topicCount;

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final summary = selectedCount > 0
        ? localizations.selectedTopicsCount(selectedCount)
        : localizations.allTopicsSummary(topicCount);

    return Row(
      children: [
        Icon(
          Icons.filter_alt_outlined,
          size: 18,
          color: Theme.of(context).colorScheme.primary,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            summary,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}
