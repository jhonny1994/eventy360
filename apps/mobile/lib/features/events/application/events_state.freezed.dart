// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'events_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$EventsState {

 List<EventSummary> get events; List<TopicItem> get topics; Set<String> get subscribedTopicIds; Set<String> get selectedTopicIds; String get query; int get page; int get pageSize; bool get isLoadingMore;
/// Create a copy of EventsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EventsStateCopyWith<EventsState> get copyWith => _$EventsStateCopyWithImpl<EventsState>(this as EventsState, _$identity);

  /// Serializes this EventsState to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EventsState&&const DeepCollectionEquality().equals(other.events, events)&&const DeepCollectionEquality().equals(other.topics, topics)&&const DeepCollectionEquality().equals(other.subscribedTopicIds, subscribedTopicIds)&&const DeepCollectionEquality().equals(other.selectedTopicIds, selectedTopicIds)&&(identical(other.query, query) || other.query == query)&&(identical(other.page, page) || other.page == page)&&(identical(other.pageSize, pageSize) || other.pageSize == pageSize)&&(identical(other.isLoadingMore, isLoadingMore) || other.isLoadingMore == isLoadingMore));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(events),const DeepCollectionEquality().hash(topics),const DeepCollectionEquality().hash(subscribedTopicIds),const DeepCollectionEquality().hash(selectedTopicIds),query,page,pageSize,isLoadingMore);

@override
String toString() {
  return 'EventsState(events: $events, topics: $topics, subscribedTopicIds: $subscribedTopicIds, selectedTopicIds: $selectedTopicIds, query: $query, page: $page, pageSize: $pageSize, isLoadingMore: $isLoadingMore)';
}


}

/// @nodoc
abstract mixin class $EventsStateCopyWith<$Res>  {
  factory $EventsStateCopyWith(EventsState value, $Res Function(EventsState) _then) = _$EventsStateCopyWithImpl;
@useResult
$Res call({
 List<EventSummary> events, List<TopicItem> topics, Set<String> subscribedTopicIds, Set<String> selectedTopicIds, String query, int page, int pageSize, bool isLoadingMore
});




}
/// @nodoc
class _$EventsStateCopyWithImpl<$Res>
    implements $EventsStateCopyWith<$Res> {
  _$EventsStateCopyWithImpl(this._self, this._then);

  final EventsState _self;
  final $Res Function(EventsState) _then;

/// Create a copy of EventsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? events = null,Object? topics = null,Object? subscribedTopicIds = null,Object? selectedTopicIds = null,Object? query = null,Object? page = null,Object? pageSize = null,Object? isLoadingMore = null,}) {
  return _then(_self.copyWith(
events: null == events ? _self.events : events // ignore: cast_nullable_to_non_nullable
as List<EventSummary>,topics: null == topics ? _self.topics : topics // ignore: cast_nullable_to_non_nullable
as List<TopicItem>,subscribedTopicIds: null == subscribedTopicIds ? _self.subscribedTopicIds : subscribedTopicIds // ignore: cast_nullable_to_non_nullable
as Set<String>,selectedTopicIds: null == selectedTopicIds ? _self.selectedTopicIds : selectedTopicIds // ignore: cast_nullable_to_non_nullable
as Set<String>,query: null == query ? _self.query : query // ignore: cast_nullable_to_non_nullable
as String,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,pageSize: null == pageSize ? _self.pageSize : pageSize // ignore: cast_nullable_to_non_nullable
as int,isLoadingMore: null == isLoadingMore ? _self.isLoadingMore : isLoadingMore // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [EventsState].
extension EventsStatePatterns on EventsState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EventsState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EventsState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EventsState value)  $default,){
final _that = this;
switch (_that) {
case _EventsState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EventsState value)?  $default,){
final _that = this;
switch (_that) {
case _EventsState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<EventSummary> events,  List<TopicItem> topics,  Set<String> subscribedTopicIds,  Set<String> selectedTopicIds,  String query,  int page,  int pageSize,  bool isLoadingMore)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EventsState() when $default != null:
return $default(_that.events,_that.topics,_that.subscribedTopicIds,_that.selectedTopicIds,_that.query,_that.page,_that.pageSize,_that.isLoadingMore);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<EventSummary> events,  List<TopicItem> topics,  Set<String> subscribedTopicIds,  Set<String> selectedTopicIds,  String query,  int page,  int pageSize,  bool isLoadingMore)  $default,) {final _that = this;
switch (_that) {
case _EventsState():
return $default(_that.events,_that.topics,_that.subscribedTopicIds,_that.selectedTopicIds,_that.query,_that.page,_that.pageSize,_that.isLoadingMore);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<EventSummary> events,  List<TopicItem> topics,  Set<String> subscribedTopicIds,  Set<String> selectedTopicIds,  String query,  int page,  int pageSize,  bool isLoadingMore)?  $default,) {final _that = this;
switch (_that) {
case _EventsState() when $default != null:
return $default(_that.events,_that.topics,_that.subscribedTopicIds,_that.selectedTopicIds,_that.query,_that.page,_that.pageSize,_that.isLoadingMore);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _EventsState implements EventsState {
  const _EventsState({required final  List<EventSummary> events, required final  List<TopicItem> topics, required final  Set<String> subscribedTopicIds, required final  Set<String> selectedTopicIds, required this.query, required this.page, required this.pageSize, required this.isLoadingMore}): _events = events,_topics = topics,_subscribedTopicIds = subscribedTopicIds,_selectedTopicIds = selectedTopicIds;
  factory _EventsState.fromJson(Map<String, dynamic> json) => _$EventsStateFromJson(json);

 final  List<EventSummary> _events;
@override List<EventSummary> get events {
  if (_events is EqualUnmodifiableListView) return _events;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_events);
}

 final  List<TopicItem> _topics;
@override List<TopicItem> get topics {
  if (_topics is EqualUnmodifiableListView) return _topics;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_topics);
}

 final  Set<String> _subscribedTopicIds;
@override Set<String> get subscribedTopicIds {
  if (_subscribedTopicIds is EqualUnmodifiableSetView) return _subscribedTopicIds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableSetView(_subscribedTopicIds);
}

 final  Set<String> _selectedTopicIds;
@override Set<String> get selectedTopicIds {
  if (_selectedTopicIds is EqualUnmodifiableSetView) return _selectedTopicIds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableSetView(_selectedTopicIds);
}

@override final  String query;
@override final  int page;
@override final  int pageSize;
@override final  bool isLoadingMore;

/// Create a copy of EventsState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EventsStateCopyWith<_EventsState> get copyWith => __$EventsStateCopyWithImpl<_EventsState>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$EventsStateToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _EventsState&&const DeepCollectionEquality().equals(other._events, _events)&&const DeepCollectionEquality().equals(other._topics, _topics)&&const DeepCollectionEquality().equals(other._subscribedTopicIds, _subscribedTopicIds)&&const DeepCollectionEquality().equals(other._selectedTopicIds, _selectedTopicIds)&&(identical(other.query, query) || other.query == query)&&(identical(other.page, page) || other.page == page)&&(identical(other.pageSize, pageSize) || other.pageSize == pageSize)&&(identical(other.isLoadingMore, isLoadingMore) || other.isLoadingMore == isLoadingMore));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_events),const DeepCollectionEquality().hash(_topics),const DeepCollectionEquality().hash(_subscribedTopicIds),const DeepCollectionEquality().hash(_selectedTopicIds),query,page,pageSize,isLoadingMore);

@override
String toString() {
  return 'EventsState(events: $events, topics: $topics, subscribedTopicIds: $subscribedTopicIds, selectedTopicIds: $selectedTopicIds, query: $query, page: $page, pageSize: $pageSize, isLoadingMore: $isLoadingMore)';
}


}

/// @nodoc
abstract mixin class _$EventsStateCopyWith<$Res> implements $EventsStateCopyWith<$Res> {
  factory _$EventsStateCopyWith(_EventsState value, $Res Function(_EventsState) _then) = __$EventsStateCopyWithImpl;
@override @useResult
$Res call({
 List<EventSummary> events, List<TopicItem> topics, Set<String> subscribedTopicIds, Set<String> selectedTopicIds, String query, int page, int pageSize, bool isLoadingMore
});




}
/// @nodoc
class __$EventsStateCopyWithImpl<$Res>
    implements _$EventsStateCopyWith<$Res> {
  __$EventsStateCopyWithImpl(this._self, this._then);

  final _EventsState _self;
  final $Res Function(_EventsState) _then;

/// Create a copy of EventsState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? events = null,Object? topics = null,Object? subscribedTopicIds = null,Object? selectedTopicIds = null,Object? query = null,Object? page = null,Object? pageSize = null,Object? isLoadingMore = null,}) {
  return _then(_EventsState(
events: null == events ? _self._events : events // ignore: cast_nullable_to_non_nullable
as List<EventSummary>,topics: null == topics ? _self._topics : topics // ignore: cast_nullable_to_non_nullable
as List<TopicItem>,subscribedTopicIds: null == subscribedTopicIds ? _self._subscribedTopicIds : subscribedTopicIds // ignore: cast_nullable_to_non_nullable
as Set<String>,selectedTopicIds: null == selectedTopicIds ? _self._selectedTopicIds : selectedTopicIds // ignore: cast_nullable_to_non_nullable
as Set<String>,query: null == query ? _self.query : query // ignore: cast_nullable_to_non_nullable
as String,page: null == page ? _self.page : page // ignore: cast_nullable_to_non_nullable
as int,pageSize: null == pageSize ? _self.pageSize : pageSize // ignore: cast_nullable_to_non_nullable
as int,isLoadingMore: null == isLoadingMore ? _self.isLoadingMore : isLoadingMore // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
