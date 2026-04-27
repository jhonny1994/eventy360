import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppShell extends StatelessWidget {
  const AppShell({
    required this.navigationShell,
    super.key,
  });

  final StatefulNavigationShell navigationShell;

  void _onDestinationSelected(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: _onDestinationSelected,
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home_rounded),
            label: localizations.homeTitle,
          ),
          NavigationDestination(
            icon: const Icon(Icons.event_note_outlined),
            selectedIcon: const Icon(Icons.event_note_rounded),
            label: localizations.eventsTitle,
          ),
          NavigationDestination(
            icon: const Icon(Icons.description_outlined),
            selectedIcon: const Icon(Icons.description_rounded),
            label: localizations.submissionsTitle,
          ),
          NavigationDestination(
            icon: const Icon(Icons.menu_book_outlined),
            selectedIcon: const Icon(Icons.menu_book_rounded),
            label: localizations.repositoryTitle,
          ),
          NavigationDestination(
            icon: const Icon(Icons.manage_accounts_outlined),
            selectedIcon: const Icon(Icons.manage_accounts_rounded),
            label: localizations.accountTitle,
          ),
        ],
      ),
    );
  }
}
