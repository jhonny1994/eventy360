import 'package:dynamic_color/dynamic_color.dart';
import 'package:eventy360/app/localization/locale_controller.dart';
import 'package:eventy360/app/router/app_router.dart';
import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/app/theme/app_theme.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/auth_deep_link_intent.dart';
import 'package:eventy360/features/notifications/application/notification_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Eventy360App extends ConsumerWidget {
  const Eventy360App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appRouter = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeControllerProvider);
    final locale = ref.watch(localeControllerProvider);
    ref
      ..listen(authDeepLinkIntentsProvider, (previous, next) {
        next.whenData((intent) {
          if (intent.action == AuthDeepLinkAction.passwordRecovery) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              appRouter.go('${RoutePaths.resetPassword}?mode=recovery');
            });
          }
        });
      })
      ..listen(notificationControllerProvider, (previous, next) {
        final pendingEventId = next.asData?.value.pendingEventId;
        if (pendingEventId != null && pendingEventId.isNotEmpty) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            appRouter.go(RoutePaths.eventDetail(pendingEventId));
            ref
                .read(notificationControllerProvider.notifier)
                .clearPendingEvent();
          });
        }
        final previousValue = previous?.asData?.value;
        final nextValue = next.asData?.value;
        if (nextValue == null ||
            nextValue.foregroundMessageSerial ==
                previousValue?.foregroundMessageSerial) {
          return;
        }
        final message = nextValue.foregroundBody ?? nextValue.foregroundTitle;
        if (message == null || message.isEmpty) {
          return;
        }
        WidgetsBinding.instance.addPostFrameCallback((_) {
          AppFeedback.showInfo(
            message,
            actionLabel: S.current.repositoryDetailAction,
            onAction: nextValue.foregroundEventId == null
                ? null
                : () => appRouter.go(
                    RoutePaths.eventDetail(nextValue.foregroundEventId!),
                  ),
          );
          ref.read(notificationControllerProvider.notifier).clearForeground();
        });
      });

    return DynamicColorBuilder(
      builder: (lightDynamic, darkDynamic) {
        return MaterialApp.router(
          debugShowCheckedModeBanner: false,
          title: 'Eventy360',
          scaffoldMessengerKey: appScaffoldMessengerKey,
          routerConfig: appRouter,
          theme: AppTheme.light(lightDynamic?.harmonized()),
          darkTheme: AppTheme.dark(darkDynamic?.harmonized()),
          themeMode: themeMode,
          locale: locale,
          supportedLocales: S.delegate.supportedLocales,
          localizationsDelegates: const [
            S.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
        );
      },
    );
  }
}
