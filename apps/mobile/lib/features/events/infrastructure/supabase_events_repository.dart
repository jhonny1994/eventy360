import 'package:eventy360/app/providers.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/events/domain/events_repository.dart';
import 'package:eventy360/features/events/domain/topic_item.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

class SupabaseEventsRepository implements EventsRepository {
  SupabaseEventsRepository(this.ref);

  final Ref ref;

  static const _bookmarkCacheKey = 'events.bookmarks';
  static const _topicCacheKey = 'events.topic_subscriptions';

  supabase.SupabaseClient? get _client {
    try {
      return supabase.Supabase.instance.client;
    } on Object {
      return null;
    }
  }

  String? get _userId => _client?.auth.currentUser?.id;

  @override
  Future<List<EventSummary>> discoverEvents({
    required int page,
    required int pageSize,
    required String query,
    required Set<String> selectedTopicIds,
  }) async {
    final bookmarkedIds = await getBookmarkedEventIds();
    final offset = (page - 1) * pageSize;
    final client = _client;
    if (client == null) {
      throw EventsRepositoryError(
        'Supabase client is not initialized for event discovery.',
      );
    }

    try {
      final response = await client.rpc<List<dynamic>>(
        'discover_events',
        params: {
          'search_query': query.isEmpty ? null : query,
          'topic_ids': selectedTopicIds.isEmpty
              ? null
              : selectedTopicIds.toList(),
          'wilaya_id_param': null,
          'daira_id_param': null,
          'start_date': null,
          'end_date': null,
          'event_status_filter': null,
          'event_format_filter': null,
          'p_organizer_id': null,
          'limit_count': pageSize,
          'offset_count': offset,
        },
      );

      final events = response
          .map((raw) => raw as Map<String, dynamic>)
          .map(
            (json) => EventSummary(
              id: (json['id'] ?? '').toString(),
              title: (json['title'] ?? json['name'] ?? 'Untitled event')
                  .toString(),
              deadline:
                  DateTime.tryParse(
                    (json['submission_deadline'] ?? json['end_date'] ?? '')
                        .toString(),
                  ) ??
                  DateTime.now().add(const Duration(days: 10)),
              location: (json['location'] ?? json['wilaya_name'] ?? 'Algeria')
                  .toString(),
              topics: ((json['topics'] as List<dynamic>?) ?? const [])
                  .map((item) => item.toString())
                  .toList(),
              isBookmarked: bookmarkedIds.contains(
                (json['id'] ?? '').toString(),
              ),
            ),
          )
          .toList();

      return events;
    } on Object catch (error) {
      throw EventsRepositoryError('Event discovery failed: $error');
    }
  }

  @override
  Future<EventSummary?> fetchEventById(String eventId) async {
    final client = _client;
    if (client == null) {
      throw EventsRepositoryError(
        'Supabase client is not initialized for event details.',
      );
    }

    try {
      final locale =
          ref.read(sharedPreferencesProvider).getString('app.locale_code') ??
          'en';
      final eventRow = await client
          .from('events')
          .select(
            'id,event_name_translations,abstract_submission_deadline,wilaya_id',
          )
          .eq('id', eventId)
          .maybeSingle();
      if (eventRow == null) {
        return null;
      }

      final topicRows = await client
          .from('event_topics')
          .select('topic_id')
          .eq('event_id', eventId);
      final topicIds = (topicRows as List<dynamic>)
          .map((row) => (row as Map<String, dynamic>)['topic_id'].toString())
          .toList();
      final topics = <String>[];
      if (topicIds.isNotEmpty) {
        final topicData = await client
            .from('topics')
            .select('id,name_translations')
            .inFilter('id', topicIds);
        final topicNameById = <String, String>{};
        for (final row
            in (topicData as List<dynamic>).cast<Map<String, dynamic>>()) {
          final translations =
              (row['name_translations'] as Map?)?.cast<String, dynamic>() ??
              const <String, dynamic>{};
          topicNameById[row['id'].toString()] =
              translations[locale]?.toString() ??
              translations['en']?.toString() ??
              translations['ar']?.toString() ??
              'Topic';
        }
        for (final topicId in topicIds) {
          topics.add(topicNameById[topicId] ?? 'Topic');
        }
      }

      final wilayaId = eventRow['wilaya_id'] as int?;
      final location = wilayaId == null
          ? 'Algeria'
          : await client.rpc<String>(
              'get_wilaya_name',
              params: {
                'p_wilaya_id': wilayaId,
                'p_locale': locale,
              },
            );

      final translations =
          (eventRow['event_name_translations'] as Map?)
              ?.cast<String, dynamic>() ??
          const <String, dynamic>{};
      final bookmarkedIds = await getBookmarkedEventIds();
      return EventSummary(
        id: eventRow['id'].toString(),
        title:
            translations[locale]?.toString() ??
            translations['en']?.toString() ??
            translations['ar']?.toString() ??
            'Untitled event',
        deadline:
            DateTime.tryParse(
              eventRow['abstract_submission_deadline']?.toString() ?? '',
            ) ??
            DateTime.now().add(const Duration(days: 10)),
        location: location,
        topics: topics,
        isBookmarked: bookmarkedIds.contains(eventId),
      );
    } on Object catch (error) {
      throw EventsRepositoryError('Event detail lookup failed: $error');
    }
  }

  @override
  Future<List<EventSummary>> fetchBookmarkedEvents() async {
    final client = _client;
    final userId = _userId;
    if (client == null || userId == null) {
      return const <EventSummary>[];
    }
    try {
      final locale =
          ref.read(sharedPreferencesProvider).getString('app.locale_code') ??
          'en';
      final bookmarks = await client
          .from('bookmarks')
          .select('event_id, events!inner(id,event_name_translations,abstract_submission_deadline,wilaya_id)')
          .eq('profile_id', userId);
      final rows = (bookmarks as List<dynamic>).cast<Map<String, dynamic>>();
      final wilayaIds = rows
          .map(
            (row) =>
                (row['events'] as Map<String, dynamic>)['wilaya_id'] as int?,
          )
          .whereType<int>()
          .toSet()
          .toList();
      final wilayaNames = <int, String>{};
      for (final wilayaId in wilayaIds) {
        try {
          wilayaNames[wilayaId] = await client.rpc<String>(
            'get_wilaya_name',
            params: {
              'p_wilaya_id': wilayaId,
              'p_locale': locale,
            },
          );
        } on Object {
          wilayaNames[wilayaId] = 'Algeria';
        }
      }
      return rows.map((row) {
        final event = row['events'] as Map<String, dynamic>;
        final translations =
            (event['event_name_translations'] as Map?)?.cast<String, dynamic>() ??
            const <String, dynamic>{};
        final wilayaId = event['wilaya_id'] as int?;
        return EventSummary(
          id: event['id'].toString(),
          title:
              translations[locale]?.toString() ??
              translations['en']?.toString() ??
              translations['ar']?.toString() ??
              'Untitled event',
          deadline:
              DateTime.tryParse(
                event['abstract_submission_deadline']?.toString() ?? '',
              ) ??
              DateTime.now().add(const Duration(days: 10)),
          location: wilayaId == null ? 'Algeria' : (wilayaNames[wilayaId] ?? 'Algeria'),
          topics: const <String>[],
          isBookmarked: true,
        );
      }).toList();
    } on Object catch (error) {
      throw EventsRepositoryError('Bookmarked events lookup failed: $error');
    }
  }

  @override
  Future<Set<String>> getBookmarkedEventIds() async {
    final prefs = ref.read(sharedPreferencesProvider);
    final fallback = prefs.getStringList(_bookmarkCacheKey) ?? const <String>[];
    final client = _client;
    final userId = _userId;
    if (client == null || userId == null) {
      return fallback.toSet();
    }
    try {
      final response = await client
          .from('bookmarks')
          .select('event_id')
          .eq('profile_id', userId);
      final ids = (response as List<dynamic>)
          .map((row) => (row as Map<String, dynamic>)['event_id'].toString())
          .toSet();
      await prefs.setStringList(_bookmarkCacheKey, ids.toList());
      return ids;
    } on Object {
      return fallback.toSet();
    }
  }

  @override
  Future<bool> toggleBookmark(String eventId) async {
    final bookmarks = await getBookmarkedEventIds();
    final isBookmarked = bookmarks.contains(eventId);
    final client = _client;
    final userId = _userId;

    if (client != null && userId != null) {
      try {
        if (isBookmarked) {
          await client
              .from('bookmarks')
              .delete()
              .eq('profile_id', userId)
              .eq('event_id', eventId);
        } else {
          await client.from('bookmarks').insert({
            'profile_id': userId,
            'event_id': eventId,
          });
        }
      } on Object catch (error) {
        throw EventsRepositoryError('Bookmark update failed: $error');
      }
    }

    if (isBookmarked) {
      bookmarks.remove(eventId);
    } else {
      bookmarks.add(eventId);
    }
    await ref
        .read(sharedPreferencesProvider)
        .setStringList(_bookmarkCacheKey, bookmarks.toList());
    return !isBookmarked;
  }

  @override
  Future<List<TopicItem>> getTopics() async {
    final client = _client;
    if (client == null) {
      throw EventsRepositoryError(
        'Supabase client is not initialized for topics.',
      );
    }

    try {
      final data = await client.from('topics').select('id, name_translations');
      final locale =
          ref.read(sharedPreferencesProvider).getString('app.locale_code') ??
          'en';
      final topics = (data as List<dynamic>)
          .map((row) => row as Map<String, dynamic>)
          .map((row) {
            final translations =
                row['name_translations'] as Map<String, dynamic>?;
            return TopicItem(
              id: row['id'].toString(),
              name:
                  translations?[locale]?.toString() ??
                  translations?['en']?.toString() ??
                  translations?['ar']?.toString() ??
                  'Topic',
            );
          })
          .toList();
      return topics;
    } on Object catch (error) {
      throw EventsRepositoryError('Topic lookup failed: $error');
    }
  }

  @override
  Future<Set<String>> getSubscribedTopicIds() async {
    final prefs = ref.read(sharedPreferencesProvider);
    final fallback = prefs.getStringList(_topicCacheKey) ?? const <String>[];
    final client = _client;
    final userId = _userId;
    if (client == null || userId == null) {
      return fallback.toSet();
    }
    try {
      final data = await client
          .from('researcher_topic_subscriptions')
          .select('topic_id')
          .eq('profile_id', userId);
      final ids = (data as List<dynamic>)
          .map((row) => (row as Map<String, dynamic>)['topic_id'].toString())
          .toSet();
      await prefs.setStringList(_topicCacheKey, ids.toList());
      return ids;
    } on Object {
      return fallback.toSet();
    }
  }

  @override
  Future<bool> toggleTopicSubscription(String topicId) async {
    final subs = await getSubscribedTopicIds();
    final isSubscribed = subs.contains(topicId);
    final client = _client;
    final userId = _userId;

    if (client != null && userId != null) {
      try {
        if (isSubscribed) {
          await client.from('researcher_topic_subscriptions').delete().match({
            'profile_id': userId,
            'topic_id': topicId,
          });
        } else {
          await client.from('researcher_topic_subscriptions').insert({
            'profile_id': userId,
            'topic_id': topicId,
          });
        }
      } on Object catch (error) {
        throw EventsRepositoryError('Topic subscription update failed: $error');
      }
    }

    if (isSubscribed) {
      subs.remove(topicId);
    } else {
      subs.add(topicId);
    }
    await ref
        .read(sharedPreferencesProvider)
        .setStringList(_topicCacheKey, subs.toList());
    return !isSubscribed;
  }
}
