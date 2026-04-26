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
const _profileCompletedPrefix = 'auth.profile_completed.';

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
        state = AsyncData(
          previousData.copyWith(
            user: user,
            profileCompleted:
                user != null &&
                (prefs.getBool('$_profileCompletedPrefix${user.id}') ?? false),
          ),
        );
      });
    });

    final profileCompleted =
        currentUser != null &&
        (prefs.getBool('$_profileCompletedPrefix${currentUser.id}') ?? false);

    return SessionState(
      user: currentUser,
      onboardingCompleted: onboardingCompleted,
      profileCompleted: profileCompleted,
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

  Future<void> setProfileCompleted({required bool value}) async {
    final current = state.asData?.value;
    final user = current?.user;
    if (current == null || user == null) {
      return;
    }
    await ref
        .read(sharedPreferencesProvider)
        .setBool('$_profileCompletedPrefix${user.id}', value);
    state = AsyncData(current.copyWith(profileCompleted: value));
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
      final prefs = ref.read(sharedPreferencesProvider);
      final profileCompleted =
          prefs.getBool('$_profileCompletedPrefix${user.id}') ?? false;
      return (previous ??
              const SessionState(
                onboardingCompleted: true,
                profileCompleted: false,
              ))
          .copyWith(
            user: user,
            onboardingCompleted: true,
            profileCompleted: profileCompleted,
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
      return (previous ??
              const SessionState(
                onboardingCompleted: true,
                profileCompleted: false,
              ))
          .copyWith(
            user: user,
            onboardingCompleted: true,
            profileCompleted: false,
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
