class RoutePaths {
  const RoutePaths._();

  static const splash = '/splash';
  static const onboarding = '/onboarding';
  static const signIn = '/auth/sign-in';
  static const signUp = '/auth/sign-up';
  static const resetPassword = '/auth/reset';
  static const profileGate = '/profile-gate';
  static const unsupportedRole = '/unsupported-role';
  static const home = '/home';
  static const events = '/events';
  static const submissions = '/submissions';
  static const newAbstractSubmission = '/submissions/new-abstract';
  static const trust = '/trust';
  static const reportPayment = '/trust/report-payment';
  static const repository = '/repository';

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
