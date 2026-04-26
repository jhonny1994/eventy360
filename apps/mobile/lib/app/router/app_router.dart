import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/application/session_state.dart';
import 'package:eventy360/features/auth/presentation/onboarding_screen.dart';
import 'package:eventy360/features/auth/presentation/password_reset_screen.dart';
import 'package:eventy360/features/auth/presentation/profile_gate_screen.dart';
import 'package:eventy360/features/auth/presentation/sign_in_screen.dart';
import 'package:eventy360/features/auth/presentation/sign_up_screen.dart';
import 'package:eventy360/features/auth/presentation/splash_screen.dart';
import 'package:eventy360/features/auth/presentation/unsupported_role_screen.dart';
import 'package:eventy360/features/events/presentation/event_detail_screen.dart';
import 'package:eventy360/features/events/presentation/events_screen.dart';
import 'package:eventy360/features/home/presentation/home_screen.dart';
import 'package:eventy360/features/submissions/presentation/submission_detail_screen.dart';
import 'package:eventy360/features/submissions/presentation/submission_write_screen.dart';
import 'package:eventy360/features/submissions/presentation/submissions_screen.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(sessionControllerProvider);
  return GoRouter(
    initialLocation: RoutePaths.splash,
    redirect: (context, state) => appRedirect(
      session: session,
      location: state.matchedLocation,
    ),
    routes: [
      GoRoute(
        path: RoutePaths.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: RoutePaths.onboarding,
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: RoutePaths.signIn,
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: RoutePaths.signUp,
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: RoutePaths.resetPassword,
        builder: (context, state) => PasswordResetScreen(
          isRecoveryMode: state.uri.queryParameters['mode'] == 'recovery',
        ),
      ),
      GoRoute(
        path: RoutePaths.profileGate,
        builder: (context, state) => const ProfileGateScreen(),
      ),
      GoRoute(
        path: RoutePaths.unsupportedRole,
        builder: (context, state) => const UnsupportedRoleScreen(),
      ),
      GoRoute(
        path: RoutePaths.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: RoutePaths.events,
        builder: (context, state) => const EventsScreen(),
      ),
      GoRoute(
        path: '${RoutePaths.events}/:eventId',
        builder: (context, state) =>
            EventDetailScreen(eventId: state.pathParameters['eventId'] ?? ''),
      ),
      GoRoute(
        path: RoutePaths.submissions,
        builder: (context, state) => const SubmissionsScreen(),
      ),
      GoRoute(
        path: RoutePaths.newAbstractSubmission,
        builder: (context, state) => SubmissionWriteScreen.abstract(
          prefilledEventId: state.uri.queryParameters['eventId'],
        ),
      ),
      GoRoute(
        path: '${RoutePaths.submissions}/:submissionId',
        builder: (context, state) => SubmissionDetailScreen(
          submissionId: state.pathParameters['submissionId'] ?? '',
        ),
      ),
      GoRoute(
        path: '${RoutePaths.submissions}/:submissionId/full-paper',
        builder: (context, state) => SubmissionWriteScreen.fullPaper(
          submissionId: state.pathParameters['submissionId'] ?? '',
        ),
      ),
      GoRoute(
        path: '${RoutePaths.submissions}/:submissionId/revision',
        builder: (context, state) => SubmissionWriteScreen.revision(
          submissionId: state.pathParameters['submissionId'] ?? '',
        ),
      ),
    ],
  );
});

String? appRedirect({
  required AsyncValue<SessionState> session,
  required String location,
}) {
  if (session.isLoading) {
    return location == RoutePaths.splash ? null : RoutePaths.splash;
  }

  if (session.hasError) {
    return location == RoutePaths.signIn ? null : RoutePaths.signIn;
  }

  final current = session.value!;
  final isAuthRoute =
      location == RoutePaths.signIn ||
      location == RoutePaths.signUp ||
      location == RoutePaths.resetPassword;

  if (!current.isAuthenticated) {
    if (!current.onboardingCompleted && location != RoutePaths.onboarding) {
      return RoutePaths.onboarding;
    }
    if (current.onboardingCompleted && !isAuthRoute) {
      return RoutePaths.signIn;
    }
    return null;
  }

  if (!current.isResearcher && location != RoutePaths.unsupportedRole) {
    return RoutePaths.unsupportedRole;
  }

  if (!current.profileCompleted && location != RoutePaths.profileGate) {
    return RoutePaths.profileGate;
  }

  if (location == RoutePaths.splash ||
      location == RoutePaths.onboarding ||
      isAuthRoute ||
      location == RoutePaths.profileGate) {
    return RoutePaths.home;
  }

  return null;
}
