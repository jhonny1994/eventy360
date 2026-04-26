import 'package:eventy360/features/events/application/events_controller.dart';
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

    await container.read(eventsControllerProvider.notifier).toggleBookmark('evt-1');
    final updated = container.read(eventsControllerProvider).asData!.value;
    expect(updated.events.first.isBookmarked, isTrue);
  });

  test('requests permission and registers token when subscribing to topic', () async {
    final repository = _FakeEventsRepository();
    final notificationController = _FakeNotificationController();
    final container = ProviderContainer(
      overrides: [
        eventsRepositoryProvider.overrideWithValue(repository),
        notificationControllerProvider.overrideWith(() => notificationController),
      ],
    );
    addTearDown(container.dispose);

    await container.read(eventsControllerProvider.future);
    await container
        .read(eventsControllerProvider.notifier)
        .toggleTopicSubscription('artificial-intelligence');

    final updated = container.read(eventsControllerProvider).asData!.value;
    expect(updated.subscribedTopicIds.contains('artificial-intelligence'), isTrue);
    expect(notificationController.permissionRequested, isTrue);
    expect(notificationController.lastRegisteredTopicId, 'artificial-intelligence');
  });

  test('applies topic filter to discovery results', () async {
    final repository = _FakeEventsRepository();
    final notificationController = _FakeNotificationController();
    final container = ProviderContainer(
      overrides: [
        eventsRepositoryProvider.overrideWithValue(repository),
        notificationControllerProvider.overrideWith(() => notificationController),
      ],
    );
    addTearDown(container.dispose);

    await container.read(eventsControllerProvider.future);
    await container.read(eventsControllerProvider.notifier).toggleTopicFilter('cybersecurity');
    final updated = container.read(eventsControllerProvider).asData!.value;
    expect(updated.events.length, 1);
    expect(updated.events.first.id, 'evt-2');
  });
}

class _FakeNotificationController extends NotificationController {
  bool permissionRequested = false;
  String? lastRegisteredTopicId;

  @override
  Future<NotificationState> build() async => NotificationState.initial();

  @override
  Future<void> registerCurrentToken({required String topicId}) async {
    lastRegisteredTopicId = topicId;
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
    ];
    if (selectedTopicIds.isEmpty) {
      return events;
    }
    return events
        .where(
          (event) => event.topics.any(
            (topic) => selectedTopicIds.contains(topic.toLowerCase().replaceAll(' ', '-')),
          ),
        )
        .toList();
  }

  @override
  Future<Set<String>> getBookmarkedEventIds() async => {..._bookmarks};

  @override
  Future<Set<String>> getSubscribedTopicIds() async => {..._subs};

  @override
  Future<List<TopicItem>> getTopics() async =>
      const [
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
