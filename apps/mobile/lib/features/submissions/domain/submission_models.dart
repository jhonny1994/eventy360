import 'package:eventy360/core/domain/operation_receipt.dart';
import 'package:flutter/foundation.dart';

enum SubmissionWriteKind { abstract, fullPaper, revision }

enum SubmissionStatus {
  abstractSubmitted,
  abstractAccepted,
  abstractRejected,
  fullPaperSubmitted,
  fullPaperAccepted,
  fullPaperRejected,
  revisionRequested,
  revisionUnderReview,
  completed,
}

SubmissionStatus submissionStatusFromDb(String value) {
  switch (value) {
    case 'abstract_submitted':
      return SubmissionStatus.abstractSubmitted;
    case 'abstract_accepted':
      return SubmissionStatus.abstractAccepted;
    case 'abstract_rejected':
      return SubmissionStatus.abstractRejected;
    case 'full_paper_submitted':
      return SubmissionStatus.fullPaperSubmitted;
    case 'full_paper_accepted':
      return SubmissionStatus.fullPaperAccepted;
    case 'full_paper_rejected':
      return SubmissionStatus.fullPaperRejected;
    case 'revision_requested':
      return SubmissionStatus.revisionRequested;
    case 'revision_under_review':
      return SubmissionStatus.revisionUnderReview;
    case 'completed':
      return SubmissionStatus.completed;
    default:
      return SubmissionStatus.abstractSubmitted;
  }
}

String submissionStatusToDb(SubmissionStatus status) {
  switch (status) {
    case SubmissionStatus.abstractSubmitted:
      return 'abstract_submitted';
    case SubmissionStatus.abstractAccepted:
      return 'abstract_accepted';
    case SubmissionStatus.abstractRejected:
      return 'abstract_rejected';
    case SubmissionStatus.fullPaperSubmitted:
      return 'full_paper_submitted';
    case SubmissionStatus.fullPaperAccepted:
      return 'full_paper_accepted';
    case SubmissionStatus.fullPaperRejected:
      return 'full_paper_rejected';
    case SubmissionStatus.revisionRequested:
      return 'revision_requested';
    case SubmissionStatus.revisionUnderReview:
      return 'revision_under_review';
    case SubmissionStatus.completed:
      return 'completed';
  }
}

class SubmissionRecord {
  const SubmissionRecord({
    required this.id,
    required this.eventId,
    required this.eventTitle,
    required this.title,
    required this.abstractText,
    required this.status,
    required this.submissionDate,
    required this.updatedAt,
    this.abstractStatus,
    this.fullPaperStatus,
    this.fullPaperFileUrl,
    this.currentAbstractVersionId,
    this.currentFullPaperVersionId,
  });

  final String id;
  final String eventId;
  final String eventTitle;
  final String title;
  final String abstractText;
  final SubmissionStatus status;
  final DateTime submissionDate;
  final DateTime updatedAt;
  final SubmissionStatus? abstractStatus;
  final SubmissionStatus? fullPaperStatus;
  final String? fullPaperFileUrl;
  final String? currentAbstractVersionId;
  final String? currentFullPaperVersionId;

  bool get canSubmitFullPaper =>
      abstractStatus == SubmissionStatus.abstractAccepted &&
      fullPaperStatus != SubmissionStatus.fullPaperSubmitted &&
      fullPaperStatus != SubmissionStatus.revisionUnderReview &&
      fullPaperStatus != SubmissionStatus.fullPaperAccepted;

  bool get canSubmitRevision =>
      fullPaperStatus == SubmissionStatus.revisionRequested;
}

class SubmissionTimelineEntry {
  const SubmissionTimelineEntry({
    required this.title,
    required this.description,
    required this.timestamp,
  });

  final String title;
  final String description;
  final DateTime timestamp;
}

class SubmissionDetail {
  const SubmissionDetail({
    required this.record,
    required this.timeline,
  });

  final SubmissionRecord record;
  final List<SubmissionTimelineEntry> timeline;
}

class SubmissionDraft {
  const SubmissionDraft({
    required this.kind,
    this.eventId,
    this.submissionId,
    this.titleAr = '',
    this.titleEn = '',
    this.abstractAr = '',
    this.abstractEn = '',
    this.fileUrl = '',
    this.revisionNotes = '',
  });

  factory SubmissionDraft.fromJson(Map<String, dynamic> json) {
    final kindName =
        (json['kind'] as String?) ?? SubmissionWriteKind.abstract.name;
    final kind = SubmissionWriteKind.values.firstWhere(
      (candidate) => candidate.name == kindName,
      orElse: () => SubmissionWriteKind.abstract,
    );
    return SubmissionDraft(
      kind: kind,
      eventId: json['eventId'] as String?,
      submissionId: json['submissionId'] as String?,
      titleAr: (json['titleAr'] as String?) ?? '',
      titleEn: (json['titleEn'] as String?) ?? '',
      abstractAr: (json['abstractAr'] as String?) ?? '',
      abstractEn: (json['abstractEn'] as String?) ?? '',
      fileUrl: (json['fileUrl'] as String?) ?? '',
      revisionNotes: (json['revisionNotes'] as String?) ?? '',
    );
  }

  final SubmissionWriteKind kind;
  final String? eventId;
  final String? submissionId;
  final String titleAr;
  final String titleEn;
  final String abstractAr;
  final String abstractEn;
  final String fileUrl;
  final String revisionNotes;

  String get cacheKey {
    switch (kind) {
      case SubmissionWriteKind.abstract:
        return 'abstract:${eventId ?? ''}';
      case SubmissionWriteKind.fullPaper:
        return 'fullPaper:${submissionId ?? ''}';
      case SubmissionWriteKind.revision:
        return 'revision:${submissionId ?? ''}';
    }
  }

  SubmissionDraft copyWith({
    String? eventId,
    String? submissionId,
    String? titleAr,
    String? titleEn,
    String? abstractAr,
    String? abstractEn,
    String? fileUrl,
    String? revisionNotes,
  }) {
    return SubmissionDraft(
      kind: kind,
      eventId: eventId ?? this.eventId,
      submissionId: submissionId ?? this.submissionId,
      titleAr: titleAr ?? this.titleAr,
      titleEn: titleEn ?? this.titleEn,
      abstractAr: abstractAr ?? this.abstractAr,
      abstractEn: abstractEn ?? this.abstractEn,
      fileUrl: fileUrl ?? this.fileUrl,
      revisionNotes: revisionNotes ?? this.revisionNotes,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'kind': kind.name,
      'eventId': eventId,
      'submissionId': submissionId,
      'titleAr': titleAr,
      'titleEn': titleEn,
      'abstractAr': abstractAr,
      'abstractEn': abstractEn,
      'fileUrl': fileUrl,
      'revisionNotes': revisionNotes,
    };
  }
}

class SubmitAbstractInput {
  const SubmitAbstractInput({
    required this.eventId,
    required this.titleAr,
    required this.abstractAr,
    this.titleEn = '',
    this.abstractEn = '',
    this.idempotencyKey,
  });

  final String eventId;
  final String titleAr;
  final String titleEn;
  final String abstractAr;
  final String abstractEn;
  final String? idempotencyKey;
}

class SubmitFullPaperInput {
  const SubmitFullPaperInput({
    required this.submissionId,
    required this.file,
    this.idempotencyKey,
  });

  final String submissionId;
  final SubmissionUploadFile file;
  final String? idempotencyKey;
}

class SubmitRevisionInput {
  const SubmitRevisionInput({
    required this.submissionId,
    required this.file,
    this.revisionNotes = '',
    this.idempotencyKey,
  });

  final String submissionId;
  final SubmissionUploadFile file;
  final String revisionNotes;
  final String? idempotencyKey;
}

class SubmissionUploadFile {
  const SubmissionUploadFile({
    required this.bytes,
    required this.fileName,
    required this.mimeType,
  });

  final Uint8List bytes;
  final String fileName;
  final String mimeType;

  int get sizeInBytes => bytes.lengthInBytes;

  String get extension {
    final parts = fileName.split('.');
    if (parts.length < 2) {
      return 'pdf';
    }
    return parts.last.toLowerCase();
  }
}

class SubmissionWriteResult {
  const SubmissionWriteResult({
    required this.submissionId,
    required this.receipt,
  });

  final String submissionId;
  final OperationReceipt receipt;
}

class SubmissionError implements Exception {
  SubmissionError(this.message);
  final String message;

  @override
  String toString() => message;
}

class SubmissionTransientError extends SubmissionError {
  SubmissionTransientError(super.message);
}
