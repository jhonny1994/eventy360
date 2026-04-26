import 'dart:async';

import 'package:eventy360/app/app.dart';
import 'package:eventy360/app/providers.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  final sharedPreferences = await SharedPreferences.getInstance();
  await _initializeBackendClients();

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    debugPrint('FlutterError: ${details.exceptionAsString()}');
  };

  ErrorWidget.builder = (details) => MaterialApp(
    home: AppErrorView(
      message: details.exceptionAsString(),
      onRetry: null,
    ),
  );

  PlatformDispatcher.instance.onError = (error, stack) {
    debugPrint('Platform error: $error');
    debugPrintStack(stackTrace: stack);
    return true;
  };

  await runZonedGuarded(
    () async {
      runApp(
        ProviderScope(
          overrides: [
            sharedPreferencesProvider.overrideWithValue(sharedPreferences),
          ],
          child: const Eventy360App(),
        ),
      );
    },
    (error, stackTrace) {
      debugPrint('Zoned error: $error');
      debugPrintStack(stackTrace: stackTrace);
    },
  );
}

Future<void> _initializeBackendClients() async {
  try {
    await Firebase.initializeApp();
  } catch (error) {
    debugPrint('Firebase initialization skipped: $error');
  }

  final supabaseUrl = const String.fromEnvironment('SUPABASE_URL');
  final supabaseAnonKey = const String.fromEnvironment('SUPABASE_ANON_KEY');
  if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
    debugPrint('Supabase initialization skipped: missing dart defines.');
    return;
  }

  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );
}
