import 'package:eventy360/app/router/app_router.dart';
import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/features/auth/application/session_state.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('keeps authenticated users away from auth routes', () {
    final redirect = appRedirect(
      session: const AsyncData(
        SessionState(
          user: AuthUser(id: '1', email: 'r@e.com', role: 'researcher'),
          onboardingCompleted: true,
          profileCompleted: true,
          isVerified: true,
        ),
      ),
      location: RoutePaths.signIn,
    );

    expect(redirect, RoutePaths.home);
  });

  test('redirects unauthenticated first launch to onboarding', () {
    final redirect = appRedirect(
      session: const AsyncData(
        SessionState(
          onboardingCompleted: false,
          profileCompleted: false,
          isVerified: false,
        ),
      ),
      location: RoutePaths.signIn,
    );

    expect(redirect, RoutePaths.onboarding);
  });

  test('redirects authenticated incomplete profile to profile gate', () {
    final redirect = appRedirect(
      session: const AsyncData(
        SessionState(
          user: AuthUser(id: '1', email: 'r@e.com', role: 'researcher'),
          onboardingCompleted: true,
          profileCompleted: false,
          isVerified: false,
        ),
      ),
      location: RoutePaths.home,
    );

    expect(redirect, RoutePaths.profileGate);
  });

  test('redirects authenticated non-researcher to unsupported-role screen', () {
    final redirect = appRedirect(
      session: const AsyncData(
        SessionState(
          user: AuthUser(id: '1', email: 'org@e.com', role: 'organizer'),
          onboardingCompleted: true,
          profileCompleted: true,
          isVerified: false,
        ),
      ),
      location: RoutePaths.home,
    );

    expect(redirect, RoutePaths.unsupportedRole);
  });

  test('keeps splash route while session is loading', () {
    final redirect = appRedirect(
      session: const AsyncLoading(),
      location: RoutePaths.splash,
    );

    expect(redirect, isNull);
  });
}
