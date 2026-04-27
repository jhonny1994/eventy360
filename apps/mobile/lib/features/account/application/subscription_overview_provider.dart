import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'subscription_overview_provider.g.dart';

class SubscriptionPricing {
  const SubscriptionPricing({
    required this.billingPeriod,
    required this.finalPrice,
    required this.currency,
    required this.userType,
  });

  final String billingPeriod;
  final double finalPrice;
  final String currency;
  final String userType;
}

class SubscriptionOverview {
  const SubscriptionOverview({
    required this.hasSubscription,
    required this.userType,
    required this.isVerified,
    this.tier,
    this.status,
    this.daysRemaining,
    this.isActive = false,
    this.trialEndsAt,
    this.endDate,
    this.pricing,
  });

  final bool hasSubscription;
  final String userType;
  final bool isVerified;
  final String? tier;
  final String? status;
  final int? daysRemaining;
  final bool isActive;
  final DateTime? trialEndsAt;
  final DateTime? endDate;
  final SubscriptionPricing? pricing;

  bool get isTrial => status == 'trial';

  bool get hasPremiumAccess => isActive || isTrial;
}

@riverpod
Future<SubscriptionOverview> subscriptionOverview(Ref ref) async {
  final session = await ref.watch(sessionControllerProvider.future);
  if (!session.isAuthenticated) {
    return const SubscriptionOverview(
      hasSubscription: false,
      userType: 'researcher',
      isVerified: false,
    );
  }

  final client = Supabase.instance.client;
  final payload = await client.rpc<Map<String, dynamic>>(
    'get_subscription_details',
  );
  final data = payload.cast<String, dynamic>();
  final profile =
      (data['profile'] as Map?)?.cast<String, dynamic>() ??
      const <String, dynamic>{};
  final subscription = (data['subscription'] as Map?)?.cast<String, dynamic>();
  final pricing = (data['pricing'] as Map?)?.cast<String, dynamic>();

  return SubscriptionOverview(
    hasSubscription: data['has_subscription'] == true,
    userType: data['user_type']?.toString() ?? 'researcher',
    isVerified: profile['is_verified'] == true,
    tier: subscription?['tier']?.toString(),
    status: subscription?['status']?.toString(),
    daysRemaining: (subscription?['days_remaining'] as num?)?.toInt(),
    isActive: subscription?['is_active'] == true,
    trialEndsAt: DateTime.tryParse(
      subscription?['trial_ends_at']?.toString() ?? '',
    ),
    endDate: DateTime.tryParse(subscription?['end_date']?.toString() ?? ''),
    pricing: pricing == null
        ? null
        : SubscriptionPricing(
            billingPeriod: pricing['billing_period']?.toString() ?? 'monthly',
            finalPrice: (pricing['final_price'] as num?)?.toDouble() ?? 0,
            currency: pricing['currency']?.toString() ?? 'DZD',
            userType: pricing['user_type']?.toString() ?? 'researcher',
          ),
  );
}
