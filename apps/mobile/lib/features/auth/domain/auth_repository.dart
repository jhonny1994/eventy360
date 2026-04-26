import 'package:eventy360/features/auth/domain/auth_deep_link_intent.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';

abstract class AuthRepository {
  Future<AuthUser?> getCurrentUser();
  Stream<AuthUser?> authStateChanges();
  Stream<AuthDeepLinkIntent> authDeepLinkIntents();
  Future<AuthUser> signIn({
    required String email,
    required String password,
  });
  Future<AuthUser> signUp({
    required String email,
    required String password,
  });
  Future<void> signOut();
  Future<void> sendPasswordResetEmail(String email);
  Future<void> updatePassword(String newPassword);
}
