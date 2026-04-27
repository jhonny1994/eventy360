import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/home/application/home_subscription_provider.dart';
import 'package:eventy360/features/repository/application/repository_controller.dart';
import 'package:eventy360/features/repository/domain/repository_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class RepositoryScreen extends ConsumerStatefulWidget {
  const RepositoryScreen({super.key});

  @override
  ConsumerState<RepositoryScreen> createState() => _RepositoryScreenState();
}

class _RepositoryScreenState extends ConsumerState<RepositoryScreen> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _downloadPaper(RepositoryPaper paper) async {
    final localizations = S.of(context);
    final fileUrl = paper.fullPaperFileUrl;
    if (fileUrl == null || fileUrl.isEmpty) {
      AppFeedback.showError(localizations.repositoryNoFileAvailable);
      return;
    }
    try {
      final uri = await ref
          .read(repositoryControllerProvider.notifier)
          .prepareDownload(paperId: paper.id, fileUrl: fileUrl);
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        throw Exception('launch failed');
      }
    } on Object {
      if (!mounted) {
        return;
      }
      AppFeedback.showError(localizations.fileOpenFailed);
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final subscriptionState = ref.watch(homeSubscriptionStatusProvider);
    final repositoryState = ref.watch(repositoryControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(localizations.repositoryTitle)),
      body: subscriptionState.when(
        data: (subscription) {
          if (!subscription.isActive && !subscription.isTrial) {
            return AppPageContainer(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16),
                children: [
                  AppPageHero(
                    badge: localizations.repositoryTitle,
                    icon: Icons.menu_book_outlined,
                    title: localizations.repositoryTitle,
                    subtitle: localizations.repositoryOverviewBody,
                  ),
                  AppEmptyState(
                    icon: Icons.workspace_premium_outlined,
                    title: localizations.repositorySubscriptionRequiredTitle,
                    body: localizations.repositorySubscriptionRequiredBody,
                  ),
                ],
              ),
            );
          }
          return repositoryState.when(
            data: (data) {
              _searchController.value = _searchController.value.copyWith(
                text: data.query,
                selection: TextSelection.collapsed(offset: data.query.length),
                composing: TextRange.empty,
              );
              return RefreshIndicator(
                onRefresh: () =>
                    ref.read(repositoryControllerProvider.notifier).refresh(),
                child: AppPageContainer(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    children: [
                      AppPageHero(
                        badge: localizations.repositoryTitle,
                        icon: Icons.menu_book_outlined,
                        title: localizations.repositoryTitle,
                        subtitle: localizations.repositoryOverviewBody,
                      ),
                      AppSectionCard(
                        title: localizations.repositorySearchHint,
                        subtitle: localizations.repositoryOverviewBody,
                        child: Column(
                          children: [
                            TextField(
                              controller: _searchController,
                              decoration: InputDecoration(
                                hintText: localizations.repositorySearchHint,
                                prefixIcon: const Icon(Icons.search_outlined),
                              ),
                              textInputAction: TextInputAction.search,
                              onSubmitted: (value) => ref
                                  .read(repositoryControllerProvider.notifier)
                                  .updateQuery(value),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: data.topics
                                  .map(
                                    (topic) => FilterChip(
                                      label: Text(topic.name),
                                      selected: data.selectedTopicIds.contains(
                                        topic.id,
                                      ),
                                      onSelected: (_) => ref
                                          .read(
                                            repositoryControllerProvider
                                                .notifier,
                                          )
                                          .toggleTopicFilter(topic.id),
                                    ),
                                  )
                                  .toList(),
                            ),
                          ],
                        ),
                      ),
                      if ((data.errorMessage ?? '').isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: AppInlineMessage.error(
                            message: data.errorMessage!,
                          ),
                        ),
                      if (data.papers.isEmpty)
                        AppEmptyState(
                          icon: Icons.search_off_outlined,
                          title: localizations.repositoryTitle,
                          body: localizations.repositoryEmptyState,
                        )
                      else
                        ...data.papers.map(
                          (paper) => _PaperCard(
                            paper: paper,
                            onTap: () => context.push(
                              RoutePaths.repositoryDetail(paper.id),
                            ),
                            onDownload: paper.fullPaperFileUrl == null
                                ? null
                                : () => _downloadPaper(paper),
                          ),
                        ),
                      if (data.hasMore) ...[
                        const SizedBox(height: 12),
                        FilledButton.tonal(
                          onPressed: data.isLoadingMore
                              ? null
                              : () => ref
                                    .read(repositoryControllerProvider.notifier)
                                    .loadNextPage(),
                          child: data.isLoadingMore
                              ? const CircularProgressIndicator.adaptive()
                              : Text(localizations.loadMore),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
            error: (error, stackTrace) => AppErrorView(
              message: error.toString(),
              onRetry: () =>
                  ref.read(repositoryControllerProvider.notifier).refresh(),
            ),
            loading: AppLoadingView.new,
          );
        },
        error: (error, stackTrace) => AppErrorView(
          message: error.toString(),
          onRetry: null,
        ),
        loading: AppLoadingView.new,
      ),
    );
  }
}

class _PaperCard extends StatelessWidget {
  const _PaperCard({
    required this.paper,
    required this.onTap,
    required this.onDownload,
  });

  final RepositoryPaper paper;
  final VoidCallback onTap;
  final VoidCallback? onDownload;

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return AppSectionCard(
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              paper.title,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '${paper.authorName} - ${paper.authorInstitution}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 4),
            Text(paper.eventName),
            if (paper.wilayaName != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  paper.dairaName == null
                      ? paper.wilayaName!
                      : '${paper.wilayaName!}, ${paper.dairaName!}',
                ),
              ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: paper.topicNames
                  .take(3)
                  .map((name) => Chip(label: Text(name)))
                  .toList(),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${localizations.repositoryViewsLabel}: ${paper.viewCount}  •  ${localizations.repositoryDownloadsLabel}: ${paper.downloadCount}',
                  ),
                ),
                if (onDownload != null)
                  IconButton(
                    onPressed: onDownload,
                    icon: const Icon(Icons.download_outlined),
                    tooltip: localizations.repositoryDownloadAction,
                  ),
                IconButton(
                  onPressed: onTap,
                  icon: const Icon(Icons.chevron_right_outlined),
                  tooltip: localizations.repositoryDetailAction,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
