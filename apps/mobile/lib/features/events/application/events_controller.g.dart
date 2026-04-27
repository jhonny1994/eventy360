// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'events_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(eventsRepository)
final eventsRepositoryProvider = EventsRepositoryProvider._();

final class EventsRepositoryProvider
    extends
        $FunctionalProvider<
          EventsRepository,
          EventsRepository,
          EventsRepository
        >
    with $Provider<EventsRepository> {
  EventsRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'eventsRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$eventsRepositoryHash();

  @$internal
  @override
  $ProviderElement<EventsRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  EventsRepository create(Ref ref) {
    return eventsRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(EventsRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<EventsRepository>(value),
    );
  }
}

String _$eventsRepositoryHash() => r'ac10519aad254be23ca633cfd465e549246943ac';

@ProviderFor(eventDetail)
final eventDetailProvider = EventDetailFamily._();

final class EventDetailProvider
    extends
        $FunctionalProvider<
          AsyncValue<EventDetail?>,
          EventDetail?,
          FutureOr<EventDetail?>
        >
    with $FutureModifier<EventDetail?>, $FutureProvider<EventDetail?> {
  EventDetailProvider._({
    required EventDetailFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'eventDetailProvider',
         isAutoDispose: false,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$eventDetailHash();

  @override
  String toString() {
    return r'eventDetailProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<EventDetail?> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<EventDetail?> create(Ref ref) {
    final argument = this.argument as String;
    return eventDetail(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is EventDetailProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$eventDetailHash() => r'bbe393e20c9899fd6d70482e812e620896989477';

final class EventDetailFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<EventDetail?>, String> {
  EventDetailFamily._()
    : super(
        retry: null,
        name: r'eventDetailProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: false,
      );

  EventDetailProvider call(String eventId) =>
      EventDetailProvider._(argument: eventId, from: this);

  @override
  String toString() => r'eventDetailProvider';
}

@ProviderFor(EventsController)
final eventsControllerProvider = EventsControllerProvider._();

final class EventsControllerProvider
    extends $AsyncNotifierProvider<EventsController, EventsState> {
  EventsControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'eventsControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$eventsControllerHash();

  @$internal
  @override
  EventsController create() => EventsController();
}

String _$eventsControllerHash() => r'b7b65e5f4850f572e8f8047acbb981cbea78cb21';

abstract class _$EventsController extends $AsyncNotifier<EventsState> {
  FutureOr<EventsState> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<EventsState>, EventsState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<EventsState>, EventsState>,
              AsyncValue<EventsState>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
