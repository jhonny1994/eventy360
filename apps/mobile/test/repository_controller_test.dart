import 'package:eventy360/features/auth/domain/location_option.dart';
import 'package:eventy360/features/events/domain/topic_item.dart';
import 'package:eventy360/features/repository/application/repository_controller.dart';
import 'package:eventy360/features/repository/domain/repository_models.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('loads first repository page and topics', () async {
    final repository = _FakeRepositoryRepository();
    final container = ProviderContainer(
      overrides: [
        repositoryRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    final state = await container.read(repositoryControllerProvider.future);

    expect(state.topics, hasLength(2));
    expect(state.papers, hasLength(1));
  });

  test('updates query using repository search', () async {
    final repository = _FakeRepositoryRepository();
    final container = ProviderContainer(
      overrides: [
        repositoryRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    await container.read(repositoryControllerProvider.future);
    await container
        .read(repositoryControllerProvider.notifier)
        .updateQuery('vision');

    final state = container.read(repositoryControllerProvider).asData!.value;
    expect(state.query, 'vision');
    expect(repository.lastQuery, 'vision');
  });

  test('loads paper detail and prepares download', () async {
    final repository = _FakeRepositoryRepository();
    final container = ProviderContainer(
      overrides: [
        repositoryRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    await container.read(repositoryControllerProvider.future);
    await container
        .read(repositoryControllerProvider.notifier)
        .loadPaperDetail('paper-1');
    final uri = await container
        .read(repositoryControllerProvider.notifier)
        .prepareDownload(
          paperId: 'paper-1',
          fileUrl: 'https://example.com/file.pdf',
        );

    final state = container.read(repositoryControllerProvider).asData!.value;
    expect(state.selectedPaper?.id, 'paper-1');
    expect(uri.toString(), 'https://example.com/file.pdf');
    expect(repository.downloadTrackedFor, 'paper-1');
  });

  test('surfaces detail errors', () async {
    final repository = _FakeRepositoryRepository()..detailError = true;
    final container = ProviderContainer(
      overrides: [
        repositoryRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    await container.read(repositoryControllerProvider.future);
    await container
        .read(repositoryControllerProvider.notifier)
        .loadPaperDetail('missing');

    final state = container.read(repositoryControllerProvider).asData!.value;
    expect(state.errorMessage, 'detail failed');
  });
}

class _FakeRepositoryRepository implements RepositoryRepository {
  String lastQuery = '';
  String? downloadTrackedFor;
  bool detailError = false;

  final RepositoryPaper paper = RepositoryPaper(
    id: 'paper-1',
    title: 'AI Research Paper',
    abstractText: 'Abstract',
    eventName: 'AI Summit',
    authorName: 'Researcher',
    authorInstitution: 'University',
    submissionDate: DateTime(2026, 4),
    viewCount: 12,
    downloadCount: 5,
    topicNames: const ['AI'],
    fullPaperFileUrl: 'https://example.com/file.pdf',
    fileName: 'file.pdf',
  );

  @override
  Future<RepositoryPaper?> fetchPaperDetail(String paperId) async {
    if (detailError) {
      throw RepositoryError('detail failed');
    }
    return paper;
  }

  @override
  Future<RepositoryPage> fetchPapers({
    required int page,
    required int pageSize,
    required String query,
    required Set<String> selectedTopicIds,
    required String authorQuery,
    required int? selectedWilayaId,
  }) async {
    lastQuery = query;
    return RepositoryPage(
      items: <RepositoryPaper>[paper],
      page: page,
      pageSize: pageSize,
      totalCount: 1,
    );
  }

  @override
  Future<List<TopicItem>> fetchTopics() async {
    return const <TopicItem>[
      TopicItem(id: 't1', name: 'AI'),
      TopicItem(id: 't2', name: 'Vision'),
    ];
  }

  @override
  Future<List<LocationOption>> fetchWilayas() async {
    return const <LocationOption>[
      LocationOption(id: 16, name: 'Algiers'),
    ];
  }

  @override
  Future<Uri> prepareDownload({
    required String paperId,
    required String fileUrl,
  }) async {
    downloadTrackedFor = paperId;
    return Uri.parse(fileUrl);
  }
}
