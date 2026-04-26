import 'package:eventy360/app/providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

const _themeModeKey = 'app.theme_mode';

final themeModeControllerProvider =
    NotifierProvider<ThemeModeController, ThemeMode>(ThemeModeController.new);

class ThemeModeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    final rawValue = prefs.getString(_themeModeKey);
    return ThemeMode.values.firstWhere(
      (mode) => mode.name == rawValue,
      orElse: () => ThemeMode.system,
    );
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await ref
        .read(sharedPreferencesProvider)
        .setString(_themeModeKey, mode.name);
  }
}
