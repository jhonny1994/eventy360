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
