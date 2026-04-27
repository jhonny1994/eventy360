// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'repository_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(repositoryRepository)
final repositoryRepositoryProvider = RepositoryRepositoryProvider._();

final class RepositoryRepositoryProvider
    extends
        $FunctionalProvider<
          RepositoryRepository,
          RepositoryRepository,
          RepositoryRepository
        >
    with $Provider<RepositoryRepository> {
  RepositoryRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'repositoryRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$repositoryRepositoryHash();

  @$internal
  @override
  $ProviderElement<RepositoryRepository> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  RepositoryRepository create(Ref ref) {
    return repositoryRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(RepositoryRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<RepositoryRepository>(value),
    );
  }
}

String _$repositoryRepositoryHash() =>
    r'59c7b66ff1bd100e503121c14b225b467854e14a';

@ProviderFor(RepositoryController)
final repositoryControllerProvider = RepositoryControllerProvider._();

final class RepositoryControllerProvider
    extends $AsyncNotifierProvider<RepositoryController, RepositoryState> {
  RepositoryControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'repositoryControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$repositoryControllerHash();

  @$internal
  @override
  RepositoryController create() => RepositoryController();
}

String _$repositoryControllerHash() =>
    r'd697e156f2476551c7cadc47f88f56b461ec93c5';

abstract class _$RepositoryController extends $AsyncNotifier<RepositoryState> {
  FutureOr<RepositoryState> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<RepositoryState>, RepositoryState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<RepositoryState>, RepositoryState>,
              AsyncValue<RepositoryState>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
