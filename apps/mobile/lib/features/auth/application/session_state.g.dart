// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_state.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SessionState _$SessionStateFromJson(Map<String, dynamic> json) =>
    _SessionState(
      onboardingCompleted: json['onboardingCompleted'] as bool,
      profileCompleted: json['profileCompleted'] as bool,
      isVerified: json['isVerified'] as bool,
      user: json['user'] == null
          ? null
          : AuthUser.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$SessionStateToJson(_SessionState instance) =>
    <String, dynamic>{
      'onboardingCompleted': instance.onboardingCompleted,
      'profileCompleted': instance.profileCompleted,
      'isVerified': instance.isVerified,
      'user': instance.user,
    };
