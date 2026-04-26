// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'event_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_EventSummary _$EventSummaryFromJson(Map<String, dynamic> json) =>
    _EventSummary(
      id: json['id'] as String,
      title: json['title'] as String,
      deadline: DateTime.parse(json['deadline'] as String),
      location: json['location'] as String,
      topics: (json['topics'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      isBookmarked: json['isBookmarked'] as bool,
    );

Map<String, dynamic> _$EventSummaryToJson(_EventSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'deadline': instance.deadline.toIso8601String(),
      'location': instance.location,
      'topics': instance.topics,
      'isBookmarked': instance.isBookmarked,
    };
