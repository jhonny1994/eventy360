import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'app_settings_provider.g.dart';

enum AppBillingPeriod { monthly, quarterly, biannual, annual }

class AppCalculatedPrice {
  const AppCalculatedPrice({
    required this.billingPeriod,
    required this.months,
    required this.basePrice,
    required this.discountPercentage,
    required this.finalPrice,
    this.currency = 'DZD',
  });

  final AppBillingPeriod billingPeriod;
  final int months;
  final double basePrice;
  final double discountPercentage;
  final double finalPrice;
  final String currency;
}

class AppPaymentSettings {
  const AppPaymentSettings({
    this.bankName,
    this.accountHolder,
    this.accountNumberRib,
    this.paymentEmail,
    this.basePriceResearcherMonthly,
    this.discountQuarterly,
    this.discountBiannual,
    this.discountAnnual,
  });

  final String? bankName;
  final String? accountHolder;
  final String? accountNumberRib;
  final String? paymentEmail;
  final double? basePriceResearcherMonthly;
  final double? discountQuarterly;
  final double? discountBiannual;
  final double? discountAnnual;

  AppCalculatedPrice? priceForResearcher(AppBillingPeriod period) {
    final base = basePriceResearcherMonthly;
    if (base == null || base <= 0) {
      return null;
    }
    final months = switch (period) {
      AppBillingPeriod.monthly => 1,
      AppBillingPeriod.quarterly => 3,
      AppBillingPeriod.biannual => 6,
      AppBillingPeriod.annual => 12,
    };
    final discount = switch (period) {
      AppBillingPeriod.monthly => 0.0,
      AppBillingPeriod.quarterly => discountQuarterly ?? 0,
      AppBillingPeriod.biannual => discountBiannual ?? 0,
      AppBillingPeriod.annual => discountAnnual ?? 0,
    };
    final priceBeforeDiscount = base * months;
    final finalPrice = priceBeforeDiscount * (1 - discount);
    return AppCalculatedPrice(
      billingPeriod: period,
      months: months,
      basePrice: priceBeforeDiscount,
      discountPercentage: discount,
      finalPrice: finalPrice,
    );
  }
}

@riverpod
Future<AppPaymentSettings?> appPaymentSettings(Ref ref) async {
  final client = Supabase.instance.client;
  final row = await client
      .from('app_settings')
      .select(
        'bank_name,account_holder,account_number_rib,payment_email,'
        'base_price_researcher_monthly,discount_quarterly,discount_biannual,discount_annual',
      )
      .limit(1)
      .maybeSingle();
  if (row == null) {
    return null;
  }

  String? normalize(String? value) {
    if (value == null) {
      return null;
    }
    final trimmed = value.trim();
    if (trimmed.isEmpty || trimmed.contains('XXXX')) {
      return null;
    }
    return trimmed;
  }

  return AppPaymentSettings(
    bankName: normalize(row['bank_name']?.toString()),
    accountHolder: normalize(row['account_holder']?.toString()),
    accountNumberRib: normalize(row['account_number_rib']?.toString()),
    paymentEmail: normalize(row['payment_email']?.toString()),
    basePriceResearcherMonthly: (row['base_price_researcher_monthly'] as num?)
        ?.toDouble(),
    discountQuarterly: (row['discount_quarterly'] as num?)?.toDouble(),
    discountBiannual: (row['discount_biannual'] as num?)?.toDouble(),
    discountAnnual: (row['discount_annual'] as num?)?.toDouble(),
  );
}
