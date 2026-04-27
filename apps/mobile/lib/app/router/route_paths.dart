class RoutePaths {
  const RoutePaths._();

  static const splash = '/splash';
  static const onboarding = '/onboarding';
  static const initialSetup = '/initial-setup';
  static const signIn = '/auth/sign-in';
  static const signUp = '/auth/sign-up';
  static const resetPassword = '/auth/reset';
  static const profileGate = '/profile-gate';
  static const unsupportedRole = '/unsupported-role';
  static const home = '/home';
  static const events = '/events';
  static const submissions = '/submissions';
  static const newAbstractSubmission = '/submissions/new-abstract';
  static const repository = '/repository';
  static const account = '/account';
  static const savedEvents = '/events/saved';
  static const trustSegment = 'trust';
  static const reportPaymentSegment = 'report-payment';
  static const topicsSegment = 'topics';
  static const profileSegment = 'profile';
  static const securitySegment = 'security';

  static String get trust => '$account/$trustSegment';

  static String get reportPayment => '$trust/$reportPaymentSegment';

  static String get topics => '$account/$topicsSegment';
  static String get accountProfile => '$account/$profileSegment';
  static String get accountSecurity => '$account/$securitySegment';

  static String eventDetail(String eventId) => '$events/$eventId';

  static String repositoryDetail(String paperId) => '$repository/$paperId';

  static String submissionDetail(String submissionId) =>
      '$submissions/$submissionId';

  static String submissionFullPaper(String submissionId) =>
      '${submissionDetail(submissionId)}/full-paper';

  static String submissionRevision(String submissionId) =>
      '${submissionDetail(submissionId)}/revision';

  static String newAbstractSubmissionForEvent(String eventId) => Uri(
    path: newAbstractSubmission,
    queryParameters: <String, String>{'eventId': eventId},
  ).toString();
}
