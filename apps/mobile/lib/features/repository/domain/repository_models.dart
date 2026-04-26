import 'package:eventy360/features/events/domain/topic_item.dart';

class RepositoryPaper {
  const RepositoryPaper({
    required this.id,
    required this.title,
    required this.abstractText,
    required this.eventName,
    required this.authorName,
    required this.authorInstitution,
    required this.submissionDate,
    required this.viewCount,
    required this.downloadCount,
    required this.topicNames,
    this.wilayaName,
    this.dairaName,
    this.fullPaperFileUrl,
    this.fileName,
    this.fileSizeBytes,
    this.fileContentType,
  });

  final String id;
  final String title;
  final String abstractText;
  final String eventName;
  final String authorName;
  final String authorInstitution;
  final DateTime submissionDate;
  final int viewCount;
  final int downloadCount;
  final List<String> topicNames;
  final String? wilayaName;
  final String? dairaName;
  final String? fullPaperFileUrl;
  final String? fileName;
  final int? fileSizeBytes;
  final String? fileContentType;
}

class RepositoryPage {
  const RepositoryPage({
    required this.items,
    required this.page,
    required this.pageSize,
    required this.totalCount,
  });

  final List<RepositoryPaper> items;
  final int page;
  final int pageSize;
  final int totalCount;

  bool get hasMore => page * pageSize < totalCount;
}

abstract class RepositoryRepository {
  Future<List<TopicItem>> fetchTopics();

  Future<RepositoryPage> fetchPapers({
    required int page,
    required int pageSize,
    required String query,
    required Set<String> selectedTopicIds,
  });

  Future<RepositoryPaper?> fetchPaperDetail(String paperId);

  Future<Uri> prepareDownload({
    required String paperId,
    required String fileUrl,
  });
}

class RepositoryError implements Exception {
  RepositoryError(this.message);

  final String message;

  @override
  String toString() => message;
}
