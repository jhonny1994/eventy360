import 'dart:convert';

import 'package:eventy360/app/providers.dart';
import 'package:eventy360/core/domain/operation_receipt.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';
import 'package:eventy360/features/submissions/domain/submissions_repository.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseSubmissionsRepository implements SubmissionsRepository {
  SupabaseSubmissionsRepository(this.ref);

  final Ref ref;

  static const _idempotencyCacheKey = 'submissions.idempotency_cache';

  SupabaseClient get _client => Supabase.instance.client;

  SharedPreferences get _prefs => ref.read(sharedPreferencesProvider);

  String get _userId {
    final user = _client.auth.currentUser;
    if (user == null) {
      throw SubmissionError('User is not authenticated.');
    }
    return user.id;
  }

  @override
  Future<List<SubmissionRecord>> fetchMySubmissions() async {
    try {
      final locale = _prefs.getString('app.locale_code') ?? 'en';
      final rows = await _client
          .from('submissions')
          .select(
            'id,event_id,title_translations,abstract_translations,status,abstract_status,'
            'full_paper_status,submission_date,updated_at,full_paper_file_url,'
            'current_abstract_version_id,current_full_paper_version_id',
          )
          .eq('submitted_by', _userId)
          .isFilter('deleted_at', null)
          .order('submission_date', ascending: false);

      final submissions = (rows as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map((row) => _mapSubmissionRecord(row, locale: locale))
          .toList();

      final eventIds = submissions.map((item) => item.eventId).toSet().toList();
      final eventNamesById = <String, String>{};
      if (eventIds.isNotEmpty) {
        final eventRows = await _client
            .from('events')
            .select('id,event_name_translations')
            .inFilter('id', eventIds);
        for (final raw
            in (eventRows as List<dynamic>).cast<Map<String, dynamic>>()) {
          final translations =
              (raw['event_name_translations'] as Map?)
                  ?.cast<String, dynamic>() ??
              const <String, dynamic>{};
          eventNamesById[raw['id'].toString()] = _pickTranslation(
            translations,
            locale,
          );
        }
      }

      return submissions
          .map(
            (item) => SubmissionRecord(
              id: item.id,
              eventId: item.eventId,
              eventTitle: eventNamesById[item.eventId] ?? item.eventId,
              title: item.title,
              abstractText: item.abstractText,
              status: item.status,
              submissionDate: item.submissionDate,
              updatedAt: item.updatedAt,
              abstractStatus: item.abstractStatus,
              fullPaperStatus: item.fullPaperStatus,
              fullPaperFileUrl: item.fullPaperFileUrl,
              currentAbstractVersionId: item.currentAbstractVersionId,
              currentFullPaperVersionId: item.currentFullPaperVersionId,
            ),
          )
          .toList();
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<SubmissionDetail> fetchSubmissionDetail(String submissionId) async {
    try {
      final locale = _prefs.getString('app.locale_code') ?? 'en';
      final row = await _client
          .from('submissions')
          .select(
            'id,event_id,title_translations,abstract_translations,status,abstract_status,'
            'full_paper_status,submission_date,updated_at,full_paper_file_url,'
            'current_abstract_version_id,current_full_paper_version_id',
          )
          .eq('id', submissionId)
          .eq('submitted_by', _userId)
          .single();
      final record = _mapSubmissionRecord(row, locale: locale);

      var eventTitle = record.eventId;
      try {
        final eventRow = await _client
            .from('events')
            .select('event_name_translations')
            .eq('id', record.eventId)
            .maybeSingle();
        if (eventRow != null) {
          final translations =
              (eventRow['event_name_translations'] as Map?)
                  ?.cast<String, dynamic>() ??
              const <String, dynamic>{};
          eventTitle = _pickTranslation(translations, locale);
        }
      } on Object {
        // Non-blocking read.
      }

      final timeline = <SubmissionTimelineEntry>[
        SubmissionTimelineEntry(
          title: 'Submission created',
          description: submissionStatusToDb(
            record.abstractStatus ?? record.status,
          ),
          timestamp: record.submissionDate,
        ),
        SubmissionTimelineEntry(
          title: 'Latest status',
          description: submissionStatusToDb(record.status),
          timestamp: record.updatedAt,
        ),
      ];

      final versionIds = <String>[
        if (record.currentAbstractVersionId != null)
          record.currentAbstractVersionId!,
        if (record.currentFullPaperVersionId != null)
          record.currentFullPaperVersionId!,
      ];
      if (versionIds.isNotEmpty) {
        try {
          final feedbackRows = await _client
              .from('submission_feedback')
              .select('feedback_content,created_at')
              .inFilter('submission_version_id', versionIds)
              .order('created_at', ascending: true);
          for (final raw
              in (feedbackRows as List<dynamic>).cast<Map<String, dynamic>>()) {
            final content = raw['feedback_content']?.toString() ?? '';
            if (content.trim().isEmpty) continue;
            timeline.add(
              SubmissionTimelineEntry(
                title: 'Feedback',
                description: content,
                timestamp:
                    DateTime.tryParse(raw['created_at']?.toString() ?? '') ??
                    DateTime.now(),
              ),
            );
          }
        } on Object catch (error) {
          debugPrint('submission feedback timeline skipped: $error');
        }
      }

      timeline.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      return SubmissionDetail(
        record: SubmissionRecord(
          id: record.id,
          eventId: record.eventId,
          eventTitle: eventTitle,
          title: record.title,
          abstractText: record.abstractText,
          status: record.status,
          submissionDate: record.submissionDate,
          updatedAt: record.updatedAt,
          abstractStatus: record.abstractStatus,
          fullPaperStatus: record.fullPaperStatus,
          fullPaperFileUrl: record.fullPaperFileUrl,
          currentAbstractVersionId: record.currentAbstractVersionId,
          currentFullPaperVersionId: record.currentFullPaperVersionId,
        ),
        timeline: timeline,
      );
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<SubmissionWriteResult> submitAbstract(
    SubmitAbstractInput input,
  ) async {
    try {
      final idempotencyKey = input.idempotencyKey?.trim();
      final cached = _readIdempotencyCache();
      if (idempotencyKey != null && cached.containsKey(idempotencyKey)) {
        final existingId = cached[idempotencyKey]!;
        return SubmissionWriteResult(
          submissionId: existingId,
          receipt: _receipt(
            id: existingId,
            message:
                'Duplicate submit prevented. Existing abstract submission was reused.',
          ),
        );
      }

      final duplicateRows = await _client
          .from('submissions')
          .select('id,submission_date')
          .eq('submitted_by', _userId)
          .eq('event_id', input.eventId)
          .gte(
            'submission_date',
            DateTime.now()
                .toUtc()
                .subtract(const Duration(minutes: 3))
                .toIso8601String(),
          )
          .order('submission_date', ascending: false)
          .limit(1);
      if ((duplicateRows as List).isNotEmpty) {
        final submissionId = duplicateRows.first['id'].toString();
        if (idempotencyKey != null) {
          cached[idempotencyKey] = submissionId;
          await _writeIdempotencyCache(cached);
        }
        return SubmissionWriteResult(
          submissionId: submissionId,
          receipt: _receipt(
            id: submissionId,
            message:
                'Duplicate submit prevented. Recent abstract submission detected.',
          ),
        );
      }

      final titleTranslations = <String, dynamic>{
        'ar': input.titleAr.trim(),
        'en': input.titleEn.trim(),
      };
      final abstractTranslations = <String, dynamic>{
        'ar': input.abstractAr.trim(),
        'en': input.abstractEn.trim(),
      };

      final submissionRow = await _client
          .from('submissions')
          .insert({
            'event_id': input.eventId,
            'submitted_by': _userId,
            'title_translations': titleTranslations,
            'abstract_translations': abstractTranslations,
            'abstract_status': 'abstract_submitted',
            'status': 'abstract_submitted',
            'submission_date': DateTime.now().toUtc().toIso8601String(),
          })
          .select('id')
          .single();
      final submissionId = submissionRow['id'].toString();

      try {
        final versionRow = await _client
            .from('submission_versions')
            .insert({
              'submission_id': submissionId,
              'version_number': 1,
              'title_translations': titleTranslations,
              'abstract_translations': abstractTranslations,
              'submitted_at': DateTime.now().toUtc().toIso8601String(),
            })
            .select('id')
            .single();
        await _client
            .from('submissions')
            .update({'current_abstract_version_id': versionRow['id']})
            .eq('id', submissionId);
      } on Object catch (error) {
        debugPrint('abstract version tracking skipped: $error');
      }

      if (idempotencyKey != null) {
        cached[idempotencyKey] = submissionId;
        await _writeIdempotencyCache(cached);
      }

      return SubmissionWriteResult(
        submissionId: submissionId,
        receipt: _receipt(
          id: submissionId,
          message: 'Abstract submission completed successfully.',
        ),
      );
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<SubmissionWriteResult> submitFullPaper(
    SubmitFullPaperInput input,
  ) async {
    try {
      final idempotencyKey = input.idempotencyKey?.trim();
      final cached = _readIdempotencyCache();
      if (idempotencyKey != null && cached.containsKey(idempotencyKey)) {
        final existingId = cached[idempotencyKey]!;
        return SubmissionWriteResult(
          submissionId: existingId,
          receipt: _receipt(
            id: existingId,
            message:
                'Duplicate submit prevented. Existing full-paper submission was reused.',
          ),
        );
      }

      final submission = await _client
          .from('submissions')
          .select(
            'id,submitted_by,title_translations,abstract_translations,full_paper_status,'
            'event_id,full_paper_file_url,full_paper_file_metadata',
          )
          .eq('id', input.submissionId)
          .single();
      if (submission['submitted_by']?.toString() != _userId) {
        throw SubmissionError('Not authorized to modify this submission.');
      }

      final fullPaperStatus = submissionStatusFromDb(
        (submission['full_paper_status'] ?? '').toString(),
      );
      final currentMetadata =
          (submission['full_paper_file_metadata'] as Map?)
              ?.cast<String, dynamic>() ??
          const <String, dynamic>{};
      if (fullPaperStatus == SubmissionStatus.fullPaperSubmitted &&
          currentMetadata['originalName']?.toString() == input.file.fileName) {
        return SubmissionWriteResult(
          submissionId: input.submissionId,
          receipt: _receipt(
            id: input.submissionId,
            message:
                'Duplicate submit prevented. Same full paper is already submitted.',
          ),
        );
      }

      final versionRows = await _client
          .from('submission_versions')
          .select('version_number')
          .eq('submission_id', input.submissionId)
          .order('version_number', ascending: false)
          .limit(1);
      final nextVersion = (versionRows as List).isEmpty
          ? 1
          : (versionRows.first['version_number'] as int) + 1;

      final uploaded = await _uploadSubmissionFile(
        eventId: submission['event_id'].toString(),
        submissionId: input.submissionId,
        file: input.file,
        versionNumber: nextVersion,
      );

      final metadata = <String, dynamic>{
        'source': 'mobile_upload',
        'storage_path': uploaded.storagePath,
        'originalName': input.file.fileName,
        'size': input.file.sizeInBytes,
        'type': input.file.mimeType,
        'submitted_via': 'mobile',
      };

      final versionRow = await _client
          .from('submission_versions')
          .insert({
            'submission_id': input.submissionId,
            'version_number': nextVersion,
            'title_translations': submission['title_translations'],
            'abstract_translations': submission['abstract_translations'],
            'full_paper_file_url': uploaded.publicUrl,
            'full_paper_file_metadata': metadata,
            'submitted_at': DateTime.now().toUtc().toIso8601String(),
          })
          .select('id')
          .single();

      await _client
          .from('submissions')
          .update({
            'full_paper_file_url': uploaded.publicUrl,
            'full_paper_file_metadata': metadata,
            'full_paper_status': 'full_paper_submitted',
            'status': 'full_paper_submitted',
            'current_full_paper_version_id': versionRow['id'],
            'updated_at': DateTime.now().toUtc().toIso8601String(),
          })
          .eq('id', input.submissionId);

      if (idempotencyKey != null) {
        cached[idempotencyKey] = input.submissionId;
        await _writeIdempotencyCache(cached);
      }

      return SubmissionWriteResult(
        submissionId: input.submissionId,
        receipt: _receipt(
          id: input.submissionId,
          message: 'Full-paper submission completed successfully.',
        ),
      );
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<SubmissionWriteResult> submitRevision(
    SubmitRevisionInput input,
  ) async {
    try {
      final idempotencyKey = input.idempotencyKey?.trim();
      final cached = _readIdempotencyCache();
      if (idempotencyKey != null && cached.containsKey(idempotencyKey)) {
        final existingId = cached[idempotencyKey]!;
        return SubmissionWriteResult(
          submissionId: existingId,
          receipt: _receipt(
            id: existingId,
            message:
                'Duplicate submit prevented. Existing revision submission was reused.',
          ),
        );
      }

      final submission = await _client
          .from('submissions')
          .select(
            'id,submitted_by,title_translations,abstract_translations,'
            'full_paper_status,current_full_paper_version_id,event_id',
          )
          .eq('id', input.submissionId)
          .single();
      if (submission['submitted_by']?.toString() != _userId) {
        throw SubmissionError('Not authorized to modify this submission.');
      }
      final fullPaperStatus = submissionStatusFromDb(
        (submission['full_paper_status'] ?? '').toString(),
      );
      if (fullPaperStatus != SubmissionStatus.revisionRequested) {
        throw SubmissionError(
          'Revision submit is only allowed when revision is requested.',
        );
      }

      final versionRows = await _client
          .from('submission_versions')
          .select('version_number')
          .eq('submission_id', input.submissionId)
          .order('version_number', ascending: false)
          .limit(1);
      final nextVersion = (versionRows as List).isEmpty
          ? 1
          : (versionRows.first['version_number'] as int) + 1;

      final uploaded = await _uploadSubmissionFile(
        eventId: submission['event_id'].toString(),
        submissionId: input.submissionId,
        file: input.file,
        versionNumber: nextVersion,
      );

      final metadata = <String, dynamic>{
        'source': 'mobile_upload',
        'storage_path': uploaded.storagePath,
        'originalName': input.file.fileName,
        'size': input.file.sizeInBytes,
        'type': input.file.mimeType,
        'submitted_via': 'mobile',
        'revision_notes': input.revisionNotes.trim(),
      };

      final versionRow = await _client
          .from('submission_versions')
          .insert({
            'submission_id': input.submissionId,
            'version_number': nextVersion,
            'title_translations': submission['title_translations'],
            'abstract_translations': submission['abstract_translations'],
            'full_paper_file_url': uploaded.publicUrl,
            'full_paper_file_metadata': metadata,
            'submitted_at': DateTime.now().toUtc().toIso8601String(),
          })
          .select('id')
          .single();

      await _client
          .from('submissions')
          .update({
            'full_paper_file_url': uploaded.publicUrl,
            'full_paper_file_metadata': metadata,
            'full_paper_status': 'revision_under_review',
            'status': 'revision_under_review',
            'current_full_paper_version_id': versionRow['id'],
            'updated_at': DateTime.now().toUtc().toIso8601String(),
          })
          .eq('id', input.submissionId);

      if (input.revisionNotes.trim().isNotEmpty) {
        try {
          await _client.from('submission_feedback').insert({
            'submission_version_id': versionRow['id'],
            'providing_user_id': _userId,
            'role_at_submission': 'author',
            'feedback_content': input.revisionNotes.trim(),
          });
        } on Object catch (error) {
          debugPrint('author revision notes skipped: $error');
        }
      }

      if (idempotencyKey != null) {
        cached[idempotencyKey] = input.submissionId;
        await _writeIdempotencyCache(cached);
      }

      return SubmissionWriteResult(
        submissionId: input.submissionId,
        receipt: _receipt(
          id: input.submissionId,
          message: 'Revision submission completed successfully.',
        ),
      );
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  SubmissionRecord _mapSubmissionRecord(
    Map<String, dynamic> row, {
    required String locale,
  }) {
    final titleTranslations =
        (row['title_translations'] as Map?)?.cast<String, dynamic>() ??
        const {};
    final abstractTranslations =
        (row['abstract_translations'] as Map?)?.cast<String, dynamic>() ??
        const {};
    final statusValue =
        (row['status'] ??
                row['full_paper_status'] ??
                row['abstract_status'] ??
                'abstract_submitted')
            .toString();
    final abstractStatusValue =
        row['abstract_status']?.toString() ?? 'abstract_submitted';
    final fullPaperStatusValue = row['full_paper_status']?.toString();

    return SubmissionRecord(
      id: row['id'].toString(),
      eventId: row['event_id'].toString(),
      eventTitle: row['event_id'].toString(),
      title: _pickTranslation(titleTranslations, locale),
      abstractText: _pickTranslation(abstractTranslations, locale),
      status: submissionStatusFromDb(statusValue),
      submissionDate:
          DateTime.tryParse(row['submission_date']?.toString() ?? '') ??
          DateTime.now(),
      updatedAt:
          DateTime.tryParse(row['updated_at']?.toString() ?? '') ??
          DateTime.now(),
      abstractStatus: submissionStatusFromDb(abstractStatusValue),
      fullPaperStatus: fullPaperStatusValue == null
          ? null
          : submissionStatusFromDb(fullPaperStatusValue),
      fullPaperFileUrl: row['full_paper_file_url']?.toString(),
      currentAbstractVersionId: row['current_abstract_version_id']?.toString(),
      currentFullPaperVersionId: row['current_full_paper_version_id']
          ?.toString(),
    );
  }

  String _pickTranslation(Map<String, dynamic> translations, String locale) {
    final normalized = locale.toLowerCase();
    return (translations[normalized] ??
            translations[normalized.split('-').first] ??
            translations['en'] ??
            translations['ar'] ??
            translations.values.cast<Object?>().firstWhere(
              (value) => value != null && value.toString().trim().isNotEmpty,
              orElse: () => '',
            ))
        .toString();
  }

  OperationReceipt _receipt({
    required String id,
    required String message,
  }) {
    return OperationReceipt(
      id: id,
      message: message,
      timestamp: DateTime.now(),
    );
  }

  Map<String, String> _readIdempotencyCache() {
    final raw = _prefs.getString(_idempotencyCacheKey);
    if (raw == null || raw.isEmpty) {
      return <String, String>{};
    }
    try {
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      return decoded.map((key, value) => MapEntry(key, value.toString()));
    } on Object {
      return <String, String>{};
    }
  }

  Future<void> _writeIdempotencyCache(Map<String, String> map) async {
    await _prefs.setString(_idempotencyCacheKey, jsonEncode(map));
  }

  Future<_UploadedSubmissionFile> _uploadSubmissionFile({
    required String eventId,
    required String submissionId,
    required SubmissionUploadFile file,
    required int versionNumber,
  }) async {
    final safeName =
        '${DateTime.now().microsecondsSinceEpoch}.${file.extension}';
    final storagePath =
        '$eventId/$submissionId/full_paper/v$versionNumber/$safeName';
    await _client.storage
        .from('submission_files')
        .uploadBinary(
          storagePath,
          file.bytes,
          fileOptions: FileOptions(
            contentType: file.mimeType,
          ),
        );
    final publicUrl = _client.storage
        .from('submission_files')
        .getPublicUrl(storagePath);
    return _UploadedSubmissionFile(
      storagePath: storagePath,
      publicUrl: publicUrl,
    );
  }

  SubmissionError _mapError(Object error) {
    if (error is SubmissionError) {
      return error;
    }
    if (error is PostgrestException) {
      if (_isTransientText(error.message)) {
        return SubmissionTransientError(error.message);
      }
      return SubmissionError(error.message);
    }
    if (error is AuthException) {
      return SubmissionError(error.message);
    }
    final message = error.toString();
    if (_isTransientText(message)) {
      return SubmissionTransientError(message);
    }
    return SubmissionError(message);
  }

  bool _isTransientText(String text) {
    final message = text.toLowerCase();
    return message.contains('timeout') ||
        message.contains('timed out') ||
        message.contains('connection') ||
        message.contains('network') ||
        message.contains('temporarily') ||
        message.contains('503') ||
        message.contains('502') ||
        message.contains('429');
  }
}

class _UploadedSubmissionFile {
  const _UploadedSubmissionFile({
    required this.storagePath,
    required this.publicUrl,
  });

  final String storagePath;
  final String publicUrl;
}
