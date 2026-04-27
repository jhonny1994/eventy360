// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'event_summary.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$EventSummary {

 String get id; String get title; DateTime get deadline; String get location; List<String> get topics; bool get isBookmarked;
/// Create a copy of EventSummary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EventSummaryCopyWith<EventSummary> get copyWith => _$EventSummaryCopyWithImpl<EventSummary>(this as EventSummary, _$identity);

  /// Serializes this EventSummary to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EventSummary&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.deadline, deadline) || other.deadline == deadline)&&(identical(other.location, location) || other.location == location)&&const DeepCollectionEquality().equals(other.topics, topics)&&(identical(other.isBookmarked, isBookmarked) || other.isBookmarked == isBookmarked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,deadline,location,const DeepCollectionEquality().hash(topics),isBookmarked);

@override
String toString() {
  return 'EventSummary(id: $id, title: $title, deadline: $deadline, location: $location, topics: $topics, isBookmarked: $isBookmarked)';
}


}

/// @nodoc
abstract mixin class $EventSummaryCopyWith<$Res>  {
  factory $EventSummaryCopyWith(EventSummary value, $Res Function(EventSummary) _then) = _$EventSummaryCopyWithImpl;
@useResult
$Res call({
 String id, String title, DateTime deadline, String location, List<String> topics, bool isBookmarked
});




}
/// @nodoc
class _$EventSummaryCopyWithImpl<$Res>
    implements $EventSummaryCopyWith<$Res> {
  _$EventSummaryCopyWithImpl(this._self, this._then);

  final EventSummary _self;
  final $Res Function(EventSummary) _then;

/// Create a copy of EventSummary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? deadline = null,Object? location = null,Object? topics = null,Object? isBookmarked = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,deadline: null == deadline ? _self.deadline : deadline // ignore: cast_nullable_to_non_nullable
as DateTime,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,topics: null == topics ? _self.topics : topics // ignore: cast_nullable_to_non_nullable
as List<String>,isBookmarked: null == isBookmarked ? _self.isBookmarked : isBookmarked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [EventSummary].
extension EventSummaryPatterns on EventSummary {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EventSummary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EventSummary() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EventSummary value)  $default,){
final _that = this;
switch (_that) {
case _EventSummary():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EventSummary value)?  $default,){
final _that = this;
switch (_that) {
case _EventSummary() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  DateTime deadline,  String location,  List<String> topics,  bool isBookmarked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EventSummary() when $default != null:
return $default(_that.id,_that.title,_that.deadline,_that.location,_that.topics,_that.isBookmarked);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  DateTime deadline,  String location,  List<String> topics,  bool isBookmarked)  $default,) {final _that = this;
switch (_that) {
case _EventSummary():
return $default(_that.id,_that.title,_that.deadline,_that.location,_that.topics,_that.isBookmarked);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  DateTime deadline,  String location,  List<String> topics,  bool isBookmarked)?  $default,) {final _that = this;
switch (_that) {
case _EventSummary() when $default != null:
return $default(_that.id,_that.title,_that.deadline,_that.location,_that.topics,_that.isBookmarked);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _EventSummary implements EventSummary {
  const _EventSummary({required this.id, required this.title, required this.deadline, required this.location, required final  List<String> topics, required this.isBookmarked}): _topics = topics;
  factory _EventSummary.fromJson(Map<String, dynamic> json) => _$EventSummaryFromJson(json);

@override final  String id;
@override final  String title;
@override final  DateTime deadline;
@override final  String location;
 final  List<String> _topics;
@override List<String> get topics {
  if (_topics is EqualUnmodifiableListView) return _topics;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_topics);
}

@override final  bool isBookmarked;

/// Create a copy of EventSummary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EventSummaryCopyWith<_EventSummary> get copyWith => __$EventSummaryCopyWithImpl<_EventSummary>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$EventSummaryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _EventSummary&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.deadline, deadline) || other.deadline == deadline)&&(identical(other.location, location) || other.location == location)&&const DeepCollectionEquality().equals(other._topics, _topics)&&(identical(other.isBookmarked, isBookmarked) || other.isBookmarked == isBookmarked));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,title,deadline,location,const DeepCollectionEquality().hash(_topics),isBookmarked);

@override
String toString() {
  return 'EventSummary(id: $id, title: $title, deadline: $deadline, location: $location, topics: $topics, isBookmarked: $isBookmarked)';
}


}

/// @nodoc
abstract mixin class _$EventSummaryCopyWith<$Res> implements $EventSummaryCopyWith<$Res> {
  factory _$EventSummaryCopyWith(_EventSummary value, $Res Function(_EventSummary) _then) = __$EventSummaryCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, DateTime deadline, String location, List<String> topics, bool isBookmarked
});




}
/// @nodoc
class __$EventSummaryCopyWithImpl<$Res>
    implements _$EventSummaryCopyWith<$Res> {
  __$EventSummaryCopyWithImpl(this._self, this._then);

  final _EventSummary _self;
  final $Res Function(_EventSummary) _then;

/// Create a copy of EventSummary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? deadline = null,Object? location = null,Object? topics = null,Object? isBookmarked = null,}) {
  return _then(_EventSummary(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,deadline: null == deadline ? _self.deadline : deadline // ignore: cast_nullable_to_non_nullable
as DateTime,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,topics: null == topics ? _self._topics : topics // ignore: cast_nullable_to_non_nullable
as List<String>,isBookmarked: null == isBookmarked ? _self.isBookmarked : isBookmarked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
