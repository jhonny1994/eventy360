import 'package:eventy360/app/providers.dart';
import 'package:eventy360/features/events/domain/event_summary.dart';
import 'package:eventy360/features/events/domain/events_repository.dart';
import 'package:eventy360/features/events/domain/topic_item.dart';
import 'package:flutter/foundation.dart';
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
      return _demoEvents(bookmarkedIds, query, selectedTopicIds, page, pageSize);
    }

    try {
      final response = await client.rpc<List<dynamic>>(
        'discover_events',
        params: {
          'search_query': query.isEmpty ? null : query,
          'topic_ids': selectedTopicIds.isEmpty ? null : selectedTopicIds.toList(),
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
              title: (json['title'] ?? json['name'] ?? 'Untitled event').toString(),
              deadline: DateTime.tryParse((json['submission_deadline'] ?? json['end_date'] ?? '')
                      .toString()) ??
                  DateTime.now().add(const Duration(days: 10)),
              location: (json['location'] ?? json['wilaya_name'] ?? 'Algeria').toString(),
              topics: ((json['topics'] as List<dynamic>?) ?? const [])
                  .map((item) => item.toString())
                  .toList(),
              isBookmarked: bookmarkedIds.contains((json['id'] ?? '').toString()),
            ),
          )
          .toList();

      if (events.isNotEmpty) {
        return events;
      }
    } on Object catch (error) {
      debugPrint('discoverEvents fallback to demo data: $error');
    }

    return _demoEvents(bookmarkedIds, query, selectedTopicIds, page, pageSize);
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
        debugPrint('toggleBookmark remote write failed: $error');
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
      return _demoTopics;
    }

    try {
      final data = await client.from('topics').select('id, name_translations');
      final locale = ref.read(sharedPreferencesProvider).getString('app.locale_code') ?? 'en';
      final topics = (data as List<dynamic>)
          .map((row) => row as Map<String, dynamic>)
          .map((row) {
        final translations = row['name_translations'] as Map<String, dynamic>?;
        return TopicItem(
          id: row['id'].toString(),
          name: translations?[locale]?.toString() ??
              translations?['en']?.toString() ??
              translations?['ar']?.toString() ??
              'Topic',
        );
      }).toList();
      if (topics.isNotEmpty) {
        return topics;
      }
    } on Object catch (error) {
      debugPrint('getTopics fallback to demo topics: $error');
    }

    return _demoTopics;
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
          await client
              .from('researcher_topic_subscriptions')
              .delete()
              .match({'profile_id': userId, 'topic_id': topicId});
        } else {
          await client
              .from('researcher_topic_subscriptions')
              .insert({'profile_id': userId, 'topic_id': topicId});
        }
      } on Object catch (error) {
        debugPrint('toggleTopicSubscription remote write failed: $error');
      }
    }

    if (isSubscribed) {
      subs.remove(topicId);
    } else {
      subs.add(topicId);
    }
    await ref.read(sharedPreferencesProvider).setStringList(_topicCacheKey, subs.toList());
    return !isSubscribed;
  }
}

final _demoTopics = <TopicItem>[
  const TopicItem(id: 'ai', name: 'Artificial Intelligence'),
  const TopicItem(id: 'cyber', name: 'Cybersecurity'),
  const TopicItem(id: 'data', name: 'Data Science'),
  const TopicItem(id: 'systems', name: 'Distributed Systems'),
];

List<EventSummary> _demoEvents(
  Set<String> bookmarkedIds,
  String query,
  Set<String> selectedTopicIds,
  int page,
  int pageSize,
) {
  final all = <EventSummary>[
    EventSummary(
      id: 'evt-1',
      title: 'AI for Climate Research Summit',
      deadline: DateTime.now().add(const Duration(days: 12)),
      location: 'Algiers',
      topics: const ['Artificial Intelligence', 'Data Science'],
      isBookmarked: bookmarkedIds.contains('evt-1'),
    ),
    EventSummary(
      id: 'evt-2',
      title: 'National Cybersecurity Colloquium',
      deadline: DateTime.now().add(const Duration(days: 20)),
      location: 'Oran',
      topics: const ['Cybersecurity'],
      isBookmarked: bookmarkedIds.contains('evt-2'),
    ),
    EventSummary(
      id: 'evt-3',
      title: 'Distributed Systems Doctoral Forum',
      deadline: DateTime.now().add(const Duration(days: 7)),
      location: 'Constantine',
      topics: const ['Distributed Systems'],
      isBookmarked: bookmarkedIds.contains('evt-3'),
    ),
  ];

  final queryFiltered = query.trim().isEmpty
      ? all
      : all
          .where(
            (event) =>
                event.title.toLowerCase().contains(query.toLowerCase()) ||
                event.location.toLowerCase().contains(query.toLowerCase()),
          )
          .toList();
  final filtered = selectedTopicIds.isEmpty
      ? queryFiltered
      : queryFiltered
          .where(
            (event) => event.topics.any(
              (topic) => selectedTopicIds.contains(_topicKey(topic)),
            ),
          )
          .toList();
  final offset = (page - 1) * pageSize;
  if (offset >= filtered.length) {
    return <EventSummary>[];
  }
  return filtered.skip(offset).take(pageSize).toList();
}

String _topicKey(String name) => name.toLowerCase().replaceAll(' ', '-');
