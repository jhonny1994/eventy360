import 'package:eventy360/features/repository/application/repository_state.dart';
import 'package:eventy360/features/repository/domain/repository_models.dart';
import 'package:eventy360/features/repository/infrastructure/supabase_repository_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'repository_controller.g.dart';

@Riverpod(keepAlive: true)
RepositoryRepository repositoryRepository(Ref ref) {
  return SupabaseRepositoryRepository();
}

@Riverpod(keepAlive: true)
class RepositoryController extends _$RepositoryController {
  @override
  Future<RepositoryState> build() async {
    final repository = ref.watch(repositoryRepositoryProvider);
    final topics = await repository.fetchTopics();
    final wilayas = await repository.fetchWilayas();
    final firstPage = await repository.fetchPapers(
      page: 1,
      pageSize: 12,
      query: '',
      selectedTopicIds: const <String>{},
      authorQuery: '',
      selectedWilayaId: null,
    );
    return RepositoryState(
      topics: topics,
      wilayas: wilayas,
      papers: firstPage.items,
      page: firstPage.page,
      pageSize: firstPage.pageSize,
      hasMore: firstPage.hasMore,
    );
  }

  Future<void> refresh() async {
    final current = state.asData?.value ?? const RepositoryState();
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(repositoryRepositoryProvider);
      final topics = await repository.fetchTopics();
      final wilayas = await repository.fetchWilayas();
      final page = await repository.fetchPapers(
        page: 1,
        pageSize: current.pageSize,
        query: current.query,
        selectedTopicIds: current.selectedTopicIds,
        authorQuery: current.authorQuery,
        selectedWilayaId: current.selectedWilayaId,
      );
      return current.copyWith(
        topics: topics,
        wilayas: wilayas,
        papers: page.items,
        page: page.page,
        pageSize: page.pageSize,
        hasMore: page.hasMore,
        isLoadingMore: false,
        clearError: true,
      );
    });
  }

  Future<void> updateQuery(String query) async {
    final current = state.asData?.value ?? const RepositoryState();
    final repository = ref.read(repositoryRepositoryProvider);
    final page = await repository.fetchPapers(
      page: 1,
      pageSize: current.pageSize,
      query: query,
      selectedTopicIds: current.selectedTopicIds,
      authorQuery: current.authorQuery,
      selectedWilayaId: current.selectedWilayaId,
    );
    state = AsyncData(
      current.copyWith(
        query: query,
        papers: page.items,
        page: page.page,
        hasMore: page.hasMore,
        clearError: true,
      ),
    );
  }

  Future<void> updateAuthorQuery(String authorQuery) async {
    final current = state.asData?.value ?? const RepositoryState();
    final repository = ref.read(repositoryRepositoryProvider);
    final page = await repository.fetchPapers(
      page: 1,
      pageSize: current.pageSize,
      query: current.query,
      selectedTopicIds: current.selectedTopicIds,
      authorQuery: authorQuery,
      selectedWilayaId: current.selectedWilayaId,
    );
    state = AsyncData(
      current.copyWith(
        authorQuery: authorQuery,
        papers: page.items,
        page: page.page,
        hasMore: page.hasMore,
        clearError: true,
      ),
    );
  }

  Future<void> updateWilayaFilter(int? wilayaId) async {
    final current = state.asData?.value ?? const RepositoryState();
    final repository = ref.read(repositoryRepositoryProvider);
    final page = await repository.fetchPapers(
      page: 1,
      pageSize: current.pageSize,
      query: current.query,
      selectedTopicIds: current.selectedTopicIds,
      authorQuery: current.authorQuery,
      selectedWilayaId: wilayaId,
    );
    state = AsyncData(
      current.copyWith(
        selectedWilayaId: wilayaId,
        clearSelectedWilayaId: wilayaId == null,
        papers: page.items,
        page: page.page,
        hasMore: page.hasMore,
        clearError: true,
      ),
    );
  }

  Future<void> toggleTopicFilter(String topicId) async {
    final current = state.asData?.value ?? const RepositoryState();
    final nextTopics = <String>{...current.selectedTopicIds};
    if (nextTopics.contains(topicId)) {
      nextTopics.remove(topicId);
    } else {
      nextTopics.add(topicId);
    }
    final repository = ref.read(repositoryRepositoryProvider);
    final page = await repository.fetchPapers(
      page: 1,
      pageSize: current.pageSize,
      query: current.query,
      selectedTopicIds: nextTopics,
      authorQuery: current.authorQuery,
      selectedWilayaId: current.selectedWilayaId,
    );
    state = AsyncData(
      current.copyWith(
        selectedTopicIds: nextTopics,
        papers: page.items,
        page: page.page,
        hasMore: page.hasMore,
        clearError: true,
      ),
    );
  }

  Future<void> loadNextPage() async {
    final current = state.asData?.value;
    if (current == null || current.isLoadingMore || !current.hasMore) {
      return;
    }
    state = AsyncData(current.copyWith(isLoadingMore: true));
    try {
      final repository = ref.read(repositoryRepositoryProvider);
      final nextPage = current.page + 1;
      final page = await repository.fetchPapers(
        page: nextPage,
        pageSize: current.pageSize,
        query: current.query,
        selectedTopicIds: current.selectedTopicIds,
        authorQuery: current.authorQuery,
        selectedWilayaId: current.selectedWilayaId,
      );
      state = AsyncData(
        current.copyWith(
          papers: <RepositoryPaper>[...current.papers, ...page.items],
          page: page.page,
          hasMore: page.hasMore,
          isLoadingMore: false,
          clearError: true,
        ),
      );
    } on RepositoryError catch (error) {
      state = AsyncData(
        current.copyWith(
          isLoadingMore: false,
          errorMessage: error.message,
        ),
      );
    }
  }

  Future<void> loadPaperDetail(String paperId) async {
    final current = state.asData?.value ?? const RepositoryState();
    state = AsyncData(current.copyWith(clearError: true));
    try {
      final existing = current.papers.where((item) => item.id == paperId);
      if (existing.isNotEmpty) {
        state = AsyncData(current.copyWith(selectedPaper: existing.first));
      }
      final paper = await ref
          .read(repositoryRepositoryProvider)
          .fetchPaperDetail(
            paperId,
          );
      if (paper == null) {
        throw RepositoryError('Paper was not found.');
      }
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(selectedPaper: paper),
      );
    } on RepositoryError catch (error) {
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(errorMessage: error.message),
      );
    }
  }

  Future<Uri> prepareDownload({
    required String paperId,
    required String fileUrl,
  }) {
    return ref
        .read(repositoryRepositoryProvider)
        .prepareDownload(paperId: paperId, fileUrl: fileUrl);
  }
}
