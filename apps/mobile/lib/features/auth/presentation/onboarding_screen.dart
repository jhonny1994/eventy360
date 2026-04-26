import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    return Scaffold(
      body: SafeArea(
        child: AdaptivePageBody(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localizations.onboardingTitle,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 16),
                Text(localizations.onboardingBody),
                const SizedBox(height: 24),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(localizations.notificationEducationBody),
                  ),
                ),
                const Spacer(),
                Semantics(
                  button: true,
                  label: localizations.getStarted,
                  child: FilledButton(
                    onPressed: () async {
                      await ref
                          .read(sessionControllerProvider.notifier)
                          .setOnboardingCompleted(value: true);
                      if (context.mounted) {
                        context.go(RoutePaths.signIn);
                      }
                    },
                    child: Text(localizations.getStarted),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
