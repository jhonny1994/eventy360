import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'home_subscription_provider.g.dart';

class HomeSubscriptionStatus {
  const HomeSubscriptionStatus({
    required this.isActive,
    required this.isTrial,
  });

  final bool isActive;
  final bool isTrial;
}

@riverpod
Future<HomeSubscriptionStatus> homeSubscriptionStatus(Ref ref) async {
  final session = await ref.watch(sessionControllerProvider.future);
  if (!session.isAuthenticated) {
    return const HomeSubscriptionStatus(isActive: false, isTrial: false);
  }

  final client = Supabase.instance.client;
  final data = await client.rpc<Map<String, dynamic>>(
    'get_subscription_details',
  );
  final payload = data.cast<String, dynamic>();
  final hasSubscription = payload['has_subscription'] == true;
  final subscription =
      (payload['subscription'] as Map?)?.cast<String, dynamic>() ??
      const <String, dynamic>{};
  final isActive = hasSubscription && subscription['is_active'] == true;
  final isTrial = subscription['status']?.toString() == 'trial';

  return HomeSubscriptionStatus(isActive: isActive, isTrial: isTrial);
}
