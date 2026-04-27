import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_state.freezed.dart';
part 'notification_state.g.dart';

@freezed
abstract class NotificationState with _$NotificationState {
  const factory NotificationState({
    required bool permissionGranted,
    String? pendingEventId,
    String? foregroundTitle,
    String? foregroundBody,
    String? foregroundEventId,
    @Default(0) int foregroundMessageSerial,
  }) = _NotificationState;

  factory NotificationState.initial() =>
      const NotificationState(permissionGranted: false);

  factory NotificationState.fromJson(Map<String, dynamic> json) =>
      _$NotificationStateFromJson(json);
}
