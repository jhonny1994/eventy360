import 'package:eventy360/features/auth/domain/auth_user.dart';

abstract class AuthRepository {
  Future<AuthUser?> getCurrentUser();
  Stream<AuthUser?> authStateChanges();
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
}
