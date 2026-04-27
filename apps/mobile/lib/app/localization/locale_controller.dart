import 'dart:ui';

import 'package:eventy360/app/providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

const _localeCodeKey = 'app.locale_code';
const _supportedLanguageCodes = {'en', 'ar'};

final localeControllerProvider = NotifierProvider<LocaleController, Locale?>(
  LocaleController.new,
);

class LocaleController extends Notifier<Locale?> {
  @override
  Locale? build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    final code = prefs.getString(_localeCodeKey);
    if (code != null && _supportedLanguageCodes.contains(code)) {
      return Locale(code);
    }
    final systemCode = PlatformDispatcher.instance.locale.languageCode;
    if (_supportedLanguageCodes.contains(systemCode)) {
      return Locale(systemCode);
    }
    return const Locale('en');
  }

  Future<void> setLocale(Locale? locale) async {
    state = locale;
    final prefs = ref.read(sharedPreferencesProvider);
    if (locale == null) {
      await prefs.remove(_localeCodeKey);
      return;
    }
    await prefs.setString(_localeCodeKey, locale.languageCode);
  }
}
