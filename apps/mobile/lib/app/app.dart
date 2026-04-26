import 'package:eventy360/app/localization/locale_controller.dart';
import 'package:eventy360/app/router/app_router.dart';
import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/app/theme/app_theme.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
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
    ref.listen(notificationControllerProvider, (previous, next) {
      final pendingEventId = next.asData?.value.pendingEventId;
      if (pendingEventId == null || pendingEventId.isEmpty) {
        return;
      }
      WidgetsBinding.instance.addPostFrameCallback((_) {
        appRouter.go('${RoutePaths.events}/$pendingEventId');
        ref.read(notificationControllerProvider.notifier).clearPendingEvent();
      });
    });

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Eventy360',
      routerConfig: appRouter,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
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
  }
}
