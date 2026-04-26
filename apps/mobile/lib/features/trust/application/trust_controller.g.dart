// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trust_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(trustRepository)
final trustRepositoryProvider = TrustRepositoryProvider._();

final class TrustRepositoryProvider
    extends
        $FunctionalProvider<TrustRepository, TrustRepository, TrustRepository>
    with $Provider<TrustRepository> {
  TrustRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'trustRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$trustRepositoryHash();

  @$internal
  @override
  $ProviderElement<TrustRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  TrustRepository create(Ref ref) {
    return trustRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(TrustRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<TrustRepository>(value),
    );
  }
}

String _$trustRepositoryHash() => r'd51a2862c36ddfd6057d1d798f96db1ab8925cc9';

@ProviderFor(TrustController)
final trustControllerProvider = TrustControllerProvider._();

final class TrustControllerProvider
    extends $AsyncNotifierProvider<TrustController, TrustState> {
  TrustControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'trustControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$trustControllerHash();

  @$internal
  @override
  TrustController create() => TrustController();
}

String _$trustControllerHash() => r'35324df88d61722405017b62783c0f1280beb90b';

abstract class _$TrustController extends $AsyncNotifier<TrustState> {
  FutureOr<TrustState> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<TrustState>, TrustState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<TrustState>, TrustState>,
              AsyncValue<TrustState>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
