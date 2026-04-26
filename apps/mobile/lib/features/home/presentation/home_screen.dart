import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final session = ref.watch(sessionControllerProvider).asData?.value;
    final userEmail = session?.user?.email ?? '-';

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.homeTitle),
        actions: [
          IconButton(
            onPressed: () async {
              final current = ref.read(themeModeControllerProvider);
              final next = switch (current) {
                ThemeMode.system => ThemeMode.light,
                ThemeMode.light => ThemeMode.dark,
                ThemeMode.dark => ThemeMode.system,
              };
              await ref.read(themeModeControllerProvider.notifier).setThemeMode(next);
            },
            icon: const Icon(Icons.brightness_6_outlined),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              title: Text(localizations.signedInAs),
              subtitle: Text(userEmail),
              trailing: OutlinedButton(
                onPressed: () => ref.read(sessionControllerProvider.notifier).signOut(),
                child: Text(localizations.signOut),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.verified_user_outlined),
              title: Text(localizations.profileStatus),
              subtitle: Text(
                session?.profileCompleted == true
                    ? localizations.profileCompleted
                    : localizations.profileIncomplete,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.notifications_active_outlined),
              title: Text(localizations.notificationEducationTitle),
              subtitle: Text(localizations.notificationEducationBody),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.dashboard_outlined),
              title: Text(localizations.homeSubtitle),
            ),
          ),
        ],
      ),
    );
  }
}
