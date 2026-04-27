import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final bookmarkedEventsProvider = FutureProvider<List<EventSummary>>((
  ref,
) async {
  return ref.watch(eventsRepositoryProvider).fetchBookmarkedEvents();
});

class SavedEventsScreen extends ConsumerWidget {
  const SavedEventsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final bookmarks = ref.watch(bookmarkedEventsProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.savedEventsTitle),
      ),
      body: bookmarks.when(
        data: (events) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(bookmarkedEventsProvider);
            await ref.read(bookmarkedEventsProvider.future);
          },
          child: AppPageContainer(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                AppPageHero(
                  badge: localizations.savedEventsTitle,
                  icon: Icons.bookmarks_outlined,
                  title: localizations.savedEventsTitle,
                  subtitle: localizations.savedEventsBody,
                ),
                if (events.isEmpty)
                  AppEmptyState(
                    icon: Icons.bookmark_border_outlined,
                    title: localizations.savedEventsTitle,
                    body: localizations.savedEventsEmptyState,
                  )
                else
                  ...events.map(
                    (event) => AppSectionCard(
                      child: AppListRow(
                        title: event.title,
                        subtitle:
                            '${event.location}\n${localizations.deadline}: ${_formatDate(event.deadline)}',
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () async {
                          await context.push(RoutePaths.eventDetail(event.id));
                          ref.invalidate(bookmarkedEventsProvider);
                        },
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        error: (error, _) => AppErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(bookmarkedEventsProvider),
        ),
        loading: AppLoadingView.new,
      ),
    );
  }
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}
