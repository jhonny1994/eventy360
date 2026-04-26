// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_state.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_NotificationState _$NotificationStateFromJson(Map<String, dynamic> json) =>
    _NotificationState(
      permissionGranted: json['permissionGranted'] as bool,
      pendingEventId: json['pendingEventId'] as String?,
    );

Map<String, dynamic> _$NotificationStateToJson(_NotificationState instance) =>
    <String, dynamic>{
      'permissionGranted': instance.permissionGranted,
      'pendingEventId': instance.pendingEventId,
    };
