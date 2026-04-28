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

  static String m0(count) =>
      "${Intl.plural(count, one: 'طلب تقديم نشط واحد', two: 'طلبا تقديم نشطان', few: '${count} طلبات تقديم نشطة', other: '${count} طلب تقديم نشط')}";

  static String m1(count) => "جميع الموضوعات متاحة (${count})";

  static String m2(date) =>
      "يشير تقديم الملخصات لهذه الفعالية حالياً إلى ${date} كأقرب موعد نهائي ظاهر.";

  static String m3(email) =>
      "أرسل رابط إعادة تعيين آمن إلى ${email} إذا أردت تغيير كلمة المرور عبر البريد الإلكتروني.";

  static String m4(count) =>
      "${Intl.plural(count, zero: 'لا توجد تصفية حسب الموضوعات', one: 'تصفية واحدة حسب الموضوعات مفعلة', other: '${count} تصفيات حسب الموضوعات مفعلة')}";

  static String m5(bankName) =>
      "استخدم المرجع البنكي ${bankName} عند إرسال إثبات دفع جديد للتفعيل أو التجديد.";

  static String m6(count) =>
      "${Intl.plural(count, zero: 'لا أيام متبقية', one: 'يوم واحد متبقٍ', two: 'يومان متبقيان', few: '${count} أيام متبقية', other: '${count} يوم متبقٍ')}";

  static String m7(amount, currency, billingPeriod) =>
      "المبلغ المقترح: ${amount} ${currency} لفترة ${billingPeriod}.";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "abstractArLabel": MessageLookupByLibrary.simpleMessage("الملخص (العربية)"),
    "abstractDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "الموعد النهائي للملخص",
    ),
    "abstractEnLabel": MessageLookupByLibrary.simpleMessage(
      "الملخص (الإنجليزية - اختياري)",
    ),
    "abstractWriteGuidance": MessageLookupByLibrary.simpleMessage(
      "ابدأ من الفعالية الصحيحة، واحرص على وضوح العنوان، ولا ترسل إلا الطلب الذي تريد متابعته لهذه الدعوة.",
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
      "أدر ملفك الشخصي والتوثيق والتفضيلات والتنبيهات من مركز حساب واحد واضح.",
    ),
    "accountHeroTitle": MessageLookupByLibrary.simpleMessage(
      "أدر تجربتك البحثية بثقة",
    ),
    "accountOverviewTitle": MessageLookupByLibrary.simpleMessage("حالة الحساب"),
    "accountTitle": MessageLookupByLibrary.simpleMessage("الحساب"),
    "activeSubmissionsCount": m0,
    "activeSubmissionsTitle": MessageLookupByLibrary.simpleMessage(
      "طلبات التقديم النشطة",
    ),
    "addBookmark": MessageLookupByLibrary.simpleMessage("حفظ الفعالية"),
    "allTopicsSummary": m1,
    "appTitle": MessageLookupByLibrary.simpleMessage("إيفنتي 360"),
    "authResearcherBadge": MessageLookupByLibrary.simpleMessage(
      "وصول الباحث عبر التطبيق",
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
      "أضف بياناتك المهنية وموقعك مرة واحدة لتبقى بقية التجربة أدق وأكثر ملاءمة لمسارك البحثي.",
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
      "استعدنا مسودتك الحالية لتتمكن من المتابعة من دون إعادة إدخال البيانات.",
    ),
    "editProfileBody": MessageLookupByLibrary.simpleMessage(
      "حدِّث هويتك العلمية ومؤسستك وصفَتَك الأكاديمية وموقعك لضمان سلاسة مسارات الفعاليات والتوثيق.",
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
      "افتح المواد البصرية والملفات المساندة الخاصة بالفعالية كما تظهر في الويب.",
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
      "استخدم موضوعات الفعالية وموقعها كفحص سريع للملاءمة، ثم تابع فقط إذا كانت الدعوة مناسبة لعملك.",
    ),
    "eventEligibilityTitle": MessageLookupByLibrary.simpleMessage(
      "الملاءمة والأهلية",
    ),
    "eventEndsLabel": MessageLookupByLibrary.simpleMessage("نهاية الفعالية"),
    "eventFeeLabel": MessageLookupByLibrary.simpleMessage("الرسوم"),
    "eventFormatLabel": MessageLookupByLibrary.simpleMessage("الصيغة"),
    "eventFreeLabel": MessageLookupByLibrary.simpleMessage("مجاني"),
    "eventHeaderSummaryBody": MessageLookupByLibrary.simpleMessage(
      "راجع الجهة المنظمة والبيانات الأساسية والحالة والتكلفة قبل التعمق في تفاصيل النداء.",
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
      "المتحدثون والمحاضرات الرئيسية",
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
    "eventTopicsSectionTitle": MessageLookupByLibrary.simpleMessage(
      "الموضوعات",
    ),
    "eventTypeLabel": MessageLookupByLibrary.simpleMessage("نوع الفعالية"),
    "eventVerdictDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "آخر موعد للقرار النهائي",
    ),
    "eventWhoOrganizesTitle": MessageLookupByLibrary.simpleMessage(
      "من ينظم هذه الفعالية",
    ),
    "eventsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "تصفح النداءات القادمة، وضيّق القائمة إلى الموضوعات المناسبة، وافتح الفعالية المناسبة عندما تصبح مستعدًا للتقديم.",
    ),
    "eventsSearchHint": MessageLookupByLibrary.simpleMessage(
      "ابحث عن الفعاليات بالاسم أو الموقع",
    ),
    "eventsTitle": MessageLookupByLibrary.simpleMessage("الفعاليات"),
    "eventsTopicFilterBody": MessageLookupByLibrary.simpleMessage(
      "اختر المجالات البحثية التي تريد ظهورها في الاكتشاف، ثم عد إلى هنا عند الحاجة إلى تضييق النتائج.",
    ),
    "existingSubmissionRedirectBody": MessageLookupByLibrary.simpleMessage(
      "لقد بدأت بالفعل طلب تقديم لهذه الفعالية، لذلك أعدناك إلى السجل الحالي بدلًا من إنشاء طلب مكرر.",
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
      "تصفية الموضوعات",
    ),
    "forgotPassword": MessageLookupByLibrary.simpleMessage(
      "هل نسيت كلمة المرور؟",
    ),
    "fullName": MessageLookupByLibrary.simpleMessage("الاسم الكامل"),
    "fullPaperDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "الموعد النهائي للبحث الكامل",
    ),
    "genericError": MessageLookupByLibrary.simpleMessage(
      "حدث خطأ ما. حاول مرة أخرى.",
    ),
    "getDirectionsAction": MessageLookupByLibrary.simpleMessage(
      "عرض الاتجاهات",
    ),
    "getStarted": MessageLookupByLibrary.simpleMessage("ابدأ الآن"),
    "haveAccountSignIn": MessageLookupByLibrary.simpleMessage(
      "لديك حساب بالفعل؟ سجل الدخول",
    ),
    "homeAttentionTitle": MessageLookupByLibrary.simpleMessage("إجراء مطلوب"),
    "homeDiscoverEventsBody": MessageLookupByLibrary.simpleMessage(
      "تصفح الفرص المتاحة، واحفظ ما يهمك، وابدأ طلب التقديم من الفعالية المناسبة.",
    ),
    "homeHeroBody": MessageLookupByLibrary.simpleMessage(
      "اعرف ما يحتاج إلى اهتمامك الآن، وواصل عملك الحالي، وانتقل إلى المسار الصحيح من دون ازدحام.",
    ),
    "homeHeroTitle": MessageLookupByLibrary.simpleMessage("يومك البحثي منظَّم"),
    "homeManageAccountBody": MessageLookupByLibrary.simpleMessage(
      "عدّل التفضيلات وحالة الثقة وإعدادات تسجيل الدخول من وجهة ثابتة واحدة.",
    ),
    "homeNextActionTitle": MessageLookupByLibrary.simpleMessage(
      "الخطوة الأنسب الآن",
    ),
    "homeOverviewBody": MessageLookupByLibrary.simpleMessage(
      "تابع حالة حسابك والمواعيد النهائية المهمة وطلباتك البحثية وأدوات الباحث من مركز تحكم واحد منظم.",
    ),
    "homeQuickLinksBody": MessageLookupByLibrary.simpleMessage(
      "انتقل إلى أهم أقسام الباحث من دون تحويل الصفحة الرئيسية إلى قائمة مزدحمة.",
    ),
    "homeQuickLinksTitle": MessageLookupByLibrary.simpleMessage("روابط سريعة"),
    "homeResumeSubmissionBody": MessageLookupByLibrary.simpleMessage(
      "راجع طلبات التقديم النشطة وواصل الخطوة المطلوبة التالية.",
    ),
    "homeSavedEventsBody": MessageLookupByLibrary.simpleMessage(
      "ارجع إلى الفعاليات التي حفظتها عندما تقرر ما الذي ستتقدم إليه لاحقاً.",
    ),
    "homeStateSummaryBody": MessageLookupByLibrary.simpleMessage(
      "أبقِ حالة التوثيق والاشتراك والمواعيد النهائية وطلبات التقديم واضحة أمامك في لمحة واحدة.",
    ),
    "homeStateSummaryTitle": MessageLookupByLibrary.simpleMessage("الحالة"),
    "homeSubscriptionAttentionBody": MessageLookupByLibrary.simpleMessage(
      "الوصول المميز غير مفعل حاليًا. أكمل إجراءات الفوترة من قسم الحساب عند حاجتك إلى المكتبة أو مزايا الباحث المميزة.",
    ),
    "homeSubtitle": MessageLookupByLibrary.simpleMessage(
      "لوحة التحكم الخاصة بك جاهزة.",
    ),
    "homeTitle": MessageLookupByLibrary.simpleMessage("لوحة الباحث"),
    "homeVerificationAttentionBody": MessageLookupByLibrary.simpleMessage(
      "لم يكتمل توثيق حسابك بعد. أكمله من قسم الحساب حتى تظل المسارات التي تتطلب التوثيق متاحة لك.",
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
    "loading": MessageLookupByLibrary.simpleMessage("جارٍ التحميل..."),
    "location": MessageLookupByLibrary.simpleMessage("الموقع"),
    "locationCopiedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم نسخ الموقع.",
    ),
    "manageTopicsAction": MessageLookupByLibrary.simpleMessage(
      "إدارة موضوعات التنبيه",
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
      "لا توجد طلبات تقديم.",
    ),
    "noUpcomingDeadline": MessageLookupByLibrary.simpleMessage(
      "لا توجد مواعيد نهائية قادمة",
    ),
    "notVerifiedStatus": MessageLookupByLibrary.simpleMessage("غير موثَّق"),
    "notificationEducationBody": MessageLookupByLibrary.simpleMessage(
      "سنطلب إذن الإشعارات فقط بعد الاشتراك في الموضوعات.",
    ),
    "notificationEducationTitle": MessageLookupByLibrary.simpleMessage(
      "إعداد الإشعارات",
    ),
    "notificationPermissionUpdated": MessageLookupByLibrary.simpleMessage(
      "تم تحديث تفضيل الإشعارات.",
    ),
    "notificationPreferencesBody": MessageLookupByLibrary.simpleMessage(
      "أدر تنبيهات الموضوعات من هنا، وافتح إعدادات النظام إذا كانت الإشعارات محظورة على جهازك.",
    ),
    "notificationPreferencesTitle": MessageLookupByLibrary.simpleMessage(
      "تفضيلات الإشعارات",
    ),
    "notificationsDisabledBody": MessageLookupByLibrary.simpleMessage(
      "فعّل الإشعارات لتصلك التنبيهات البحثية المهمة في الوقت المناسب.",
    ),
    "notificationsEnabledBody": MessageLookupByLibrary.simpleMessage(
      "تصلك تنبيهات الموضوعات فور اشتراكك في المجالات البحثية ذات الصلة.",
    ),
    "notificationsEnabledStatus": MessageLookupByLibrary.simpleMessage(
      "الإشعارات مفعلة",
    ),
    "notificationsNotEnabledStatus": MessageLookupByLibrary.simpleMessage(
      "الإشعارات غير مفعلة",
    ),
    "onboardingBody": MessageLookupByLibrary.simpleMessage(
      "أنجز مسارك البحثي من الهاتف بخطوات أقل ووضوح أكبر.",
    ),
    "onboardingStepDiscoverBody": MessageLookupByLibrary.simpleMessage(
      "ابحث عن الفعاليات الملائمة، وصفِّ النتائج، واحفظ ما يوافق اهتماماتك ومواعيدك النهائية.",
    ),
    "onboardingStepDiscoverTitle": MessageLookupByLibrary.simpleMessage(
      "اكتشف الفعاليات المناسبة بسرعة",
    ),
    "onboardingStepNotifyBody": MessageLookupByLibrary.simpleMessage(
      "نطلب إذن الإشعارات فقط عند اشتراكك في الموضوعات حتى تبقى الطلبات مرتبطة بالسياق.",
    ),
    "onboardingStepNotifyTitle": MessageLookupByLibrary.simpleMessage(
      "ابقَ على اطلاع بتنبيهات في وقتها",
    ),
    "onboardingStepSubmitBody": MessageLookupByLibrary.simpleMessage(
      "تابع الملخصات والبحوث الكاملة والمراجعات ضمن مسار واحد واضح المراحل والحالة.",
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
      "اعرض هنا إثباتات الدفع التي أرسلتها سابقًا وقرار المراجعة المرتبط بكل واحد منها.",
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
      "قيد المراجعة",
    ),
    "paymentRejectedStatus": MessageLookupByLibrary.simpleMessage("مرفوض"),
    "paymentReportActivationHint": MessageLookupByLibrary.simpleMessage(
      "سيساعد هذا التقرير على تفعيل الوصول المميز بعد اكتمال التوثيق.",
    ),
    "paymentReportRenewalHint": MessageLookupByLibrary.simpleMessage(
      "سيُعامل هذا التقرير على أنه إجراء تجديد أو استمرار لاشتراكك الحالي.",
    ),
    "paymentTrustFlowHint": MessageLookupByLibrary.simpleMessage(
      "راجع من هنا حالة اشتراكك الحالية، ثم أرسل إثبات دفع جديدًا كلما احتجت إلى تفعيل الوصول أو تجديده.",
    ),
    "paymentVerifiedStatus": MessageLookupByLibrary.simpleMessage("مُعتمَد"),
    "phoneLabel": MessageLookupByLibrary.simpleMessage("الهاتف"),
    "pickFileAction": MessageLookupByLibrary.simpleMessage("اختر ملفًا"),
    "pickProofDocument": MessageLookupByLibrary.simpleMessage(
      "اختر وثيقة الإثبات",
    ),
    "pickVerificationDocument": MessageLookupByLibrary.simpleMessage(
      "اختر وثيقة التوثيق",
    ),
    "preferencesBody": MessageLookupByLibrary.simpleMessage(
      "اختر اللغة والمظهر وآلية التنبيهات من دون مغادرة مسارك الأساسي داخل التطبيق.",
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
      "إزالة من المحفوظات",
    ),
    "reportPaymentBody": MessageLookupByLibrary.simpleMessage(
      "أرسل مبلغ الدفع وطريقته ووثيقة الإثبات حتى يتمكن الفريق من التحقق من تفعيل اشتراكك.",
    ),
    "reportPaymentOverviewBody": MessageLookupByLibrary.simpleMessage(
      "أرسل تفاصيل الفوترة ووثيقة الإثبات ليتمكن الفريق من التحقق من تفعيل اشتراكك بسرعة ودقة.",
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
      "العودة إلى المكتبة",
    ),
    "repositoryContextTitle": MessageLookupByLibrary.simpleMessage(
      "سياق المكتبة",
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
      "استخدم هذه الشاشة لتأكيد هوية البحث وطبيعة الملف ومؤشرات الاستخدام قبل التنزيل.",
    ),
    "repositoryDownloadSectionTitle": MessageLookupByLibrary.simpleMessage(
      "التنزيل",
    ),
    "repositoryDownloadsLabel": MessageLookupByLibrary.simpleMessage(
      "التنزيلات",
    ),
    "repositoryEmptyState": MessageLookupByLibrary.simpleMessage(
      "لا توجد أبحاث تطابق معايير التصفية الحالية.",
    ),
    "repositoryFilterBody": MessageLookupByLibrary.simpleMessage(
      "صفِّ النتائج حسب البحث أو المؤلف أو الموضوع أو الولاية حتى تبدو المكتبة منسقة لا مزدحمة.",
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
      "افتح قسم الحساب، وراجع حالة الاشتراك، ثم أرسل إثبات دفع لتفعيل الوصول أو تجديده قبل العودة إلى هنا.",
    ),
    "repositoryProtectedDownloadBody": MessageLookupByLibrary.simpleMessage(
      "تُتبع عمليات التنزيل وتُفتح من مرجع ملف محمي حتى يظل الوصول متوافقًا مع قواعد الاشتراك.",
    ),
    "repositoryReadyToDownload": MessageLookupByLibrary.simpleMessage(
      "جاهز للتنزيل",
    ),
    "repositorySearchHint": MessageLookupByLibrary.simpleMessage(
      "ابحث في الأبحاث أو الفعاليات أو الباحثين",
    ),
    "repositorySubscriptionRequiredBody": MessageLookupByLibrary.simpleMessage(
      "المكتبة متاحة فقط عندما يكون الوصول المميز أو التجريبي مفعلًا.",
    ),
    "repositorySubscriptionRequiredTitle": MessageLookupByLibrary.simpleMessage(
      "الوصول المميز مطلوب",
    ),
    "repositoryTitle": MessageLookupByLibrary.simpleMessage("المكتبة"),
    "repositoryViewsLabel": MessageLookupByLibrary.simpleMessage("المشاهدات"),
    "requiredField": MessageLookupByLibrary.simpleMessage("هذا الحقل مطلوب."),
    "researcherAccessBody": MessageLookupByLibrary.simpleMessage(
      "انتقل إلى الملف الشخصي والأمان والتوثيق والفعاليات المحفوظة من قسم واحد منظم.",
    ),
    "researcherAccessTitle": MessageLookupByLibrary.simpleMessage(
      "الملف الشخصي والوصول",
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
      "مراجعة طلبات التقديم",
    ),
    "revisionNotesLabel": MessageLookupByLibrary.simpleMessage(
      "ملاحظات المراجعة (اختياري)",
    ),
    "saveProfileAction": MessageLookupByLibrary.simpleMessage(
      "حفظ الملف الشخصي",
    ),
    "savedEventsBody": MessageLookupByLibrary.simpleMessage(
      "ارجع إلى الفعاليات التي حفظتها من دون إعادة بناء البحث من جديد.",
    ),
    "savedEventsEmptyState": MessageLookupByLibrary.simpleMessage(
      "لم تقم بحفظ أي فعاليات بعد.",
    ),
    "savedEventsShortTitle": MessageLookupByLibrary.simpleMessage("المحفوظة"),
    "savedEventsTitle": MessageLookupByLibrary.simpleMessage(
      "الفعاليات المحفوظة",
    ),
    "secureDocsBody": MessageLookupByLibrary.simpleMessage(
      "تُرفع مستندات التوثيق والدفع عبر طلبات موثقة، وتُفحَص قبل الرفع، ثم تُفتح لاحقًا بروابط موقعة قصيرة العمر.",
    ),
    "secureDocsTitle": MessageLookupByLibrary.simpleMessage(
      "معالجة المستندات الحساسة",
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
      "راجع كلمة المرور ووسائل حماية الحساب من شاشة أمان مخصصة وواضحة.",
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
      "ادخل إلى الفعاليات وطلبات التقديم ومسارات التوثيق والمكتبة من مساحة عمل واحدة مركزة على الهاتف.",
    ),
    "signInHeroTitle": MessageLookupByLibrary.simpleMessage(
      "عد إلى مسارك البحثي بسرعة",
    ),
    "signOut": MessageLookupByLibrary.simpleMessage("تسجيل الخروج"),
    "signUp": MessageLookupByLibrary.simpleMessage("إنشاء حساب"),
    "signUpHeroBody": MessageLookupByLibrary.simpleMessage(
      "ابدأ ببيانات دخول آمنة، ثم أكمل ملفك الشخصي ومسار التوثيق داخل التطبيق.",
    ),
    "signUpHeroTitle": MessageLookupByLibrary.simpleMessage("أنشئ حسابك كباحث"),
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
      "وصل هذا الطلب إلى حالته النهائية المكتملة. يمكنك الاحتفاظ بهذه الصفحة كسجل لما تم تسليمه.",
    ),
    "statusNarrativeFullPaperAccepted": MessageLookupByLibrary.simpleMessage(
      "تم قبول البحث الكامل. يبقى هذا الطلب في وضع جيد ما لم تتواصل معك الجهة المنظمة مرة أخرى.",
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
      "تفاصيل طلب التقديم غير متاحة.",
    ),
    "submissionDetailOverviewBody": MessageLookupByLibrary.simpleMessage(
      "راجع سجل طلب التقديم هذا ومواعيده وملفاته المرفوعة وملاحظات المراجعين والخطوة المطلوبة التالية.",
    ),
    "submissionDetailTitle": MessageLookupByLibrary.simpleMessage(
      "تفاصيل طلب التقديم",
    ),
    "submissionFeedbackBody": MessageLookupByLibrary.simpleMessage(
      "اعرض ملاحظات المراجعين هنا منفصلة عن الإجراءات حتى تبقى الخطوة التالية واضحة.",
    ),
    "submissionFeedbackTitle": MessageLookupByLibrary.simpleMessage(
      "الملاحظات",
    ),
    "submissionFilesBody": MessageLookupByLibrary.simpleMessage(
      "راجع تفاصيل الملف المرفوع هنا بدلاً من الاعتماد على رابط تخزين خام.",
    ),
    "submissionFilesTitle": MessageLookupByLibrary.simpleMessage("ملف التقديم"),
    "submissionStatusLabel": MessageLookupByLibrary.simpleMessage("الحالة"),
    "submissionTimelineTitle": MessageLookupByLibrary.simpleMessage(
      "الجدول الزمني للحالة والملاحظات",
    ),
    "submissionTitleArLabel": MessageLookupByLibrary.simpleMessage(
      "العنوان (العربية)",
    ),
    "submissionTitleEnLabel": MessageLookupByLibrary.simpleMessage(
      "العنوان (الإنجليزية - اختياري)",
    ),
    "submissionsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "تابع سجلاتك النشطة، واعرف ما الذي تغير، وواصل فقط الطلب الذي يحتاج إلى خطوة الآن.",
    ),
    "submissionsStartFromEventBody": MessageLookupByLibrary.simpleMessage(
      "ابدأ كل ملخص جديد من الفعالية المرتبطة به حتى يبقى النداء والموعد النهائي والسياق مرتبطين بطلب التقديم منذ البداية.",
    ),
    "submissionsTitle": MessageLookupByLibrary.simpleMessage("طلبات التقديم"),
    "submitAbstractAction": MessageLookupByLibrary.simpleMessage(
      "تقديم الملخص",
    ),
    "submitAbstractOverviewBody": MessageLookupByLibrary.simpleMessage(
      "جهّز البيانات الأساسية والملخصات المطلوبة لإنشاء طلب تقديم أولي منظم.",
    ),
    "submitAbstractTitle": MessageLookupByLibrary.simpleMessage("تقديم الملخص"),
    "submitFullPaperAction": MessageLookupByLibrary.simpleMessage(
      "تقديم البحث الكامل",
    ),
    "submitFullPaperOverviewBody": MessageLookupByLibrary.simpleMessage(
      "ارفع ملف البحث النهائي إلى سجل طلب التقديم الموافق عليه من دون فقدان السياق.",
    ),
    "submitFullPaperTitle": MessageLookupByLibrary.simpleMessage(
      "تقديم البحث الكامل",
    ),
    "submitPaymentReportAction": MessageLookupByLibrary.simpleMessage(
      "إرسال تقرير الدفع",
    ),
    "submitRevisionAction": MessageLookupByLibrary.simpleMessage(
      "تقديم التعديلات",
    ),
    "submitRevisionOverviewBody": MessageLookupByLibrary.simpleMessage(
      "أرسل النسخة المعدلة وأي ملاحظات مطلوبة من المراجعين في خطوة واحدة مركزة.",
    ),
    "submitRevisionTitle": MessageLookupByLibrary.simpleMessage(
      "تقديم التعديلات",
    ),
    "submitVerificationRequest": MessageLookupByLibrary.simpleMessage(
      "إرسال طلب التوثيق",
    ),
    "submittedOnLabel": MessageLookupByLibrary.simpleMessage("تاريخ التقديم"),
    "subscriptionActive": MessageLookupByLibrary.simpleMessage(
      "اشتراك مميز نشط",
    ),
    "subscriptionActiveHeadline": MessageLookupByLibrary.simpleMessage(
      "وصولك المميز مفعل حاليًا.",
    ),
    "subscriptionBankReference": m5,
    "subscriptionCancelledHeadline": MessageLookupByLibrary.simpleMessage(
      "أُلغي اشتراكك.",
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
      "راجع مستوى الوصول الحالي، وتحقق من الحاجة إلى التجديد، ثم أرسل إثبات الدفع التالي من دون مغادرة قسم الحساب.",
    ),
    "subscriptionRecommendedPrice": m7,
    "subscriptionStatusTitle": MessageLookupByLibrary.simpleMessage(
      "حالة الاشتراك",
    ),
    "subscriptionTrialHeadline": MessageLookupByLibrary.simpleMessage(
      "فترة التجربة مفعلة حاليًا.",
    ),
    "themeDark": MessageLookupByLibrary.simpleMessage("داكن"),
    "themeLight": MessageLookupByLibrary.simpleMessage("فاتح"),
    "themePreferenceTitle": MessageLookupByLibrary.simpleMessage("المظهر"),
    "themeSystem": MessageLookupByLibrary.simpleMessage("تلقائي (حسب النظام)"),
    "themeUpdatedSuccess": MessageLookupByLibrary.simpleMessage(
      "تم تحديث المظهر.",
    ),
    "topicSubscriptionHint": MessageLookupByLibrary.simpleMessage(
      "اشترك في الموضوعات لتصلك التنبيهات في وقتها.",
    ),
    "topicSubscriptionsBody": MessageLookupByLibrary.simpleMessage(
      "حدِّد الموضوعات البحثية التي تريد متابعتها وتلقّي التنبيهات عنها.",
    ),
    "topicSubscriptionsEmptyState": MessageLookupByLibrary.simpleMessage(
      "لا توجد موضوعات متاحة حاليًا.",
    ),
    "topicSubscriptionsManageBody": MessageLookupByLibrary.simpleMessage(
      "اختر الموضوعات التي ترغب في متابعتها. نطلب إذن الإشعارات عند الاشتراك فقط حتى يبقى الطلب في سياقه المناسب.",
    ),
    "topicSubscriptionsManageTitle": MessageLookupByLibrary.simpleMessage(
      "إدارة موضوعات التنبيه",
    ),
    "topicSubscriptionsTitle": MessageLookupByLibrary.simpleMessage(
      "اشتراكات الموضوعات",
    ),
    "trustCenterTitle": MessageLookupByLibrary.simpleMessage(
      "التوثيق والفوترة",
    ),
    "trustOverviewBody": MessageLookupByLibrary.simpleMessage(
      "ارفع وثائق التوثيق، وراجع تقارير الدفع، وأدر الوصول المميز من مكان واحد آمن.",
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
      "تمت الموافقة على توثيقك كباحث، ويمكنك متابعة استخدام المسارات المخصصة للحسابات الموثَّقة.",
    ),
    "verificationCenterTitle": MessageLookupByLibrary.simpleMessage("التوثيق"),
    "verificationPendingBody": MessageLookupByLibrary.simpleMessage(
      "طلب التوثيق الخاص بك قيد المراجعة. سنحتفظ بآخر وثيقة مرفوعة حتى يكتمل التقييم.",
    ),
    "verificationPendingStatus": MessageLookupByLibrary.simpleMessage(
      "قيد المراجعة",
    ),
    "verificationRejectedStatus": MessageLookupByLibrary.simpleMessage("مرفوض"),
    "verificationRequiredBody": MessageLookupByLibrary.simpleMessage(
      "ارفع وثيقة إثبات واضحة لبدء مراجعة التوثيق.",
    ),
    "verificationStatusTitle": MessageLookupByLibrary.simpleMessage(
      "حالة التوثيق",
    ),
    "verifiedStatus": MessageLookupByLibrary.simpleMessage("موثَّق"),
    "viewProofDocument": MessageLookupByLibrary.simpleMessage(
      "عرض وثيقة الإثبات",
    ),
    "viewSubmissionAction": MessageLookupByLibrary.simpleMessage(
      "عرض طلب التقديم",
    ),
    "viewTopicsAction": MessageLookupByLibrary.simpleMessage("عرض الموضوعات"),
    "viewUploadedDocument": MessageLookupByLibrary.simpleMessage(
      "عرض الوثيقة المرفوعة",
    ),
    "websiteLabel": MessageLookupByLibrary.simpleMessage("الموقع الإلكتروني"),
    "wilayaLabel": MessageLookupByLibrary.simpleMessage("الولاية"),
  };
}
