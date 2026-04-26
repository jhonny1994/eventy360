// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Eventy360';

  @override
  String get homeTitle => 'Researcher Home';

  @override
  String get homeSubtitle => 'MVP foundation is ready.';

  @override
  String get retry => 'Retry';

  @override
  String get somethingWentWrong => 'Something went wrong.';

  @override
  String get loading => 'Loading...';
}
