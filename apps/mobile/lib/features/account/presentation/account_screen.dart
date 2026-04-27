import 'package:eventy360/app/application/app_settings_provider.dart';
import 'package:eventy360/app/localization/locale_controller.dart';
import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/account/application/subscription_overview_provider.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/home/application/home_subscription_provider.dart';
import 'package:eventy360/features/notifications/application/notification_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart' as permissions;

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final session = ref.watch(sessionControllerProvider).asData?.value;
    final subscriptionState = ref.watch(homeSubscriptionStatusProvider);
    final themeMode = ref.watch(themeModeControllerProvider);
    final locale = ref.watch(localeControllerProvider);
    final notificationState = ref.watch(notificationControllerProvider);
    final subscriptionOverview = ref.watch(subscriptionOverviewProvider);
    final appSettings = ref.watch(appPaymentSettingsProvider);

    final isVerified = session?.isVerified == true;
    final email = session?.user?.email ?? '-';
    final hasPremiumSubscription =
        subscriptionState.asData?.value.isActive == true ||
        subscriptionState.asData?.value.isTrial == true;
    final notificationPermissionGranted =
        notificationState.asData?.value.permissionGranted == true;

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.accountTitle),
      ),
      body: AppPageContainer(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            AppPageHero(
              badge: localizations.accountTitle,
              icon: Icons.manage_accounts_outlined,
              title: localizations.accountHeroTitle,
              subtitle: localizations.accountHeroBody,
            ),
            AppSectionCard(
              title: localizations.accountOverviewTitle,
              subtitle: email,
              leading: const Icon(Icons.account_circle_outlined),
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  AppStatusBadge(
                    label: isVerified
                        ? localizations.verifiedStatus
                        : localizations.notVerifiedStatus,
                    tone: isVerified
                        ? AppStatusTone.success
                        : AppStatusTone.neutral,
                  ),
                  AppStatusBadge(
                    label: hasPremiumSubscription
                        ? localizations.subscriptionActive
                        : localizations.subscriptionInactive,
                    tone: hasPremiumSubscription
                        ? AppStatusTone.info
                        : AppStatusTone.neutral,
                  ),
                  AppStatusBadge(
                    label: notificationPermissionGranted
                        ? localizations.notificationsEnabledStatus
                        : localizations.notificationsNotEnabledStatus,
                    tone: notificationPermissionGranted
                        ? AppStatusTone.success
                        : AppStatusTone.neutral,
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.subscriptionStatusTitle,
              subtitle: localizations.subscriptionOverviewBody,
              child: subscriptionOverview.when(
                data: (overview) {
                  final bankName = appSettings.asData?.value?.bankName;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _subscriptionHeadline(localizations, overview),
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if ((overview.daysRemaining ?? 0) > 0) ...[
                        const SizedBox(height: 6),
                        Text(
                          localizations.subscriptionDaysRemaining(
                            overview.daysRemaining!,
                          ),
                        ),
                      ],
                      if (overview.pricing != null) ...[
                        const SizedBox(height: 6),
                        Text(
                          localizations.subscriptionRecommendedPrice(
                            overview.pricing!.finalPrice.toStringAsFixed(0),
                            overview.pricing!.currency,
                            overview.pricing!.billingPeriod,
                          ),
                        ),
                      ],
                      if ((bankName ?? '').isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          localizations.subscriptionBankReference(bankName!),
                        ),
                      ],
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: FilledButton.tonalIcon(
                              onPressed: () => context.push(RoutePaths.trust),
                              icon: const Icon(Icons.receipt_long_outlined),
                              label: Text(localizations.subscriptionHistoryAction),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: FilledButton.icon(
                              onPressed: () =>
                                  context.push(RoutePaths.reportPayment),
                              icon: const Icon(Icons.upload_file_outlined),
                              label: Text(localizations.reportPaymentTitle),
                            ),
                          ),
                        ],
                      ),
                    ],
                  );
                },
                error: (error, _) => Text(error.toString()),
                loading: () => const LinearProgressIndicator(),
              ),
            ),
            AppSectionCard(
              title: localizations.preferencesTitle,
              subtitle: localizations.preferencesBody,
              child: Column(
                children: [
                  _PreferenceTile(
                    icon: Icons.language_outlined,
                    title: localizations.languagePreferenceTitle,
                    subtitle: _languageLabel(localizations, locale),
                    onTap: () async {
                      await _showLanguageSheet(context, ref);
                    },
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.palette_outlined,
                    title: localizations.themePreferenceTitle,
                    subtitle: _themeLabel(localizations, themeMode),
                    onTap: () async {
                      await _showThemeSheet(context, ref);
                    },
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.notifications_outlined,
                    title: localizations.notificationPreferencesTitle,
                    subtitle: notificationPermissionGranted
                        ? localizations.notificationsEnabledBody
                        : localizations.notificationsDisabledBody,
                    onTap: () async {
                      await _showNotificationSheet(context, ref);
                    },
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.researcherAccessTitle,
              subtitle: localizations.researcherAccessBody,
              child: Column(
                children: [
                  _PreferenceTile(
                    icon: Icons.person_outline_rounded,
                    title: localizations.editProfileTitle,
                    subtitle: localizations.editProfileBody,
                    onTap: () => context.push(RoutePaths.accountProfile),
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.security_outlined,
                    title: localizations.securityTitle,
                    subtitle: localizations.securityBody,
                    onTap: () => context.push(RoutePaths.accountSecurity),
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.verified_user_outlined,
                    title: localizations.trustCenterTitle,
                    subtitle: localizations.trustOverviewBody,
                    onTap: () => context.push(RoutePaths.trust),
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.bookmarks_outlined,
                    title: localizations.savedEventsTitle,
                    subtitle: localizations.savedEventsBody,
                    onTap: () => context.push(RoutePaths.savedEvents),
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.event_note_outlined,
                    title: localizations.topicSubscriptionsTitle,
                    subtitle: localizations.topicSubscriptionsBody,
                    onTap: () => context.push(RoutePaths.topics),
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.accountActionsTitle,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FilledButton.tonalIcon(
                    onPressed: () async {
                      await ref
                          .read(sessionControllerProvider.notifier)
                          .signOut();
                    },
                    icon: const Icon(Icons.logout_outlined),
                    label: Text(localizations.signOut),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showLanguageSheet(BuildContext context, WidgetRef ref) async {
    final localizations = S.of(context);
    final current = ref.read(localeControllerProvider);
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text(localizations.languageEnglish),
                trailing: current?.languageCode == 'en'
                    ? const Icon(Icons.check_rounded)
                    : null,
                onTap: () async {
                  await ref
                      .read(localeControllerProvider.notifier)
                      .setLocale(const Locale('en'));
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
              ListTile(
                title: Text(localizations.languageArabic),
                trailing: current?.languageCode == 'ar'
                    ? const Icon(Icons.check_rounded)
                    : null,
                onTap: () async {
                  await ref
                      .read(localeControllerProvider.notifier)
                      .setLocale(const Locale('ar'));
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showThemeSheet(BuildContext context, WidgetRef ref) async {
    final localizations = S.of(context);
    final current = ref.read(themeModeControllerProvider);
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text(localizations.themeSystem),
                trailing: current == ThemeMode.system
                    ? const Icon(Icons.check_rounded)
                    : null,
                onTap: () async {
                  await ref
                      .read(themeModeControllerProvider.notifier)
                      .setThemeMode(ThemeMode.system);
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
              ListTile(
                title: Text(localizations.themeLight),
                trailing: current == ThemeMode.light
                    ? const Icon(Icons.check_rounded)
                    : null,
                onTap: () async {
                  await ref
                      .read(themeModeControllerProvider.notifier)
                      .setThemeMode(ThemeMode.light);
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
              ListTile(
                title: Text(localizations.themeDark),
                trailing: current == ThemeMode.dark
                    ? const Icon(Icons.check_rounded)
                    : null,
                onTap: () async {
                  await ref
                      .read(themeModeControllerProvider.notifier)
                      .setThemeMode(ThemeMode.dark);
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showNotificationSheet(
    BuildContext context,
    WidgetRef ref,
  ) async {
    final localizations = S.of(context);
    final controller = ref.read(notificationControllerProvider.notifier);
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  localizations.notificationPreferencesTitle,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  localizations.notificationPreferencesBody,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () async {
                    await controller.requestPermissionForTopicIntent();
                    if (context.mounted) {
                      Navigator.of(context).pop();
                    }
                  },
                  icon: const Icon(Icons.notifications_active_outlined),
                  label: Text(localizations.enableNotificationsAction),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () async {
                    await permissions.openAppSettings();
                    if (context.mounted) {
                      Navigator.of(context).pop();
                    }
                  },
                  icon: const Icon(Icons.open_in_new_outlined),
                  label: Text(localizations.openSystemSettingsAction),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _languageLabel(S localizations, Locale? locale) {
    return switch (locale?.languageCode) {
      'ar' => localizations.languageArabic,
      _ => localizations.languageEnglish,
    };
  }

  String _themeLabel(S localizations, ThemeMode mode) {
    return switch (mode) {
      ThemeMode.system => localizations.themeSystem,
      ThemeMode.light => localizations.themeLight,
      ThemeMode.dark => localizations.themeDark,
    };
  }

  String _subscriptionHeadline(S localizations, SubscriptionOverview overview) {
    if (!overview.hasSubscription) {
      return localizations.subscriptionInactive;
    }
    return switch (overview.status) {
      'trial' => localizations.subscriptionTrialHeadline,
      'active' => localizations.subscriptionActiveHeadline,
      'expired' => localizations.subscriptionExpiredHeadline,
      'cancelled' => localizations.subscriptionCancelledHeadline,
      _ => localizations.subscriptionInactive,
    };
  }
}

class _PreferenceTile extends StatelessWidget {
  const _PreferenceTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
    );
  }
}
