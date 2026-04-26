// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'events_state.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_EventsState _$EventsStateFromJson(Map<String, dynamic> json) => _EventsState(
  events: (json['events'] as List<dynamic>)
      .map((e) => EventSummary.fromJson(e as Map<String, dynamic>))
      .toList(),
  topics: (json['topics'] as List<dynamic>)
      .map((e) => TopicItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  subscribedTopicIds: (json['subscribedTopicIds'] as List<dynamic>)
      .map((e) => e as String)
      .toSet(),
  selectedTopicIds: (json['selectedTopicIds'] as List<dynamic>)
      .map((e) => e as String)
      .toSet(),
  query: json['query'] as String,
  page: (json['page'] as num).toInt(),
  pageSize: (json['pageSize'] as num).toInt(),
  isLoadingMore: json['isLoadingMore'] as bool,
);

Map<String, dynamic> _$EventsStateToJson(_EventsState instance) =>
    <String, dynamic>{
      'events': instance.events,
      'topics': instance.topics,
      'subscribedTopicIds': instance.subscribedTopicIds.toList(),
      'selectedTopicIds': instance.selectedTopicIds.toList(),
      'query': instance.query,
      'page': instance.page,
      'pageSize': instance.pageSize,
      'isLoadingMore': instance.isLoadingMore,
    };
