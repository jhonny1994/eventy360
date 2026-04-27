import 'package:eventy360/app/application/initial_setup_controller.dart';
import 'package:eventy360/app/localization/locale_controller.dart';
import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class InitialSetupScreen extends ConsumerWidget {
  const InitialSetupScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final locale = ref.watch(localeControllerProvider);
    final themeMode = ref.watch(themeModeControllerProvider);
    final eventsState = ref.watch(eventsControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.initialSetupTitle),
        automaticallyImplyLeading: false,
      ),
      body: AppPageContainer(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            AppPageHero(
              badge: localizations.accountTitle,
              icon: Icons.tune_rounded,
              title: localizations.initialSetupHeroTitle,
              subtitle: localizations.initialSetupHeroBody,
            ),
            AppSectionCard(
              title: localizations.languagePreferenceTitle,
              subtitle: localizations.initialSetupLanguageBody,
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  ChoiceChip(
                    label: Text(localizations.languageEnglish),
                    selected: locale?.languageCode != 'ar',
                    onSelected: (_) => ref
                        .read(localeControllerProvider.notifier)
                        .setLocale(const Locale('en')),
                  ),
                  ChoiceChip(
                    label: Text(localizations.languageArabic),
                    selected: locale?.languageCode == 'ar',
                    onSelected: (_) => ref
                        .read(localeControllerProvider.notifier)
                        .setLocale(const Locale('ar')),
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.themePreferenceTitle,
              subtitle: localizations.initialSetupThemeBody,
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _ThemeChip(
                    label: localizations.themeSystem,
                    selected: themeMode == ThemeMode.system,
                    onSelected: () => ref
                        .read(themeModeControllerProvider.notifier)
                        .setThemeMode(ThemeMode.system),
                  ),
                  _ThemeChip(
                    label: localizations.themeLight,
                    selected: themeMode == ThemeMode.light,
                    onSelected: () => ref
                        .read(themeModeControllerProvider.notifier)
                        .setThemeMode(ThemeMode.light),
                  ),
                  _ThemeChip(
                    label: localizations.themeDark,
                    selected: themeMode == ThemeMode.dark,
                    onSelected: () => ref
                        .read(themeModeControllerProvider.notifier)
                        .setThemeMode(ThemeMode.dark),
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.topicSubscriptionsTitle,
              subtitle: localizations.initialSetupTopicsBody,
              child: eventsState.when(
                loading: () => const LinearProgressIndicator(),
                error: (error, _) => Text(error.toString()),
                data: (data) {
                  if (data.topics.isEmpty) {
                    return Text(localizations.topicSubscriptionsEmptyState);
                  }
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: data.topics.map((topic) {
                          final selected = data.subscribedTopicIds.contains(
                            topic.id,
                          );
                          return FilterChip(
                            selected: selected,
                            label: Text(topic.name),
                            onSelected: (_) => ref
                                .read(eventsControllerProvider.notifier)
                                .toggleTopicSubscription(topic.id),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        localizations.initialSetupTopicsFootnote,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  );
                },
              ),
            ),
            AppSectionCard(
              title: localizations.initialSetupFinishTitle,
              subtitle: localizations.initialSetupFinishBody,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FilledButton.icon(
                    onPressed: () async {
                      await ref
                          .read(initialSetupControllerProvider.notifier)
                          .markCompleted();
                      if (context.mounted) {
                        context.go(RoutePaths.home);
                      }
                    },
                    icon: const Icon(Icons.check_circle_outline_rounded),
                    label: Text(localizations.initialSetupContinueAction),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: () => context.go(RoutePaths.account),
                    icon: const Icon(Icons.manage_accounts_outlined),
                    label: Text(localizations.accountTitle),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ThemeChip extends StatelessWidget {
  const _ThemeChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final bool selected;
  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
    );
  }
}
