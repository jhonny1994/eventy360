// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'subscription_overview_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(subscriptionOverview)
final subscriptionOverviewProvider = SubscriptionOverviewProvider._();

final class SubscriptionOverviewProvider
    extends
        $FunctionalProvider<
          AsyncValue<SubscriptionOverview>,
          SubscriptionOverview,
          FutureOr<SubscriptionOverview>
        >
    with
        $FutureModifier<SubscriptionOverview>,
        $FutureProvider<SubscriptionOverview> {
  SubscriptionOverviewProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'subscriptionOverviewProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$subscriptionOverviewHash();

  @$internal
  @override
  $FutureProviderElement<SubscriptionOverview> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<SubscriptionOverview> create(Ref ref) {
    return subscriptionOverview(ref);
  }
}

String _$subscriptionOverviewHash() =>
    r'4763af0e482cdc22b6f27ad08deecfa6b9ba1bba';
