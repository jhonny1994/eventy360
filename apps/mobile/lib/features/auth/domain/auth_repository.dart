import 'package:eventy360/features/auth/domain/auth_deep_link_intent.dart';
import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:eventy360/features/auth/domain/location_option.dart';
import 'package:eventy360/features/auth/domain/researcher_profile.dart';
import 'package:eventy360/features/auth/domain/user_profile_status.dart';

abstract class AuthRepository {
  Future<AuthUser?> getCurrentUser();
  Future<UserProfileStatus> getUserProfileStatus(String userId);
  Future<List<LocationOption>> fetchWilayas(String localeCode);
  Future<List<LocationOption>> fetchDairas({
    required int wilayaId,
    required String localeCode,
  });
  Future<void> completeResearcherProfile({
    required String fullName,
    required String institution,
    required int wilayaId,
    required int dairaId,
  });
  Future<ResearcherProfile> fetchResearcherProfile();
  Future<void> updateResearcherProfile({
    required String fullName,
    required String institution,
    required String academicPosition,
    required String bio,
    required int wilayaId,
    required int dairaId,
  });
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
