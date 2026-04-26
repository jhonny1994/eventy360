import 'dart:async';
import 'dart:convert';

import 'package:eventy360/app/providers.dart';
import 'package:eventy360/features/submissions/application/submissions_state.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';
import 'package:eventy360/features/submissions/domain/submissions_repository.dart';
import 'package:eventy360/features/submissions/infrastructure/supabase_submissions_repository.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final submissionsRepositoryProvider = Provider<SubmissionsRepository>((ref) {
  return SupabaseSubmissionsRepository(ref);
});

final submissionsControllerProvider =
    AsyncNotifierProvider<SubmissionsController, SubmissionsState>(
      SubmissionsController.new,
    );

class SubmissionsController extends AsyncNotifier<SubmissionsState> {
  static const _draftCacheKey = 'submissions.drafts.v1';

  @override
  Future<SubmissionsState> build() async {
    final repository = ref.watch(submissionsRepositoryProvider);
    final drafts = _readDraftsFromPrefs();
    final submissions = await repository.fetchMySubmissions();
    return SubmissionsState(submissions: submissions, drafts: drafts);
  }

  Future<void> refresh() async {
    final current = state.asData?.value ?? const SubmissionsState();
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final submissions = await ref
          .read(submissionsRepositoryProvider)
          .fetchMySubmissions();
      return current.copyWith(
        submissions: submissions,
        clearError: true,
      );
    });
  }

  Future<void> loadSubmissionDetail(String submissionId) async {
    final current = state.asData?.value ?? const SubmissionsState();
    state = AsyncData(current.copyWith(clearError: true));
    state = await AsyncValue.guard(() async {
      final detail = await ref
          .read(submissionsRepositoryProvider)
          .fetchSubmissionDetail(submissionId);
      return (state.asData?.value ?? current).copyWith(
        selectedDetail: detail,
        clearError: true,
      );
    });
  }

  Future<void> submitAbstract(SubmitAbstractInput input) async {
    await _submitWithGuards(
      operation: () async {
        return ref.read(submissionsRepositoryProvider).submitAbstract(input);
      },
      draftKey: SubmissionDraft(
        kind: SubmissionWriteKind.abstract,
        eventId: input.eventId,
      ).cacheKey,
    );
  }

  Future<void> submitFullPaper(SubmitFullPaperInput input) async {
    await _submitWithGuards(
      operation: () async {
        return ref.read(submissionsRepositoryProvider).submitFullPaper(input);
      },
      draftKey: SubmissionDraft(
        kind: SubmissionWriteKind.fullPaper,
        submissionId: input.submissionId,
      ).cacheKey,
    );
  }

  Future<void> submitRevision(SubmitRevisionInput input) async {
    await _submitWithGuards(
      operation: () async {
        return ref.read(submissionsRepositoryProvider).submitRevision(input);
      },
      draftKey: SubmissionDraft(
        kind: SubmissionWriteKind.revision,
        submissionId: input.submissionId,
      ).cacheKey,
    );
  }

  Future<void> _submitWithGuards({
    required Future<SubmissionWriteResult> Function() operation,
    required String draftKey,
  }) async {
    final current = state.asData?.value ?? const SubmissionsState();
    if (current.isSubmitting) {
      return;
    }
    state = AsyncData(
      current.copyWith(
        isSubmitting: true,
        clearError: true,
      ),
    );
    try {
      final result = await _runWithRetry(operation);
      final refreshedSubmissions = await ref
          .read(submissionsRepositoryProvider)
          .fetchMySubmissions();
      final nextDrafts = {...(state.asData?.value.drafts ?? current.drafts)}
        ..remove(draftKey);
      await _writeDraftsToPrefs(nextDrafts);
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          submissions: refreshedSubmissions,
          isSubmitting: false,
          drafts: nextDrafts,
          lastReceipt: result.receipt,
          clearError: true,
        ),
      );
    } on SubmissionError catch (error) {
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          isSubmitting: false,
          errorMessage: error.message,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          isSubmitting: false,
          errorMessage: error.toString(),
        ),
      );
    }
  }

  Future<T> _runWithRetry<T>(Future<T> Function() operation) async {
    var attempt = 0;
    while (true) {
      attempt += 1;
      try {
        return await operation();
      } on SubmissionTransientError {
        if (attempt >= 3) {
          rethrow;
        }
        await Future<void>.delayed(Duration(milliseconds: 350 * attempt));
      } on TimeoutException {
        if (attempt >= 3) {
          throw SubmissionTransientError('Request timed out after retries.');
        }
        await Future<void>.delayed(Duration(milliseconds: 350 * attempt));
      }
    }
  }

  Future<void> clearReceipt() async {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    state = AsyncData(current.copyWith(clearReceipt: true));
  }

  Future<void> saveDraft(SubmissionDraft draft) async {
    final current = state.asData?.value ?? const SubmissionsState();
    final drafts = {...current.drafts, draft.cacheKey: draft};
    await _writeDraftsToPrefs(drafts);
    state = AsyncData(current.copyWith(drafts: drafts, clearError: true));
  }

  SubmissionDraft? getDraft(SubmissionWriteKind kind, {String? idOrEvent}) {
    final drafts =
        state.asData?.value.drafts ?? const <String, SubmissionDraft>{};
    final key = switch (kind) {
      SubmissionWriteKind.abstract => 'abstract:${idOrEvent ?? ''}',
      SubmissionWriteKind.fullPaper => 'fullPaper:${idOrEvent ?? ''}',
      SubmissionWriteKind.revision => 'revision:${idOrEvent ?? ''}',
    };
    return drafts[key];
  }

  Future<void> clearDraft(SubmissionWriteKind kind, {String? idOrEvent}) async {
    final current = state.asData?.value ?? const SubmissionsState();
    final key = switch (kind) {
      SubmissionWriteKind.abstract => 'abstract:${idOrEvent ?? ''}',
      SubmissionWriteKind.fullPaper => 'fullPaper:${idOrEvent ?? ''}',
      SubmissionWriteKind.revision => 'revision:${idOrEvent ?? ''}',
    };
    final drafts = {...current.drafts}..remove(key);
    await _writeDraftsToPrefs(drafts);
    state = AsyncData(current.copyWith(drafts: drafts));
  }

  Map<String, SubmissionDraft> _readDraftsFromPrefs() {
    final raw = ref.read(sharedPreferencesProvider).getString(_draftCacheKey);
    if (raw == null || raw.isEmpty) {
      return <String, SubmissionDraft>{};
    }
    try {
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      return decoded.map((key, value) {
        return MapEntry(
          key,
          SubmissionDraft.fromJson((value as Map).cast<String, dynamic>()),
        );
      });
    } on Object catch (error) {
      debugPrint('Failed to parse submission drafts: $error');
      return <String, SubmissionDraft>{};
    }
  }

  Future<void> _writeDraftsToPrefs(Map<String, SubmissionDraft> drafts) async {
    final encoded = jsonEncode(
      drafts.map((key, value) => MapEntry(key, value.toJson())),
    );
    await ref
        .read(sharedPreferencesProvider)
        .setString(_draftCacheKey, encoded);
  }
}
