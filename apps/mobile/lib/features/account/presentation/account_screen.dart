import 'package:eventy360/app/application/app_settings_provider.dart';
import 'package:eventy360/app/localization/locale_controller.dart';
import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_modal_sheet.dart';
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
    final profileReady = session?.profileCompleted == true;
    final accountHealthScore = [
      profileReady,
      isVerified,
      hasPremiumSubscription,
      notificationPermissionGranted,
    ].where((value) => value).length;

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
              trailing: AppStatusBadge(
                label: '$accountHealthScore/4',
                tone: accountHealthScore >= 3
                    ? AppStatusTone.success
                    : AppStatusTone.info,
              ),
            ),
            AppSectionCard(
              title: localizations.accountOverviewTitle,
              leading: const _SectionBadge(icon: Icons.account_circle_outlined),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    email,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      AppStatusBadge(
                        label: profileReady
                            ? localizations.editProfileTitle
                            : localizations.editProfileTitle,
                        tone: profileReady
                            ? AppStatusTone.success
                            : AppStatusTone.info,
                      ),
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
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: () async {
                          await context.push(RoutePaths.accountProfile);
                          _refreshAccountData(ref);
                        },
                        icon: const Icon(Icons.person_outline_rounded),
                        label: Text(localizations.editProfileTitle),
                      ),
                      FilledButton.tonalIcon(
                        onPressed: () async {
                          await context.push(RoutePaths.trust);
                          _refreshAccountData(ref);
                        },
                        icon: const Icon(Icons.verified_user_outlined),
                        label: Text(localizations.trustCenterTitle),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.subscriptionStatusTitle,
              subtitle: localizations.subscriptionOverviewBody,
              leading: const _SectionBadge(
                icon: Icons.workspace_premium_outlined,
              ),
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
                        const SizedBox(height: 10),
                        AppListRow(
                          leading: const Icon(Icons.account_balance_outlined),
                          title: localizations.reportPaymentTitle,
                          subtitle: localizations.subscriptionBankReference(
                            bankName!,
                          ),
                        ),
                      ],
                      const SizedBox(height: 14),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final compact = constraints.maxWidth < 560;
                          final first = FilledButton.tonalIcon(
                            onPressed: () async {
                              await context.push(RoutePaths.trust);
                              _refreshAccountData(ref);
                            },
                            icon: const Icon(Icons.receipt_long_outlined),
                            label: Text(
                              localizations.subscriptionHistoryAction,
                            ),
                          );
                          final second = FilledButton.icon(
                            onPressed: () async {
                              await context.push(RoutePaths.reportPayment);
                              _refreshAccountData(ref);
                            },
                            icon: const Icon(Icons.upload_file_outlined),
                            label: Text(localizations.reportPaymentTitle),
                          );

                          if (compact) {
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                first,
                                const SizedBox(height: 10),
                                second,
                              ],
                            );
                          }

                          return Row(
                            children: [
                              Expanded(child: first),
                              const SizedBox(width: 10),
                              Expanded(child: second),
                            ],
                          );
                        },
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
              leading: const _SectionBadge(icon: Icons.tune_outlined),
              child: Column(
                children: [
                  _PreferenceTile(
                    icon: Icons.language_outlined,
                    title: localizations.languagePreferenceTitle,
                    subtitle: _languageLabel(localizations, locale),
                    onTap: () async {
                      await _showLanguageSheet(context, ref);
                      _refreshAccountData(ref);
                    },
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.palette_outlined,
                    title: localizations.themePreferenceTitle,
                    subtitle: _themeLabel(localizations, themeMode),
                    onTap: () async {
                      await _showThemeSheet(context, ref);
                      _refreshAccountData(ref);
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
                      _refreshAccountData(ref);
                    },
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.researcherAccessTitle,
              subtitle: localizations.researcherAccessBody,
              leading: const _SectionBadge(icon: Icons.hub_outlined),
              child: Column(
                children: [
                  _PreferenceTile(
                    icon: Icons.person_outline_rounded,
                    title: localizations.editProfileTitle,
                    subtitle: localizations.editProfileBody,
                    onTap: () async {
                      await context.push(RoutePaths.accountProfile);
                      _refreshAccountData(ref);
                    },
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.security_outlined,
                    title: localizations.securityTitle,
                    subtitle: localizations.securityBody,
                    onTap: () async {
                      await context.push(RoutePaths.accountSecurity);
                      _refreshAccountData(ref);
                    },
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.verified_user_outlined,
                    title: localizations.trustCenterTitle,
                    subtitle: localizations.trustOverviewBody,
                    onTap: () async {
                      await context.push(RoutePaths.trust);
                      _refreshAccountData(ref);
                    },
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.bookmarks_outlined,
                    title: localizations.savedEventsTitle,
                    subtitle: localizations.savedEventsBody,
                    onTap: () async {
                      await context.push(RoutePaths.savedEvents);
                      _refreshAccountData(ref);
                    },
                  ),
                  const Divider(height: 1),
                  _PreferenceTile(
                    icon: Icons.event_note_outlined,
                    title: localizations.topicSubscriptionsTitle,
                    subtitle: localizations.topicSubscriptionsBody,
                    onTap: () async {
                      await context.push(RoutePaths.topics);
                      _refreshAccountData(ref);
                    },
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.accountActionsTitle,
              leading: const _SectionBadge(icon: Icons.logout_outlined),
              subtitle: email,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  OutlinedButton.icon(
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
    await showAppModalSheet<void>(
      context: context,
      builder: (context) {
        return AppModalSheet(
          title: localizations.languagePreferenceTitle,
          subtitle: localizations.preferencesBody,
          child: AppModalSheetSection(
            children: [
              AppModalSheetOption(
                label: localizations.languageEnglish,
                selected: current?.languageCode == 'en',
                onTap: () async {
                  await ref
                      .read(localeControllerProvider.notifier)
                      .setLocale(const Locale('en'));
                  AppFeedback.showSuccess(
                    localizations.languageUpdatedSuccess,
                  );
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
              const Divider(height: 1),
              AppModalSheetOption(
                label: localizations.languageArabic,
                selected: current?.languageCode == 'ar',
                onTap: () async {
                  await ref
                      .read(localeControllerProvider.notifier)
                      .setLocale(const Locale('ar'));
                  AppFeedback.showSuccess(
                    localizations.languageUpdatedSuccess,
                  );
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
    await showAppModalSheet<void>(
      context: context,
      builder: (context) {
        return AppModalSheet(
          title: localizations.themePreferenceTitle,
          subtitle: localizations.preferencesBody,
          child: AppModalSheetSection(
            children: [
              AppModalSheetOption(
                label: localizations.themeSystem,
                selected: current == ThemeMode.system,
                onTap: () async {
                  await ref
                      .read(themeModeControllerProvider.notifier)
                      .setThemeMode(ThemeMode.system);
                  AppFeedback.showSuccess(localizations.themeUpdatedSuccess);
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
              const Divider(height: 1),
              AppModalSheetOption(
                label: localizations.themeLight,
                selected: current == ThemeMode.light,
                onTap: () async {
                  await ref
                      .read(themeModeControllerProvider.notifier)
                      .setThemeMode(ThemeMode.light);
                  AppFeedback.showSuccess(localizations.themeUpdatedSuccess);
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
              ),
              const Divider(height: 1),
              AppModalSheetOption(
                label: localizations.themeDark,
                selected: current == ThemeMode.dark,
                onTap: () async {
                  await ref
                      .read(themeModeControllerProvider.notifier)
                      .setThemeMode(ThemeMode.dark);
                  AppFeedback.showSuccess(localizations.themeUpdatedSuccess);
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
    await showAppModalSheet<void>(
      context: context,
      builder: (context) {
        return AppModalSheet(
          title: localizations.notificationPreferencesTitle,
          subtitle: localizations.notificationPreferencesBody,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              FilledButton.icon(
                onPressed: () async {
                  await controller.requestPermissionForTopicIntent();
                  AppFeedback.showInfo(
                    localizations.notificationPreferencesTitle,
                  );
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
                  AppFeedback.showInfo(
                    localizations.openSystemSettingsAction,
                  );
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
                icon: const Icon(Icons.open_in_new_outlined),
                label: Text(localizations.openSystemSettingsAction),
              ),
            ],
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
    if (overview.isTrial) {
      return localizations.subscriptionTrialHeadline;
    }
    if (overview.isActive) {
      return localizations.subscriptionActiveHeadline;
    }
    return switch (overview.status) {
      'expired' => localizations.subscriptionExpiredHeadline,
      'cancelled' => localizations.subscriptionCancelledHeadline,
      _ => localizations.subscriptionInactive,
    };
  }
}

void _refreshAccountData(WidgetRef ref) {
  ref
    ..invalidate(homeSubscriptionStatusProvider)
    ..invalidate(subscriptionOverviewProvider)
    ..invalidate(notificationControllerProvider);
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
    return AppListRow(
      leading: Icon(icon),
      title: title,
      subtitle: subtitle,
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
      stackTrailingOnCompact: false,
    );
  }
}

class _SectionBadge extends StatelessWidget {
  const _SectionBadge({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(icon, color: colorScheme.onPrimaryContainer),
    );
  }
}
