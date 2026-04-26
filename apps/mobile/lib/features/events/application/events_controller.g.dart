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

String _$eventsControllerHash() => r'740c353145c96b715f64684d2b2c342d6367269d';

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
