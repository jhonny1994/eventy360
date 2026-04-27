import 'package:eventy360/app/providers.dart';
import 'package:eventy360/app/theme/theme_mode_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('defaults to system theme and persists changes', () async {
    SharedPreferences.setMockInitialValues(const {});
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
    );
    addTearDown(container.dispose);

    expect(container.read(themeModeControllerProvider), ThemeMode.system);

    await container
        .read(themeModeControllerProvider.notifier)
        .setThemeMode(ThemeMode.dark);

    expect(container.read(themeModeControllerProvider), ThemeMode.dark);
    expect(prefs.getString('app.theme_mode'), ThemeMode.dark.name);
  });
}
