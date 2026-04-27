import 'package:freezed_annotation/freezed_annotation.dart';

part 'event_summary.freezed.dart';
part 'event_summary.g.dart';

@freezed
abstract class EventSummary with _$EventSummary {
  const factory EventSummary({
    required String id,
    required String title,
    required DateTime deadline,
    required String location,
    required List<String> topics,
    required bool isBookmarked,
  }) = _EventSummary;

  factory EventSummary.fromJson(Map<String, dynamic> json) =>
      _$EventSummaryFromJson(json);
}
