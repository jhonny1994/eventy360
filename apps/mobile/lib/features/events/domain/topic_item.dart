import 'package:freezed_annotation/freezed_annotation.dart';

part 'topic_item.freezed.dart';
part 'topic_item.g.dart';

@freezed
abstract class TopicItem with _$TopicItem {
  const factory TopicItem({
    required String id,
    required String name,
  }) = _TopicItem;

  factory TopicItem.fromJson(Map<String, dynamic> json) =>
      _$TopicItemFromJson(json);
}
