import 'dart:math';

import 'package:eventy360/features/events/domain/topic_item.dart';
import 'package:eventy360/features/repository/domain/repository_models.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseRepositoryRepository implements RepositoryRepository {
  SupabaseClient get _client => Supabase.instance.client;

  String get _localeCode =>
      (_client.auth.currentUser?.userMetadata?['preferred_language']
                  ?.toString() ??
              'en')
          .toLowerCase();

  @override
  Future<List<TopicItem>> fetchTopics() async {
    try {
      final rows = await _client
          .from('topics')
          .select('id,name_translations,slug')
          .order('slug');
      return (rows as List<dynamic>).cast<Map<String, dynamic>>().map((row) {
        final translations =
            (row['name_translations'] as Map?)?.cast<String, dynamic>() ??
            const <String, dynamic>{};
        return TopicItem(
          id: row['id'].toString(),
          name: _pickTranslation(translations),
        );
      }).toList();
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<RepositoryPage> fetchPapers({
    required int page,
    required int pageSize,
    required String query,
    required Set<String> selectedTopicIds,
  }) async {
    try {
      final offset = max(0, (page - 1) * pageSize);
      final dynamic rows = await _client.rpc<dynamic>(
        'discover_papers',
        params: {
          'search_query': query.trim().isEmpty ? null : query.trim(),
          'topic_ids': selectedTopicIds.isEmpty
              ? null
              : selectedTopicIds.toList(),
          'wilaya_id_param': null,
          'daira_id_param': null,
          'start_date': null,
          'end_date': null,
          'author_name_filter': null,
          'organizer_id': null,
          'limit_count': pageSize,
          'offset_count': offset,
        },
      );
      final typedRows = (rows as List<dynamic>).cast<Map<String, dynamic>>();
      final items = await _enrichPapers(typedRows);
      final totalCount = items.isEmpty
          ? 0
          : ((typedRows.first['total_records'] as num?)?.toInt() ??
                items.length);
      return RepositoryPage(
        items: items,
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
      );
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<RepositoryPaper?> fetchPaperDetail(String paperId) async {
    try {
      final dynamic rows = await _client
          .rpc<dynamic>(
            'discover_papers',
            params: {
              'search_query': null,
              'topic_ids': null,
              'wilaya_id_param': null,
              'daira_id_param': null,
              'start_date': null,
              'end_date': null,
              'author_name_filter': null,
              'organizer_id': null,
              'limit_count': 1,
              'offset_count': 0,
            },
          )
          .eq('id', paperId)
          .limit(1);
      final typedRows = (rows as List<dynamic>).cast<Map<String, dynamic>>();
      if (typedRows.isEmpty) {
        return null;
      }
      final dynamic analyticsRows = await _client.rpc<dynamic>(
        'get_paper_analytics',
        params: {'p_submission_id': paperId},
      );
      final analytics = (analyticsRows as List<dynamic>?)
          ?.cast<Map<String, dynamic>>()
          .firstOrNull;
      final items = await _enrichPapers(
        typedRows,
        analyticsOverrideById: {
          paperId: <String, dynamic>{
            'view_count': (analytics?['view_count'] as num?)?.toInt() ?? 0,
            'download_count':
                (analytics?['download_count'] as num?)?.toInt() ?? 0,
          },
        },
      );
      await _client.rpc<dynamic>(
        'track_paper_activity',
        params: {
          'p_submission_id': paperId,
          'p_action_type': 'view',
        },
      );
      return items.first;
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<Uri> prepareDownload({
    required String paperId,
    required String fileUrl,
  }) async {
    try {
      await _client.rpc<dynamic>(
        'track_paper_activity',
        params: {
          'p_submission_id': paperId,
          'p_action_type': 'download',
        },
      );
      return Uri.parse(fileUrl);
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  Future<List<RepositoryPaper>> _enrichPapers(
    List<Map<String, dynamic>> rows, {
    Map<String, Map<String, dynamic>> analyticsOverrideById =
        const <String, Map<String, dynamic>>{},
  }) async {
    if (rows.isEmpty) {
      return const <RepositoryPaper>[];
    }

    final topicRows = await _client
        .from('topics')
        .select('id,name_translations,slug');
    final wilayaRows = await _client
        .from('wilayas')
        .select('id,name_ar,name_other');
    final dairaIds = rows
        .map((row) => row['author_daira_id'])
        .whereType<int>()
        .toSet()
        .toList();
    final dairaRows = dairaIds.isEmpty
        ? const <dynamic>[]
        : await _client
              .from('dairas')
              .select('id,name_ar,name_other,wilaya_id')
              .inFilter('id', dairaIds);
    final dynamic analyticsRows = analyticsOverrideById.isNotEmpty
        ? const <dynamic>[]
        : await _client.rpc<dynamic>(
            'get_papers_analytics',
            params: {
              'p_submission_ids': rows.map((row) => row['id']).toList(),
            },
          );

    final topicMap = {
      for (final raw
          in (topicRows as List<dynamic>).cast<Map<String, dynamic>>())
        raw['id'].toString(): raw,
    };
    final wilayaMap = {
      for (final raw
          in (wilayaRows as List<dynamic>).cast<Map<String, dynamic>>())
        (raw['id'] as int): raw,
    };
    final dairaMap = {
      for (final raw in dairaRows.cast<Map<String, dynamic>>())
        (raw['id'] as int): raw,
    };
    final analyticsMap = {
      for (final raw
          in (analyticsRows as List<dynamic>).cast<Map<String, dynamic>>())
        raw['submission_id'].toString(): raw,
      ...analyticsOverrideById,
    };

    return rows.map((row) {
      final titleTranslations =
          (row['paper_title_translations'] as Map?)?.cast<String, dynamic>() ??
          const <String, dynamic>{};
      final abstractTranslations =
          (row['paper_abstract_translations'] as Map?)
              ?.cast<String, dynamic>() ??
          const <String, dynamic>{};
      final eventTranslations =
          (row['event_name_translations'] as Map?)?.cast<String, dynamic>() ??
          const <String, dynamic>{};
      final fileMetadata = (row['full_paper_file_metadata'] as Map?)
          ?.cast<String, dynamic>();
      final wilayaId = row['author_wilaya_id'] as int?;
      final dairaId = row['author_daira_id'] as int?;
      final analytics =
          analyticsMap[row['id'].toString()] ?? const <String, dynamic>{};
      final topicNames = <String>[];
      for (final topicId
          in (row['event_topic_ids'] as List<dynamic>? ?? const <dynamic>[])) {
        final topicRow = topicMap[topicId.toString()];
        if (topicRow == null) {
          continue;
        }
        final translations =
            (topicRow['name_translations'] as Map?)?.cast<String, dynamic>() ??
            const <String, dynamic>{};
        topicNames.add(_pickTranslation(translations));
      }
      final wilayaRow = wilayaId == null ? null : wilayaMap[wilayaId];
      final dairaRow = dairaId == null ? null : dairaMap[dairaId];
      return RepositoryPaper(
        id: row['id'].toString(),
        title: _pickTranslation(titleTranslations),
        abstractText: _pickTranslation(abstractTranslations),
        eventName: _pickTranslation(eventTranslations),
        authorName: row['author_name']?.toString() ?? '-',
        authorInstitution: row['author_institution']?.toString() ?? '-',
        submissionDate:
            DateTime.tryParse(row['submission_date']?.toString() ?? '') ??
            DateTime.now(),
        viewCount: (analytics['view_count'] as num?)?.toInt() ?? 0,
        downloadCount: (analytics['download_count'] as num?)?.toInt() ?? 0,
        topicNames: topicNames,
        wilayaName: wilayaRow == null
            ? null
            : _localizedLocationName(wilayaRow),
        dairaName: dairaRow == null ? null : _localizedLocationName(dairaRow),
        fullPaperFileUrl: row['full_paper_file_url']?.toString(),
        fileName: fileMetadata?['name']?.toString(),
        fileSizeBytes: (fileMetadata?['size'] as num?)?.toInt(),
        fileContentType: fileMetadata?['contentType']?.toString(),
      );
    }).toList();
  }

  String _pickTranslation(Map<String, dynamic> translations) {
    if (_localeCode.startsWith('ar')) {
      return translations['ar']?.toString() ??
          translations['en']?.toString() ??
          _firstStringOrFallback(translations) ??
          '-';
    }
    return translations['en']?.toString() ??
        translations['ar']?.toString() ??
        _firstStringOrFallback(translations) ??
        '-';
  }

  String? _firstStringOrFallback(Map<String, dynamic> translations) {
    for (final value in translations.values) {
      if (value is String && value.isNotEmpty) {
        return value;
      }
    }
    return null;
  }

  String _localizedLocationName(Map<String, dynamic> row) {
    if (_localeCode.startsWith('ar')) {
      return row['name_ar']?.toString() ?? row['name_other']?.toString() ?? '-';
    }
    return row['name_other']?.toString() ?? row['name_ar']?.toString() ?? '-';
  }

  RepositoryError _mapError(Object error) {
    if (error is RepositoryError) {
      return error;
    }
    if (error is PostgrestException) {
      return RepositoryError(error.message);
    }
    return RepositoryError(error.toString());
  }
}
