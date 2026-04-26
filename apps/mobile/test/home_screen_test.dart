import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/application/session_state.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/application/events_state.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/home/application/home_subscription_provider.dart';
import 'package:eventy360/features/home/presentation/home_screen.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/features/submissions/application/submissions_state.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

void main() {
  testWidgets('home screen renders backend-backed statuses', (tester) async {
    final router = GoRouter(
      routes: [
        GoRoute(
          path: RoutePaths.home,
          builder: (context, state) => const HomeScreen(),
        ),
      ],
      initialLocation: RoutePaths.home,
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sessionControllerProvider.overrideWith(
            () => _FakeSessionController(
              const SessionState(
                onboardingCompleted: true,
                profileCompleted: true,
                isVerified: true,
                user: AuthUser(
                  id: 'u1',
                  email: 'user@example.com',
                  role: 'researcher',
                ),
              ),
            ),
          ),
          eventsControllerProvider.overrideWith(
            () => _FakeEventsController(
              EventsState.initial().copyWith(
                events: [
                  EventSummary(
                    id: 'evt-1',
                    title: 'AI Summit',
                    deadline: DateTime(2026, 5, 10),
                    location: 'Algiers',
                    topics: const ['AI'],
                    isBookmarked: false,
                  ),
                ],
              ),
            ),
          ),
          submissionsControllerProvider.overrideWith(
            () => _FakeSubmissionsController(
              SubmissionsState(
                submissions: [
                  SubmissionRecord(
                    id: 'sub-1',
                    eventId: 'evt-1',
                    eventTitle: 'AI Summit',
                    title: 'Paper',
                    abstractText: 'Text',
                    status: SubmissionStatus.abstractSubmitted,
                    submissionDate: testDate,
                    updatedAt: testDate,
                  ),
                ],
              ),
            ),
          ),
          homeSubscriptionStatusProvider.overrideWith(
            (ref) async =>
                const HomeSubscriptionStatus(isActive: true, isTrial: false),
          ),
        ],
        child: MaterialApp.router(
          routerConfig: router,
          supportedLocales: S.delegate.supportedLocales,
          localizationsDelegates: const [
            S.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Verified'), findsOneWidget);
    expect(find.text('Premium subscription active'), findsOneWidget);
    expect(find.text('1 active submissions'), findsOneWidget);
  });
}

final testDate = DateTime(2026);

class _FakeSessionController extends SessionController {
  _FakeSessionController(this.value);

  final SessionState value;

  @override
  Future<SessionState> build() async => value;
}

class _FakeEventsController extends EventsController {
  _FakeEventsController(this.value);

  final EventsState value;

  @override
  Future<EventsState> build() async => value;
}

class _FakeSubmissionsController extends SubmissionsController {
  _FakeSubmissionsController(this.value);

  final SubmissionsState value;

  @override
  Future<SubmissionsState> build() async => value;
}
