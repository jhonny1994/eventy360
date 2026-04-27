import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_detail.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/events/domain/events_repository.dart';
import 'package:eventy360/features/events/domain/topic_item.dart';
import 'package:eventy360/features/notifications/application/notification_controller.dart';
import 'package:eventy360/features/notifications/application/notification_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('loads events and toggles bookmark', () async {
    final repository = _FakeEventsRepository();
    final notificationController = _FakeNotificationController();
    final container = ProviderContainer(
      overrides: [
        eventsRepositoryProvider.overrideWithValue(repository),
        notificationControllerProvider.overrideWith(
          () => notificationController,
        ),
      ],
    );
    addTearDown(container.dispose);

    final initial = await container.read(eventsControllerProvider.future);
    expect(initial.events, isNotEmpty);
    expect(initial.events.first.isBookmarked, isFalse);

    await container
        .read(eventsControllerProvider.notifier)
        .toggleBookmark('evt-1');
    final updated = container.read(eventsControllerProvider).asData!.value;
    expect(updated.events.first.isBookmarked, isTrue);
  });

  test(
    'requests permission and registers token when subscribing to topic',
    () async {
      final repository = _FakeEventsRepository();
      final notificationController = _FakeNotificationController();
      final container = ProviderContainer(
        overrides: [
          eventsRepositoryProvider.overrideWithValue(repository),
          notificationControllerProvider.overrideWith(
            () => notificationController,
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(eventsControllerProvider.future);
      await container
          .read(eventsControllerProvider.notifier)
          .toggleTopicSubscription('artificial-intelligence');

      final updated = container.read(eventsControllerProvider).asData!.value;
      expect(
        updated.subscribedTopicIds.contains('artificial-intelligence'),
        isTrue,
      );
      expect(notificationController.permissionRequested, isTrue);
      expect(
        notificationController.lastRegisteredTopicId,
        'artificial-intelligence',
      );
    },
  );

  test('applies topic filter to discovery results', () async {
    final repository = _FakeEventsRepository();
    final notificationController = _FakeNotificationController();
    final container = ProviderContainer(
      overrides: [
        eventsRepositoryProvider.overrideWithValue(repository),
        notificationControllerProvider.overrideWith(
          () => notificationController,
        ),
      ],
    );
    addTearDown(container.dispose);

    await container.read(eventsControllerProvider.future);
    await container
        .read(eventsControllerProvider.notifier)
        .toggleTopicFilter('cybersecurity');
    final updated = container.read(eventsControllerProvider).asData!.value;
    expect(updated.events.length, 1);
    expect(updated.events.first.id, 'evt-2');
  });

  test('unsubscribing from topic unregisters current token', () async {
    final repository = _FakeEventsRepository().._subs.add('cybersecurity');
    final notificationController = _FakeNotificationController();
    final container = ProviderContainer(
      overrides: [
        eventsRepositoryProvider.overrideWithValue(repository),
        notificationControllerProvider.overrideWith(
          () => notificationController,
        ),
      ],
    );
    addTearDown(container.dispose);

    await container.read(eventsControllerProvider.future);
    await container
        .read(eventsControllerProvider.notifier)
        .toggleTopicSubscription('cybersecurity');

    final updated = container.read(eventsControllerProvider).asData!.value;
    expect(updated.subscribedTopicIds.contains('cybersecurity'), isFalse);
    expect(notificationController.lastUnregisteredTopicId, 'cybersecurity');
  });

  test('ensureEventLoaded fetches missing event by id', () async {
    final repository = _FakeEventsRepository();
    final notificationController = _FakeNotificationController();
    final container = ProviderContainer(
      overrides: [
        eventsRepositoryProvider.overrideWithValue(repository),
        notificationControllerProvider.overrideWith(
          () => notificationController,
        ),
      ],
    );
    addTearDown(container.dispose);

    await container.read(eventsControllerProvider.future);
    final fetched = await container
        .read(eventsControllerProvider.notifier)
        .ensureEventLoaded('evt-3');

    expect(fetched, isNotNull);
    expect(fetched!.id, 'evt-3');
    final updated = container.read(eventsControllerProvider).asData!.value;
    expect(updated.events.any((event) => event.id == 'evt-3'), isTrue);
  });
}

class _FakeNotificationController extends NotificationController {
  bool permissionRequested = false;
  String? lastRegisteredTopicId;
  String? lastUnregisteredTopicId;

  @override
  Future<NotificationState> build() async => NotificationState.initial();

  @override
  Future<void> registerCurrentToken({required String topicId}) async {
    lastRegisteredTopicId = topicId;
  }

  @override
  Future<void> unregisterCurrentToken({required String topicId}) async {
    lastUnregisteredTopicId = topicId;
  }

  @override
  Future<void> requestPermissionForTopicIntent() async {
    permissionRequested = true;
  }
}

class _FakeEventsRepository implements EventsRepository {
  final Set<String> _bookmarks = {};
  final Set<String> _subs = {};

  @override
  Future<List<EventSummary>> discoverEvents({
    required int page,
    required int pageSize,
    required String query,
    required Set<String> selectedTopicIds,
  }) async {
    final events = [
      EventSummary(
        id: 'evt-1',
        title: 'Demo event',
        deadline: DateTime(2026, 12, 31),
        location: 'Algiers',
        topics: const ['Artificial Intelligence'],
        isBookmarked: _bookmarks.contains('evt-1'),
      ),
      EventSummary(
        id: 'evt-2',
        title: 'Security event',
        deadline: DateTime(2026, 11, 30),
        location: 'Oran',
        topics: const ['Cybersecurity'],
        isBookmarked: _bookmarks.contains('evt-2'),
      ),
      EventSummary(
        id: 'evt-3',
        title: 'Data event',
        deadline: DateTime(2026, 10, 20),
        location: 'Constantine',
        topics: const ['Data Science'],
        isBookmarked: _bookmarks.contains('evt-3'),
      ),
    ];
    if (selectedTopicIds.isEmpty) {
      return events;
    }
    return events
        .where(
          (event) => event.topics.any(
            (topic) => selectedTopicIds.contains(
              topic.toLowerCase().replaceAll(' ', '-'),
            ),
          ),
        )
        .toList();
  }

  @override
  Future<EventSummary?> fetchEventById(String eventId) async {
    final all = await discoverEvents(
      page: 1,
      pageSize: 10,
      query: '',
      selectedTopicIds: const {},
    );
    for (final event in all) {
      if (event.id == eventId) {
        return event;
      }
    }
    return null;
  }

  @override
  Future<EventDetail?> fetchEventDetail(String eventId) async {
    final summary = await fetchEventById(eventId);
    if (summary == null) {
      return null;
    }
    return EventDetail(
      id: summary.id,
      title: summary.title,
      isBookmarked: summary.isBookmarked,
      eventType: 'conference',
      eventDate: summary.deadline,
      status: 'published',
      format: 'in_person',
      email: 'events@example.com',
      phone: '+213000000000',
      createdAt: DateTime(2026),
      location: summary.location,
      topics: summary.topics,
    );
  }

  @override
  Future<List<EventSummary>> fetchBookmarkedEvents() async {
    final events = await discoverEvents(
      page: 1,
      pageSize: 10,
      query: '',
      selectedTopicIds: const {},
    );
    return events.where((event) => _bookmarks.contains(event.id)).toList();
  }

  @override
  Future<Set<String>> getBookmarkedEventIds() async => {..._bookmarks};

  @override
  Future<Set<String>> getSubscribedTopicIds() async => {..._subs};

  @override
  Future<List<TopicItem>> getTopics() async => const [
    TopicItem(id: 'artificial-intelligence', name: 'Artificial Intelligence'),
    TopicItem(id: 'cybersecurity', name: 'Cybersecurity'),
  ];

  @override
  Future<bool> toggleBookmark(String eventId) async {
    if (_bookmarks.contains(eventId)) {
      _bookmarks.remove(eventId);
      return false;
    }
    _bookmarks.add(eventId);
    return true;
  }

  @override
  Future<bool> toggleTopicSubscription(String topicId) async {
    if (_subs.contains(topicId)) {
      _subs.remove(topicId);
      return false;
    }
    _subs.add(topicId);
    return true;
  }
}
