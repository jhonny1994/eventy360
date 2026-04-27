// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_state.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_NotificationState _$NotificationStateFromJson(Map<String, dynamic> json) =>
    _NotificationState(
      permissionGranted: json['permissionGranted'] as bool,
      pendingEventId: json['pendingEventId'] as String?,
      foregroundTitle: json['foregroundTitle'] as String?,
      foregroundBody: json['foregroundBody'] as String?,
      foregroundEventId: json['foregroundEventId'] as String?,
      foregroundMessageSerial:
          (json['foregroundMessageSerial'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$NotificationStateToJson(_NotificationState instance) =>
    <String, dynamic>{
      'permissionGranted': instance.permissionGranted,
      'pendingEventId': instance.pendingEventId,
      'foregroundTitle': instance.foregroundTitle,
      'foregroundBody': instance.foregroundBody,
      'foregroundEventId': instance.foregroundEventId,
      'foregroundMessageSerial': instance.foregroundMessageSerial,
    };
