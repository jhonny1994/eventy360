class UserProfileStatus {
  const UserProfileStatus({
    required this.userType,
    required this.isVerified,
    required this.isExtendedProfileComplete,
  });

  final String userType;
  final bool isVerified;
  final bool isExtendedProfileComplete;
}
