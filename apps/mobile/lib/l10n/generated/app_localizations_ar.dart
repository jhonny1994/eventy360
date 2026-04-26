// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'إيفنتي 360';

  @override
  String get homeTitle => 'الصفحة الرئيسية للباحث';

  @override
  String get homeSubtitle => 'الأساس الأولي للتطبيق جاهز.';

  @override
  String get retry => 'إعادة المحاولة';

  @override
  String get somethingWentWrong => 'حدث خطأ ما.';

  @override
  String get loading => 'جار التحميل...';
}
