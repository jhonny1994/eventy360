// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a ar locale. All the
// messages from the main program should be duplicated here with the same
// function name.

// Ignore issues from commonly used lints in this file.
// ignore_for_file:unnecessary_brace_in_string_interps, unnecessary_new
// ignore_for_file:prefer_single_quotes,comment_references, directives_ordering
// ignore_for_file:annotate_overrides,prefer_generic_function_type_aliases
// ignore_for_file:unused_import, file_names, avoid_escaping_inner_quotes
// ignore_for_file:unnecessary_string_interpolations, unnecessary_string_escapes

import 'package:intl/intl.dart';
import 'package:intl/message_lookup_by_library.dart';

final messages = new MessageLookup();

typedef String MessageIfAbsent(String messageStr, List<dynamic> args);

class MessageLookup extends MessageLookupByLibrary {
  String get localeName => 'ar';

  static String m0(count) => "${count} ترشيحات نشطة";

  static String m1(count) => "جميع المواضيع متاحة (${count})";

  static String m2(date) =>
      "يشير تقديم الملخصات لهذه الفعالية حالياً إلى ${date} كأقرب موعد نهائي ظاهر.";

  static String m3(email) =>
      "أرسل رابط إعادة تعيين آمن إلى ${email} إذا أردت تغيير كلمة المرور عبر البريد الإلكتروني.";

  static String m4(count) =>
      "${Intl.plural(count, zero: 'لا توجد تصفيات مواضيع', one: 'تصفية موضوع واحدة مفعلة', other: '${count} تصفيات مواضيع مفعلة')}";

  static String m5(bankName) =>
      "استخدم مرجع البنك ${bankName} عند إرسال إثبات دفع جديد للتفعيل أو التجديد.";

  static String m6(count) => "المتبقي ${count} يوم";

  static String m7(amount, currency, billingPeriod) =>
      "المبلغ المقترح: ${amount} ${currency} لفترة ${billingPeriod}.";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "abstractArLabel": MessageLookupByLibrary.simpleMessage("الملخص (العربية)"),
    "abstractDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "موعد الملخص",
    ),
    "abstractEnLabel": MessageLookupByLibrary.simpleMessage(
      "الملخص (الإنجليزية - اختياري)",
    ),
    "abstractWriteGuidance": MessageLookupByLibrary.simpleMessage(
      "ابدأ من الفعالية الصحيحة، واحرص على وضوح العناوين، ولا ترسل إلا عندما تكون هذه هي المشاركة التي تريد تتبعها لهذه الدعوة.",
    ),
    "academicPositionLabel": MessageLookupByLibrary.simpleMessage(
      "الصفة الأكاديمية",
    ),
    "accountActionsTitle": MessageLookupByLibrary.simpleMessage(
      "إجراءات الحساب",
    ),
    "accountCreated": MessageLookupByLibrary.simpleMessage(
      "تم إنشاء الحساب بنجاح.",
    ),
    "accountHeroBody": MessageLookupByLibrary.simpleMessage(
      "أدر الثقة والتفضيلات واللغة والمظهر والتنبيهات من مكان واحد واضح.",
    ),
    "accountHeroTitle": MessageLookupByLibrary.simpleMessage(
      "تحكم في تجربتك البحثية",
    ),
    "accountOverviewTitle": MessageLookupByLibrary.simpleMessage("حالة الحساب"),
    "accountTitle": MessageLookupByLibrary.simpleMessage("الحساب"),
    "activeSubmissionsCount": m0,
    "activeSubmissionsTitle": MessageLookupByLibrary.simpleMessage(
      "الترشيحات النشطة",
    ),
    "addBookmark": MessageLookupByLibrary.simpleMessage("إضافة إشارة مرجعية"),
    "allTopicsSummary": m1,
    "appTitle": MessageLookupByLibrary.simpleMessage("إيفنتي 360"),
    "authResearcherBadge": MessageLookupByLibrary.simpleMessage(
      "وصول الباحث عبر الهاتف",
    ),
    "backToSignIn": MessageLookupByLibrary.simpleMessage(
      "العودة إلى تسجيل الدخول",
    ),
    "billingPeriodAnnual": MessageLookupByLibrary.simpleMessage("سنوي"),
    "billingPeriodBiannual": MessageLookupByLibrary.simpleMessage("نصف سنوي"),
    "billingPeriodLabel": MessageLookupByLibrary.simpleMessage("فترة الفوترة"),
    "billingPeriodMonthly": MessageLookupByLibrary.simpleMessage("شهري"),
    "billingPeriodQuarterly": MessageLookupByLibrary.simpleMessage("ربع سنوي"),
    "bookmarkAddedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم حفظ الفعالية.",
    ),
    "bookmarkRemovedSuccess": MessageLookupByLibrary.simpleMessage(
      "تمت إزالة الفعالية من المحفوظات.",
    ),
    "cancelAction": MessageLookupByLibrary.simpleMessage("إلغاء"),
    "completeProfileBody": MessageLookupByLibrary.simpleMessage(
      "قبل استخدام ميزات الباحث، أكمل بيانات ملفك الشخصي.",
    ),
    "completeProfileHeroBody": MessageLookupByLibrary.simpleMessage(
      "أضف بياناتك المهنية وموقعك مرة واحدة حتى تبقى التجربة المحمولة مخصصة ودقيقة في بقية المسارات.",
    ),
    "completeProfileTitle": MessageLookupByLibrary.simpleMessage(
      "أكمل ملفك الشخصي",
    ),
    "confirmPassword": MessageLookupByLibrary.simpleMessage(
      "تأكيد كلمة المرور",
    ),
    "continueAction": MessageLookupByLibrary.simpleMessage("متابعة"),
    "copyLocationAction": MessageLookupByLibrary.simpleMessage("نسخ الموقع"),
    "createAccount": MessageLookupByLibrary.simpleMessage("إنشاء حساب"),
    "dairaLabel": MessageLookupByLibrary.simpleMessage("الدائرة"),
    "deadline": MessageLookupByLibrary.simpleMessage("آخر موعد"),
    "doneAction": MessageLookupByLibrary.simpleMessage("تم"),
    "draftRestoredMessage": MessageLookupByLibrary.simpleMessage(
      "استعدنا مسودتك قيد العمل حتى تتمكن من المتابعة دون إعادة بناء النموذج.",
    ),
    "editProfileBody": MessageLookupByLibrary.simpleMessage(
      "حافظ على دقة الاسم والمؤسسة والدور الأكاديمي والموقع حتى تبقى مسارات الفعاليات والثقة متناسقة.",
    ),
    "editProfileTitle": MessageLookupByLibrary.simpleMessage(
      "تعديل الملف الشخصي",
    ),
    "email": MessageLookupByLibrary.simpleMessage("البريد الإلكتروني"),
    "enableNotificationsAction": MessageLookupByLibrary.simpleMessage(
      "تفعيل الإشعارات",
    ),
    "eventActionsSectionBody": MessageLookupByLibrary.simpleMessage(
      "احفظ هذه الفعالية أو واصل إلى مسار التقديم المرتبط بها.",
    ),
    "eventActionsSectionTitle": MessageLookupByLibrary.simpleMessage(
      "الإجراءات",
    ),
    "eventAssetsSectionBody": MessageLookupByLibrary.simpleMessage(
      "افتح المواد البصرية والمساندة الخاصة بالفعالية كما هي معروضة في الويب.",
    ),
    "eventAssetsSectionTitle": MessageLookupByLibrary.simpleMessage(
      "مواد الفعالية",
    ),
    "eventAxesSectionTitle": MessageLookupByLibrary.simpleMessage(
      "محاور الفعالية",
    ),
    "eventBrochureAction": MessageLookupByLibrary.simpleMessage("فتح المطوية"),
    "eventContactSectionBody": MessageLookupByLibrary.simpleMessage(
      "استخدم قنوات التواصل المباشرة والموقع المرتبطين بهذه الفعالية.",
    ),
    "eventContactSectionTitle": MessageLookupByLibrary.simpleMessage(
      "التواصل والروابط",
    ),
    "eventCreatedLabel": MessageLookupByLibrary.simpleMessage("تاريخ الإنشاء"),
    "eventDecisionSupportBody": MessageLookupByLibrary.simpleMessage(
      "تحقق أولاً من الموعد النهائي ومدى الملاءمة وسياق الجهة المنظمة حتى لا تبدأ المسار الخاطئ.",
    ),
    "eventDecisionSupportTitle": MessageLookupByLibrary.simpleMessage(
      "قبل أن تتقدم",
    ),
    "eventDetailsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "راجع توقيت الفعالية وموقعها ومواضيعها وخطواتها التالية قبل الحفظ أو التقديم.",
    ),
    "eventDetailsTitle": MessageLookupByLibrary.simpleMessage(
      "تفاصيل الفعالية",
    ),
    "eventEligibilityBody": MessageLookupByLibrary.simpleMessage(
      "استخدم مواضيع الفعالية والموقع كفحص سريع للملاءمة، ثم تابع فقط إذا كانت الدعوة مناسبة لعملك.",
    ),
    "eventEligibilityTitle": MessageLookupByLibrary.simpleMessage(
      "الملاءمة والأهلية",
    ),
    "eventEndsLabel": MessageLookupByLibrary.simpleMessage("نهاية الفعالية"),
    "eventFeeLabel": MessageLookupByLibrary.simpleMessage("الرسوم"),
    "eventFormatLabel": MessageLookupByLibrary.simpleMessage("الصيغة"),
    "eventFreeLabel": MessageLookupByLibrary.simpleMessage("مجاني"),
    "eventHeaderSummaryBody": MessageLookupByLibrary.simpleMessage(
      "راجع مالك الفعالية والبيانات الأساسية والحالة والتكلفة قبل الدخول في تفاصيل النداء.",
    ),
    "eventLocationSectionTitle": MessageLookupByLibrary.simpleMessage("الموقع"),
    "eventLogoTitle": MessageLookupByLibrary.simpleMessage("شعار الفعالية"),
    "eventNotFound": MessageLookupByLibrary.simpleMessage(
      "لم يتم العثور على الفعالية.",
    ),
    "eventObjectivesTitle": MessageLookupByLibrary.simpleMessage("الأهداف"),
    "eventOrganizerBody": MessageLookupByLibrary.simpleMessage(
      "إذا بدا أي شيء غير واضح، فاعتبر هذه الشاشة مرجعك قبل الالتزام بالتقديم.",
    ),
    "eventOrganizerTitle": MessageLookupByLibrary.simpleMessage(
      "سياق الجهة المنظمة",
    ),
    "eventProblemStatementTitle": MessageLookupByLibrary.simpleMessage(
      "إشكالية الفعالية",
    ),
    "eventQrTitle": MessageLookupByLibrary.simpleMessage("رمز QR"),
    "eventReviewResultLabel": MessageLookupByLibrary.simpleMessage(
      "نتيجة مراجعة الملخص",
    ),
    "eventScientificCommitteeTitle": MessageLookupByLibrary.simpleMessage(
      "اللجنة العلمية",
    ),
    "eventSelectionLabel": MessageLookupByLibrary.simpleMessage("الفعالية"),
    "eventSpeakersTitle": MessageLookupByLibrary.simpleMessage(
      "المتحدثون والكلمات الرئيسية",
    ),
    "eventStartsLabel": MessageLookupByLibrary.simpleMessage("بداية الفعالية"),
    "eventStatusLabel": MessageLookupByLibrary.simpleMessage("الحالة"),
    "eventSubmissionGuidelinesTitle": MessageLookupByLibrary.simpleMessage(
      "إرشادات التقديم",
    ),
    "eventTargetAudienceTitle": MessageLookupByLibrary.simpleMessage(
      "الفئة المستهدفة",
    ),
    "eventTimelineBody": m2,
    "eventTimelineSectionBody": MessageLookupByLibrary.simpleMessage(
      "تحقق من كل تاريخ مهم مرتبط بهذه الفعالية قبل التقديم أو انتظار النتيجة.",
    ),
    "eventTimelineSectionTitle": MessageLookupByLibrary.simpleMessage(
      "الجدول الزمني",
    ),
    "eventTimelineTitle": MessageLookupByLibrary.simpleMessage("الجدول الزمني"),
    "eventTopicsSectionTitle": MessageLookupByLibrary.simpleMessage("المواضيع"),
    "eventTypeLabel": MessageLookupByLibrary.simpleMessage("نوع الفعالية"),
    "eventVerdictDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "آخر موعد للقرار النهائي",
    ),
    "eventWhoOrganizesTitle": MessageLookupByLibrary.simpleMessage(
      "من ينظم هذه الفعالية",
    ),
    "eventsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "تصفح النداءات القادمة وضيّق القائمة إلى المواضيع المناسبة وافتح فعالية محددة عندما تصبح مستعداً للتقديم.",
    ),
    "eventsSearchHint": MessageLookupByLibrary.simpleMessage(
      "ابحث عن الفعاليات بالاسم أو الموقع",
    ),
    "eventsTitle": MessageLookupByLibrary.simpleMessage("الفعاليات"),
    "eventsTopicFilterBody": MessageLookupByLibrary.simpleMessage(
      "اختر المجالات البحثية التي تريد ظهورها في الاكتشاف. أبقِ الواجهة الرئيسية هادئة ثم عد للتصفية من هنا عند الحاجة.",
    ),
    "existingSubmissionRedirectBody": MessageLookupByLibrary.simpleMessage(
      "لقد بدأت بالفعل مشاركة لهذه الفعالية، لذلك أعدناك إلى السجل الحالي بدلاً من إنشاء نسخة مكررة.",
    ),
    "exploreEvents": MessageLookupByLibrary.simpleMessage("استكشف الفعاليات"),
    "feedbackResearcherLabel": MessageLookupByLibrary.simpleMessage(
      "ملاحظة الباحث",
    ),
    "feedbackReviewerLabel": MessageLookupByLibrary.simpleMessage(
      "ملاحظة المراجع",
    ),
    "fileOpenFailed": MessageLookupByLibrary.simpleMessage("تعذر فتح الملف."),
    "filePickerHint": MessageLookupByLibrary.simpleMessage(
      "اختر ملف PDF أو DOC أو DOCX وسنقوم برفعه لك.",
    ),
    "fileReadFailed": MessageLookupByLibrary.simpleMessage(
      "تعذر قراءة الملف المحدد.",
    ),
    "fileSizeLabel": MessageLookupByLibrary.simpleMessage("حجم الملف"),
    "fileTypeLabel": MessageLookupByLibrary.simpleMessage("نوع الملف"),
    "fileUrlLabel": MessageLookupByLibrary.simpleMessage("رابط الملف"),
    "filterTopicsAction": MessageLookupByLibrary.simpleMessage(
      "تصفية المواضيع",
    ),
    "forgotPassword": MessageLookupByLibrary.simpleMessage(
      "هل نسيت كلمة المرور؟",
    ),
    "fullName": MessageLookupByLibrary.simpleMessage("الاسم الكامل"),
    "fullPaperDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "موعد البحث الكامل",
    ),
    "genericError": MessageLookupByLibrary.simpleMessage(
      "حدث خطأ ما. حاول مرة أخرى.",
    ),
    "getDirectionsAction": MessageLookupByLibrary.simpleMessage("الاتجاهات"),
    "getStarted": MessageLookupByLibrary.simpleMessage("ابدأ الآن"),
    "haveAccountSignIn": MessageLookupByLibrary.simpleMessage(
      "لديك حساب بالفعل؟ سجل الدخول",
    ),
    "homeAttentionTitle": MessageLookupByLibrary.simpleMessage("إجراء مطلوب"),
    "homeDiscoverEventsBody": MessageLookupByLibrary.simpleMessage(
      "تصفح الفرص المتاحة واحفظ ما يهمك وابدأ الترشيح من الفعالية المناسبة.",
    ),
    "homeHeroBody": MessageLookupByLibrary.simpleMessage(
      "اعرف ما يحتاج إلى اهتمام الآن، وواصل عملك الحالي، وانتقل إلى المسار الصحيح دون ازدحام.",
    ),
    "homeHeroTitle": MessageLookupByLibrary.simpleMessage("يومك البحثي منظم"),
    "homeManageAccountBody": MessageLookupByLibrary.simpleMessage(
      "عدّل التفضيلات وحالة الثقة وإعدادات تسجيل الدخول من وجهة ثابتة واحدة.",
    ),
    "homeNextActionTitle": MessageLookupByLibrary.simpleMessage(
      "أفضل إجراء تالٍ",
    ),
    "homeOverviewBody": MessageLookupByLibrary.simpleMessage(
      "تابع حالة حسابك والمواعيد النهائية المهمة والترشيحات وأدوات الباحث من مركز تحكم هادئ واحد.",
    ),
    "homeQuickLinksBody": MessageLookupByLibrary.simpleMessage(
      "انتقل إلى أهم مناطق الباحث دون تحويل الصفحة الرئيسية إلى قائمة مزدحمة.",
    ),
    "homeQuickLinksTitle": MessageLookupByLibrary.simpleMessage("روابط سريعة"),
    "homeResumeSubmissionBody": MessageLookupByLibrary.simpleMessage(
      "راجع ترشيحاتك النشطة وواصل الخطوة المطلوبة التالية.",
    ),
    "homeSavedEventsBody": MessageLookupByLibrary.simpleMessage(
      "ارجع إلى الفعاليات التي حفظتها عندما تقرر ما الذي ستتقدم إليه لاحقاً.",
    ),
    "homeStateSummaryBody": MessageLookupByLibrary.simpleMessage(
      "أبقِ حالة التحقق والاشتراك والمواعيد النهائية والترشيحات مرئية بسرعة.",
    ),
    "homeStateSummaryTitle": MessageLookupByLibrary.simpleMessage("الحالة"),
    "homeSubscriptionAttentionBody": MessageLookupByLibrary.simpleMessage(
      "الوصول المميز غير نشط حالياً. عالج الفوترة من الحساب عندما تحتاج إلى المستودع أو المزايا المميزة.",
    ),
    "homeSubtitle": MessageLookupByLibrary.simpleMessage(
      "لوحة التحكم الخاصة بك جاهزة.",
    ),
    "homeTitle": MessageLookupByLibrary.simpleMessage("الصفحة الرئيسية للباحث"),
    "homeVerificationAttentionBody": MessageLookupByLibrary.simpleMessage(
      "التحقق لم يكتمل بعد. عالجه من الحساب حتى تبقى مسارات الباحث المقيدة بالثقة متاحة.",
    ),
    "imageUnavailableLabel": MessageLookupByLibrary.simpleMessage(
      "الصورة غير متاحة",
    ),
    "institution": MessageLookupByLibrary.simpleMessage("المؤسسة"),
    "languageArabic": MessageLookupByLibrary.simpleMessage("العربية"),
    "languageEnglish": MessageLookupByLibrary.simpleMessage("الإنجليزية"),
    "languagePreferenceTitle": MessageLookupByLibrary.simpleMessage("اللغة"),
    "languageUpdatedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم تحديث اللغة.",
    ),
    "lastUpdatedLabel": MessageLookupByLibrary.simpleMessage("آخر تحديث"),
    "latestRequestLabel": MessageLookupByLibrary.simpleMessage("آخر طلب"),
    "loadMore": MessageLookupByLibrary.simpleMessage("تحميل المزيد"),
    "loading": MessageLookupByLibrary.simpleMessage("جار التحميل..."),
    "location": MessageLookupByLibrary.simpleMessage("الموقع"),
    "locationCopiedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم نسخ الموقع.",
    ),
    "manageTopicsAction": MessageLookupByLibrary.simpleMessage(
      "إدارة مواضيع التنبيهات",
    ),
    "navAccountLabel": MessageLookupByLibrary.simpleMessage("الحساب"),
    "navEventsLabel": MessageLookupByLibrary.simpleMessage("الفعاليات"),
    "navHomeLabel": MessageLookupByLibrary.simpleMessage("الرئيسية"),
    "navLibraryLabel": MessageLookupByLibrary.simpleMessage("المكتبة"),
    "navSubmissionsLabel": MessageLookupByLibrary.simpleMessage("أعمالي"),
    "nearestDeadlineTitle": MessageLookupByLibrary.simpleMessage(
      "أقرب موعد نهائي",
    ),
    "newPassword": MessageLookupByLibrary.simpleMessage("كلمة المرور الجديدة"),
    "noEventsFound": MessageLookupByLibrary.simpleMessage("لا توجد فعاليات."),
    "noFileSelected": MessageLookupByLibrary.simpleMessage("لم يتم اختيار ملف"),
    "noPaymentsFound": MessageLookupByLibrary.simpleMessage(
      "لا توجد مدفوعات حتى الآن.",
    ),
    "noSubmissionsFound": MessageLookupByLibrary.simpleMessage(
      "لا توجد ترشيحات.",
    ),
    "noUpcomingDeadline": MessageLookupByLibrary.simpleMessage(
      "لا توجد مواعيد نهائية قادمة",
    ),
    "notVerifiedStatus": MessageLookupByLibrary.simpleMessage("غير موثق"),
    "notificationEducationBody": MessageLookupByLibrary.simpleMessage(
      "سنطلب إذن الإشعارات فقط بعد الاشتراك في المواضيع.",
    ),
    "notificationEducationTitle": MessageLookupByLibrary.simpleMessage(
      "إعداد الإشعارات",
    ),
    "notificationPermissionUpdated": MessageLookupByLibrary.simpleMessage(
      "تم تحديث تفضيل الإشعارات.",
    ),
    "notificationPreferencesBody": MessageLookupByLibrary.simpleMessage(
      "تحكم في طريقة تعامل التطبيق مع تنبيهات المواضيع وافتح إعدادات النظام إذا كان أندرويد قد حظر الإشعارات بالفعل.",
    ),
    "notificationPreferencesTitle": MessageLookupByLibrary.simpleMessage(
      "تفضيلات الإشعارات",
    ),
    "notificationsDisabledBody": MessageLookupByLibrary.simpleMessage(
      "فعّل الإشعارات حتى تصلك تنبيهات المواضيع المهمة في الوقت المناسب.",
    ),
    "notificationsEnabledBody": MessageLookupByLibrary.simpleMessage(
      "تصبح تنبيهات المواضيع متاحة عند الاشتراك في المجالات ذات الصلة.",
    ),
    "notificationsEnabledStatus": MessageLookupByLibrary.simpleMessage(
      "الإشعارات مفعلة",
    ),
    "notificationsNotEnabledStatus": MessageLookupByLibrary.simpleMessage(
      "الإشعارات غير مفعلة",
    ),
    "onboardingBody": MessageLookupByLibrary.simpleMessage(
      "أنجز سير عملك البحثي من الهاتف بخطوات أقل.",
    ),
    "onboardingStepDiscoverBody": MessageLookupByLibrary.simpleMessage(
      "ابحث وصفِّ واشرِّح الفعاليات المطابقة لاهتماماتك البحثية والمواعيد النهائية.",
    ),
    "onboardingStepDiscoverTitle": MessageLookupByLibrary.simpleMessage(
      "اكتشف الفعاليات المناسبة بسرعة",
    ),
    "onboardingStepNotifyBody": MessageLookupByLibrary.simpleMessage(
      "نطلب إذن الإشعارات فقط عند اشتراكك في المواضيع حتى تبقى الطلبات مرتبطة بالسياق.",
    ),
    "onboardingStepNotifyTitle": MessageLookupByLibrary.simpleMessage(
      "ابقَ على اطلاع بتنبيهات في وقتها",
    ),
    "onboardingStepSubmitBody": MessageLookupByLibrary.simpleMessage(
      "تابع الملخصات والأبحاث الكاملة والمراجعات ضمن مسار واحد واضح الحالة.",
    ),
    "onboardingStepSubmitTitle": MessageLookupByLibrary.simpleMessage(
      "قدّم أعمالك بسلاسة أكبر",
    ),
    "onboardingTitle": MessageLookupByLibrary.simpleMessage(
      "مرحبًا بك في إيفنتي 360",
    ),
    "openSubmissionFileAction": MessageLookupByLibrary.simpleMessage(
      "فتح الملف المرفوع",
    ),
    "openSystemSettingsAction": MessageLookupByLibrary.simpleMessage(
      "فتح إعدادات النظام",
    ),
    "openedSystemSettingsMessage": MessageLookupByLibrary.simpleMessage(
      "تم فتح إعدادات النظام.",
    ),
    "organizerLabel": MessageLookupByLibrary.simpleMessage("الجهة المنظمة"),
    "password": MessageLookupByLibrary.simpleMessage("كلمة المرور"),
    "passwordTooShort": MessageLookupByLibrary.simpleMessage(
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    ),
    "passwordUpdatedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم تحديث كلمة المرور بنجاح.",
    ),
    "passwordsDoNotMatch": MessageLookupByLibrary.simpleMessage(
      "كلمتا المرور غير متطابقتين.",
    ),
    "paymentAmountError": MessageLookupByLibrary.simpleMessage(
      "أدخل مبلغًا صالحًا أكبر من صفر.",
    ),
    "paymentAmountLabel": MessageLookupByLibrary.simpleMessage("المبلغ"),
    "paymentHistoryBody": MessageLookupByLibrary.simpleMessage(
      "هذه هي إثباتات الدفع التي أرسلتها مسبقاً وقرارات المراجعة المرتبطة بكل منها.",
    ),
    "paymentHistoryTitle": MessageLookupByLibrary.simpleMessage(
      "سجل المدفوعات",
    ),
    "paymentInstructionAccountHolderLabel":
        MessageLookupByLibrary.simpleMessage("صاحب الحساب"),
    "paymentInstructionBankLabel": MessageLookupByLibrary.simpleMessage(
      "البنك",
    ),
    "paymentInstructionEmailLabel": MessageLookupByLibrary.simpleMessage(
      "بريد متابعة الدفع",
    ),
    "paymentInstructionRibLabel": MessageLookupByLibrary.simpleMessage(
      "رقم الحساب / RIB",
    ),
    "paymentInstructionsTitle": MessageLookupByLibrary.simpleMessage(
      "تعليمات الدفع",
    ),
    "paymentMethodBank": MessageLookupByLibrary.simpleMessage("تحويل بنكي"),
    "paymentMethodCash": MessageLookupByLibrary.simpleMessage("نقدًا"),
    "paymentMethodCheck": MessageLookupByLibrary.simpleMessage("شيك"),
    "paymentMethodLabel": MessageLookupByLibrary.simpleMessage("طريقة الدفع"),
    "paymentMethodOnline": MessageLookupByLibrary.simpleMessage("دفع إلكتروني"),
    "paymentNotesLabel": MessageLookupByLibrary.simpleMessage("ملاحظات الدافع"),
    "paymentPendingStatus": MessageLookupByLibrary.simpleMessage(
      "بانتظار التحقق",
    ),
    "paymentRejectedStatus": MessageLookupByLibrary.simpleMessage("مرفوض"),
    "paymentReportActivationHint": MessageLookupByLibrary.simpleMessage(
      "سيساعد هذا البلاغ على تفعيل الوصول المميز بعد اكتمال التحقق.",
    ),
    "paymentReportRenewalHint": MessageLookupByLibrary.simpleMessage(
      "سيُعامل هذا البلاغ كعملية تجديد أو استمرار لاشتراكك الحالي.",
    ),
    "paymentTrustFlowHint": MessageLookupByLibrary.simpleMessage(
      "استخدم هذه المساحة لمراجعة حالة اشتراكك الحالية، ثم أرسل إثبات دفع جديد كلما احتجت إلى تفعيل الوصول أو تجديده.",
    ),
    "paymentVerifiedStatus": MessageLookupByLibrary.simpleMessage("تم التحقق"),
    "phoneLabel": MessageLookupByLibrary.simpleMessage("الهاتف"),
    "pickFileAction": MessageLookupByLibrary.simpleMessage("اختر ملفًا"),
    "pickProofDocument": MessageLookupByLibrary.simpleMessage(
      "اختر وثيقة الإثبات",
    ),
    "pickVerificationDocument": MessageLookupByLibrary.simpleMessage(
      "اختر وثيقة التحقق",
    ),
    "preferencesBody": MessageLookupByLibrary.simpleMessage(
      "اضبط المظهر واللغة وسلوك التنبيهات دون مغادرة مسار التطبيق.",
    ),
    "preferencesTitle": MessageLookupByLibrary.simpleMessage("التفضيلات"),
    "profileBioLabel": MessageLookupByLibrary.simpleMessage("نبذة قصيرة"),
    "profileCompleted": MessageLookupByLibrary.simpleMessage(
      "الملف الشخصي مكتمل",
    ),
    "profileIncomplete": MessageLookupByLibrary.simpleMessage(
      "الملف الشخصي غير مكتمل",
    ),
    "profileSavedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم تحديث الملف الشخصي بنجاح.",
    ),
    "profileStatus": MessageLookupByLibrary.simpleMessage("حالة الملف الشخصي"),
    "referenceNumberLabel": MessageLookupByLibrary.simpleMessage("رقم المرجع"),
    "rejectionReasonLabel": MessageLookupByLibrary.simpleMessage("سبب الرفض"),
    "removeBookmark": MessageLookupByLibrary.simpleMessage(
      "إزالة الإشارة المرجعية",
    ),
    "reportPaymentBody": MessageLookupByLibrary.simpleMessage(
      "أرسل مبلغ الدفع وطريقته ووثيقة الإثبات حتى يتمكن الفريق من التحقق من وصول اشتراكك.",
    ),
    "reportPaymentOverviewBody": MessageLookupByLibrary.simpleMessage(
      "أرسل تفاصيل الفوترة ووثيقة الإثبات مرة واحدة حتى يتمكن الفريق من التحقق من وصول اشتراكك بسرعة ودقة.",
    ),
    "reportPaymentTitle": MessageLookupByLibrary.simpleMessage(
      "إرسال إثبات الدفع",
    ),
    "reportedAtLabel": MessageLookupByLibrary.simpleMessage("تاريخ الإبلاغ"),
    "repositoryAbstractTitle": MessageLookupByLibrary.simpleMessage("الملخص"),
    "repositoryAllWilayas": MessageLookupByLibrary.simpleMessage("كل الولايات"),
    "repositoryAuthorHint": MessageLookupByLibrary.simpleMessage(
      "تصفية حسب اسم المؤلف",
    ),
    "repositoryBackAction": MessageLookupByLibrary.simpleMessage(
      "العودة إلى المستودع",
    ),
    "repositoryContextTitle": MessageLookupByLibrary.simpleMessage(
      "سياق المستودع",
    ),
    "repositoryDetailAction": MessageLookupByLibrary.simpleMessage(
      "عرض التفاصيل",
    ),
    "repositoryDetailOverviewBody": MessageLookupByLibrary.simpleMessage(
      "راجع سياق البحث وملخصه وحزمة التنزيل قبل فتح الملف الكامل.",
    ),
    "repositoryDetailTitle": MessageLookupByLibrary.simpleMessage(
      "تفاصيل البحث",
    ),
    "repositoryDownloadAction": MessageLookupByLibrary.simpleMessage(
      "تنزيل البحث",
    ),
    "repositoryDownloadConfidenceBody": MessageLookupByLibrary.simpleMessage(
      "استخدم هذه الشاشة لتأكيد هوية البحث وطبيعة الملف وتتبع الاستخدام قبل التنزيل.",
    ),
    "repositoryDownloadSectionTitle": MessageLookupByLibrary.simpleMessage(
      "التنزيل",
    ),
    "repositoryDownloadsLabel": MessageLookupByLibrary.simpleMessage(
      "التنزيلات",
    ),
    "repositoryEmptyState": MessageLookupByLibrary.simpleMessage(
      "لا توجد أبحاث مطابقة للفلاتر الحالية.",
    ),
    "repositoryFilterBody": MessageLookupByLibrary.simpleMessage(
      "رشّح حسب البحث أو المؤلف أو الموضوع أو الولاية حتى يبدو المستودع منسقاً لا مزدحماً.",
    ),
    "repositoryNoFileAvailable": MessageLookupByLibrary.simpleMessage(
      "لا يتوفر ملف قابل للتنزيل لهذا البحث.",
    ),
    "repositoryOverviewBody": MessageLookupByLibrary.simpleMessage(
      "ابحث في الأوراق وصفِّها حسب الموضوع أو المؤلف وافتح المادة التي تهمك دون ازدحام.",
    ),
    "repositoryPaperFileFallback": MessageLookupByLibrary.simpleMessage(
      "ملف البحث",
    ),
    "repositoryPremiumContextBody": MessageLookupByLibrary.simpleMessage(
      "افتح الحساب، وراجع حالة الاشتراك، ثم أرسل إثبات دفع لتفعيل الوصول أو تجديده قبل العودة إلى هنا.",
    ),
    "repositoryProtectedDownloadBody": MessageLookupByLibrary.simpleMessage(
      "تُتبع التنزيلات وتُفتح من مرجع ملف محمي حتى يبقى الوصول متوافقاً مع قواعد الاشتراك.",
    ),
    "repositoryReadyToDownload": MessageLookupByLibrary.simpleMessage(
      "جاهز للتنزيل",
    ),
    "repositorySearchHint": MessageLookupByLibrary.simpleMessage(
      "ابحث في الأبحاث أو الفعاليات أو الباحثين",
    ),
    "repositorySubscriptionRequiredBody": MessageLookupByLibrary.simpleMessage(
      "المستودع متاح فقط عندما يكون الوصول المميز أو التجريبي نشطاً.",
    ),
    "repositorySubscriptionRequiredTitle": MessageLookupByLibrary.simpleMessage(
      "يتطلب وصولًا مميزًا",
    ),
    "repositoryTitle": MessageLookupByLibrary.simpleMessage("المكتبة"),
    "repositoryViewsLabel": MessageLookupByLibrary.simpleMessage("المشاهدات"),
    "requiredField": MessageLookupByLibrary.simpleMessage("هذا الحقل مطلوب."),
    "researcherAccessBody": MessageLookupByLibrary.simpleMessage(
      "افتح الملف الشخصي والتحقق والفعاليات المحفوظة وأدوات الأمان من قسم واحد واضح.",
    ),
    "researcherAccessTitle": MessageLookupByLibrary.simpleMessage(
      "الملف والوصول",
    ),
    "resetEmailSent": MessageLookupByLibrary.simpleMessage(
      "تم إرسال رسالة إعادة تعيين كلمة المرور.",
    ),
    "resetPassword": MessageLookupByLibrary.simpleMessage(
      "إعادة تعيين كلمة المرور",
    ),
    "resetPasswordHeroBody": MessageLookupByLibrary.simpleMessage(
      "استعد الوصول بأمان عبر رابط إعادة التعيين، أو أكمل جلسة استرجاع كلمة المرور دون فقدان السياق.",
    ),
    "retry": MessageLookupByLibrary.simpleMessage("إعادة المحاولة"),
    "reviewSubmissionsAction": MessageLookupByLibrary.simpleMessage(
      "مراجعة الترشيحات",
    ),
    "revisionNotesLabel": MessageLookupByLibrary.simpleMessage(
      "ملاحظات المراجعة (اختياري)",
    ),
    "saveProfileAction": MessageLookupByLibrary.simpleMessage(
      "حفظ الملف الشخصي",
    ),
    "savedEventsBody": MessageLookupByLibrary.simpleMessage(
      "ارجع إلى الفعاليات التي اخترتها دون الحاجة إلى إعادة بناء البحث من البداية.",
    ),
    "savedEventsEmptyState": MessageLookupByLibrary.simpleMessage(
      "لم تقم بحفظ أي فعاليات بعد.",
    ),
    "savedEventsShortTitle": MessageLookupByLibrary.simpleMessage("المحفوظة"),
    "savedEventsTitle": MessageLookupByLibrary.simpleMessage(
      "الفعاليات المحفوظة",
    ),
    "secureDocsBody": MessageLookupByLibrary.simpleMessage(
      "يتم رفع ملفات التحقق والدفع عبر طلبات موثقة، ويتم التحقق منها قبل الرفع، ثم فتحها لاحقًا بروابط موقعة قصيرة العمر.",
    ),
    "secureDocsTitle": MessageLookupByLibrary.simpleMessage(
      "التعامل مع الوثائق الحساسة",
    ),
    "secureFileRequiredError": MessageLookupByLibrary.simpleMessage(
      "اختر ملفًا قبل الإرسال.",
    ),
    "secureFileSizeError": MessageLookupByLibrary.simpleMessage(
      "حجم الملف المحدد يتجاوز 10 ميغابايت.",
    ),
    "secureFileTypeError": MessageLookupByLibrary.simpleMessage(
      "يسمح هنا فقط بملفات PDF أو JPG أو PNG.",
    ),
    "securityBody": MessageLookupByLibrary.simpleMessage(
      "احمِ الوصول إلى حسابك وحافظ على تحديث بيانات الاعتماد من شاشة أمان مخصصة.",
    ),
    "securityDirectPasswordBody": MessageLookupByLibrary.simpleMessage(
      "إذا كنت مسجلاً الدخول بالفعل على هذا الجهاز، يمكنك تعيين كلمة مرور جديدة هنا مباشرة.",
    ),
    "securityResetBody": m3,
    "securityTitle": MessageLookupByLibrary.simpleMessage("الأمان"),
    "selectedTopicsCount": m4,
    "sendResetLink": MessageLookupByLibrary.simpleMessage(
      "إرسال رابط إعادة التعيين",
    ),
    "signIn": MessageLookupByLibrary.simpleMessage("تسجيل الدخول"),
    "signInHeroBody": MessageLookupByLibrary.simpleMessage(
      "ادخل إلى الفعاليات والترشيحات ومسارات الثقة والمستودع من مساحة عمل محمولة واحدة ومركزة.",
    ),
    "signInHeroTitle": MessageLookupByLibrary.simpleMessage(
      "عد إلى مسارك البحثي بسرعة",
    ),
    "signOut": MessageLookupByLibrary.simpleMessage("تسجيل الخروج"),
    "signUp": MessageLookupByLibrary.simpleMessage("إنشاء حساب"),
    "signUpHeroBody": MessageLookupByLibrary.simpleMessage(
      "ابدأ ببيانات الدخول الآمنة، ثم أكمل ملفك الشخصي ومسار التحقق داخل التطبيق.",
    ),
    "signUpHeroTitle": MessageLookupByLibrary.simpleMessage(
      "أنشئ وصول الباحث الخاص بك",
    ),
    "signedInAs": MessageLookupByLibrary.simpleMessage("تم تسجيل الدخول باسم"),
    "skipAction": MessageLookupByLibrary.simpleMessage("تخطي"),
    "somethingWentWrong": MessageLookupByLibrary.simpleMessage("حدث خطأ ما."),
    "statusAbstractAccepted": MessageLookupByLibrary.simpleMessage(
      "تم قبول الملخص",
    ),
    "statusAbstractRejected": MessageLookupByLibrary.simpleMessage(
      "تم رفض الملخص",
    ),
    "statusAbstractSubmitted": MessageLookupByLibrary.simpleMessage(
      "تم تقديم الملخص",
    ),
    "statusCompleted": MessageLookupByLibrary.simpleMessage("مكتمل"),
    "statusFullPaperAccepted": MessageLookupByLibrary.simpleMessage(
      "تم قبول البحث الكامل",
    ),
    "statusFullPaperRejected": MessageLookupByLibrary.simpleMessage(
      "تم رفض البحث الكامل",
    ),
    "statusFullPaperSubmitted": MessageLookupByLibrary.simpleMessage(
      "تم تقديم البحث الكامل",
    ),
    "statusNarrativeAbstractAccepted": MessageLookupByLibrary.simpleMessage(
      "تمت الموافقة على الملخص. الإجراء التالي المهم هو تجهيز البحث الكامل قبل موعده النهائي.",
    ),
    "statusNarrativeAbstractRejected": MessageLookupByLibrary.simpleMessage(
      "لم يتم قبول الملخص. راجع أي ملاحظات هنا قبل أن تقرر خطوتك التالية.",
    ),
    "statusNarrativeAbstractSubmitted": MessageLookupByLibrary.simpleMessage(
      "ملخصك قيد المراجعة الآن. لا يلزم اتخاذ إجراء إضافي حتى يصدر الفريق البحثي النتيجة.",
    ),
    "statusNarrativeCompleted": MessageLookupByLibrary.simpleMessage(
      "وصلت هذه المشاركة إلى حالتها النهائية المكتملة. يمكنك الاحتفاظ بهذه الصفحة كسجل لما تم تسليمه.",
    ),
    "statusNarrativeFullPaperAccepted": MessageLookupByLibrary.simpleMessage(
      "تم قبول البحث الكامل. المشاركة الآن في حالة جيدة ما لم تتواصل معك الجهة المنظمة مرة أخرى.",
    ),
    "statusNarrativeFullPaperRejected": MessageLookupByLibrary.simpleMessage(
      "تم رفض البحث الكامل. اقرأ الملاحظات بعناية قبل أن تستثمر وقتاً في رفع جديد.",
    ),
    "statusNarrativeFullPaperSubmitted": MessageLookupByLibrary.simpleMessage(
      "تم حفظ البحث الكامل وهو الآن بانتظار المراجعة. راقب الملاحظات وتحديثات المواعيد.",
    ),
    "statusNarrativeRevisionRequested": MessageLookupByLibrary.simpleMessage(
      "تم طلب مراجعة. استخدم الملاحظات أدناه ثم أرسل النسخة المحدثة من هذه الشاشة.",
    ),
    "statusNarrativeRevisionUnderReview": MessageLookupByLibrary.simpleMessage(
      "تم رفع المراجعة وعادت إلى التقييم. تبقى أحدث الملاحظات مرئية أدناه كمرجع.",
    ),
    "statusRevisionRequested": MessageLookupByLibrary.simpleMessage(
      "تم طلب مراجعة",
    ),
    "statusRevisionUnderReview": MessageLookupByLibrary.simpleMessage(
      "المراجعة قيد التقييم",
    ),
    "submissionDetailMissing": MessageLookupByLibrary.simpleMessage(
      "تفاصيل الترشيح غير متاحة.",
    ),
    "submissionDetailOverviewBody": MessageLookupByLibrary.simpleMessage(
      "راجع سجل هذا الترشيح ومواعيده وملفاته المرفوعة وملاحظات المراجعين والخطوة المطلوبة التالية.",
    ),
    "submissionDetailTitle": MessageLookupByLibrary.simpleMessage(
      "تفاصيل الترشيح",
    ),
    "submissionFeedbackBody": MessageLookupByLibrary.simpleMessage(
      "أبقِ ملاحظات المراجعين منفصلة عن إجراءاتك حتى تبقى الخطوة التالية واضحة.",
    ),
    "submissionFeedbackTitle": MessageLookupByLibrary.simpleMessage(
      "الملاحظات",
    ),
    "submissionFilesBody": MessageLookupByLibrary.simpleMessage(
      "راجع تفاصيل الملف المرفوع هنا بدلاً من الاعتماد على رابط تخزين خام.",
    ),
    "submissionFilesTitle": MessageLookupByLibrary.simpleMessage(
      "ملف المشاركة",
    ),
    "submissionStatusLabel": MessageLookupByLibrary.simpleMessage("الحالة"),
    "submissionTimelineTitle": MessageLookupByLibrary.simpleMessage(
      "الخط الزمني للحالة والملاحظات",
    ),
    "submissionTitleArLabel": MessageLookupByLibrary.simpleMessage(
      "العنوان (العربية)",
    ),
    "submissionTitleEnLabel": MessageLookupByLibrary.simpleMessage(
      "العنوان (الإنجليزية - اختياري)",
    ),
    "submissionsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "تابع سجلاتك النشطة واعرف ما الذي تغير وواصل فقط الترشيح الذي يحتاج إلى خطوة الآن.",
    ),
    "submissionsStartFromEventBody": MessageLookupByLibrary.simpleMessage(
      "ابدأ كل ملخص جديد من الفعالية المرتبطة به حتى يبقى النداء والموعد النهائي والسياق مرتبطين بالترشيح منذ البداية.",
    ),
    "submissionsTitle": MessageLookupByLibrary.simpleMessage("الترشيحات"),
    "submitAbstractAction": MessageLookupByLibrary.simpleMessage(
      "تقديم الملخص",
    ),
    "submitAbstractOverviewBody": MessageLookupByLibrary.simpleMessage(
      "جهّز البيانات الأساسية والملخصات المطلوبة لإنشاء ترشيح أولي منظم.",
    ),
    "submitAbstractTitle": MessageLookupByLibrary.simpleMessage("تقديم الملخص"),
    "submitFullPaperAction": MessageLookupByLibrary.simpleMessage(
      "تقديم البحث الكامل",
    ),
    "submitFullPaperOverviewBody": MessageLookupByLibrary.simpleMessage(
      "ارفع ملف البحث النهائي على سجل الترشيح الموافق عليه دون فقدان السياق.",
    ),
    "submitFullPaperTitle": MessageLookupByLibrary.simpleMessage(
      "تقديم البحث الكامل",
    ),
    "submitPaymentReportAction": MessageLookupByLibrary.simpleMessage(
      "إرسال تقرير الدفع",
    ),
    "submitRevisionAction": MessageLookupByLibrary.simpleMessage(
      "تقديم المراجعة",
    ),
    "submitRevisionOverviewBody": MessageLookupByLibrary.simpleMessage(
      "أرسل النسخة المعدلة وأي ملاحظات مطلوبة من المراجعين في خطوة واحدة مركزة.",
    ),
    "submitRevisionTitle": MessageLookupByLibrary.simpleMessage(
      "تقديم المراجعة",
    ),
    "submitVerificationRequest": MessageLookupByLibrary.simpleMessage(
      "إرسال طلب التحقق",
    ),
    "submittedOnLabel": MessageLookupByLibrary.simpleMessage("تاريخ التقديم"),
    "subscriptionActive": MessageLookupByLibrary.simpleMessage(
      "اشتراك مميز نشط",
    ),
    "subscriptionActiveHeadline": MessageLookupByLibrary.simpleMessage(
      "وصولك المميز نشط.",
    ),
    "subscriptionBankReference": m5,
    "subscriptionCancelledHeadline": MessageLookupByLibrary.simpleMessage(
      "تم إلغاء اشتراكك.",
    ),
    "subscriptionDaysRemaining": m6,
    "subscriptionExpiredHeadline": MessageLookupByLibrary.simpleMessage(
      "انتهت صلاحية الوصول المميز.",
    ),
    "subscriptionHistoryAction": MessageLookupByLibrary.simpleMessage(
      "سجل الفوترة",
    ),
    "subscriptionInactive": MessageLookupByLibrary.simpleMessage(
      "لا يوجد اشتراك مميز نشط",
    ),
    "subscriptionOverviewBody": MessageLookupByLibrary.simpleMessage(
      "راجع مستوى الوصول الحالي، واعرف هل تحتاج إلى تجديد، ثم أرسل إثبات الدفع التالي من دون مغادرة مسار الحساب.",
    ),
    "subscriptionRecommendedPrice": m7,
    "subscriptionStatusTitle": MessageLookupByLibrary.simpleMessage(
      "حالة الاشتراك",
    ),
    "subscriptionTrialHeadline": MessageLookupByLibrary.simpleMessage(
      "فترة التجربة لديك نشطة.",
    ),
    "themeDark": MessageLookupByLibrary.simpleMessage("داكن"),
    "themeLight": MessageLookupByLibrary.simpleMessage("فاتح"),
    "themePreferenceTitle": MessageLookupByLibrary.simpleMessage("المظهر"),
    "themeSystem": MessageLookupByLibrary.simpleMessage("اتباع النظام"),
    "themeUpdatedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم تحديث المظهر.",
    ),
    "topicSubscriptionHint": MessageLookupByLibrary.simpleMessage(
      "اشترك في المواضيع لتصلك تنبيهات فورية.",
    ),
    "topicSubscriptionsBody": MessageLookupByLibrary.simpleMessage(
      "أدر اهتماماتك البحثية ومواضيع التنبيهات.",
    ),
    "topicSubscriptionsEmptyState": MessageLookupByLibrary.simpleMessage(
      "لا توجد مواضيع متاحة حاليًا.",
    ),
    "topicSubscriptionsManageBody": MessageLookupByLibrary.simpleMessage(
      "اختر المواضيع التي تريد متابعتها. نطلب إذن الإشعارات عند الاشتراك حتى تبقى الطلبات مرتبطة بالسياق.",
    ),
    "topicSubscriptionsManageTitle": MessageLookupByLibrary.simpleMessage(
      "إدارة مواضيع التنبيهات",
    ),
    "topicSubscriptionsTitle": MessageLookupByLibrary.simpleMessage(
      "اشتراكات المواضيع",
    ),
    "trustCenterTitle": MessageLookupByLibrary.simpleMessage("التحقق والفوترة"),
    "trustOverviewBody": MessageLookupByLibrary.simpleMessage(
      "ارفع وثائق التحقق وراجع تقارير الدفع وأبقِ الوصول المميز متقدماً من مكان آمن واحد.",
    ),
    "unsupportedRoleBody": MessageLookupByLibrary.simpleMessage(
      "تطبيق إيفنتي 360 المحمول يدعم حسابات الباحثين فقط حاليًا.",
    ),
    "unsupportedRoleOverviewBody": MessageLookupByLibrary.simpleMessage(
      "هذا الإصدار المحمول يركز عمدًا على مسارات الباحثين فقط، لذلك يتم إيقاف الحسابات غير المدعومة هنا بدلًا من أن تتعطل لاحقًا.",
    ),
    "unsupportedRoleTitle": MessageLookupByLibrary.simpleMessage(
      "هذا الدور غير مدعوم على التطبيق المحمول",
    ),
    "updatePasswordAction": MessageLookupByLibrary.simpleMessage(
      "تحديث كلمة المرور",
    ),
    "updatePasswordTitle": MessageLookupByLibrary.simpleMessage(
      "تعيين كلمة مرور جديدة",
    ),
    "uploadGuidanceMessage": MessageLookupByLibrary.simpleMessage(
      "ارفع فقط ملفات PDF أو DOC أو DOCX. تبقى إرشادات الملف والحجم والنوع ظاهرة هنا حتى تبدو العملية واضحة وآمنة.",
    ),
    "verificationApprovedBody": MessageLookupByLibrary.simpleMessage(
      "تمت الموافقة على توثيقك كباحث، ويمكنك متابعة استخدام المسارات المخصصة للحسابات الموثقة.",
    ),
    "verificationCenterTitle": MessageLookupByLibrary.simpleMessage("التحقق"),
    "verificationPendingBody": MessageLookupByLibrary.simpleMessage(
      "طلب التحقق الخاص بك قيد المراجعة. سنحتفظ بآخر وثيقة مرفوعة حتى يكتمل التقييم.",
    ),
    "verificationPendingStatus": MessageLookupByLibrary.simpleMessage(
      "قيد المراجعة",
    ),
    "verificationRejectedStatus": MessageLookupByLibrary.simpleMessage("مرفوض"),
    "verificationRequiredBody": MessageLookupByLibrary.simpleMessage(
      "ارفع وثيقة إثبات واضحة لبدء مراجعة التحقق.",
    ),
    "verificationStatusTitle": MessageLookupByLibrary.simpleMessage(
      "حالة التحقق",
    ),
    "verifiedStatus": MessageLookupByLibrary.simpleMessage("موثق"),
    "viewProofDocument": MessageLookupByLibrary.simpleMessage(
      "عرض وثيقة الإثبات",
    ),
    "viewSubmissionAction": MessageLookupByLibrary.simpleMessage("عرض الترشيح"),
    "viewTopicsAction": MessageLookupByLibrary.simpleMessage("عرض المواضيع"),
    "viewUploadedDocument": MessageLookupByLibrary.simpleMessage(
      "عرض الوثيقة المرفوعة",
    ),
    "websiteLabel": MessageLookupByLibrary.simpleMessage("الموقع الإلكتروني"),
    "wilayaLabel": MessageLookupByLibrary.simpleMessage("الولاية"),
  };
}
