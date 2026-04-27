class ResearcherProfile {
  const ResearcherProfile({
    required this.fullName,
    required this.institution,
    required this.academicPosition,
    required this.bio,
    required this.wilayaId,
    required this.dairaId,
  });

  final String fullName;
  final String institution;
  final String academicPosition;
  final String bio;
  final int? wilayaId;
  final int? dairaId;
}
