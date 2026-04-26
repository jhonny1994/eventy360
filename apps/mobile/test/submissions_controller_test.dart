import 'package:eventy360/app/providers.dart';
import 'package:eventy360/core/domain/operation_receipt.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';
import 'package:eventy360/features/submissions/domain/submissions_repository.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('submits abstract and returns receipt', () async {
    final repository = _FakeSubmissionsRepository();
    SharedPreferences.setMockInitialValues(<String, Object>{});
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        submissionsRepositoryProvider.overrideWithValue(repository),
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
    );
    addTearDown(container.dispose);

    await container.read(submissionsControllerProvider.future);
    await container
        .read(submissionsControllerProvider.notifier)
        .submitAbstract(
          const SubmitAbstractInput(
            eventId: 'evt-1',
            titleAr: 'عنوان',
            abstractAr: 'ملخص',
          ),
        );

    final state = container.read(submissionsControllerProvider).asData!.value;
    expect(state.lastReceipt, isNotNull);
    expect(state.submissions.length, 1);
    expect(state.submissions.first.id, 'sub-1');
  });

  test('retries transient errors then succeeds', () async {
    final repository = _FakeSubmissionsRepository()
      ..transientFailuresBeforeSuccess = 2;
    SharedPreferences.setMockInitialValues(<String, Object>{});
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        submissionsRepositoryProvider.overrideWithValue(repository),
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
    );
    addTearDown(container.dispose);

    await container.read(submissionsControllerProvider.future);
    await container
        .read(submissionsControllerProvider.notifier)
        .submitAbstract(
          const SubmitAbstractInput(
            eventId: 'evt-1',
            titleAr: 'عنوان',
            abstractAr: 'ملخص',
          ),
        );

    expect(repository.submitAbstractCallCount, 3);
    final state = container.read(submissionsControllerProvider).asData!.value;
    expect(state.errorMessage, isNull);
    expect(state.lastReceipt?.id, 'sub-1');
  });

  test('saves and reads draft', () async {
    final repository = _FakeSubmissionsRepository();
    SharedPreferences.setMockInitialValues(<String, Object>{});
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        submissionsRepositoryProvider.overrideWithValue(repository),
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
    );
    addTearDown(container.dispose);

    await container.read(submissionsControllerProvider.future);
    await container
        .read(submissionsControllerProvider.notifier)
        .saveDraft(
          const SubmissionDraft(
            kind: SubmissionWriteKind.abstract,
            eventId: 'evt-9',
            titleAr: 'draft',
            abstractAr: 'draft abstract',
          ),
        );

    final draft = container
        .read(submissionsControllerProvider.notifier)
        .getDraft(SubmissionWriteKind.abstract, idOrEvent: 'evt-9');
    expect(draft, isNotNull);
    expect(draft!.titleAr, 'draft');
  });

  test('submits full paper and refreshes submissions', () async {
    final repository = _FakeSubmissionsRepository();
    SharedPreferences.setMockInitialValues(<String, Object>{});
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        submissionsRepositoryProvider.overrideWithValue(repository),
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
    );
    addTearDown(container.dispose);

    await container.read(submissionsControllerProvider.future);
    await container
        .read(submissionsControllerProvider.notifier)
        .submitFullPaper(
          SubmitFullPaperInput(
            submissionId: 'sub-1',
            file: SubmissionUploadFile(
              bytes: Uint8List.fromList(<int>[1, 2, 3]),
              fileName: 'paper.pdf',
              mimeType: 'application/pdf',
            ),
          ),
        );

    final state = container.read(submissionsControllerProvider).asData!.value;
    expect(state.lastReceipt?.id, 'sub-1');
    expect(repository.submitFullPaperCallCount, 1);
  });

  test('submits revision and refreshes submissions', () async {
    final repository = _FakeSubmissionsRepository();
    SharedPreferences.setMockInitialValues(<String, Object>{});
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        submissionsRepositoryProvider.overrideWithValue(repository),
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
    );
    addTearDown(container.dispose);

    await container.read(submissionsControllerProvider.future);
    await container
        .read(submissionsControllerProvider.notifier)
        .submitRevision(
          SubmitRevisionInput(
            submissionId: 'sub-1',
            file: SubmissionUploadFile(
              bytes: Uint8List.fromList(<int>[4, 5, 6]),
              fileName: 'revision.pdf',
              mimeType: 'application/pdf',
            ),
            revisionNotes: 'Updated references',
          ),
        );

    final state = container.read(submissionsControllerProvider).asData!.value;
    expect(state.lastReceipt?.id, 'sub-1');
    expect(repository.submitRevisionCallCount, 1);
  });
}

class _FakeSubmissionsRepository implements SubmissionsRepository {
  final List<SubmissionRecord> _items = <SubmissionRecord>[
    SubmissionRecord(
      id: 'sub-1',
      eventId: 'evt-1',
      eventTitle: 'Event',
      title: 'Seed submission',
      abstractText: 'Seed abstract',
      status: SubmissionStatus.abstractAccepted,
      submissionDate: DateTime(2026),
      updatedAt: DateTime(2026),
      abstractStatus: SubmissionStatus.abstractAccepted,
      fullPaperStatus: SubmissionStatus.revisionRequested,
      currentAbstractVersionId: 'v1',
    ),
  ];

  int submitAbstractCallCount = 0;
  int submitFullPaperCallCount = 0;
  int submitRevisionCallCount = 0;
  int transientFailuresBeforeSuccess = 0;

  @override
  Future<List<SubmissionRecord>> fetchMySubmissions() async {
    return List<SubmissionRecord>.from(_items);
  }

  @override
  Future<SubmissionDetail> fetchSubmissionDetail(String submissionId) async {
    final record = _items.firstWhere((item) => item.id == submissionId);
    return SubmissionDetail(record: record, timeline: const []);
  }

  @override
  Future<SubmissionWriteResult> submitAbstract(
    SubmitAbstractInput input,
  ) async {
    submitAbstractCallCount += 1;
    if (transientFailuresBeforeSuccess > 0) {
      transientFailuresBeforeSuccess -= 1;
      throw SubmissionTransientError('timeout');
    }
    final record = SubmissionRecord(
      id: 'sub-1',
      eventId: input.eventId,
      eventTitle: 'Event',
      title: input.titleAr,
      abstractText: input.abstractAr,
      status: SubmissionStatus.abstractSubmitted,
      submissionDate: DateTime(2026),
      updatedAt: DateTime(2026),
      abstractStatus: SubmissionStatus.abstractSubmitted,
      currentAbstractVersionId: 'v1',
    );
    _items
      ..removeWhere((item) => item.id == record.id)
      ..add(record);
    return SubmissionWriteResult(
      submissionId: record.id,
      receipt: OperationReceipt(
        id: record.id,
        message: 'ok',
        timestamp: DateTime(2026),
      ),
    );
  }

  @override
  Future<SubmissionWriteResult> submitFullPaper(
    SubmitFullPaperInput input,
  ) async {
    submitFullPaperCallCount += 1;
    return SubmissionWriteResult(
      submissionId: input.submissionId,
      receipt: OperationReceipt(
        id: input.submissionId,
        message: 'ok',
        timestamp: DateTime(2026),
      ),
    );
  }

  @override
  Future<SubmissionWriteResult> submitRevision(
    SubmitRevisionInput input,
  ) async {
    submitRevisionCallCount += 1;
    return SubmissionWriteResult(
      submissionId: input.submissionId,
      receipt: OperationReceipt(
        id: input.submissionId,
        message: 'ok',
        timestamp: DateTime(2026),
      ),
    );
  }
}
