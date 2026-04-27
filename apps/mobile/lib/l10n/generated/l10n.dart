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

  /// `Track your account health, critical deadlines, submissions, and researcher tools from one calm control center.`
  String get homeOverviewBody {
    return Intl.message(
      'Track your account health, critical deadlines, submissions, and researcher tools from one calm control center.',
      name: 'homeOverviewBody',
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

  /// `Discover relevant events faster`
  String get onboardingStepDiscoverTitle {
    return Intl.message(
      'Discover relevant events faster',
      name: 'onboardingStepDiscoverTitle',
      desc: '',
      args: [],
    );
  }

  /// `Search, filter, and bookmark opportunities that match your research focus and deadlines.`
  String get onboardingStepDiscoverBody {
    return Intl.message(
      'Search, filter, and bookmark opportunities that match your research focus and deadlines.',
      name: 'onboardingStepDiscoverBody',
      desc: '',
      args: [],
    );
  }

  /// `Submit with fewer blockers`
  String get onboardingStepSubmitTitle {
    return Intl.message(
      'Submit with fewer blockers',
      name: 'onboardingStepSubmitTitle',
      desc: '',
      args: [],
    );
  }

  /// `Track abstracts, full papers, and revisions in one guided flow with clear status visibility.`
  String get onboardingStepSubmitBody {
    return Intl.message(
      'Track abstracts, full papers, and revisions in one guided flow with clear status visibility.',
      name: 'onboardingStepSubmitBody',
      desc: '',
      args: [],
    );
  }

  /// `Stay ahead with timely alerts`
  String get onboardingStepNotifyTitle {
    return Intl.message(
      'Stay ahead with timely alerts',
      name: 'onboardingStepNotifyTitle',
      desc: '',
      args: [],
    );
  }

  /// `We request notification permission only when you subscribe to topics, so prompts remain contextual.`
  String get onboardingStepNotifyBody {
    return Intl.message(
      'We request notification permission only when you subscribe to topics, so prompts remain contextual.',
      name: 'onboardingStepNotifyBody',
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

  /// `Skip`
  String get skipAction {
    return Intl.message('Skip', name: 'skipAction', desc: '', args: []);
  }

  /// `Get Started`
  String get getStarted {
    return Intl.message('Get Started', name: 'getStarted', desc: '', args: []);
  }

  /// `Sign In`
  String get signIn {
    return Intl.message('Sign In', name: 'signIn', desc: '', args: []);
  }

  /// `Return to your research flow`
  String get signInHeroTitle {
    return Intl.message(
      'Return to your research flow',
      name: 'signInHeroTitle',
      desc: '',
      args: [],
    );
  }

  /// `Access events, submissions, trust operations, and repository tools from one focused mobile workspace.`
  String get signInHeroBody {
    return Intl.message(
      'Access events, submissions, trust operations, and repository tools from one focused mobile workspace.',
      name: 'signInHeroBody',
      desc: '',
      args: [],
    );
  }

  /// `Sign Up`
  String get signUp {
    return Intl.message('Sign Up', name: 'signUp', desc: '', args: []);
  }

  /// `Create your researcher access`
  String get signUpHeroTitle {
    return Intl.message(
      'Create your researcher access',
      name: 'signUpHeroTitle',
      desc: '',
      args: [],
    );
  }

  /// `Start with secure credentials, then complete your researcher profile and verification path inside the app.`
  String get signUpHeroBody {
    return Intl.message(
      'Start with secure credentials, then complete your researcher profile and verification path inside the app.',
      name: 'signUpHeroBody',
      desc: '',
      args: [],
    );
  }

  /// `Sign Out`
  String get signOut {
    return Intl.message('Sign Out', name: 'signOut', desc: '', args: []);
  }

  /// `Researcher mobile access`
  String get authResearcherBadge {
    return Intl.message(
      'Researcher mobile access',
      name: 'authResearcherBadge',
      desc: '',
      args: [],
    );
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

  /// `Recover access securely with a reset link, or finish a password recovery session without losing context.`
  String get resetPasswordHeroBody {
    return Intl.message(
      'Recover access securely with a reset link, or finish a password recovery session without losing context.',
      name: 'resetPasswordHeroBody',
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

  /// `Add your professional details and location once so the rest of the mobile experience can stay personalized and accurate.`
  String get completeProfileHeroBody {
    return Intl.message(
      'Add your professional details and location once so the rest of the mobile experience can stay personalized and accurate.',
      name: 'completeProfileHeroBody',
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

  /// `Wilaya`
  String get wilayaLabel {
    return Intl.message('Wilaya', name: 'wilayaLabel', desc: '', args: []);
  }

  /// `Daira`
  String get dairaLabel {
    return Intl.message('Daira', name: 'dairaLabel', desc: '', args: []);
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

  /// `Account`
  String get accountTitle {
    return Intl.message('Account', name: 'accountTitle', desc: '', args: []);
  }

  /// `Control your researcher experience`
  String get accountHeroTitle {
    return Intl.message(
      'Control your researcher experience',
      name: 'accountHeroTitle',
      desc: '',
      args: [],
    );
  }

  /// `Manage trust, preferences, language, theme, and alerts from one clear place.`
  String get accountHeroBody {
    return Intl.message(
      'Manage trust, preferences, language, theme, and alerts from one clear place.',
      name: 'accountHeroBody',
      desc: '',
      args: [],
    );
  }

  /// `Account overview`
  String get accountOverviewTitle {
    return Intl.message(
      'Account overview',
      name: 'accountOverviewTitle',
      desc: '',
      args: [],
    );
  }

  /// `Account actions`
  String get accountActionsTitle {
    return Intl.message(
      'Account actions',
      name: 'accountActionsTitle',
      desc: '',
      args: [],
    );
  }

  /// `Edit profile`
  String get editProfileTitle {
    return Intl.message(
      'Edit profile',
      name: 'editProfileTitle',
      desc: '',
      args: [],
    );
  }

  /// `Keep your name, institution, academic role, and location accurate so event and trust workflows stay aligned.`
  String get editProfileBody {
    return Intl.message(
      'Keep your name, institution, academic role, and location accurate so event and trust workflows stay aligned.',
      name: 'editProfileBody',
      desc: '',
      args: [],
    );
  }

  /// `Save profile`
  String get saveProfileAction {
    return Intl.message(
      'Save profile',
      name: 'saveProfileAction',
      desc: '',
      args: [],
    );
  }

  /// `Profile updated successfully.`
  String get profileSavedSuccess {
    return Intl.message(
      'Profile updated successfully.',
      name: 'profileSavedSuccess',
      desc: '',
      args: [],
    );
  }

  /// `Academic position`
  String get academicPositionLabel {
    return Intl.message(
      'Academic position',
      name: 'academicPositionLabel',
      desc: '',
      args: [],
    );
  }

  /// `Short bio`
  String get profileBioLabel {
    return Intl.message(
      'Short bio',
      name: 'profileBioLabel',
      desc: '',
      args: [],
    );
  }

  /// `Security`
  String get securityTitle {
    return Intl.message('Security', name: 'securityTitle', desc: '', args: []);
  }

  /// `Protect your account access and keep your credentials current from a dedicated security surface.`
  String get securityBody {
    return Intl.message(
      'Protect your account access and keep your credentials current from a dedicated security surface.',
      name: 'securityBody',
      desc: '',
      args: [],
    );
  }

  /// `Send a secure reset link to {email} if you want to change your password from email.`
  String securityResetBody(Object email) {
    return Intl.message(
      'Send a secure reset link to $email if you want to change your password from email.',
      name: 'securityResetBody',
      desc: '',
      args: [email],
    );
  }

  /// `If you are already signed in on this device, you can set a new password here immediately.`
  String get securityDirectPasswordBody {
    return Intl.message(
      'If you are already signed in on this device, you can set a new password here immediately.',
      name: 'securityDirectPasswordBody',
      desc: '',
      args: [],
    );
  }

  /// `Preferences`
  String get preferencesTitle {
    return Intl.message(
      'Preferences',
      name: 'preferencesTitle',
      desc: '',
      args: [],
    );
  }

  /// `Adjust appearance, language, and alert behavior without leaving the app flow.`
  String get preferencesBody {
    return Intl.message(
      'Adjust appearance, language, and alert behavior without leaving the app flow.',
      name: 'preferencesBody',
      desc: '',
      args: [],
    );
  }

  /// `Language`
  String get languagePreferenceTitle {
    return Intl.message(
      'Language',
      name: 'languagePreferenceTitle',
      desc: '',
      args: [],
    );
  }

  /// `Theme`
  String get themePreferenceTitle {
    return Intl.message(
      'Theme',
      name: 'themePreferenceTitle',
      desc: '',
      args: [],
    );
  }

  /// `Notification preferences`
  String get notificationPreferencesTitle {
    return Intl.message(
      'Notification preferences',
      name: 'notificationPreferencesTitle',
      desc: '',
      args: [],
    );
  }

  /// `Control how the app handles topic alerts and open system settings if Android has already blocked notifications.`
  String get notificationPreferencesBody {
    return Intl.message(
      'Control how the app handles topic alerts and open system settings if Android has already blocked notifications.',
      name: 'notificationPreferencesBody',
      desc: '',
      args: [],
    );
  }

  /// `Notifications enabled`
  String get notificationsEnabledStatus {
    return Intl.message(
      'Notifications enabled',
      name: 'notificationsEnabledStatus',
      desc: '',
      args: [],
    );
  }

  /// `Notifications not enabled`
  String get notificationsNotEnabledStatus {
    return Intl.message(
      'Notifications not enabled',
      name: 'notificationsNotEnabledStatus',
      desc: '',
      args: [],
    );
  }

  /// `Topic alerts are available when you subscribe to relevant subjects.`
  String get notificationsEnabledBody {
    return Intl.message(
      'Topic alerts are available when you subscribe to relevant subjects.',
      name: 'notificationsEnabledBody',
      desc: '',
      args: [],
    );
  }

  /// `Enable notifications so important topic alerts can reach you on time.`
  String get notificationsDisabledBody {
    return Intl.message(
      'Enable notifications so important topic alerts can reach you on time.',
      name: 'notificationsDisabledBody',
      desc: '',
      args: [],
    );
  }

  /// `Enable notifications`
  String get enableNotificationsAction {
    return Intl.message(
      'Enable notifications',
      name: 'enableNotificationsAction',
      desc: '',
      args: [],
    );
  }

  /// `Open system settings`
  String get openSystemSettingsAction {
    return Intl.message(
      'Open system settings',
      name: 'openSystemSettingsAction',
      desc: '',
      args: [],
    );
  }

  /// `English`
  String get languageEnglish {
    return Intl.message('English', name: 'languageEnglish', desc: '', args: []);
  }

  /// `Arabic`
  String get languageArabic {
    return Intl.message('Arabic', name: 'languageArabic', desc: '', args: []);
  }

  /// `Follow system`
  String get themeSystem {
    return Intl.message(
      'Follow system',
      name: 'themeSystem',
      desc: '',
      args: [],
    );
  }

  /// `Light`
  String get themeLight {
    return Intl.message('Light', name: 'themeLight', desc: '', args: []);
  }

  /// `Dark`
  String get themeDark {
    return Intl.message('Dark', name: 'themeDark', desc: '', args: []);
  }

  /// `Researcher access`
  String get researcherAccessTitle {
    return Intl.message(
      'Researcher access',
      name: 'researcherAccessTitle',
      desc: '',
      args: [],
    );
  }

  /// `Review trust and access-related steps in focused screens when you need them.`
  String get researcherAccessBody {
    return Intl.message(
      'Review trust and access-related steps in focused screens when you need them.',
      name: 'researcherAccessBody',
      desc: '',
      args: [],
    );
  }

  /// `Topic subscriptions`
  String get topicSubscriptionsTitle {
    return Intl.message(
      'Topic subscriptions',
      name: 'topicSubscriptionsTitle',
      desc: '',
      args: [],
    );
  }

  /// `Manage your research interests and notification topics.`
  String get topicSubscriptionsBody {
    return Intl.message(
      'Manage your research interests and notification topics.',
      name: 'topicSubscriptionsBody',
      desc: '',
      args: [],
    );
  }

  /// `Saved events`
  String get savedEventsTitle {
    return Intl.message(
      'Saved events',
      name: 'savedEventsTitle',
      desc: '',
      args: [],
    );
  }

  /// `Return to the events you shortlisted without rebuilding your search from scratch.`
  String get savedEventsBody {
    return Intl.message(
      'Return to the events you shortlisted without rebuilding your search from scratch.',
      name: 'savedEventsBody',
      desc: '',
      args: [],
    );
  }

  /// `You have not bookmarked any events yet.`
  String get savedEventsEmptyState {
    return Intl.message(
      'You have not bookmarked any events yet.',
      name: 'savedEventsEmptyState',
      desc: '',
      args: [],
    );
  }

  /// `Manage alert topics`
  String get topicSubscriptionsManageTitle {
    return Intl.message(
      'Manage alert topics',
      name: 'topicSubscriptionsManageTitle',
      desc: '',
      args: [],
    );
  }

  /// `Choose the topics you want to follow. We request notification permission when you subscribe so prompts stay contextual.`
  String get topicSubscriptionsManageBody {
    return Intl.message(
      'Choose the topics you want to follow. We request notification permission when you subscribe so prompts stay contextual.',
      name: 'topicSubscriptionsManageBody',
      desc: '',
      args: [],
    );
  }

  /// `No topics are available right now.`
  String get topicSubscriptionsEmptyState {
    return Intl.message(
      'No topics are available right now.',
      name: 'topicSubscriptionsEmptyState',
      desc: '',
      args: [],
    );
  }

  /// `Manage alert topics`
  String get manageTopicsAction {
    return Intl.message(
      'Manage alert topics',
      name: 'manageTopicsAction',
      desc: '',
      args: [],
    );
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

  /// `Verified`
  String get verifiedStatus {
    return Intl.message('Verified', name: 'verifiedStatus', desc: '', args: []);
  }

  /// `Not verified`
  String get notVerifiedStatus {
    return Intl.message(
      'Not verified',
      name: 'notVerifiedStatus',
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

  /// `Your research day is organized`
  String get homeHeroTitle {
    return Intl.message(
      'Your research day is organized',
      name: 'homeHeroTitle',
      desc: '',
      args: [],
    );
  }

  /// `See what needs attention now, continue your current work, and move into the right workflow without clutter.`
  String get homeHeroBody {
    return Intl.message(
      'See what needs attention now, continue your current work, and move into the right workflow without clutter.',
      name: 'homeHeroBody',
      desc: '',
      args: [],
    );
  }

  /// `Next best action`
  String get homeNextActionTitle {
    return Intl.message(
      'Next best action',
      name: 'homeNextActionTitle',
      desc: '',
      args: [],
    );
  }

  /// `Current status summary`
  String get homeStateSummaryTitle {
    return Intl.message(
      'Current status summary',
      name: 'homeStateSummaryTitle',
      desc: '',
      args: [],
    );
  }

  /// `Keep your trust, subscription, deadline, and submission state visible at a glance.`
  String get homeStateSummaryBody {
    return Intl.message(
      'Keep your trust, subscription, deadline, and submission state visible at a glance.',
      name: 'homeStateSummaryBody',
      desc: '',
      args: [],
    );
  }

  /// `Quick links`
  String get homeQuickLinksTitle {
    return Intl.message(
      'Quick links',
      name: 'homeQuickLinksTitle',
      desc: '',
      args: [],
    );
  }

  /// `Jump into your core researcher areas without turning home into a crowded menu.`
  String get homeQuickLinksBody {
    return Intl.message(
      'Jump into your core researcher areas without turning home into a crowded menu.',
      name: 'homeQuickLinksBody',
      desc: '',
      args: [],
    );
  }

  /// `Review your active submissions and continue the next required step.`
  String get homeResumeSubmissionBody {
    return Intl.message(
      'Review your active submissions and continue the next required step.',
      name: 'homeResumeSubmissionBody',
      desc: '',
      args: [],
    );
  }

  /// `Browse live opportunities, bookmark what matters, and start a submission from the right event.`
  String get homeDiscoverEventsBody {
    return Intl.message(
      'Browse live opportunities, bookmark what matters, and start a submission from the right event.',
      name: 'homeDiscoverEventsBody',
      desc: '',
      args: [],
    );
  }

  /// `Adjust preferences, trust status, and sign-in settings from one stable destination.`
  String get homeManageAccountBody {
    return Intl.message(
      'Adjust preferences, trust status, and sign-in settings from one stable destination.',
      name: 'homeManageAccountBody',
      desc: '',
      args: [],
    );
  }

  /// `Return to the events you bookmarked when you are deciding what to submit next.`
  String get homeSavedEventsBody {
    return Intl.message(
      'Return to the events you bookmarked when you are deciding what to submit next.',
      name: 'homeSavedEventsBody',
      desc: '',
      args: [],
    );
  }

  /// `Review submissions`
  String get reviewSubmissionsAction {
    return Intl.message(
      'Review submissions',
      name: 'reviewSubmissionsAction',
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

  /// `Browse upcoming calls, filter by topic, subscribe to what matters, and keep your shortlist moving.`
  String get eventsOverviewBody {
    return Intl.message(
      'Browse upcoming calls, filter by topic, subscribe to what matters, and keep your shortlist moving.',
      name: 'eventsOverviewBody',
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

  /// `Before you submit`
  String get eventDecisionSupportTitle {
    return Intl.message(
      'Before you submit',
      name: 'eventDecisionSupportTitle',
      desc: '',
      args: [],
    );
  }

  /// `Check the deadline, fit, and organizer context first so you do not start the wrong workflow.`
  String get eventDecisionSupportBody {
    return Intl.message(
      'Check the deadline, fit, and organizer context first so you do not start the wrong workflow.',
      name: 'eventDecisionSupportBody',
      desc: '',
      args: [],
    );
  }

  /// `Timeline`
  String get eventTimelineTitle {
    return Intl.message(
      'Timeline',
      name: 'eventTimelineTitle',
      desc: '',
      args: [],
    );
  }

  /// `Abstract submissions for this event currently point to {date} as the next visible deadline.`
  String eventTimelineBody(Object date) {
    return Intl.message(
      'Abstract submissions for this event currently point to $date as the next visible deadline.',
      name: 'eventTimelineBody',
      desc: '',
      args: [date],
    );
  }

  /// `Eligibility and fit`
  String get eventEligibilityTitle {
    return Intl.message(
      'Eligibility and fit',
      name: 'eventEligibilityTitle',
      desc: '',
      args: [],
    );
  }

  /// `Use the event topics and location as a quick fit check, then continue only if this call matches your work.`
  String get eventEligibilityBody {
    return Intl.message(
      'Use the event topics and location as a quick fit check, then continue only if this call matches your work.',
      name: 'eventEligibilityBody',
      desc: '',
      args: [],
    );
  }

  /// `Organizer context`
  String get eventOrganizerTitle {
    return Intl.message(
      'Organizer context',
      name: 'eventOrganizerTitle',
      desc: '',
      args: [],
    );
  }

  /// `If anything feels unclear, keep this screen as your source of truth before you commit a submission.`
  String get eventOrganizerBody {
    return Intl.message(
      'If anything feels unclear, keep this screen as your source of truth before you commit a submission.',
      name: 'eventOrganizerBody',
      desc: '',
      args: [],
    );
  }

  /// `You already started a submission for this event, so we took you back to that record instead of creating a duplicate.`
  String get existingSubmissionRedirectBody {
    return Intl.message(
      'You already started a submission for this event, so we took you back to that record instead of creating a duplicate.',
      name: 'existingSubmissionRedirectBody',
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

  /// `Review active work, understand each status quickly, and keep your next submission action obvious.`
  String get submissionsOverviewBody {
    return Intl.message(
      'Review active work, understand each status quickly, and keep your next submission action obvious.',
      name: 'submissionsOverviewBody',
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

  /// `Prepare the core metadata and abstracts needed to create a clean initial submission.`
  String get submitAbstractOverviewBody {
    return Intl.message(
      'Prepare the core metadata and abstracts needed to create a clean initial submission.',
      name: 'submitAbstractOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `Upload the final paper file against the approved submission record without losing context.`
  String get submitFullPaperOverviewBody {
    return Intl.message(
      'Upload the final paper file against the approved submission record without losing context.',
      name: 'submitFullPaperOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `Send the revised paper and any notes requested by reviewers in one focused step.`
  String get submitRevisionOverviewBody {
    return Intl.message(
      'Send the revised paper and any notes requested by reviewers in one focused step.',
      name: 'submitRevisionOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `We restored your in-progress draft so you can continue without rebuilding the form.`
  String get draftRestoredMessage {
    return Intl.message(
      'We restored your in-progress draft so you can continue without rebuilding the form.',
      name: 'draftRestoredMessage',
      desc: '',
      args: [],
    );
  }

  /// `Start from the right event, keep titles clear, and submit only when this abstract is the one you want tracked for that call.`
  String get abstractWriteGuidance {
    return Intl.message(
      'Start from the right event, keep titles clear, and submit only when this abstract is the one you want tracked for that call.',
      name: 'abstractWriteGuidance',
      desc: '',
      args: [],
    );
  }

  /// `Upload PDF, DOC, or DOCX only. File guidance, size, and type stay visible here so the submission feels explicit and safe.`
  String get uploadGuidanceMessage {
    return Intl.message(
      'Upload PDF, DOC, or DOCX only. File guidance, size, and type stay visible here so the submission feels explicit and safe.',
      name: 'uploadGuidanceMessage',
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

  /// `Choose a PDF, DOC, or DOCX file and we will upload it for you.`
  String get filePickerHint {
    return Intl.message(
      'Choose a PDF, DOC, or DOCX file and we will upload it for you.',
      name: 'filePickerHint',
      desc: '',
      args: [],
    );
  }

  /// `Submitted on`
  String get submittedOnLabel {
    return Intl.message(
      'Submitted on',
      name: 'submittedOnLabel',
      desc: '',
      args: [],
    );
  }

  /// `Last updated`
  String get lastUpdatedLabel {
    return Intl.message(
      'Last updated',
      name: 'lastUpdatedLabel',
      desc: '',
      args: [],
    );
  }

  /// `Abstract deadline`
  String get abstractDeadlineLabel {
    return Intl.message(
      'Abstract deadline',
      name: 'abstractDeadlineLabel',
      desc: '',
      args: [],
    );
  }

  /// `Full-paper deadline`
  String get fullPaperDeadlineLabel {
    return Intl.message(
      'Full-paper deadline',
      name: 'fullPaperDeadlineLabel',
      desc: '',
      args: [],
    );
  }

  /// `Submission file`
  String get submissionFilesTitle {
    return Intl.message(
      'Submission file',
      name: 'submissionFilesTitle',
      desc: '',
      args: [],
    );
  }

  /// `Review the uploaded file details here instead of relying on a raw storage URL.`
  String get submissionFilesBody {
    return Intl.message(
      'Review the uploaded file details here instead of relying on a raw storage URL.',
      name: 'submissionFilesBody',
      desc: '',
      args: [],
    );
  }

  /// `File size`
  String get fileSizeLabel {
    return Intl.message('File size', name: 'fileSizeLabel', desc: '', args: []);
  }

  /// `File type`
  String get fileTypeLabel {
    return Intl.message('File type', name: 'fileTypeLabel', desc: '', args: []);
  }

  /// `Open uploaded file`
  String get openSubmissionFileAction {
    return Intl.message(
      'Open uploaded file',
      name: 'openSubmissionFileAction',
      desc: '',
      args: [],
    );
  }

  /// `Feedback`
  String get submissionFeedbackTitle {
    return Intl.message(
      'Feedback',
      name: 'submissionFeedbackTitle',
      desc: '',
      args: [],
    );
  }

  /// `Keep reviewer feedback separate from your actions so the next step stays clear.`
  String get submissionFeedbackBody {
    return Intl.message(
      'Keep reviewer feedback separate from your actions so the next step stays clear.',
      name: 'submissionFeedbackBody',
      desc: '',
      args: [],
    );
  }

  /// `Reviewer note`
  String get feedbackReviewerLabel {
    return Intl.message(
      'Reviewer note',
      name: 'feedbackReviewerLabel',
      desc: '',
      args: [],
    );
  }

  /// `Researcher note`
  String get feedbackResearcherLabel {
    return Intl.message(
      'Researcher note',
      name: 'feedbackResearcherLabel',
      desc: '',
      args: [],
    );
  }

  /// `Your abstract is in review. No additional action is needed until the research team updates the verdict.`
  String get statusNarrativeAbstractSubmitted {
    return Intl.message(
      'Your abstract is in review. No additional action is needed until the research team updates the verdict.',
      name: 'statusNarrativeAbstractSubmitted',
      desc: '',
      args: [],
    );
  }

  /// `Your abstract is approved. The next important action is preparing the full paper before the paper deadline.`
  String get statusNarrativeAbstractAccepted {
    return Intl.message(
      'Your abstract is approved. The next important action is preparing the full paper before the paper deadline.',
      name: 'statusNarrativeAbstractAccepted',
      desc: '',
      args: [],
    );
  }

  /// `Your abstract was not accepted. Review any feedback here before deciding on your next event submission.`
  String get statusNarrativeAbstractRejected {
    return Intl.message(
      'Your abstract was not accepted. Review any feedback here before deciding on your next event submission.',
      name: 'statusNarrativeAbstractRejected',
      desc: '',
      args: [],
    );
  }

  /// `Your full paper is on file and waiting for review. Keep an eye on feedback and deadline updates.`
  String get statusNarrativeFullPaperSubmitted {
    return Intl.message(
      'Your full paper is on file and waiting for review. Keep an eye on feedback and deadline updates.',
      name: 'statusNarrativeFullPaperSubmitted',
      desc: '',
      args: [],
    );
  }

  /// `Your full paper was accepted. This submission is in a healthy state unless the event team contacts you again.`
  String get statusNarrativeFullPaperAccepted {
    return Intl.message(
      'Your full paper was accepted. This submission is in a healthy state unless the event team contacts you again.',
      name: 'statusNarrativeFullPaperAccepted',
      desc: '',
      args: [],
    );
  }

  /// `Your full paper was rejected. Read the notes carefully before investing effort in another upload.`
  String get statusNarrativeFullPaperRejected {
    return Intl.message(
      'Your full paper was rejected. Read the notes carefully before investing effort in another upload.',
      name: 'statusNarrativeFullPaperRejected',
      desc: '',
      args: [],
    );
  }

  /// `A revision is required. Use the notes below and submit the updated paper from this screen.`
  String get statusNarrativeRevisionRequested {
    return Intl.message(
      'A revision is required. Use the notes below and submit the updated paper from this screen.',
      name: 'statusNarrativeRevisionRequested',
      desc: '',
      args: [],
    );
  }

  /// `Your revision is uploaded and back under review. The latest notes remain visible below for context.`
  String get statusNarrativeRevisionUnderReview {
    return Intl.message(
      'Your revision is uploaded and back under review. The latest notes remain visible below for context.',
      name: 'statusNarrativeRevisionUnderReview',
      desc: '',
      args: [],
    );
  }

  /// `This submission has reached its final completed state. You can keep this page as your record of what was delivered.`
  String get statusNarrativeCompleted {
    return Intl.message(
      'This submission has reached its final completed state. You can keep this page as your record of what was delivered.',
      name: 'statusNarrativeCompleted',
      desc: '',
      args: [],
    );
  }

  /// `Choose file`
  String get pickFileAction {
    return Intl.message(
      'Choose file',
      name: 'pickFileAction',
      desc: '',
      args: [],
    );
  }

  /// `No file selected`
  String get noFileSelected {
    return Intl.message(
      'No file selected',
      name: 'noFileSelected',
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

  /// `See the full lifecycle of this submission, including current status, abstract content, files, and timeline history.`
  String get submissionDetailOverviewBody {
    return Intl.message(
      'See the full lifecycle of this submission, including current status, abstract content, files, and timeline history.',
      name: 'submissionDetailOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `Trust Center`
  String get trustCenterTitle {
    return Intl.message(
      'Trust Center',
      name: 'trustCenterTitle',
      desc: '',
      args: [],
    );
  }

  /// `Handle verification and payment evidence in a secure, transparent flow designed for researcher trust operations.`
  String get trustOverviewBody {
    return Intl.message(
      'Handle verification and payment evidence in a secure, transparent flow designed for researcher trust operations.',
      name: 'trustOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `Sensitive document handling`
  String get secureDocsTitle {
    return Intl.message(
      'Sensitive document handling',
      name: 'secureDocsTitle',
      desc: '',
      args: [],
    );
  }

  /// `Verification and payment files are uploaded through authenticated requests, validated before upload, and opened later with short-lived signed links.`
  String get secureDocsBody {
    return Intl.message(
      'Verification and payment files are uploaded through authenticated requests, validated before upload, and opened later with short-lived signed links.',
      name: 'secureDocsBody',
      desc: '',
      args: [],
    );
  }

  /// `Verification`
  String get verificationCenterTitle {
    return Intl.message(
      'Verification',
      name: 'verificationCenterTitle',
      desc: '',
      args: [],
    );
  }

  /// `Your researcher verification is approved. You can continue using verified researcher flows.`
  String get verificationApprovedBody {
    return Intl.message(
      'Your researcher verification is approved. You can continue using verified researcher flows.',
      name: 'verificationApprovedBody',
      desc: '',
      args: [],
    );
  }

  /// `Your verification request is pending review. We will keep your latest document on file until the review is completed.`
  String get verificationPendingBody {
    return Intl.message(
      'Your verification request is pending review. We will keep your latest document on file until the review is completed.',
      name: 'verificationPendingBody',
      desc: '',
      args: [],
    );
  }

  /// `Upload one clear proof document to start the verification review process.`
  String get verificationRequiredBody {
    return Intl.message(
      'Upload one clear proof document to start the verification review process.',
      name: 'verificationRequiredBody',
      desc: '',
      args: [],
    );
  }

  /// `Latest request`
  String get latestRequestLabel {
    return Intl.message(
      'Latest request',
      name: 'latestRequestLabel',
      desc: '',
      args: [],
    );
  }

  /// `Rejection reason`
  String get rejectionReasonLabel {
    return Intl.message(
      'Rejection reason',
      name: 'rejectionReasonLabel',
      desc: '',
      args: [],
    );
  }

  /// `View uploaded document`
  String get viewUploadedDocument {
    return Intl.message(
      'View uploaded document',
      name: 'viewUploadedDocument',
      desc: '',
      args: [],
    );
  }

  /// `Choose verification document`
  String get pickVerificationDocument {
    return Intl.message(
      'Choose verification document',
      name: 'pickVerificationDocument',
      desc: '',
      args: [],
    );
  }

  /// `Submit verification request`
  String get submitVerificationRequest {
    return Intl.message(
      'Submit verification request',
      name: 'submitVerificationRequest',
      desc: '',
      args: [],
    );
  }

  /// `Pending review`
  String get verificationPendingStatus {
    return Intl.message(
      'Pending review',
      name: 'verificationPendingStatus',
      desc: '',
      args: [],
    );
  }

  /// `Rejected`
  String get verificationRejectedStatus {
    return Intl.message(
      'Rejected',
      name: 'verificationRejectedStatus',
      desc: '',
      args: [],
    );
  }

  /// `Payment History`
  String get paymentHistoryTitle {
    return Intl.message(
      'Payment History',
      name: 'paymentHistoryTitle',
      desc: '',
      args: [],
    );
  }

  /// `Report Payment`
  String get reportPaymentTitle {
    return Intl.message(
      'Report Payment',
      name: 'reportPaymentTitle',
      desc: '',
      args: [],
    );
  }

  /// `Submit billing details and proof once so the team can validate your subscription access quickly and accurately.`
  String get reportPaymentOverviewBody {
    return Intl.message(
      'Submit billing details and proof once so the team can validate your subscription access quickly and accurately.',
      name: 'reportPaymentOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `No payments found yet.`
  String get noPaymentsFound {
    return Intl.message(
      'No payments found yet.',
      name: 'noPaymentsFound',
      desc: '',
      args: [],
    );
  }

  /// `Billing period`
  String get billingPeriodLabel {
    return Intl.message(
      'Billing period',
      name: 'billingPeriodLabel',
      desc: '',
      args: [],
    );
  }

  /// `Payment method`
  String get paymentMethodLabel {
    return Intl.message(
      'Payment method',
      name: 'paymentMethodLabel',
      desc: '',
      args: [],
    );
  }

  /// `Reported at`
  String get reportedAtLabel {
    return Intl.message(
      'Reported at',
      name: 'reportedAtLabel',
      desc: '',
      args: [],
    );
  }

  /// `Reference number`
  String get referenceNumberLabel {
    return Intl.message(
      'Reference number',
      name: 'referenceNumberLabel',
      desc: '',
      args: [],
    );
  }

  /// `View proof document`
  String get viewProofDocument {
    return Intl.message(
      'View proof document',
      name: 'viewProofDocument',
      desc: '',
      args: [],
    );
  }

  /// `Monthly`
  String get billingPeriodMonthly {
    return Intl.message(
      'Monthly',
      name: 'billingPeriodMonthly',
      desc: '',
      args: [],
    );
  }

  /// `Quarterly`
  String get billingPeriodQuarterly {
    return Intl.message(
      'Quarterly',
      name: 'billingPeriodQuarterly',
      desc: '',
      args: [],
    );
  }

  /// `Biannual`
  String get billingPeriodBiannual {
    return Intl.message(
      'Biannual',
      name: 'billingPeriodBiannual',
      desc: '',
      args: [],
    );
  }

  /// `Annual`
  String get billingPeriodAnnual {
    return Intl.message(
      'Annual',
      name: 'billingPeriodAnnual',
      desc: '',
      args: [],
    );
  }

  /// `Bank transfer`
  String get paymentMethodBank {
    return Intl.message(
      'Bank transfer',
      name: 'paymentMethodBank',
      desc: '',
      args: [],
    );
  }

  /// `Check`
  String get paymentMethodCheck {
    return Intl.message(
      'Check',
      name: 'paymentMethodCheck',
      desc: '',
      args: [],
    );
  }

  /// `Cash`
  String get paymentMethodCash {
    return Intl.message('Cash', name: 'paymentMethodCash', desc: '', args: []);
  }

  /// `Online payment`
  String get paymentMethodOnline {
    return Intl.message(
      'Online payment',
      name: 'paymentMethodOnline',
      desc: '',
      args: [],
    );
  }

  /// `Pending verification`
  String get paymentPendingStatus {
    return Intl.message(
      'Pending verification',
      name: 'paymentPendingStatus',
      desc: '',
      args: [],
    );
  }

  /// `Verified`
  String get paymentVerifiedStatus {
    return Intl.message(
      'Verified',
      name: 'paymentVerifiedStatus',
      desc: '',
      args: [],
    );
  }

  /// `Rejected`
  String get paymentRejectedStatus {
    return Intl.message(
      'Rejected',
      name: 'paymentRejectedStatus',
      desc: '',
      args: [],
    );
  }

  /// `Submit your payment amount, method, and proof so the team can verify your subscription access.`
  String get reportPaymentBody {
    return Intl.message(
      'Submit your payment amount, method, and proof so the team can verify your subscription access.',
      name: 'reportPaymentBody',
      desc: '',
      args: [],
    );
  }

  /// `Amount`
  String get paymentAmountLabel {
    return Intl.message(
      'Amount',
      name: 'paymentAmountLabel',
      desc: '',
      args: [],
    );
  }

  /// `Enter a valid amount greater than zero.`
  String get paymentAmountError {
    return Intl.message(
      'Enter a valid amount greater than zero.',
      name: 'paymentAmountError',
      desc: '',
      args: [],
    );
  }

  /// `Payer notes`
  String get paymentNotesLabel {
    return Intl.message(
      'Payer notes',
      name: 'paymentNotesLabel',
      desc: '',
      args: [],
    );
  }

  /// `Choose proof document`
  String get pickProofDocument {
    return Intl.message(
      'Choose proof document',
      name: 'pickProofDocument',
      desc: '',
      args: [],
    );
  }

  /// `Submit payment report`
  String get submitPaymentReportAction {
    return Intl.message(
      'Submit payment report',
      name: 'submitPaymentReportAction',
      desc: '',
      args: [],
    );
  }

  /// `Research Repository`
  String get repositoryTitle {
    return Intl.message(
      'Research Repository',
      name: 'repositoryTitle',
      desc: '',
      args: [],
    );
  }

  /// `Search premium research material, narrow by topic, and move from discovery to download without friction.`
  String get repositoryOverviewBody {
    return Intl.message(
      'Search premium research material, narrow by topic, and move from discovery to download without friction.',
      name: 'repositoryOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `Premium access is required`
  String get repositorySubscriptionRequiredTitle {
    return Intl.message(
      'Premium access is required',
      name: 'repositorySubscriptionRequiredTitle',
      desc: '',
      args: [],
    );
  }

  /// `The repository is reserved for active premium or trial subscriptions.`
  String get repositorySubscriptionRequiredBody {
    return Intl.message(
      'The repository is reserved for active premium or trial subscriptions.',
      name: 'repositorySubscriptionRequiredBody',
      desc: '',
      args: [],
    );
  }

  /// `Search papers, events, or authors`
  String get repositorySearchHint {
    return Intl.message(
      'Search papers, events, or authors',
      name: 'repositorySearchHint',
      desc: '',
      args: [],
    );
  }

  /// `No papers matched your current filters.`
  String get repositoryEmptyState {
    return Intl.message(
      'No papers matched your current filters.',
      name: 'repositoryEmptyState',
      desc: '',
      args: [],
    );
  }

  /// `Views`
  String get repositoryViewsLabel {
    return Intl.message(
      'Views',
      name: 'repositoryViewsLabel',
      desc: '',
      args: [],
    );
  }

  /// `Downloads`
  String get repositoryDownloadsLabel {
    return Intl.message(
      'Downloads',
      name: 'repositoryDownloadsLabel',
      desc: '',
      args: [],
    );
  }

  /// `Download paper`
  String get repositoryDownloadAction {
    return Intl.message(
      'Download paper',
      name: 'repositoryDownloadAction',
      desc: '',
      args: [],
    );
  }

  /// `View details`
  String get repositoryDetailAction {
    return Intl.message(
      'View details',
      name: 'repositoryDetailAction',
      desc: '',
      args: [],
    );
  }

  /// `Paper Details`
  String get repositoryDetailTitle {
    return Intl.message(
      'Paper Details',
      name: 'repositoryDetailTitle',
      desc: '',
      args: [],
    );
  }

  /// `Review the paper context, abstract, and download package before opening the full document.`
  String get repositoryDetailOverviewBody {
    return Intl.message(
      'Review the paper context, abstract, and download package before opening the full document.',
      name: 'repositoryDetailOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `Abstract`
  String get repositoryAbstractTitle {
    return Intl.message(
      'Abstract',
      name: 'repositoryAbstractTitle',
      desc: '',
      args: [],
    );
  }

  /// `Download`
  String get repositoryDownloadSectionTitle {
    return Intl.message(
      'Download',
      name: 'repositoryDownloadSectionTitle',
      desc: '',
      args: [],
    );
  }

  /// `Paper file`
  String get repositoryPaperFileFallback {
    return Intl.message(
      'Paper file',
      name: 'repositoryPaperFileFallback',
      desc: '',
      args: [],
    );
  }

  /// `No downloadable file is available for this paper.`
  String get repositoryNoFileAvailable {
    return Intl.message(
      'No downloadable file is available for this paper.',
      name: 'repositoryNoFileAvailable',
      desc: '',
      args: [],
    );
  }

  /// `We could not read the selected file.`
  String get fileReadFailed {
    return Intl.message(
      'We could not read the selected file.',
      name: 'fileReadFailed',
      desc: '',
      args: [],
    );
  }

  /// `Only PDF, JPG, or PNG files are allowed here.`
  String get secureFileTypeError {
    return Intl.message(
      'Only PDF, JPG, or PNG files are allowed here.',
      name: 'secureFileTypeError',
      desc: '',
      args: [],
    );
  }

  /// `The selected file exceeds the 10 MB limit.`
  String get secureFileSizeError {
    return Intl.message(
      'The selected file exceeds the 10 MB limit.',
      name: 'secureFileSizeError',
      desc: '',
      args: [],
    );
  }

  /// `Choose a file before submitting.`
  String get secureFileRequiredError {
    return Intl.message(
      'Choose a file before submitting.',
      name: 'secureFileRequiredError',
      desc: '',
      args: [],
    );
  }

  /// `We could not open the file.`
  String get fileOpenFailed {
    return Intl.message(
      'We could not open the file.',
      name: 'fileOpenFailed',
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

  /// `Review the event timing, location, topics, and next actions before bookmarking or submitting.`
  String get eventDetailsOverviewBody {
    return Intl.message(
      'Review the event timing, location, topics, and next actions before bookmarking or submitting.',
      name: 'eventDetailsOverviewBody',
      desc: '',
      args: [],
    );
  }

  /// `This mobile release is intentionally focused on researcher workflows, so unsupported accounts are stopped here instead of failing later.`
  String get unsupportedRoleOverviewBody {
    return Intl.message(
      'This mobile release is intentionally focused on researcher workflows, so unsupported accounts are stopped here instead of failing later.',
      name: 'unsupportedRoleOverviewBody',
      desc: '',
      args: [],
    );
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
