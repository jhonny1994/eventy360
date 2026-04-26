import 'package:eventy360/features/events/application/events_state.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/events/domain/events_repository.dart';
import 'package:eventy360/features/events/infrastructure/supabase_events_repository.dart';
import 'package:eventy360/features/notifications/application/notification_controller.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'events_controller.g.dart';

@Riverpod(keepAlive: true)
EventsRepository eventsRepository(Ref ref) {
  return SupabaseEventsRepository(ref);
}

@Riverpod(keepAlive: true)
class EventsController extends _$EventsController {
  @override
  Future<EventsState> build() async {
    final repository = ref.watch(eventsRepositoryProvider);
    final topics = await repository.getTopics();
    final subscribedTopics = await repository.getSubscribedTopicIds();
    final events = await repository.discoverEvents(
      page: 1,
      pageSize: 20,
      query: '',
      selectedTopicIds: const {},
    );
    return EventsState.initial().copyWith(
      topics: topics,
      subscribedTopicIds: subscribedTopics,
      events: events,
      errorMessage: null,
    );
  }

  Future<void> refresh() async {
    final current = state.asData?.value ?? EventsState.initial();
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(eventsRepositoryProvider);
      final events = await repository.discoverEvents(
        page: 1,
        pageSize: current.pageSize,
        query: current.query,
        selectedTopicIds: current.selectedTopicIds,
      );
      final topics = await repository.getTopics();
      final subscribedTopics = await repository.getSubscribedTopicIds();
      return current.copyWith(
        events: events,
        topics: topics,
        subscribedTopicIds: subscribedTopics,
        page: 1,
        errorMessage: null,
      );
    });
  }

  Future<void> updateQuery(String query) async {
    final current = state.asData?.value ?? EventsState.initial();
    try {
      final repository = ref.read(eventsRepositoryProvider);
      final events = await repository.discoverEvents(
        page: 1,
        pageSize: current.pageSize,
        query: query,
        selectedTopicIds: current.selectedTopicIds,
      );
      state = AsyncData(
        current.copyWith(
          query: query,
          page: 1,
          events: events,
          errorMessage: null,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(current.copyWith(errorMessage: error.toString()));
    }
  }

  Future<void> loadNextPage() async {
    final current = state.asData?.value;
    if (current == null || current.isLoadingMore) {
      return;
    }
    state = AsyncData(current.copyWith(isLoadingMore: true));
    try {
      final repository = ref.read(eventsRepositoryProvider);
      final nextPage = current.page + 1;
      final nextEvents = await repository.discoverEvents(
        page: nextPage,
        pageSize: current.pageSize,
        query: current.query,
        selectedTopicIds: current.selectedTopicIds,
      );
      state = AsyncData(
        current.copyWith(
          events: [...current.events, ...nextEvents],
          page: nextPage,
          isLoadingMore: false,
          errorMessage: null,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(
        current.copyWith(
          isLoadingMore: false,
          errorMessage: error.toString(),
        ),
      );
    }
  }

  Future<void> toggleBookmark(String eventId) async {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    try {
      final repository = ref.read(eventsRepositoryProvider);
      final isBookmarked = await repository.toggleBookmark(eventId);
      state = AsyncData(
        current.copyWith(
          events: current.events
              .map(
                (event) => event.id == eventId
                    ? event.copyWith(isBookmarked: isBookmarked)
                    : event,
              )
              .toList(),
          errorMessage: null,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(current.copyWith(errorMessage: error.toString()));
    }
  }

  Future<void> toggleTopicSubscription(String topicId) async {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    final notifications = ref.read(notificationControllerProvider.notifier);
    final repository = ref.read(eventsRepositoryProvider);
    try {
      await notifications.requestPermissionForTopicIntent();
      final subscribed = await repository.toggleTopicSubscription(topicId);

      try {
        if (subscribed) {
          await notifications.registerCurrentToken(topicId: topicId);
        } else {
          await notifications.unregisterCurrentToken(topicId: topicId);
        }
      } on Object {
        await repository.toggleTopicSubscription(topicId);
        rethrow;
      }

      final updatedSubs = {...current.subscribedTopicIds};
      if (subscribed) {
        updatedSubs.add(topicId);
      } else {
        updatedSubs.remove(topicId);
      }

      state = AsyncData(
        current.copyWith(
          subscribedTopicIds: updatedSubs,
          errorMessage: null,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(current.copyWith(errorMessage: error.toString()));
    }
  }

  Future<void> toggleTopicFilter(String topicId) async {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    final selected = {...current.selectedTopicIds};
    if (selected.contains(topicId)) {
      selected.remove(topicId);
    } else {
      selected.add(topicId);
    }
    try {
      final repository = ref.read(eventsRepositoryProvider);
      final filteredEvents = await repository.discoverEvents(
        page: 1,
        pageSize: current.pageSize,
        query: current.query,
        selectedTopicIds: selected,
      );
      state = AsyncData(
        current.copyWith(
          selectedTopicIds: selected,
          page: 1,
          events: filteredEvents,
          errorMessage: null,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(current.copyWith(errorMessage: error.toString()));
    }
  }

  EventSummary? findById(String eventId) {
    final current = state.asData?.value;
    if (current == null) {
      return null;
    }
    for (final event in current.events) {
      if (event.id == eventId) {
        return event;
      }
    }
    return null;
  }

  Future<EventSummary?> ensureEventLoaded(String eventId) async {
    final existing = findById(eventId);
    if (existing != null) {
      return existing;
    }
    final repository = ref.read(eventsRepositoryProvider);
    final fetched = await repository.fetchEventById(eventId);
    final current = state.asData?.value;
    if (current != null && fetched != null) {
      final nextEvents = [...current.events, fetched];
      state = AsyncData(current.copyWith(events: nextEvents));
    }
    return fetched;
  }
}
