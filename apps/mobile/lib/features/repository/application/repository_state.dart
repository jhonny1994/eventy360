import 'package:eventy360/features/events/domain/topic_item.dart';
import 'package:eventy360/features/repository/domain/repository_models.dart';

class RepositoryState {
  const RepositoryState({
    this.papers = const <RepositoryPaper>[],
    this.topics = const <TopicItem>[],
    this.selectedTopicIds = const <String>{},
    this.query = '',
    this.page = 1,
    this.pageSize = 12,
    this.hasMore = false,
    this.isLoadingMore = false,
    this.selectedPaper,
    this.errorMessage,
  });

  final List<RepositoryPaper> papers;
  final List<TopicItem> topics;
  final Set<String> selectedTopicIds;
  final String query;
  final int page;
  final int pageSize;
  final bool hasMore;
  final bool isLoadingMore;
  final RepositoryPaper? selectedPaper;
  final String? errorMessage;

  RepositoryState copyWith({
    List<RepositoryPaper>? papers,
    List<TopicItem>? topics,
    Set<String>? selectedTopicIds,
    String? query,
    int? page,
    int? pageSize,
    bool? hasMore,
    bool? isLoadingMore,
    RepositoryPaper? selectedPaper,
    String? errorMessage,
    bool clearError = false,
    bool clearSelectedPaper = false,
  }) {
    return RepositoryState(
      papers: papers ?? this.papers,
      topics: topics ?? this.topics,
      selectedTopicIds: selectedTopicIds ?? this.selectedTopicIds,
      query: query ?? this.query,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      selectedPaper: clearSelectedPaper
          ? null
          : (selectedPaper ?? this.selectedPaper),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
