import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/presentation/widgets/auth_scaffold.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UnsupportedRoleScreen extends ConsumerWidget {
  const UnsupportedRoleScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    return AuthScaffold(
      badge: localizations.authResearcherBadge,
      icon: Icons.block_outlined,
      title: localizations.unsupportedRoleTitle,
      subtitle: localizations.unsupportedRoleOverviewBody,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            localizations.unsupportedRoleBody,
            style: Theme.of(context).textTheme.bodyLarge,
            textAlign: TextAlign.start,
          ),
          const SizedBox(height: 20),
          OutlinedButton(
            onPressed: () =>
                ref.read(sessionControllerProvider.notifier).signOut(),
            child: Text(localizations.signOut),
          ),
        ],
      ),
    );
  }
}
