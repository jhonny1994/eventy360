class EventDetail {
  const EventDetail({
    required this.id,
    required this.title,
    required this.isBookmarked,
    required this.eventType,
    required this.eventDate,
    required this.status,
    required this.format,
    required this.email,
    required this.phone,
    required this.createdAt,
    this.subtitle,
    this.description,
    this.eventEndDate,
    this.abstractSubmissionDeadline,
    this.fullPaperSubmissionDeadline,
    this.submissionVerdictDeadline,
    this.abstractReviewResultDate,
    this.location,
    this.topics = const <String>[],
    this.price,
    this.problemStatement,
    this.targetAudience,
    this.scientificCommittees,
    this.speakersKeynotes,
    this.submissionGuidelines,
    this.whoOrganizes,
    this.website,
    this.logoUrl,
    this.qrCodeUrl,
    this.brochureUrl,
    this.eventAxes,
    this.organizer,
  });

  final String id;
  final String title;
  final String? subtitle;
  final String? description;
  final String eventType;
  final DateTime eventDate;
  final DateTime? eventEndDate;
  final DateTime? abstractSubmissionDeadline;
  final DateTime? fullPaperSubmissionDeadline;
  final DateTime? submissionVerdictDeadline;
  final DateTime? abstractReviewResultDate;
  final String? location;
  final List<String> topics;
  final double? price;
  final String status;
  final String format;
  final String? problemStatement;
  final String? targetAudience;
  final String? scientificCommittees;
  final String? speakersKeynotes;
  final String? submissionGuidelines;
  final String? whoOrganizes;
  final String? website;
  final String email;
  final String phone;
  final String? logoUrl;
  final String? qrCodeUrl;
  final String? brochureUrl;
  final String? eventAxes;
  final DateTime createdAt;
  final EventOrganizerDetail? organizer;
  final bool isBookmarked;
}

class EventOrganizerDetail {
  const EventOrganizerDetail({
    required this.id,
    required this.isVerified,
    this.displayName,
    this.bio,
    this.institutionType,
    this.profilePictureUrl,
  });

  final String id;
  final String? displayName;
  final String? bio;
  final String? institutionType;
  final String? profilePictureUrl;
  final bool isVerified;
}
