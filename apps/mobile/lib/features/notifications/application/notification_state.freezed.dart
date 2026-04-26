// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'notification_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$NotificationState {

 bool get permissionGranted; String? get pendingEventId; String? get foregroundTitle; String? get foregroundBody; String? get foregroundEventId; int get foregroundMessageSerial;
/// Create a copy of NotificationState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NotificationStateCopyWith<NotificationState> get copyWith => _$NotificationStateCopyWithImpl<NotificationState>(this as NotificationState, _$identity);

  /// Serializes this NotificationState to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationState&&(identical(other.permissionGranted, permissionGranted) || other.permissionGranted == permissionGranted)&&(identical(other.pendingEventId, pendingEventId) || other.pendingEventId == pendingEventId)&&(identical(other.foregroundTitle, foregroundTitle) || other.foregroundTitle == foregroundTitle)&&(identical(other.foregroundBody, foregroundBody) || other.foregroundBody == foregroundBody)&&(identical(other.foregroundEventId, foregroundEventId) || other.foregroundEventId == foregroundEventId)&&(identical(other.foregroundMessageSerial, foregroundMessageSerial) || other.foregroundMessageSerial == foregroundMessageSerial));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,permissionGranted,pendingEventId,foregroundTitle,foregroundBody,foregroundEventId,foregroundMessageSerial);

@override
String toString() {
  return 'NotificationState(permissionGranted: $permissionGranted, pendingEventId: $pendingEventId, foregroundTitle: $foregroundTitle, foregroundBody: $foregroundBody, foregroundEventId: $foregroundEventId, foregroundMessageSerial: $foregroundMessageSerial)';
}


}

/// @nodoc
abstract mixin class $NotificationStateCopyWith<$Res>  {
  factory $NotificationStateCopyWith(NotificationState value, $Res Function(NotificationState) _then) = _$NotificationStateCopyWithImpl;
@useResult
$Res call({
 bool permissionGranted, String? pendingEventId, String? foregroundTitle, String? foregroundBody, String? foregroundEventId, int foregroundMessageSerial
});




}
/// @nodoc
class _$NotificationStateCopyWithImpl<$Res>
    implements $NotificationStateCopyWith<$Res> {
  _$NotificationStateCopyWithImpl(this._self, this._then);

  final NotificationState _self;
  final $Res Function(NotificationState) _then;

/// Create a copy of NotificationState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? permissionGranted = null,Object? pendingEventId = freezed,Object? foregroundTitle = freezed,Object? foregroundBody = freezed,Object? foregroundEventId = freezed,Object? foregroundMessageSerial = null,}) {
  return _then(_self.copyWith(
permissionGranted: null == permissionGranted ? _self.permissionGranted : permissionGranted // ignore: cast_nullable_to_non_nullable
as bool,pendingEventId: freezed == pendingEventId ? _self.pendingEventId : pendingEventId // ignore: cast_nullable_to_non_nullable
as String?,foregroundTitle: freezed == foregroundTitle ? _self.foregroundTitle : foregroundTitle // ignore: cast_nullable_to_non_nullable
as String?,foregroundBody: freezed == foregroundBody ? _self.foregroundBody : foregroundBody // ignore: cast_nullable_to_non_nullable
as String?,foregroundEventId: freezed == foregroundEventId ? _self.foregroundEventId : foregroundEventId // ignore: cast_nullable_to_non_nullable
as String?,foregroundMessageSerial: null == foregroundMessageSerial ? _self.foregroundMessageSerial : foregroundMessageSerial // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [NotificationState].
extension NotificationStatePatterns on NotificationState {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _NotificationState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _NotificationState() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _NotificationState value)  $default,){
final _that = this;
switch (_that) {
case _NotificationState():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _NotificationState value)?  $default,){
final _that = this;
switch (_that) {
case _NotificationState() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool permissionGranted,  String? pendingEventId,  String? foregroundTitle,  String? foregroundBody,  String? foregroundEventId,  int foregroundMessageSerial)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _NotificationState() when $default != null:
return $default(_that.permissionGranted,_that.pendingEventId,_that.foregroundTitle,_that.foregroundBody,_that.foregroundEventId,_that.foregroundMessageSerial);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool permissionGranted,  String? pendingEventId,  String? foregroundTitle,  String? foregroundBody,  String? foregroundEventId,  int foregroundMessageSerial)  $default,) {final _that = this;
switch (_that) {
case _NotificationState():
return $default(_that.permissionGranted,_that.pendingEventId,_that.foregroundTitle,_that.foregroundBody,_that.foregroundEventId,_that.foregroundMessageSerial);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool permissionGranted,  String? pendingEventId,  String? foregroundTitle,  String? foregroundBody,  String? foregroundEventId,  int foregroundMessageSerial)?  $default,) {final _that = this;
switch (_that) {
case _NotificationState() when $default != null:
return $default(_that.permissionGranted,_that.pendingEventId,_that.foregroundTitle,_that.foregroundBody,_that.foregroundEventId,_that.foregroundMessageSerial);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _NotificationState implements NotificationState {
  const _NotificationState({required this.permissionGranted, this.pendingEventId, this.foregroundTitle, this.foregroundBody, this.foregroundEventId, this.foregroundMessageSerial = 0});
  factory _NotificationState.fromJson(Map<String, dynamic> json) => _$NotificationStateFromJson(json);

@override final  bool permissionGranted;
@override final  String? pendingEventId;
@override final  String? foregroundTitle;
@override final  String? foregroundBody;
@override final  String? foregroundEventId;
@override@JsonKey() final  int foregroundMessageSerial;

/// Create a copy of NotificationState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$NotificationStateCopyWith<_NotificationState> get copyWith => __$NotificationStateCopyWithImpl<_NotificationState>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$NotificationStateToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _NotificationState&&(identical(other.permissionGranted, permissionGranted) || other.permissionGranted == permissionGranted)&&(identical(other.pendingEventId, pendingEventId) || other.pendingEventId == pendingEventId)&&(identical(other.foregroundTitle, foregroundTitle) || other.foregroundTitle == foregroundTitle)&&(identical(other.foregroundBody, foregroundBody) || other.foregroundBody == foregroundBody)&&(identical(other.foregroundEventId, foregroundEventId) || other.foregroundEventId == foregroundEventId)&&(identical(other.foregroundMessageSerial, foregroundMessageSerial) || other.foregroundMessageSerial == foregroundMessageSerial));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,permissionGranted,pendingEventId,foregroundTitle,foregroundBody,foregroundEventId,foregroundMessageSerial);

@override
String toString() {
  return 'NotificationState(permissionGranted: $permissionGranted, pendingEventId: $pendingEventId, foregroundTitle: $foregroundTitle, foregroundBody: $foregroundBody, foregroundEventId: $foregroundEventId, foregroundMessageSerial: $foregroundMessageSerial)';
}


}

/// @nodoc
abstract mixin class _$NotificationStateCopyWith<$Res> implements $NotificationStateCopyWith<$Res> {
  factory _$NotificationStateCopyWith(_NotificationState value, $Res Function(_NotificationState) _then) = __$NotificationStateCopyWithImpl;
@override @useResult
$Res call({
 bool permissionGranted, String? pendingEventId, String? foregroundTitle, String? foregroundBody, String? foregroundEventId, int foregroundMessageSerial
});




}
/// @nodoc
class __$NotificationStateCopyWithImpl<$Res>
    implements _$NotificationStateCopyWith<$Res> {
  __$NotificationStateCopyWithImpl(this._self, this._then);

  final _NotificationState _self;
  final $Res Function(_NotificationState) _then;

/// Create a copy of NotificationState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? permissionGranted = null,Object? pendingEventId = freezed,Object? foregroundTitle = freezed,Object? foregroundBody = freezed,Object? foregroundEventId = freezed,Object? foregroundMessageSerial = null,}) {
  return _then(_NotificationState(
permissionGranted: null == permissionGranted ? _self.permissionGranted : permissionGranted // ignore: cast_nullable_to_non_nullable
as bool,pendingEventId: freezed == pendingEventId ? _self.pendingEventId : pendingEventId // ignore: cast_nullable_to_non_nullable
as String?,foregroundTitle: freezed == foregroundTitle ? _self.foregroundTitle : foregroundTitle // ignore: cast_nullable_to_non_nullable
as String?,foregroundBody: freezed == foregroundBody ? _self.foregroundBody : foregroundBody // ignore: cast_nullable_to_non_nullable
as String?,foregroundEventId: freezed == foregroundEventId ? _self.foregroundEventId : foregroundEventId // ignore: cast_nullable_to_non_nullable
as String?,foregroundMessageSerial: null == foregroundMessageSerial ? _self.foregroundMessageSerial : foregroundMessageSerial // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
