import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/features/auth/domain/auth_repository.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

class SupabaseAuthRepository implements AuthRepository {
  SupabaseAuthRepository();

  supabase.GoTrueClient get _auth => _client.auth;

  supabase.SupabaseClient get _client {
    try {
      return supabase.Supabase.instance.client;
    } catch (_) {
      throw AuthException(
        'Supabase is not initialized. Provide SUPABASE_URL and SUPABASE_ANON_KEY.',
      );
    }
  }

  @override
  Stream<AuthUser?> authStateChanges() {
    return _auth.onAuthStateChange.map((event) => _mapUser(event.session?.user));
  }

  @override
  Future<AuthUser?> getCurrentUser() async {
    final user = _auth.currentUser;
    return _mapUser(user);
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.resetPasswordForEmail(email);
  }

  @override
  Future<AuthUser> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _auth.signInWithPassword(email: email, password: password);
    final user = response.user;
    if (user == null || user.email == null) {
      throw AuthException('Sign in did not return a valid user.');
    }
    return _mapUser(user)!;
  }

  @override
  Future<AuthUser> signUp({
    required String email,
    required String password,
  }) async {
    final response = await _auth.signUp(email: email, password: password);
    final user = response.user;
    if (user == null || user.email == null) {
      throw AuthException('Sign up did not return a valid user.');
    }
    return _mapUser(user)!;
  }

  @override
  Future<void> signOut() => _auth.signOut();

  AuthUser? _mapUser(supabase.User? user) {
    if (user == null || user.email == null) {
      return null;
    }
    final role = user.userMetadata?['role']?.toString() ??
        user.appMetadata['role']?.toString() ??
        'researcher';
    return AuthUser(
      id: user.id,
      email: user.email!,
      role: role,
    );
  }
}
