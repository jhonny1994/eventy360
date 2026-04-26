import 'package:eventy360/app/providers.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/application/session_state.dart';
import 'package:eventy360/features/auth/domain/auth_deep_link_intent.dart';
import 'package:eventy360/features/auth/domain/auth_repository.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:eventy360/features/auth/domain/location_option.dart';
import 'package:eventy360/features/auth/domain/user_profile_status.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('build hydrates backend-backed profile state', () async {
    final repository = _FakeAuthRepository()
      ..currentUser = const AuthUser(
        id: 'u1',
        email: 'user@example.com',
        role: 'researcher',
      )
      ..profileStatus = const UserProfileStatus(
        userType: 'researcher',
        isVerified: true,
        isExtendedProfileComplete: true,
      );
    SharedPreferences.setMockInitialValues(
      const <String, Object>{'auth.onboarding_completed': true},
    );
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        authRepositoryProvider.overrideWithValue(repository),
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
    );
    addTearDown(container.dispose);

    final state = await container.read(sessionControllerProvider.future);

    expect(
      state,
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
    );
  });

  test(
    'completeResearcherProfile persists through repository and refreshes state',
    () async {
      final repository = _FakeAuthRepository()
        ..currentUser = const AuthUser(
          id: 'u1',
          email: 'user@example.com',
          role: 'researcher',
        )
        ..profileStatus = const UserProfileStatus(
          userType: 'researcher',
          isVerified: false,
          isExtendedProfileComplete: false,
        );
      SharedPreferences.setMockInitialValues(
        const <String, Object>{'auth.onboarding_completed': true},
      );
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(repository),
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
      );
      addTearDown(container.dispose);

      await container.read(sessionControllerProvider.future);
      await container
          .read(sessionControllerProvider.notifier)
          .completeResearcherProfile(
            fullName: 'Raouf',
            institution: 'USTHB',
            wilayaId: 16,
            dairaId: 1601,
          );

      expect(repository.completedProfileFullName, 'Raouf');
      expect(repository.completedProfileInstitution, 'USTHB');
      expect(repository.completedProfileWilayaId, 16);
      expect(repository.completedProfileDairaId, 1601);

      final updated = container.read(sessionControllerProvider).asData!.value;
      expect(updated.profileCompleted, isTrue);
    },
  );
}

class _FakeAuthRepository implements AuthRepository {
  AuthUser? currentUser;
  UserProfileStatus profileStatus = const UserProfileStatus(
    userType: 'researcher',
    isVerified: false,
    isExtendedProfileComplete: false,
  );
  String? completedProfileFullName;
  String? completedProfileInstitution;
  int? completedProfileWilayaId;
  int? completedProfileDairaId;

  @override
  Stream<AuthDeepLinkIntent> authDeepLinkIntents() =>
      const Stream<AuthDeepLinkIntent>.empty();

  @override
  Stream<AuthUser?> authStateChanges() => const Stream<AuthUser?>.empty();

  @override
  Future<void> completeResearcherProfile({
    required String fullName,
    required String institution,
    required int wilayaId,
    required int dairaId,
  }) async {
    completedProfileFullName = fullName;
    completedProfileInstitution = institution;
    completedProfileWilayaId = wilayaId;
    completedProfileDairaId = dairaId;
    profileStatus = UserProfileStatus(
      userType: profileStatus.userType,
      isVerified: profileStatus.isVerified,
      isExtendedProfileComplete: true,
    );
  }

  @override
  Future<List<LocationOption>> fetchDairas({
    required int wilayaId,
    required String localeCode,
  }) async => const <LocationOption>[];

  @override
  Future<List<LocationOption>> fetchWilayas(String localeCode) async =>
      const <LocationOption>[];

  @override
  Future<AuthUser?> getCurrentUser() async => currentUser;

  @override
  Future<UserProfileStatus> getUserProfileStatus(String userId) async =>
      profileStatus;

  @override
  Future<void> sendPasswordResetEmail(String email) async {}

  @override
  Future<AuthUser> signIn({
    required String email,
    required String password,
  }) async => currentUser!;

  @override
  Future<void> signOut() async {}

  @override
  Future<AuthUser> signUp({
    required String email,
    required String password,
  }) async => currentUser!;

  @override
  Future<void> updatePassword(String newPassword) async {}
}
