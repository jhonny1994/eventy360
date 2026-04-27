// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a en locale. All the
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
  String get localeName => 'en';

  static String m0(count) => "${count} active submissions";

  static String m1(date) =>
      "Abstract submissions for this event currently point to ${date} as the next visible deadline.";

  static String m2(email) =>
      "Send a secure reset link to ${email} if you want to change your password from email.";

  static String m3(bankName) => "Current bank reference: ${bankName}.";

  static String m4(count) => "${count} days remaining";

  static String m5(amount, currency, billingPeriod) =>
      "Recommended amount: ${amount} ${currency} for ${billingPeriod}.";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "abstractArLabel": MessageLookupByLibrary.simpleMessage(
      "Abstract (Arabic)",
    ),
    "abstractDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "Abstract deadline",
    ),
    "abstractEnLabel": MessageLookupByLibrary.simpleMessage(
      "Abstract (English, optional)",
    ),
    "abstractWriteGuidance": MessageLookupByLibrary.simpleMessage(
      "Start from the right event, keep titles clear, and submit only when this abstract is the one you want tracked for that call.",
    ),
    "academicPositionLabel": MessageLookupByLibrary.simpleMessage(
      "Academic position",
    ),
    "accountActionsTitle": MessageLookupByLibrary.simpleMessage(
      "Account actions",
    ),
    "accountCreated": MessageLookupByLibrary.simpleMessage(
      "Account created successfully.",
    ),
    "accountHeroBody": MessageLookupByLibrary.simpleMessage(
      "Manage trust, preferences, language, theme, and alerts from one clear place.",
    ),
    "accountHeroTitle": MessageLookupByLibrary.simpleMessage(
      "Control your researcher experience",
    ),
    "accountOverviewTitle": MessageLookupByLibrary.simpleMessage(
      "Account overview",
    ),
    "accountTitle": MessageLookupByLibrary.simpleMessage("Account"),
    "activeSubmissionsCount": m0,
    "activeSubmissionsTitle": MessageLookupByLibrary.simpleMessage(
      "Active submissions",
    ),
    "addBookmark": MessageLookupByLibrary.simpleMessage("Add bookmark"),
    "appTitle": MessageLookupByLibrary.simpleMessage("Eventy360"),
    "authResearcherBadge": MessageLookupByLibrary.simpleMessage(
      "Researcher mobile access",
    ),
    "backToSignIn": MessageLookupByLibrary.simpleMessage("Back to sign in"),
    "billingPeriodAnnual": MessageLookupByLibrary.simpleMessage("Annual"),
    "billingPeriodBiannual": MessageLookupByLibrary.simpleMessage("Biannual"),
    "billingPeriodLabel": MessageLookupByLibrary.simpleMessage(
      "Billing period",
    ),
    "billingPeriodMonthly": MessageLookupByLibrary.simpleMessage("Monthly"),
    "billingPeriodQuarterly": MessageLookupByLibrary.simpleMessage("Quarterly"),
    "cancelAction": MessageLookupByLibrary.simpleMessage("Cancel"),
    "completeProfileBody": MessageLookupByLibrary.simpleMessage(
      "Before using researcher features, complete your profile details.",
    ),
    "completeProfileHeroBody": MessageLookupByLibrary.simpleMessage(
      "Add your professional details and location once so the rest of the mobile experience can stay personalized and accurate.",
    ),
    "completeProfileTitle": MessageLookupByLibrary.simpleMessage(
      "Complete Your Profile",
    ),
    "confirmPassword": MessageLookupByLibrary.simpleMessage("Confirm password"),
    "continueAction": MessageLookupByLibrary.simpleMessage("Continue"),
    "createAccount": MessageLookupByLibrary.simpleMessage("Create account"),
    "dairaLabel": MessageLookupByLibrary.simpleMessage("Daira"),
    "deadline": MessageLookupByLibrary.simpleMessage("Deadline"),
    "draftRestoredMessage": MessageLookupByLibrary.simpleMessage(
      "We restored your in-progress draft so you can continue without rebuilding the form.",
    ),
    "editProfileBody": MessageLookupByLibrary.simpleMessage(
      "Keep your name, institution, academic role, and location accurate so event and trust workflows stay aligned.",
    ),
    "editProfileTitle": MessageLookupByLibrary.simpleMessage("Edit profile"),
    "email": MessageLookupByLibrary.simpleMessage("Email"),
    "enableNotificationsAction": MessageLookupByLibrary.simpleMessage(
      "Enable notifications",
    ),
    "eventDecisionSupportBody": MessageLookupByLibrary.simpleMessage(
      "Check the deadline, fit, and organizer context first so you do not start the wrong workflow.",
    ),
    "eventDecisionSupportTitle": MessageLookupByLibrary.simpleMessage(
      "Before you submit",
    ),
    "eventDetailsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Review the event timing, location, topics, and next actions before bookmarking or submitting.",
    ),
    "eventDetailsTitle": MessageLookupByLibrary.simpleMessage("Event Details"),
    "eventEligibilityBody": MessageLookupByLibrary.simpleMessage(
      "Use the event topics and location as a quick fit check, then continue only if this call matches your work.",
    ),
    "eventEligibilityTitle": MessageLookupByLibrary.simpleMessage(
      "Eligibility and fit",
    ),
    "eventNotFound": MessageLookupByLibrary.simpleMessage(
      "Event was not found.",
    ),
    "eventOrganizerBody": MessageLookupByLibrary.simpleMessage(
      "If anything feels unclear, keep this screen as your source of truth before you commit a submission.",
    ),
    "eventOrganizerTitle": MessageLookupByLibrary.simpleMessage(
      "Organizer context",
    ),
    "eventSelectionLabel": MessageLookupByLibrary.simpleMessage("Event"),
    "eventTimelineBody": m1,
    "eventTimelineTitle": MessageLookupByLibrary.simpleMessage("Timeline"),
    "eventsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Browse upcoming calls, filter by topic, subscribe to what matters, and keep your shortlist moving.",
    ),
    "eventsSearchHint": MessageLookupByLibrary.simpleMessage(
      "Search events by name or location",
    ),
    "eventsTitle": MessageLookupByLibrary.simpleMessage("Discover Events"),
    "existingSubmissionRedirectBody": MessageLookupByLibrary.simpleMessage(
      "You already started a submission for this event, so we took you back to that record instead of creating a duplicate.",
    ),
    "exploreEvents": MessageLookupByLibrary.simpleMessage("Explore events"),
    "feedbackResearcherLabel": MessageLookupByLibrary.simpleMessage(
      "Researcher note",
    ),
    "feedbackReviewerLabel": MessageLookupByLibrary.simpleMessage(
      "Reviewer note",
    ),
    "fileOpenFailed": MessageLookupByLibrary.simpleMessage(
      "We could not open the file.",
    ),
    "filePickerHint": MessageLookupByLibrary.simpleMessage(
      "Choose a PDF, DOC, or DOCX file and we will upload it for you.",
    ),
    "fileReadFailed": MessageLookupByLibrary.simpleMessage(
      "We could not read the selected file.",
    ),
    "fileSizeLabel": MessageLookupByLibrary.simpleMessage("File size"),
    "fileTypeLabel": MessageLookupByLibrary.simpleMessage("File type"),
    "fileUrlLabel": MessageLookupByLibrary.simpleMessage("File URL"),
    "forgotPassword": MessageLookupByLibrary.simpleMessage("Forgot password?"),
    "fullName": MessageLookupByLibrary.simpleMessage("Full name"),
    "fullPaperDeadlineLabel": MessageLookupByLibrary.simpleMessage(
      "Full-paper deadline",
    ),
    "genericError": MessageLookupByLibrary.simpleMessage(
      "Something went wrong. Please try again.",
    ),
    "getStarted": MessageLookupByLibrary.simpleMessage("Get Started"),
    "haveAccountSignIn": MessageLookupByLibrary.simpleMessage(
      "Already have an account? Sign in",
    ),
    "homeDiscoverEventsBody": MessageLookupByLibrary.simpleMessage(
      "Browse live opportunities, bookmark what matters, and start a submission from the right event.",
    ),
    "homeHeroBody": MessageLookupByLibrary.simpleMessage(
      "See what needs attention now, continue your current work, and move into the right workflow without clutter.",
    ),
    "homeHeroTitle": MessageLookupByLibrary.simpleMessage(
      "Your research day is organized",
    ),
    "homeManageAccountBody": MessageLookupByLibrary.simpleMessage(
      "Adjust preferences, trust status, and sign-in settings from one stable destination.",
    ),
    "homeNextActionTitle": MessageLookupByLibrary.simpleMessage(
      "Next best action",
    ),
    "homeOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Track your account health, critical deadlines, submissions, and researcher tools from one calm control center.",
    ),
    "homeQuickLinksBody": MessageLookupByLibrary.simpleMessage(
      "Jump into your core researcher areas without turning home into a crowded menu.",
    ),
    "homeQuickLinksTitle": MessageLookupByLibrary.simpleMessage("Quick links"),
    "homeResumeSubmissionBody": MessageLookupByLibrary.simpleMessage(
      "Review your active submissions and continue the next required step.",
    ),
    "homeSavedEventsBody": MessageLookupByLibrary.simpleMessage(
      "Return to the events you bookmarked when you are deciding what to submit next.",
    ),
    "homeStateSummaryBody": MessageLookupByLibrary.simpleMessage(
      "Keep your trust, subscription, deadline, and submission state visible at a glance.",
    ),
    "homeStateSummaryTitle": MessageLookupByLibrary.simpleMessage(
      "Current status summary",
    ),
    "homeSubtitle": MessageLookupByLibrary.simpleMessage(
      "Your command center is ready.",
    ),
    "homeTitle": MessageLookupByLibrary.simpleMessage("Researcher Home"),
    "initialSetupContinueAction": MessageLookupByLibrary.simpleMessage(
      "Open my workspace",
    ),
    "initialSetupFinishBody": MessageLookupByLibrary.simpleMessage(
      "Once these basics feel right, continue into the full researcher experience with the stable tab bar.",
    ),
    "initialSetupFinishTitle": MessageLookupByLibrary.simpleMessage(
      "Move into the app shell",
    ),
    "initialSetupHeroBody": MessageLookupByLibrary.simpleMessage(
      "Choose how the app should look, read, and notify before you settle into the researcher shell.",
    ),
    "initialSetupHeroTitle": MessageLookupByLibrary.simpleMessage(
      "Finish the first-run setup with intention",
    ),
    "initialSetupLanguageBody": MessageLookupByLibrary.simpleMessage(
      "Pick the language you want to use across the mobile app from the first session.",
    ),
    "initialSetupThemeBody": MessageLookupByLibrary.simpleMessage(
      "Choose a default appearance now. You can still change it later from Account.",
    ),
    "initialSetupTitle": MessageLookupByLibrary.simpleMessage(
      "Set up your mobile workspace",
    ),
    "initialSetupTopicsBody": MessageLookupByLibrary.simpleMessage(
      "Subscribe to the topics you care about so discovery and notifications start from your real interests.",
    ),
    "initialSetupTopicsFootnote": MessageLookupByLibrary.simpleMessage(
      "You can keep refining these topics later without losing progress in the app.",
    ),
    "institution": MessageLookupByLibrary.simpleMessage("Institution"),
    "languageArabic": MessageLookupByLibrary.simpleMessage("Arabic"),
    "languageEnglish": MessageLookupByLibrary.simpleMessage("English"),
    "languagePreferenceTitle": MessageLookupByLibrary.simpleMessage("Language"),
    "lastUpdatedLabel": MessageLookupByLibrary.simpleMessage("Last updated"),
    "latestRequestLabel": MessageLookupByLibrary.simpleMessage(
      "Latest request",
    ),
    "loadMore": MessageLookupByLibrary.simpleMessage("Load more"),
    "loading": MessageLookupByLibrary.simpleMessage("Loading..."),
    "location": MessageLookupByLibrary.simpleMessage("Location"),
    "manageTopicsAction": MessageLookupByLibrary.simpleMessage(
      "Manage alert topics",
    ),
    "nearestDeadlineTitle": MessageLookupByLibrary.simpleMessage(
      "Nearest deadline",
    ),
    "newPassword": MessageLookupByLibrary.simpleMessage("New password"),
    "noEventsFound": MessageLookupByLibrary.simpleMessage("No events found."),
    "noFileSelected": MessageLookupByLibrary.simpleMessage("No file selected"),
    "noPaymentsFound": MessageLookupByLibrary.simpleMessage(
      "No payments found yet.",
    ),
    "noSubmissionsFound": MessageLookupByLibrary.simpleMessage(
      "No submissions found.",
    ),
    "noUpcomingDeadline": MessageLookupByLibrary.simpleMessage(
      "No upcoming deadlines",
    ),
    "notVerifiedStatus": MessageLookupByLibrary.simpleMessage("Not verified"),
    "notificationEducationBody": MessageLookupByLibrary.simpleMessage(
      "We will ask for notification permission only after you subscribe to topics.",
    ),
    "notificationEducationTitle": MessageLookupByLibrary.simpleMessage(
      "Notification setup",
    ),
    "notificationPreferencesBody": MessageLookupByLibrary.simpleMessage(
      "Control how the app handles topic alerts and open system settings if Android has already blocked notifications.",
    ),
    "notificationPreferencesTitle": MessageLookupByLibrary.simpleMessage(
      "Notification preferences",
    ),
    "notificationsDisabledBody": MessageLookupByLibrary.simpleMessage(
      "Enable notifications so important topic alerts can reach you on time.",
    ),
    "notificationsEnabledBody": MessageLookupByLibrary.simpleMessage(
      "Topic alerts are available when you subscribe to relevant subjects.",
    ),
    "notificationsEnabledStatus": MessageLookupByLibrary.simpleMessage(
      "Notifications enabled",
    ),
    "notificationsNotEnabledStatus": MessageLookupByLibrary.simpleMessage(
      "Notifications not enabled",
    ),
    "onboardingBody": MessageLookupByLibrary.simpleMessage(
      "Complete your researcher workflow from mobile with fewer steps.",
    ),
    "onboardingStepDiscoverBody": MessageLookupByLibrary.simpleMessage(
      "Search, filter, and bookmark opportunities that match your research focus and deadlines.",
    ),
    "onboardingStepDiscoverTitle": MessageLookupByLibrary.simpleMessage(
      "Discover relevant events faster",
    ),
    "onboardingStepNotifyBody": MessageLookupByLibrary.simpleMessage(
      "We request notification permission only when you subscribe to topics, so prompts remain contextual.",
    ),
    "onboardingStepNotifyTitle": MessageLookupByLibrary.simpleMessage(
      "Stay ahead with timely alerts",
    ),
    "onboardingStepSubmitBody": MessageLookupByLibrary.simpleMessage(
      "Track abstracts, full papers, and revisions in one guided flow with clear status visibility.",
    ),
    "onboardingStepSubmitTitle": MessageLookupByLibrary.simpleMessage(
      "Submit with fewer blockers",
    ),
    "onboardingTitle": MessageLookupByLibrary.simpleMessage(
      "Welcome to Eventy360",
    ),
    "openSubmissionFileAction": MessageLookupByLibrary.simpleMessage(
      "Open uploaded file",
    ),
    "openSystemSettingsAction": MessageLookupByLibrary.simpleMessage(
      "Open system settings",
    ),
    "password": MessageLookupByLibrary.simpleMessage("Password"),
    "passwordTooShort": MessageLookupByLibrary.simpleMessage(
      "Password must be at least 8 characters.",
    ),
    "passwordUpdatedSuccess": MessageLookupByLibrary.simpleMessage(
      "Password updated successfully.",
    ),
    "passwordsDoNotMatch": MessageLookupByLibrary.simpleMessage(
      "Passwords do not match.",
    ),
    "paymentAmountError": MessageLookupByLibrary.simpleMessage(
      "Enter a valid amount greater than zero.",
    ),
    "paymentAmountLabel": MessageLookupByLibrary.simpleMessage("Amount"),
    "paymentHistoryBody": MessageLookupByLibrary.simpleMessage(
      "These are the proofs you already submitted and the review decisions attached to each one.",
    ),
    "paymentHistoryTitle": MessageLookupByLibrary.simpleMessage(
      "Payment History",
    ),
    "paymentInstructionAccountHolderLabel":
        MessageLookupByLibrary.simpleMessage("Account holder"),
    "paymentInstructionBankLabel": MessageLookupByLibrary.simpleMessage("Bank"),
    "paymentInstructionEmailLabel": MessageLookupByLibrary.simpleMessage(
      "Payment contact email",
    ),
    "paymentInstructionRibLabel": MessageLookupByLibrary.simpleMessage(
      "RIB / account number",
    ),
    "paymentInstructionsTitle": MessageLookupByLibrary.simpleMessage(
      "Payment instructions",
    ),
    "paymentMethodBank": MessageLookupByLibrary.simpleMessage("Bank transfer"),
    "paymentMethodCash": MessageLookupByLibrary.simpleMessage("Cash"),
    "paymentMethodCheck": MessageLookupByLibrary.simpleMessage("Check"),
    "paymentMethodLabel": MessageLookupByLibrary.simpleMessage(
      "Payment method",
    ),
    "paymentMethodOnline": MessageLookupByLibrary.simpleMessage(
      "Online payment",
    ),
    "paymentNotesLabel": MessageLookupByLibrary.simpleMessage("Payer notes"),
    "paymentPendingStatus": MessageLookupByLibrary.simpleMessage(
      "Pending verification",
    ),
    "paymentRejectedStatus": MessageLookupByLibrary.simpleMessage("Rejected"),
    "paymentReportActivationHint": MessageLookupByLibrary.simpleMessage(
      "This payment report will help activate premium access after verification is complete.",
    ),
    "paymentReportRenewalHint": MessageLookupByLibrary.simpleMessage(
      "This payment report will be treated as a renewal or continuity action for your current subscription.",
    ),
    "paymentTrustFlowHint": MessageLookupByLibrary.simpleMessage(
      "Use this space to understand your current subscription state first, then report payment only when you have the right proof ready.",
    ),
    "paymentVerifiedStatus": MessageLookupByLibrary.simpleMessage("Verified"),
    "pickFileAction": MessageLookupByLibrary.simpleMessage("Choose file"),
    "pickProofDocument": MessageLookupByLibrary.simpleMessage(
      "Choose proof document",
    ),
    "pickVerificationDocument": MessageLookupByLibrary.simpleMessage(
      "Choose verification document",
    ),
    "preferencesBody": MessageLookupByLibrary.simpleMessage(
      "Adjust appearance, language, and alert behavior without leaving the app flow.",
    ),
    "preferencesTitle": MessageLookupByLibrary.simpleMessage("Preferences"),
    "profileBioLabel": MessageLookupByLibrary.simpleMessage("Short bio"),
    "profileCompleted": MessageLookupByLibrary.simpleMessage(
      "Profile completed",
    ),
    "profileIncomplete": MessageLookupByLibrary.simpleMessage(
      "Profile incomplete",
    ),
    "profileSavedSuccess": MessageLookupByLibrary.simpleMessage(
      "Profile updated successfully.",
    ),
    "profileStatus": MessageLookupByLibrary.simpleMessage("Profile status"),
    "referenceNumberLabel": MessageLookupByLibrary.simpleMessage(
      "Reference number",
    ),
    "rejectionReasonLabel": MessageLookupByLibrary.simpleMessage(
      "Rejection reason",
    ),
    "removeBookmark": MessageLookupByLibrary.simpleMessage("Remove bookmark"),
    "reportPaymentBody": MessageLookupByLibrary.simpleMessage(
      "Submit your payment amount, method, and proof so the team can verify your subscription access.",
    ),
    "reportPaymentOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Submit billing details and proof once so the team can validate your subscription access quickly and accurately.",
    ),
    "reportPaymentTitle": MessageLookupByLibrary.simpleMessage(
      "Report Payment",
    ),
    "reportedAtLabel": MessageLookupByLibrary.simpleMessage("Reported at"),
    "repositoryAbstractTitle": MessageLookupByLibrary.simpleMessage("Abstract"),
    "repositoryAllWilayas": MessageLookupByLibrary.simpleMessage("All wilayas"),
    "repositoryAuthorHint": MessageLookupByLibrary.simpleMessage(
      "Filter by author name",
    ),
    "repositoryBackAction": MessageLookupByLibrary.simpleMessage(
      "Back to repository",
    ),
    "repositoryContextTitle": MessageLookupByLibrary.simpleMessage(
      "Repository context",
    ),
    "repositoryDetailAction": MessageLookupByLibrary.simpleMessage(
      "View details",
    ),
    "repositoryDetailOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Review the paper context, abstract, and download package before opening the full document.",
    ),
    "repositoryDetailTitle": MessageLookupByLibrary.simpleMessage(
      "Paper Details",
    ),
    "repositoryDownloadAction": MessageLookupByLibrary.simpleMessage(
      "Download paper",
    ),
    "repositoryDownloadConfidenceBody": MessageLookupByLibrary.simpleMessage(
      "Use this screen to confirm the paper identity, file shape, and tracked usage before downloading.",
    ),
    "repositoryDownloadSectionTitle": MessageLookupByLibrary.simpleMessage(
      "Download",
    ),
    "repositoryDownloadsLabel": MessageLookupByLibrary.simpleMessage(
      "Downloads",
    ),
    "repositoryEmptyState": MessageLookupByLibrary.simpleMessage(
      "No papers matched your current filters.",
    ),
    "repositoryFilterBody": MessageLookupByLibrary.simpleMessage(
      "Filter by search, author, topic, and wilaya so the repository feels curated instead of noisy.",
    ),
    "repositoryNoFileAvailable": MessageLookupByLibrary.simpleMessage(
      "No downloadable file is available for this paper.",
    ),
    "repositoryOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Search premium research material, narrow by topic, and move from discovery to download without friction.",
    ),
    "repositoryPaperFileFallback": MessageLookupByLibrary.simpleMessage(
      "Paper file",
    ),
    "repositoryPremiumContextBody": MessageLookupByLibrary.simpleMessage(
      "Unlock repository access from Account, then return here once payment and review are in motion.",
    ),
    "repositoryProtectedDownloadBody": MessageLookupByLibrary.simpleMessage(
      "Downloads are tracked and opened from a protected file reference so access remains consistent with subscription rules.",
    ),
    "repositoryReadyToDownload": MessageLookupByLibrary.simpleMessage(
      "Ready to download",
    ),
    "repositorySearchHint": MessageLookupByLibrary.simpleMessage(
      "Search papers, events, or authors",
    ),
    "repositorySubscriptionRequiredBody": MessageLookupByLibrary.simpleMessage(
      "The repository is reserved for active premium or trial subscriptions.",
    ),
    "repositorySubscriptionRequiredTitle": MessageLookupByLibrary.simpleMessage(
      "Premium access is required",
    ),
    "repositoryTitle": MessageLookupByLibrary.simpleMessage(
      "Research Repository",
    ),
    "repositoryViewsLabel": MessageLookupByLibrary.simpleMessage("Views"),
    "requiredField": MessageLookupByLibrary.simpleMessage(
      "This field is required.",
    ),
    "researcherAccessBody": MessageLookupByLibrary.simpleMessage(
      "Review trust and access-related steps in focused screens when you need them.",
    ),
    "researcherAccessTitle": MessageLookupByLibrary.simpleMessage(
      "Researcher access",
    ),
    "resetEmailSent": MessageLookupByLibrary.simpleMessage(
      "Password reset email was sent.",
    ),
    "resetPassword": MessageLookupByLibrary.simpleMessage("Reset Password"),
    "resetPasswordHeroBody": MessageLookupByLibrary.simpleMessage(
      "Recover access securely with a reset link, or finish a password recovery session without losing context.",
    ),
    "retry": MessageLookupByLibrary.simpleMessage("Retry"),
    "reviewSubmissionsAction": MessageLookupByLibrary.simpleMessage(
      "Review submissions",
    ),
    "revisionNotesLabel": MessageLookupByLibrary.simpleMessage(
      "Revision notes (optional)",
    ),
    "saveProfileAction": MessageLookupByLibrary.simpleMessage("Save profile"),
    "savedEventsBody": MessageLookupByLibrary.simpleMessage(
      "Return to the events you shortlisted without rebuilding your search from scratch.",
    ),
    "savedEventsEmptyState": MessageLookupByLibrary.simpleMessage(
      "You have not bookmarked any events yet.",
    ),
    "savedEventsTitle": MessageLookupByLibrary.simpleMessage("Saved events"),
    "secureDocsBody": MessageLookupByLibrary.simpleMessage(
      "Verification and payment files are uploaded through authenticated requests, validated before upload, and opened later with short-lived signed links.",
    ),
    "secureDocsTitle": MessageLookupByLibrary.simpleMessage(
      "Sensitive document handling",
    ),
    "secureFileRequiredError": MessageLookupByLibrary.simpleMessage(
      "Choose a file before submitting.",
    ),
    "secureFileSizeError": MessageLookupByLibrary.simpleMessage(
      "The selected file exceeds the 10 MB limit.",
    ),
    "secureFileTypeError": MessageLookupByLibrary.simpleMessage(
      "Only PDF, JPG, or PNG files are allowed here.",
    ),
    "securityBody": MessageLookupByLibrary.simpleMessage(
      "Protect your account access and keep your credentials current from a dedicated security surface.",
    ),
    "securityDirectPasswordBody": MessageLookupByLibrary.simpleMessage(
      "If you are already signed in on this device, you can set a new password here immediately.",
    ),
    "securityResetBody": m2,
    "securityTitle": MessageLookupByLibrary.simpleMessage("Security"),
    "sendResetLink": MessageLookupByLibrary.simpleMessage("Send reset link"),
    "signIn": MessageLookupByLibrary.simpleMessage("Sign In"),
    "signInHeroBody": MessageLookupByLibrary.simpleMessage(
      "Access events, submissions, trust operations, and repository tools from one focused mobile workspace.",
    ),
    "signInHeroTitle": MessageLookupByLibrary.simpleMessage(
      "Return to your research flow",
    ),
    "signOut": MessageLookupByLibrary.simpleMessage("Sign Out"),
    "signUp": MessageLookupByLibrary.simpleMessage("Sign Up"),
    "signUpHeroBody": MessageLookupByLibrary.simpleMessage(
      "Start with secure credentials, then complete your researcher profile and verification path inside the app.",
    ),
    "signUpHeroTitle": MessageLookupByLibrary.simpleMessage(
      "Create your researcher access",
    ),
    "signedInAs": MessageLookupByLibrary.simpleMessage("Signed in as"),
    "skipAction": MessageLookupByLibrary.simpleMessage("Skip"),
    "somethingWentWrong": MessageLookupByLibrary.simpleMessage(
      "Something went wrong.",
    ),
    "statusAbstractAccepted": MessageLookupByLibrary.simpleMessage(
      "Abstract accepted",
    ),
    "statusAbstractRejected": MessageLookupByLibrary.simpleMessage(
      "Abstract rejected",
    ),
    "statusAbstractSubmitted": MessageLookupByLibrary.simpleMessage(
      "Abstract submitted",
    ),
    "statusCompleted": MessageLookupByLibrary.simpleMessage("Completed"),
    "statusFullPaperAccepted": MessageLookupByLibrary.simpleMessage(
      "Full paper accepted",
    ),
    "statusFullPaperRejected": MessageLookupByLibrary.simpleMessage(
      "Full paper rejected",
    ),
    "statusFullPaperSubmitted": MessageLookupByLibrary.simpleMessage(
      "Full paper submitted",
    ),
    "statusNarrativeAbstractAccepted": MessageLookupByLibrary.simpleMessage(
      "Your abstract is approved. The next important action is preparing the full paper before the paper deadline.",
    ),
    "statusNarrativeAbstractRejected": MessageLookupByLibrary.simpleMessage(
      "Your abstract was not accepted. Review any feedback here before deciding on your next event submission.",
    ),
    "statusNarrativeAbstractSubmitted": MessageLookupByLibrary.simpleMessage(
      "Your abstract is in review. No additional action is needed until the research team updates the verdict.",
    ),
    "statusNarrativeCompleted": MessageLookupByLibrary.simpleMessage(
      "This submission has reached its final completed state. You can keep this page as your record of what was delivered.",
    ),
    "statusNarrativeFullPaperAccepted": MessageLookupByLibrary.simpleMessage(
      "Your full paper was accepted. This submission is in a healthy state unless the event team contacts you again.",
    ),
    "statusNarrativeFullPaperRejected": MessageLookupByLibrary.simpleMessage(
      "Your full paper was rejected. Read the notes carefully before investing effort in another upload.",
    ),
    "statusNarrativeFullPaperSubmitted": MessageLookupByLibrary.simpleMessage(
      "Your full paper is on file and waiting for review. Keep an eye on feedback and deadline updates.",
    ),
    "statusNarrativeRevisionRequested": MessageLookupByLibrary.simpleMessage(
      "A revision is required. Use the notes below and submit the updated paper from this screen.",
    ),
    "statusNarrativeRevisionUnderReview": MessageLookupByLibrary.simpleMessage(
      "Your revision is uploaded and back under review. The latest notes remain visible below for context.",
    ),
    "statusRevisionRequested": MessageLookupByLibrary.simpleMessage(
      "Revision requested",
    ),
    "statusRevisionUnderReview": MessageLookupByLibrary.simpleMessage(
      "Revision under review",
    ),
    "submissionDetailMissing": MessageLookupByLibrary.simpleMessage(
      "Submission details are not available.",
    ),
    "submissionDetailOverviewBody": MessageLookupByLibrary.simpleMessage(
      "See the full lifecycle of this submission, including current status, abstract content, files, and timeline history.",
    ),
    "submissionDetailTitle": MessageLookupByLibrary.simpleMessage(
      "Submission Details",
    ),
    "submissionFeedbackBody": MessageLookupByLibrary.simpleMessage(
      "Keep reviewer feedback separate from your actions so the next step stays clear.",
    ),
    "submissionFeedbackTitle": MessageLookupByLibrary.simpleMessage("Feedback"),
    "submissionFilesBody": MessageLookupByLibrary.simpleMessage(
      "Review the uploaded file details here instead of relying on a raw storage URL.",
    ),
    "submissionFilesTitle": MessageLookupByLibrary.simpleMessage(
      "Submission file",
    ),
    "submissionStatusLabel": MessageLookupByLibrary.simpleMessage("Status"),
    "submissionTimelineTitle": MessageLookupByLibrary.simpleMessage(
      "Status and Feedback Timeline",
    ),
    "submissionTitleArLabel": MessageLookupByLibrary.simpleMessage(
      "Title (Arabic)",
    ),
    "submissionTitleEnLabel": MessageLookupByLibrary.simpleMessage(
      "Title (English, optional)",
    ),
    "submissionsOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Review active work, understand each status quickly, and keep your next submission action obvious.",
    ),
    "submissionsTitle": MessageLookupByLibrary.simpleMessage("My Submissions"),
    "submitAbstractAction": MessageLookupByLibrary.simpleMessage(
      "Submit abstract",
    ),
    "submitAbstractOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Prepare the core metadata and abstracts needed to create a clean initial submission.",
    ),
    "submitAbstractTitle": MessageLookupByLibrary.simpleMessage(
      "Submit Abstract",
    ),
    "submitFullPaperAction": MessageLookupByLibrary.simpleMessage(
      "Submit full paper",
    ),
    "submitFullPaperOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Upload the final paper file against the approved submission record without losing context.",
    ),
    "submitFullPaperTitle": MessageLookupByLibrary.simpleMessage(
      "Submit Full Paper",
    ),
    "submitPaymentReportAction": MessageLookupByLibrary.simpleMessage(
      "Submit payment report",
    ),
    "submitRevisionAction": MessageLookupByLibrary.simpleMessage(
      "Submit revision",
    ),
    "submitRevisionOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Send the revised paper and any notes requested by reviewers in one focused step.",
    ),
    "submitRevisionTitle": MessageLookupByLibrary.simpleMessage(
      "Submit Revision",
    ),
    "submitVerificationRequest": MessageLookupByLibrary.simpleMessage(
      "Submit verification request",
    ),
    "submittedOnLabel": MessageLookupByLibrary.simpleMessage("Submitted on"),
    "subscriptionActive": MessageLookupByLibrary.simpleMessage(
      "Premium subscription active",
    ),
    "subscriptionActiveHeadline": MessageLookupByLibrary.simpleMessage(
      "Your premium access is active.",
    ),
    "subscriptionBankReference": m3,
    "subscriptionCancelledHeadline": MessageLookupByLibrary.simpleMessage(
      "Your subscription was cancelled.",
    ),
    "subscriptionDaysRemaining": m4,
    "subscriptionExpiredHeadline": MessageLookupByLibrary.simpleMessage(
      "Your premium access has expired.",
    ),
    "subscriptionHistoryAction": MessageLookupByLibrary.simpleMessage(
      "Review history",
    ),
    "subscriptionInactive": MessageLookupByLibrary.simpleMessage(
      "No active premium subscription",
    ),
    "subscriptionOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Understand your current access, renewal urgency, and the right next billing action without leaving account flow.",
    ),
    "subscriptionRecommendedPrice": m5,
    "subscriptionStatusTitle": MessageLookupByLibrary.simpleMessage(
      "Subscription status",
    ),
    "subscriptionTrialHeadline": MessageLookupByLibrary.simpleMessage(
      "Your trial access is active.",
    ),
    "themeDark": MessageLookupByLibrary.simpleMessage("Dark"),
    "themeLight": MessageLookupByLibrary.simpleMessage("Light"),
    "themePreferenceTitle": MessageLookupByLibrary.simpleMessage("Theme"),
    "themeSystem": MessageLookupByLibrary.simpleMessage("Follow system"),
    "topicSubscriptionHint": MessageLookupByLibrary.simpleMessage(
      "Subscribe to topics to receive push alerts.",
    ),
    "topicSubscriptionsBody": MessageLookupByLibrary.simpleMessage(
      "Manage your research interests and notification topics.",
    ),
    "topicSubscriptionsEmptyState": MessageLookupByLibrary.simpleMessage(
      "No topics are available right now.",
    ),
    "topicSubscriptionsManageBody": MessageLookupByLibrary.simpleMessage(
      "Choose the topics you want to follow. We request notification permission when you subscribe so prompts stay contextual.",
    ),
    "topicSubscriptionsManageTitle": MessageLookupByLibrary.simpleMessage(
      "Manage alert topics",
    ),
    "topicSubscriptionsTitle": MessageLookupByLibrary.simpleMessage(
      "Topic subscriptions",
    ),
    "trustCenterTitle": MessageLookupByLibrary.simpleMessage("Trust Center"),
    "trustOverviewBody": MessageLookupByLibrary.simpleMessage(
      "Handle verification and payment evidence in a secure, transparent flow designed for researcher trust operations.",
    ),
    "unsupportedRoleBody": MessageLookupByLibrary.simpleMessage(
      "Eventy360 mobile currently supports researcher accounts only.",
    ),
    "unsupportedRoleOverviewBody": MessageLookupByLibrary.simpleMessage(
      "This mobile release is intentionally focused on researcher workflows, so unsupported accounts are stopped here instead of failing later.",
    ),
    "unsupportedRoleTitle": MessageLookupByLibrary.simpleMessage(
      "This account role is not supported on mobile",
    ),
    "updatePasswordAction": MessageLookupByLibrary.simpleMessage(
      "Update password",
    ),
    "updatePasswordTitle": MessageLookupByLibrary.simpleMessage(
      "Set a new password",
    ),
    "uploadGuidanceMessage": MessageLookupByLibrary.simpleMessage(
      "Upload PDF, DOC, or DOCX only. File guidance, size, and type stay visible here so the submission feels explicit and safe.",
    ),
    "verificationApprovedBody": MessageLookupByLibrary.simpleMessage(
      "Your researcher verification is approved. You can continue using verified researcher flows.",
    ),
    "verificationCenterTitle": MessageLookupByLibrary.simpleMessage(
      "Verification",
    ),
    "verificationPendingBody": MessageLookupByLibrary.simpleMessage(
      "Your verification request is pending review. We will keep your latest document on file until the review is completed.",
    ),
    "verificationPendingStatus": MessageLookupByLibrary.simpleMessage(
      "Pending review",
    ),
    "verificationRejectedStatus": MessageLookupByLibrary.simpleMessage(
      "Rejected",
    ),
    "verificationRequiredBody": MessageLookupByLibrary.simpleMessage(
      "Upload one clear proof document to start the verification review process.",
    ),
    "verificationStatusTitle": MessageLookupByLibrary.simpleMessage(
      "Verification status",
    ),
    "verifiedStatus": MessageLookupByLibrary.simpleMessage("Verified"),
    "viewProofDocument": MessageLookupByLibrary.simpleMessage(
      "View proof document",
    ),
    "viewUploadedDocument": MessageLookupByLibrary.simpleMessage(
      "View uploaded document",
    ),
    "wilayaLabel": MessageLookupByLibrary.simpleMessage("Wilaya"),
  };
}
