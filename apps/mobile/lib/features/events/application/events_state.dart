import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/events/domain/topic_item.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'events_state.freezed.dart';
part 'events_state.g.dart';

@freezed
abstract class EventsState with _$EventsState {
  const factory EventsState({
    required List<EventSummary> events,
    required List<TopicItem> topics,
    required Set<String> subscribedTopicIds,
    required Set<String> selectedTopicIds,
    required String query,
    required int page,
    required int pageSize,
    required bool isLoadingMore,
  }) = _EventsState;

  factory EventsState.initial() => const EventsState(
        events: [],
        topics: [],
        subscribedTopicIds: {},
        selectedTopicIds: {},
        query: '',
        page: 1,
        pageSize: 20,
        isLoadingMore: false,
      );

  factory EventsState.fromJson(Map<String, dynamic> json) =>
      _$EventsStateFromJson(json);
}
