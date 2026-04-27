import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/events/domain/topic_item.dart';

abstract class EventsRepository {
  Future<List<EventSummary>> discoverEvents({
    required int page,
    required int pageSize,
    required String query,
    required Set<String> selectedTopicIds,
  });
  Future<EventSummary?> fetchEventById(String eventId);
  Future<List<EventSummary>> fetchBookmarkedEvents();

  Future<Set<String>> getBookmarkedEventIds();
  Future<bool> toggleBookmark(String eventId);

  Future<List<TopicItem>> getTopics();
  Future<Set<String>> getSubscribedTopicIds();
  Future<bool> toggleTopicSubscription(String topicId);
}

class EventsRepositoryError implements Exception {
  EventsRepositoryError(this.message);

  final String message;

  @override
  String toString() => message;
}
