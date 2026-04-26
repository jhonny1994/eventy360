import 'package:eventy360/app/providers.dart';
import 'package:eventy360/features/auth/application/session_state.dart';
import 'package:eventy360/features/auth/domain/auth_deep_link_intent.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/features/auth/domain/auth_repository.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:eventy360/features/auth/infrastructure/supabase_auth_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'session_controller.g.dart';

const _onboardingKey = 'auth.onboarding_completed';

@Riverpod(keepAlive: true)
AuthRepository authRepository(Ref ref) {
  return SupabaseAuthRepository();
}

@Riverpod(keepAlive: true)
Stream<AuthUser?> authStateChanges(Ref ref) {
  return ref.watch(authRepositoryProvider).authStateChanges();
}

@Riverpod(keepAlive: true)
Stream<AuthDeepLinkIntent> authDeepLinkIntents(Ref ref) {
  return ref.watch(authRepositoryProvider).authDeepLinkIntents();
}

@Riverpod(keepAlive: true)
class SessionController extends _$SessionController {
  @override
  Future<SessionState> build() async {
    final prefs = ref.watch(sharedPreferencesProvider);
    final onboardingCompleted = prefs.getBool(_onboardingKey) ?? false;

    AuthUser? currentUser;
    try {
      currentUser = await ref.watch(authRepositoryProvider).getCurrentUser();
    } on Object {
      currentUser = null;
    }

    ref.listen(authStateChangesProvider, (previous, next) {
      next.whenData((user) async {
        final previousData = state.asData?.value;
        if (previousData == null) {
          return;
        }
        var nextUser = user;
        var profileCompleted = false;
        var isVerified = false;
        if (user != null) {
          final profile = await ref
              .read(authRepositoryProvider)
              .getUserProfileStatus(user.id);
          nextUser = user.copyWith(role: profile.userType);
          profileCompleted = profile.isExtendedProfileComplete;
          isVerified = profile.isVerified;
        }
        state = AsyncData(
          previousData.copyWith(
            user: nextUser,
            profileCompleted: profileCompleted,
            isVerified: isVerified,
          ),
        );
      });
    });

    var profileCompleted = false;
    var isVerified = false;
    if (currentUser != null) {
      final profile = await ref
          .watch(authRepositoryProvider)
          .getUserProfileStatus(currentUser.id);
      currentUser = currentUser.copyWith(role: profile.userType);
      profileCompleted = profile.isExtendedProfileComplete;
      isVerified = profile.isVerified;
    }

    return SessionState(
      user: currentUser,
      onboardingCompleted: onboardingCompleted,
      profileCompleted: profileCompleted,
      isVerified: isVerified,
    );
  }

  Future<void> setOnboardingCompleted({required bool value}) async {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    await ref.read(sharedPreferencesProvider).setBool(_onboardingKey, value);
    state = AsyncData(current.copyWith(onboardingCompleted: value));
  }

  Future<void> completeResearcherProfile({
    required String fullName,
    required String institution,
    required int wilayaId,
    required int dairaId,
  }) async {
    final current = state.asData?.value;
    final user = current?.user;
    if (current == null || user == null) {
      return;
    }
    await ref
        .read(authRepositoryProvider)
        .completeResearcherProfile(
          fullName: fullName,
          institution: institution,
          wilayaId: wilayaId,
          dairaId: dairaId,
        );
    final profile = await ref
        .read(authRepositoryProvider)
        .getUserProfileStatus(user.id);
    state = AsyncData(
      current.copyWith(
        user: user.copyWith(role: profile.userType),
        profileCompleted: profile.isExtendedProfileComplete,
        isVerified: profile.isVerified,
      ),
    );
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    final previous = state.asData?.value;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final user = await ref
          .read(authRepositoryProvider)
          .signIn(email: email, password: password);
      final profile = await ref
          .read(authRepositoryProvider)
          .getUserProfileStatus(user.id);
      return (previous ??
              const SessionState(
                onboardingCompleted: true,
                profileCompleted: false,
                isVerified: false,
              ))
          .copyWith(
            user: user.copyWith(role: profile.userType),
            onboardingCompleted: true,
            profileCompleted: profile.isExtendedProfileComplete,
            isVerified: profile.isVerified,
          );
    });
  }

  Future<void> signUp({
    required String email,
    required String password,
  }) async {
    final previous = state.asData?.value;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final user = await ref
          .read(authRepositoryProvider)
          .signUp(email: email, password: password);
      final profile = await ref
          .read(authRepositoryProvider)
          .getUserProfileStatus(user.id);
      return (previous ??
              const SessionState(
                onboardingCompleted: true,
                profileCompleted: false,
                isVerified: false,
              ))
          .copyWith(
            user: user.copyWith(role: profile.userType),
            onboardingCompleted: true,
            profileCompleted: profile.isExtendedProfileComplete,
            isVerified: profile.isVerified,
          );
    });
  }

  Future<void> signOut() async {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    await ref.read(authRepositoryProvider).signOut();
    state = AsyncData(
      current.copyWith(
        user: null,
        profileCompleted: false,
        isVerified: false,
      ),
    );
  }

  Future<void> sendPasswordReset(String email) async {
    try {
      await ref.read(authRepositoryProvider).sendPasswordResetEmail(email);
    } catch (error) {
      if (error is AuthException) {
        rethrow;
      }
      throw AuthException('Password reset failed.');
    }
  }

  Future<void> updatePassword(String newPassword) async {
    if (newPassword.length < 8) {
      throw AuthException('Password must be at least 8 characters.');
    }
    try {
      await ref.read(authRepositoryProvider).updatePassword(newPassword);
    } catch (error) {
      if (error is AuthException) {
        rethrow;
      }
      throw AuthException('Password update failed.');
    }
  }
}
