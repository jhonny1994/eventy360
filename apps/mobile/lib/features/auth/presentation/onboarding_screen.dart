import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  static const _actionSlotWidth = 80.0;

  late final PageController _pageController;
  var _currentStep = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding(BuildContext context) async {
    await ref
        .read(sessionControllerProvider.notifier)
        .setOnboardingCompleted(value: true);
    if (context.mounted) {
      context.go(RoutePaths.signIn);
    }
  }

  Future<void> _onPrimaryAction(
    BuildContext context,
    int totalSteps,
  ) async {
    final isLastStep = _currentStep == totalSteps - 1;
    if (isLastStep) {
      await _completeOnboarding(context);
      return;
    }
    await _pageController.nextPage(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final theme = Theme.of(context);
    final steps = [
      _OnboardingStep(
        icon: Icons.explore_rounded,
        title: localizations.onboardingStepDiscoverTitle,
        body: localizations.onboardingStepDiscoverBody,
      ),
      _OnboardingStep(
        icon: Icons.task_alt_rounded,
        title: localizations.onboardingStepSubmitTitle,
        body: localizations.onboardingStepSubmitBody,
      ),
      _OnboardingStep(
        icon: Icons.notifications_active_rounded,
        title: localizations.onboardingStepNotifyTitle,
        body: localizations.onboardingStepNotifyBody,
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: AdaptivePageBody(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        localizations.onboardingTitle,
                        style: theme.textTheme.headlineMedium,
                      ),
                    ),
                    SizedBox(
                      width: _actionSlotWidth,
                      child: _currentStep < steps.length - 1
                          ? TextButton(
                              onPressed: () => _completeOnboarding(context),
                              child: Text(localizations.skipAction),
                            )
                          : const SizedBox.shrink(),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  localizations.onboardingBody,
                  style: theme.textTheme.bodyLarge,
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    itemCount: steps.length,
                    onPageChanged: (index) =>
                        setState(() => _currentStep = index),
                    itemBuilder: (context, index) {
                      final step = steps[index];
                      return Card(
                        clipBehavior: Clip.antiAlias,
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                height: 56,
                                width: 56,
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primaryContainer,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Icon(
                                  step.icon,
                                  color: theme.colorScheme.onPrimaryContainer,
                                ),
                              ),
                              const SizedBox(height: 20),
                              Text(
                                step.title,
                                style: theme.textTheme.titleLarge,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                step.body,
                                style: theme.textTheme.bodyLarge,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    steps.length,
                    (index) {
                      final selected = index == _currentStep;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        height: 8,
                        width: selected ? 24 : 8,
                        decoration: BoxDecoration(
                          color: selected
                              ? theme.colorScheme.primary
                              : theme.colorScheme.outlineVariant,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
                Semantics(
                  button: true,
                  label: _currentStep == steps.length - 1
                      ? localizations.getStarted
                      : localizations.continueAction,
                  child: FilledButton(
                    onPressed: () => _onPrimaryAction(context, steps.length),
                    child: Text(
                      _currentStep == steps.length - 1
                          ? localizations.getStarted
                          : localizations.continueAction,
                    ),
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

class _OnboardingStep {
  const _OnboardingStep({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;
}
