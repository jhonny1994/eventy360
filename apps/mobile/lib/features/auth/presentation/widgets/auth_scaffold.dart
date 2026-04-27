import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:flutter/material.dart';

class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    required this.title,
    required this.subtitle,
    required this.child,
    super.key,
    this.badge,
    this.icon = Icons.lock_open_rounded,
    this.topAction,
    this.bottom,
  });

  final String title;
  final String subtitle;
  final String? badge;
  final IconData icon;
  final Widget child;
  final Widget? topAction;
  final Widget? bottom;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              colorScheme.surface,
              colorScheme.surfaceContainerLowest,
              colorScheme.primaryContainer.withValues(alpha: 0.55),
            ],
          ),
        ),
        child: Stack(
          children: [
            const _AuthBackdrop(),
            SafeArea(
              child: AdaptivePageBody(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (badge != null) ...[
                                    _AuthBadge(
                                      icon: icon,
                                      label: badge!,
                                    ),
                                    const SizedBox(height: 18),
                                  ],
                                  Text(
                                    title,
                                    style: theme.textTheme.headlineMedium
                                        ?.copyWith(
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -0.5,
                                        ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    subtitle,
                                    style: theme.textTheme.bodyLarge?.copyWith(
                                      color: colorScheme.onSurfaceVariant,
                                      height: 1.45,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (topAction != null) ...[
                              const SizedBox(width: 12),
                              topAction!,
                            ],
                          ],
                        ),
                        const SizedBox(height: 24),
                        DecoratedBox(
                          decoration: BoxDecoration(
                            color: colorScheme.surface.withValues(alpha: 0.84),
                            borderRadius: BorderRadius.circular(28),
                            border: Border.all(
                              color: colorScheme.outlineVariant.withValues(
                                alpha: 0.7,
                              ),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: colorScheme.shadow.withValues(
                                  alpha: 0.08,
                                ),
                                blurRadius: 28,
                                offset: const Offset(0, 18),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(22),
                            child: child,
                          ),
                        ),
                        if (bottom != null) ...[
                          const SizedBox(height: 16),
                          bottom!,
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthBadge extends StatelessWidget {
  const _AuthBadge({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colorScheme.surface.withValues(alpha: 0.78),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: colorScheme.outlineVariant.withValues(alpha: 0.8),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: colorScheme.primary,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: colorScheme.onSurface,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthBackdrop extends StatelessWidget {
  const _AuthBackdrop();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            top: -90,
            left: -40,
            child: _GlowOrb(
              size: 220,
              color: colorScheme.primary.withValues(alpha: 0.14),
            ),
          ),
          Positioned(
            right: -70,
            top: 120,
            child: _GlowOrb(
              size: 180,
              color: colorScheme.secondary.withValues(alpha: 0.12),
            ),
          ),
          Positioned(
            bottom: -90,
            left: 80,
            child: _GlowOrb(
              size: 240,
              color: colorScheme.tertiary.withValues(alpha: 0.11),
            ),
          ),
        ],
      ),
    );
  }
}

class _GlowOrb extends StatelessWidget {
  const _GlowOrb({
    required this.size,
    required this.color,
  });

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color,
            color.withValues(alpha: 0),
          ],
        ),
      ),
    );
  }
}
