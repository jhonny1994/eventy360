// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home_subscription_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(homeSubscriptionStatus)
final homeSubscriptionStatusProvider = HomeSubscriptionStatusProvider._();

final class HomeSubscriptionStatusProvider
    extends
        $FunctionalProvider<
          AsyncValue<HomeSubscriptionStatus>,
          HomeSubscriptionStatus,
          FutureOr<HomeSubscriptionStatus>
        >
    with
        $FutureModifier<HomeSubscriptionStatus>,
        $FutureProvider<HomeSubscriptionStatus> {
  HomeSubscriptionStatusProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'homeSubscriptionStatusProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$homeSubscriptionStatusHash();

  @$internal
  @override
  $FutureProviderElement<HomeSubscriptionStatus> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<HomeSubscriptionStatus> create(Ref ref) {
    return homeSubscriptionStatus(ref);
  }
}

String _$homeSubscriptionStatusHash() =>
    r'e00f8b208b67fcb6f35d8e9aab07a24321fe541b';
