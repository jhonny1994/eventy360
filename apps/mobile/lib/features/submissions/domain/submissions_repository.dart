import 'package:eventy360/features/submissions/domain/submission_models.dart';

abstract class SubmissionsRepository {
  Future<List<SubmissionRecord>> fetchMySubmissions();
  Future<SubmissionDetail> fetchSubmissionDetail(String submissionId);
  Future<SubmissionWriteResult> submitAbstract(SubmitAbstractInput input);
  Future<SubmissionWriteResult> submitFullPaper(SubmitFullPaperInput input);
  Future<SubmissionWriteResult> submitRevision(SubmitRevisionInput input);
}
