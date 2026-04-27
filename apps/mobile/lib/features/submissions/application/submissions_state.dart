import 'package:eventy360/core/domain/operation_receipt.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';

class SubmissionsState {
  const SubmissionsState({
    this.submissions = const <SubmissionRecord>[],
    this.isSubmitting = false,
    this.lastReceipt,
    this.errorMessage,
    this.selectedDetail,
    this.drafts = const <String, SubmissionDraft>{},
  });

  final List<SubmissionRecord> submissions;
  final bool isSubmitting;
  final OperationReceipt? lastReceipt;
  final String? errorMessage;
  final SubmissionDetail? selectedDetail;
  final Map<String, SubmissionDraft> drafts;

  SubmissionsState copyWith({
    List<SubmissionRecord>? submissions,
    bool? isSubmitting,
    OperationReceipt? lastReceipt,
    bool clearReceipt = false,
    String? errorMessage,
    bool clearError = false,
    SubmissionDetail? selectedDetail,
    bool clearSelectedDetail = false,
    Map<String, SubmissionDraft>? drafts,
  }) {
    return SubmissionsState(
      submissions: submissions ?? this.submissions,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      lastReceipt: clearReceipt ? null : (lastReceipt ?? this.lastReceipt),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      selectedDetail: clearSelectedDetail
          ? null
          : (selectedDetail ?? this.selectedDetail),
      drafts: drafts ?? this.drafts,
    );
  }
}
