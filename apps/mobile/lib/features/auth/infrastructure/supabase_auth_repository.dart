import 'package:eventy360/features/auth/domain/auth_deep_link_intent.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/features/auth/domain/auth_repository.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:eventy360/features/auth/domain/location_option.dart';
import 'package:eventy360/features/auth/domain/user_profile_status.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

class SupabaseAuthRepository implements AuthRepository {
  SupabaseAuthRepository();

  supabase.GoTrueClient get _auth => _client.auth;

  supabase.SupabaseClient get _client {
    try {
      return supabase.Supabase.instance.client;
    } on Object {
      throw AuthException(
        'Supabase is not initialized. Provide SUPABASE_URL and SUPABASE_ANON_KEY.',
      );
    }
  }

  @override
  Stream<AuthUser?> authStateChanges() {
    return _auth.onAuthStateChange.map(
      (event) => _mapUser(event.session?.user),
    );
  }

  @override
  Stream<AuthDeepLinkIntent> authDeepLinkIntents() {
    return _auth.onAuthStateChange
        .where(
          (event) => event.event == supabase.AuthChangeEvent.passwordRecovery,
        )
        .map(
          (_) => const AuthDeepLinkIntent(
            action: AuthDeepLinkAction.passwordRecovery,
          ),
        );
  }

  @override
  Future<AuthUser?> getCurrentUser() async {
    final user = _auth.currentUser;
    return _mapUser(user);
  }

  @override
  Future<UserProfileStatus> getUserProfileStatus(String userId) async {
    final row = await _client
        .from('profiles')
        .select('user_type,is_verified,is_extended_profile_complete')
        .eq('id', userId)
        .single();
    return UserProfileStatus(
      userType: row['user_type']?.toString() ?? 'researcher',
      isVerified: row['is_verified'] == true,
      isExtendedProfileComplete: row['is_extended_profile_complete'] == true,
    );
  }

  @override
  Future<List<LocationOption>> fetchWilayas(String localeCode) async {
    final rows = await _client
        .from('wilayas')
        .select('id,name_ar,name_other')
        .order('id');
    return (rows as List<dynamic>).cast<Map<String, dynamic>>().map((row) {
      final localized = _pickLocalizedName(
        localeCode: localeCode,
        arabic: row['name_ar']?.toString(),
        other: row['name_other']?.toString(),
      );
      return LocationOption(
        id: row['id'] as int,
        name: localized,
      );
    }).toList();
  }

  @override
  Future<List<LocationOption>> fetchDairas({
    required int wilayaId,
    required String localeCode,
  }) async {
    final rows = await _client
        .from('dairas')
        .select('id,wilaya_id,name_ar,name_other')
        .eq('wilaya_id', wilayaId)
        .order('id');
    return (rows as List<dynamic>).cast<Map<String, dynamic>>().map((row) {
      final localized = _pickLocalizedName(
        localeCode: localeCode,
        arabic: row['name_ar']?.toString(),
        other: row['name_other']?.toString(),
      );
      return LocationOption(
        id: row['id'] as int,
        wilayaId: row['wilaya_id'] as int,
        name: localized,
      );
    }).toList();
  }

  @override
  Future<void> completeResearcherProfile({
    required String fullName,
    required String institution,
    required int wilayaId,
    required int dairaId,
  }) async {
    await _client.rpc<Object?>(
      'complete_my_profile',
      params: {
        'profile_data': {
          'name': fullName,
          'institution': institution,
          'academic_position': '',
          'bio_translations': <String, String>{'ar': '', 'en': ''},
          'profile_picture_url': null,
          'wilaya_id': wilayaId,
          'daira_id': dairaId,
        },
      },
    );
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.resetPasswordForEmail(email);
  }

  @override
  Future<void> updatePassword(String newPassword) async {
    await _auth.updateUser(
      supabase.UserAttributes(password: newPassword),
    );
  }

  @override
  Future<AuthUser> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _auth.signInWithPassword(
      email: email,
      password: password,
    );
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
    final role =
        user.userMetadata?['role']?.toString() ??
        user.appMetadata['role']?.toString() ??
        'researcher';
    return AuthUser(
      id: user.id,
      email: user.email!,
      role: role,
    );
  }

  String _pickLocalizedName({
    required String localeCode,
    required String? arabic,
    required String? other,
  }) {
    if (localeCode.toLowerCase().startsWith('ar')) {
      return arabic ?? other ?? '';
    }
    return other ?? arabic ?? '';
  }
}
