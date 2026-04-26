// GENERATED CODE - DO NOT MODIFY BY HAND
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'intl/messages_all.dart';

// **************************************************************************
// Generator: Flutter Intl IDE plugin
// Made by Localizely
// **************************************************************************

// ignore_for_file: non_constant_identifier_names, lines_longer_than_80_chars
// ignore_for_file: join_return_with_assignment, prefer_final_in_for_each
// ignore_for_file: avoid_redundant_argument_values, avoid_escaping_inner_quotes

class S {
  S();

  static S? _current;

  static S get current {
    assert(
      _current != null,
      'No instance of S was loaded. Try to initialize the S delegate before accessing S.current.',
    );
    return _current!;
  }

  static const AppLocalizationDelegate delegate = AppLocalizationDelegate();

  static Future<S> load(Locale locale) {
    final name = (locale.countryCode?.isEmpty ?? false)
        ? locale.languageCode
        : locale.toString();
    final localeName = Intl.canonicalizedLocale(name);
    return initializeMessages(localeName).then((_) {
      Intl.defaultLocale = localeName;
      final instance = S();
      S._current = instance;

      return instance;
    });
  }

  static S of(BuildContext context) {
    final instance = S.maybeOf(context);
    assert(
      instance != null,
      'No instance of S present in the widget tree. Did you add S.delegate in localizationsDelegates?',
    );
    return instance!;
  }

  static S? maybeOf(BuildContext context) {
    return Localizations.of<S>(context, S);
  }

  /// `Eventy360`
  String get appTitle {
    return Intl.message('Eventy360', name: 'appTitle', desc: '', args: []);
  }

  /// `Researcher Home`
  String get homeTitle {
    return Intl.message(
      'Researcher Home',
      name: 'homeTitle',
      desc: '',
      args: [],
    );
  }

  /// `Your command center is ready.`
  String get homeSubtitle {
    return Intl.message(
      'Your command center is ready.',
      name: 'homeSubtitle',
      desc: '',
      args: [],
    );
  }

  /// `Welcome to Eventy360`
  String get onboardingTitle {
    return Intl.message(
      'Welcome to Eventy360',
      name: 'onboardingTitle',
      desc: '',
      args: [],
    );
  }

  /// `Complete your researcher workflow from mobile with fewer steps.`
  String get onboardingBody {
    return Intl.message(
      'Complete your researcher workflow from mobile with fewer steps.',
      name: 'onboardingBody',
      desc: '',
      args: [],
    );
  }

  /// `Notification setup`
  String get notificationEducationTitle {
    return Intl.message(
      'Notification setup',
      name: 'notificationEducationTitle',
      desc: '',
      args: [],
    );
  }

  /// `We will ask for notification permission only after you subscribe to topics.`
  String get notificationEducationBody {
    return Intl.message(
      'We will ask for notification permission only after you subscribe to topics.',
      name: 'notificationEducationBody',
      desc: '',
      args: [],
    );
  }

  /// `Get Started`
  String get getStarted {
    return Intl.message('Get Started', name: 'getStarted', desc: '', args: []);
  }

  /// `Sign In`
  String get signIn {
    return Intl.message('Sign In', name: 'signIn', desc: '', args: []);
  }

  /// `Sign Up`
  String get signUp {
    return Intl.message('Sign Up', name: 'signUp', desc: '', args: []);
  }

  /// `Sign Out`
  String get signOut {
    return Intl.message('Sign Out', name: 'signOut', desc: '', args: []);
  }

  /// `Email`
  String get email {
    return Intl.message('Email', name: 'email', desc: '', args: []);
  }

  /// `Password`
  String get password {
    return Intl.message('Password', name: 'password', desc: '', args: []);
  }

  /// `This field is required.`
  String get requiredField {
    return Intl.message(
      'This field is required.',
      name: 'requiredField',
      desc: '',
      args: [],
    );
  }

  /// `Password must be at least 8 characters.`
  String get passwordTooShort {
    return Intl.message(
      'Password must be at least 8 characters.',
      name: 'passwordTooShort',
      desc: '',
      args: [],
    );
  }

  /// `Create account`
  String get createAccount {
    return Intl.message(
      'Create account',
      name: 'createAccount',
      desc: '',
      args: [],
    );
  }

  /// `Already have an account? Sign in`
  String get haveAccountSignIn {
    return Intl.message(
      'Already have an account? Sign in',
      name: 'haveAccountSignIn',
      desc: '',
      args: [],
    );
  }

  /// `Forgot password?`
  String get forgotPassword {
    return Intl.message(
      'Forgot password?',
      name: 'forgotPassword',
      desc: '',
      args: [],
    );
  }

  /// `Reset Password`
  String get resetPassword {
    return Intl.message(
      'Reset Password',
      name: 'resetPassword',
      desc: '',
      args: [],
    );
  }

  /// `Send reset link`
  String get sendResetLink {
    return Intl.message(
      'Send reset link',
      name: 'sendResetLink',
      desc: '',
      args: [],
    );
  }

  /// `Password reset email was sent.`
  String get resetEmailSent {
    return Intl.message(
      'Password reset email was sent.',
      name: 'resetEmailSent',
      desc: '',
      args: [],
    );
  }

  /// `Back to sign in`
  String get backToSignIn {
    return Intl.message(
      'Back to sign in',
      name: 'backToSignIn',
      desc: '',
      args: [],
    );
  }

  /// `Set a new password`
  String get updatePasswordTitle {
    return Intl.message(
      'Set a new password',
      name: 'updatePasswordTitle',
      desc: '',
      args: [],
    );
  }

  /// `New password`
  String get newPassword {
    return Intl.message(
      'New password',
      name: 'newPassword',
      desc: '',
      args: [],
    );
  }

  /// `Confirm password`
  String get confirmPassword {
    return Intl.message(
      'Confirm password',
      name: 'confirmPassword',
      desc: '',
      args: [],
    );
  }

  /// `Update password`
  String get updatePasswordAction {
    return Intl.message(
      'Update password',
      name: 'updatePasswordAction',
      desc: '',
      args: [],
    );
  }

  /// `Passwords do not match.`
  String get passwordsDoNotMatch {
    return Intl.message(
      'Passwords do not match.',
      name: 'passwordsDoNotMatch',
      desc: '',
      args: [],
    );
  }

  /// `Password updated successfully.`
  String get passwordUpdatedSuccess {
    return Intl.message(
      'Password updated successfully.',
      name: 'passwordUpdatedSuccess',
      desc: '',
      args: [],
    );
  }

  /// `Account created successfully.`
  String get accountCreated {
    return Intl.message(
      'Account created successfully.',
      name: 'accountCreated',
      desc: '',
      args: [],
    );
  }

  /// `Something went wrong. Please try again.`
  String get genericError {
    return Intl.message(
      'Something went wrong. Please try again.',
      name: 'genericError',
      desc: '',
      args: [],
    );
  }

  /// `Complete Your Profile`
  String get completeProfileTitle {
    return Intl.message(
      'Complete Your Profile',
      name: 'completeProfileTitle',
      desc: '',
      args: [],
    );
  }

  /// `Before using researcher features, complete your profile details.`
  String get completeProfileBody {
    return Intl.message(
      'Before using researcher features, complete your profile details.',
      name: 'completeProfileBody',
      desc: '',
      args: [],
    );
  }

  /// `Full name`
  String get fullName {
    return Intl.message('Full name', name: 'fullName', desc: '', args: []);
  }

  /// `Institution`
  String get institution {
    return Intl.message('Institution', name: 'institution', desc: '', args: []);
  }

  /// `Continue`
  String get continueAction {
    return Intl.message('Continue', name: 'continueAction', desc: '', args: []);
  }

  /// `This account role is not supported on mobile`
  String get unsupportedRoleTitle {
    return Intl.message(
      'This account role is not supported on mobile',
      name: 'unsupportedRoleTitle',
      desc: '',
      args: [],
    );
  }

  /// `Eventy360 mobile currently supports researcher accounts only.`
  String get unsupportedRoleBody {
    return Intl.message(
      'Eventy360 mobile currently supports researcher accounts only.',
      name: 'unsupportedRoleBody',
      desc: '',
      args: [],
    );
  }

  /// `Signed in as`
  String get signedInAs {
    return Intl.message('Signed in as', name: 'signedInAs', desc: '', args: []);
  }

  /// `Profile status`
  String get profileStatus {
    return Intl.message(
      'Profile status',
      name: 'profileStatus',
      desc: '',
      args: [],
    );
  }

  /// `Verification status`
  String get verificationStatusTitle {
    return Intl.message(
      'Verification status',
      name: 'verificationStatusTitle',
      desc: '',
      args: [],
    );
  }

  /// `Subscription status`
  String get subscriptionStatusTitle {
    return Intl.message(
      'Subscription status',
      name: 'subscriptionStatusTitle',
      desc: '',
      args: [],
    );
  }

  /// `Premium subscription active`
  String get subscriptionActive {
    return Intl.message(
      'Premium subscription active',
      name: 'subscriptionActive',
      desc: '',
      args: [],
    );
  }

  /// `No active premium subscription`
  String get subscriptionInactive {
    return Intl.message(
      'No active premium subscription',
      name: 'subscriptionInactive',
      desc: '',
      args: [],
    );
  }

  /// `Nearest deadline`
  String get nearestDeadlineTitle {
    return Intl.message(
      'Nearest deadline',
      name: 'nearestDeadlineTitle',
      desc: '',
      args: [],
    );
  }

  /// `No upcoming deadlines`
  String get noUpcomingDeadline {
    return Intl.message(
      'No upcoming deadlines',
      name: 'noUpcomingDeadline',
      desc: '',
      args: [],
    );
  }

  /// `Active submissions`
  String get activeSubmissionsTitle {
    return Intl.message(
      'Active submissions',
      name: 'activeSubmissionsTitle',
      desc: '',
      args: [],
    );
  }

  /// `{count} active submissions`
  String activeSubmissionsCount(int count) {
    return Intl.message(
      '$count active submissions',
      name: 'activeSubmissionsCount',
      desc: '',
      args: [count],
    );
  }

  /// `Profile completed`
  String get profileCompleted {
    return Intl.message(
      'Profile completed',
      name: 'profileCompleted',
      desc: '',
      args: [],
    );
  }

  /// `Profile incomplete`
  String get profileIncomplete {
    return Intl.message(
      'Profile incomplete',
      name: 'profileIncomplete',
      desc: '',
      args: [],
    );
  }

  /// `Explore events`
  String get exploreEvents {
    return Intl.message(
      'Explore events',
      name: 'exploreEvents',
      desc: '',
      args: [],
    );
  }

  /// `Discover Events`
  String get eventsTitle {
    return Intl.message(
      'Discover Events',
      name: 'eventsTitle',
      desc: '',
      args: [],
    );
  }

  /// `Search events by name or location`
  String get eventsSearchHint {
    return Intl.message(
      'Search events by name or location',
      name: 'eventsSearchHint',
      desc: '',
      args: [],
    );
  }

  /// `Subscribe to topics to receive push alerts.`
  String get topicSubscriptionHint {
    return Intl.message(
      'Subscribe to topics to receive push alerts.',
      name: 'topicSubscriptionHint',
      desc: '',
      args: [],
    );
  }

  /// `Add bookmark`
  String get addBookmark {
    return Intl.message(
      'Add bookmark',
      name: 'addBookmark',
      desc: '',
      args: [],
    );
  }

  /// `Remove bookmark`
  String get removeBookmark {
    return Intl.message(
      'Remove bookmark',
      name: 'removeBookmark',
      desc: '',
      args: [],
    );
  }

  /// `Load more`
  String get loadMore {
    return Intl.message('Load more', name: 'loadMore', desc: '', args: []);
  }

  /// `No events found.`
  String get noEventsFound {
    return Intl.message(
      'No events found.',
      name: 'noEventsFound',
      desc: '',
      args: [],
    );
  }

  /// `Event Details`
  String get eventDetailsTitle {
    return Intl.message(
      'Event Details',
      name: 'eventDetailsTitle',
      desc: '',
      args: [],
    );
  }

  /// `Event was not found.`
  String get eventNotFound {
    return Intl.message(
      'Event was not found.',
      name: 'eventNotFound',
      desc: '',
      args: [],
    );
  }

  /// `My Submissions`
  String get submissionsTitle {
    return Intl.message(
      'My Submissions',
      name: 'submissionsTitle',
      desc: '',
      args: [],
    );
  }

  /// `Submit Abstract`
  String get submitAbstractTitle {
    return Intl.message(
      'Submit Abstract',
      name: 'submitAbstractTitle',
      desc: '',
      args: [],
    );
  }

  /// `Submit abstract`
  String get submitAbstractAction {
    return Intl.message(
      'Submit abstract',
      name: 'submitAbstractAction',
      desc: '',
      args: [],
    );
  }

  /// `Submit Full Paper`
  String get submitFullPaperTitle {
    return Intl.message(
      'Submit Full Paper',
      name: 'submitFullPaperTitle',
      desc: '',
      args: [],
    );
  }

  /// `Submit full paper`
  String get submitFullPaperAction {
    return Intl.message(
      'Submit full paper',
      name: 'submitFullPaperAction',
      desc: '',
      args: [],
    );
  }

  /// `Submit Revision`
  String get submitRevisionTitle {
    return Intl.message(
      'Submit Revision',
      name: 'submitRevisionTitle',
      desc: '',
      args: [],
    );
  }

  /// `Submit revision`
  String get submitRevisionAction {
    return Intl.message(
      'Submit revision',
      name: 'submitRevisionAction',
      desc: '',
      args: [],
    );
  }

  /// `Event`
  String get eventSelectionLabel {
    return Intl.message(
      'Event',
      name: 'eventSelectionLabel',
      desc: '',
      args: [],
    );
  }

  /// `Title (Arabic)`
  String get submissionTitleArLabel {
    return Intl.message(
      'Title (Arabic)',
      name: 'submissionTitleArLabel',
      desc: '',
      args: [],
    );
  }

  /// `Title (English, optional)`
  String get submissionTitleEnLabel {
    return Intl.message(
      'Title (English, optional)',
      name: 'submissionTitleEnLabel',
      desc: '',
      args: [],
    );
  }

  /// `Abstract (Arabic)`
  String get abstractArLabel {
    return Intl.message(
      'Abstract (Arabic)',
      name: 'abstractArLabel',
      desc: '',
      args: [],
    );
  }

  /// `Abstract (English, optional)`
  String get abstractEnLabel {
    return Intl.message(
      'Abstract (English, optional)',
      name: 'abstractEnLabel',
      desc: '',
      args: [],
    );
  }

  /// `Paste the uploaded file URL from your storage path.`
  String get fileUrlHint {
    return Intl.message(
      'Paste the uploaded file URL from your storage path.',
      name: 'fileUrlHint',
      desc: '',
      args: [],
    );
  }

  /// `File URL`
  String get fileUrlLabel {
    return Intl.message('File URL', name: 'fileUrlLabel', desc: '', args: []);
  }

  /// `Revision notes (optional)`
  String get revisionNotesLabel {
    return Intl.message(
      'Revision notes (optional)',
      name: 'revisionNotesLabel',
      desc: '',
      args: [],
    );
  }

  /// `Cancel`
  String get cancelAction {
    return Intl.message('Cancel', name: 'cancelAction', desc: '', args: []);
  }

  /// `No submissions found.`
  String get noSubmissionsFound {
    return Intl.message(
      'No submissions found.',
      name: 'noSubmissionsFound',
      desc: '',
      args: [],
    );
  }

  /// `Status`
  String get submissionStatusLabel {
    return Intl.message(
      'Status',
      name: 'submissionStatusLabel',
      desc: '',
      args: [],
    );
  }

  /// `Abstract submitted`
  String get statusAbstractSubmitted {
    return Intl.message(
      'Abstract submitted',
      name: 'statusAbstractSubmitted',
      desc: '',
      args: [],
    );
  }

  /// `Abstract accepted`
  String get statusAbstractAccepted {
    return Intl.message(
      'Abstract accepted',
      name: 'statusAbstractAccepted',
      desc: '',
      args: [],
    );
  }

  /// `Abstract rejected`
  String get statusAbstractRejected {
    return Intl.message(
      'Abstract rejected',
      name: 'statusAbstractRejected',
      desc: '',
      args: [],
    );
  }

  /// `Full paper submitted`
  String get statusFullPaperSubmitted {
    return Intl.message(
      'Full paper submitted',
      name: 'statusFullPaperSubmitted',
      desc: '',
      args: [],
    );
  }

  /// `Full paper accepted`
  String get statusFullPaperAccepted {
    return Intl.message(
      'Full paper accepted',
      name: 'statusFullPaperAccepted',
      desc: '',
      args: [],
    );
  }

  /// `Full paper rejected`
  String get statusFullPaperRejected {
    return Intl.message(
      'Full paper rejected',
      name: 'statusFullPaperRejected',
      desc: '',
      args: [],
    );
  }

  /// `Revision requested`
  String get statusRevisionRequested {
    return Intl.message(
      'Revision requested',
      name: 'statusRevisionRequested',
      desc: '',
      args: [],
    );
  }

  /// `Revision under review`
  String get statusRevisionUnderReview {
    return Intl.message(
      'Revision under review',
      name: 'statusRevisionUnderReview',
      desc: '',
      args: [],
    );
  }

  /// `Completed`
  String get statusCompleted {
    return Intl.message(
      'Completed',
      name: 'statusCompleted',
      desc: '',
      args: [],
    );
  }

  /// `Submission Details`
  String get submissionDetailTitle {
    return Intl.message(
      'Submission Details',
      name: 'submissionDetailTitle',
      desc: '',
      args: [],
    );
  }

  /// `Submission details are not available.`
  String get submissionDetailMissing {
    return Intl.message(
      'Submission details are not available.',
      name: 'submissionDetailMissing',
      desc: '',
      args: [],
    );
  }

  /// `Status and Feedback Timeline`
  String get submissionTimelineTitle {
    return Intl.message(
      'Status and Feedback Timeline',
      name: 'submissionTimelineTitle',
      desc: '',
      args: [],
    );
  }

  /// `Deadline`
  String get deadline {
    return Intl.message('Deadline', name: 'deadline', desc: '', args: []);
  }

  /// `Location`
  String get location {
    return Intl.message('Location', name: 'location', desc: '', args: []);
  }

  /// `Retry`
  String get retry {
    return Intl.message('Retry', name: 'retry', desc: '', args: []);
  }

  /// `Something went wrong.`
  String get somethingWentWrong {
    return Intl.message(
      'Something went wrong.',
      name: 'somethingWentWrong',
      desc: '',
      args: [],
    );
  }

  /// `Loading...`
  String get loading {
    return Intl.message('Loading...', name: 'loading', desc: '', args: []);
  }
}

class AppLocalizationDelegate extends LocalizationsDelegate<S> {
  const AppLocalizationDelegate();

  List<Locale> get supportedLocales {
    return const <Locale>[
      Locale.fromSubtags(languageCode: 'en'),
      Locale.fromSubtags(languageCode: 'ar'),
    ];
  }

  @override
  bool isSupported(Locale locale) => _isSupported(locale);
  @override
  Future<S> load(Locale locale) => S.load(locale);
  @override
  bool shouldReload(AppLocalizationDelegate old) => false;

  bool _isSupported(Locale locale) {
    for (var supportedLocale in supportedLocales) {
      if (supportedLocale.languageCode == locale.languageCode) {
        return true;
      }
    }
    return false;
  }
}
