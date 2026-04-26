// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_state.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SessionState _$SessionStateFromJson(Map<String, dynamic> json) =>
    _SessionState(
      user: json['user'] == null
          ? null
          : AuthUser.fromJson(json['user'] as Map<String, dynamic>),
      onboardingCompleted: json['onboardingCompleted'] as bool,
      profileCompleted: json['profileCompleted'] as bool,
    );

Map<String, dynamic> _$SessionStateToJson(_SessionState instance) =>
    <String, dynamic>{
      'user': instance.user,
      'onboardingCompleted': instance.onboardingCompleted,
      'profileCompleted': instance.profileCompleted,
    };
