// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_settings_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(appPaymentSettings)
final appPaymentSettingsProvider = AppPaymentSettingsProvider._();

final class AppPaymentSettingsProvider
    extends
        $FunctionalProvider<
          AsyncValue<AppPaymentSettings?>,
          AppPaymentSettings?,
          FutureOr<AppPaymentSettings?>
        >
    with
        $FutureModifier<AppPaymentSettings?>,
        $FutureProvider<AppPaymentSettings?> {
  AppPaymentSettingsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'appPaymentSettingsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$appPaymentSettingsHash();

  @$internal
  @override
  $FutureProviderElement<AppPaymentSettings?> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<AppPaymentSettings?> create(Ref ref) {
    return appPaymentSettings(ref);
  }
}

String _$appPaymentSettingsHash() =>
    r'61cff357047cba31e2a92af4117f977fc27d224b';
