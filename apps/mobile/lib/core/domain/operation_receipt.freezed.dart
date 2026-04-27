// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'operation_receipt.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$OperationReceipt {

 String get id; String get message; DateTime get timestamp;
/// Create a copy of OperationReceipt
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OperationReceiptCopyWith<OperationReceipt> get copyWith => _$OperationReceiptCopyWithImpl<OperationReceipt>(this as OperationReceipt, _$identity);

  /// Serializes this OperationReceipt to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OperationReceipt&&(identical(other.id, id) || other.id == id)&&(identical(other.message, message) || other.message == message)&&(identical(other.timestamp, timestamp) || other.timestamp == timestamp));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,message,timestamp);

@override
String toString() {
  return 'OperationReceipt(id: $id, message: $message, timestamp: $timestamp)';
}


}

/// @nodoc
abstract mixin class $OperationReceiptCopyWith<$Res>  {
  factory $OperationReceiptCopyWith(OperationReceipt value, $Res Function(OperationReceipt) _then) = _$OperationReceiptCopyWithImpl;
@useResult
$Res call({
 String id, String message, DateTime timestamp
});




}
/// @nodoc
class _$OperationReceiptCopyWithImpl<$Res>
    implements $OperationReceiptCopyWith<$Res> {
  _$OperationReceiptCopyWithImpl(this._self, this._then);

  final OperationReceipt _self;
  final $Res Function(OperationReceipt) _then;

/// Create a copy of OperationReceipt
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? message = null,Object? timestamp = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,timestamp: null == timestamp ? _self.timestamp : timestamp // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [OperationReceipt].
extension OperationReceiptPatterns on OperationReceipt {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OperationReceipt value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OperationReceipt() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OperationReceipt value)  $default,){
final _that = this;
switch (_that) {
case _OperationReceipt():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OperationReceipt value)?  $default,){
final _that = this;
switch (_that) {
case _OperationReceipt() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String message,  DateTime timestamp)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OperationReceipt() when $default != null:
return $default(_that.id,_that.message,_that.timestamp);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String message,  DateTime timestamp)  $default,) {final _that = this;
switch (_that) {
case _OperationReceipt():
return $default(_that.id,_that.message,_that.timestamp);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String message,  DateTime timestamp)?  $default,) {final _that = this;
switch (_that) {
case _OperationReceipt() when $default != null:
return $default(_that.id,_that.message,_that.timestamp);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OperationReceipt implements OperationReceipt {
  const _OperationReceipt({required this.id, required this.message, required this.timestamp});
  factory _OperationReceipt.fromJson(Map<String, dynamic> json) => _$OperationReceiptFromJson(json);

@override final  String id;
@override final  String message;
@override final  DateTime timestamp;

/// Create a copy of OperationReceipt
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OperationReceiptCopyWith<_OperationReceipt> get copyWith => __$OperationReceiptCopyWithImpl<_OperationReceipt>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OperationReceiptToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OperationReceipt&&(identical(other.id, id) || other.id == id)&&(identical(other.message, message) || other.message == message)&&(identical(other.timestamp, timestamp) || other.timestamp == timestamp));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,message,timestamp);

@override
String toString() {
  return 'OperationReceipt(id: $id, message: $message, timestamp: $timestamp)';
}


}

/// @nodoc
abstract mixin class _$OperationReceiptCopyWith<$Res> implements $OperationReceiptCopyWith<$Res> {
  factory _$OperationReceiptCopyWith(_OperationReceipt value, $Res Function(_OperationReceipt) _then) = __$OperationReceiptCopyWithImpl;
@override @useResult
$Res call({
 String id, String message, DateTime timestamp
});




}
/// @nodoc
class __$OperationReceiptCopyWithImpl<$Res>
    implements _$OperationReceiptCopyWith<$Res> {
  __$OperationReceiptCopyWithImpl(this._self, this._then);

  final _OperationReceipt _self;
  final $Res Function(_OperationReceipt) _then;

/// Create a copy of OperationReceipt
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? message = null,Object? timestamp = null,}) {
  return _then(_OperationReceipt(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,timestamp: null == timestamp ? _self.timestamp : timestamp // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

// dart format on
