// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'initial_setup_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(InitialSetupController)
final initialSetupControllerProvider = InitialSetupControllerProvider._();

final class InitialSetupControllerProvider
    extends $NotifierProvider<InitialSetupController, bool> {
  InitialSetupControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'initialSetupControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$initialSetupControllerHash();

  @$internal
  @override
  InitialSetupController create() => InitialSetupController();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(bool value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<bool>(value),
    );
  }
}

String _$initialSetupControllerHash() =>
    r'c970bfc5e695843df898086327b7d5bf47522302';

abstract class _$InitialSetupController extends $Notifier<bool> {
  bool build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<bool, bool>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<bool, bool>,
              bool,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
