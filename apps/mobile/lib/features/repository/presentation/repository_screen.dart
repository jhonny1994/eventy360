import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/account/application/subscription_overview_provider.dart';
import 'package:eventy360/features/home/application/home_subscription_provider.dart';
import 'package:eventy360/features/repository/application/repository_controller.dart';
import 'package:eventy360/features/repository/application/repository_state.dart';
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
  late final TextEditingController _authorController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _authorController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _authorController.dispose();
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
                  const SizedBox(height: 12),
                  AppSectionCard(
                    title: localizations.subscriptionStatusTitle,
                    subtitle: localizations.repositoryPremiumContextBody,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        FilledButton.icon(
                          onPressed: () async {
                            await context.push(RoutePaths.account);
                            ref
                              ..invalidate(homeSubscriptionStatusProvider)
                              ..invalidate(subscriptionOverviewProvider);
                          },
                          icon: const Icon(Icons.manage_accounts_outlined),
                          label: Text(localizations.accountTitle),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton.icon(
                          onPressed: () async {
                            await context.push(RoutePaths.reportPayment);
                            ref
                              ..invalidate(homeSubscriptionStatusProvider)
                              ..invalidate(subscriptionOverviewProvider);
                          },
                          icon: const Icon(Icons.upload_file_outlined),
                          label: Text(localizations.reportPaymentTitle),
                        ),
                      ],
                    ),
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
              _authorController.value = _authorController.value.copyWith(
                text: data.authorQuery,
                selection: TextSelection.collapsed(
                  offset: data.authorQuery.length,
                ),
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
                        subtitle: localizations.repositoryFilterBody,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
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
                            TextField(
                              controller: _authorController,
                              decoration: InputDecoration(
                                hintText: localizations.repositoryAuthorHint,
                                prefixIcon: const Icon(
                                  Icons.person_search_outlined,
                                ),
                              ),
                              textInputAction: TextInputAction.search,
                              onSubmitted: (value) => ref
                                  .read(repositoryControllerProvider.notifier)
                                  .updateAuthorQuery(value),
                            ),
                            const SizedBox(height: 12),
                            _RepositoryFilterSummaryRow(data: data),
                            const SizedBox(height: 14),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: () => _showRepositoryFilters(
                                  context,
                                  ref,
                                  data: data,
                                ),
                                icon: const Icon(Icons.filter_list_rounded),
                                label: Text(localizations.filterTopicsAction),
                              ),
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

Future<void> _showRepositoryFilters(
  BuildContext context,
  WidgetRef ref, {
  required RepositoryState data,
}) async {
  final localizations = S.of(context);
  await showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (context) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                localizations.filterTopicsAction,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                localizations.repositoryFilterBody,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<int?>(
                initialValue: data.selectedWilayaId,
                items: [
                  DropdownMenuItem(
                    child: Text(localizations.repositoryAllWilayas),
                  ),
                  ...data.wilayas.map(
                    (wilaya) => DropdownMenuItem<int?>(
                      value: wilaya.id,
                      child: Text(wilaya.name),
                    ),
                  ),
                ],
                onChanged: (value) => ref
                    .read(repositoryControllerProvider.notifier)
                    .updateWilayaFilter(value),
                decoration: InputDecoration(
                  labelText: localizations.wilayaLabel,
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.35,
                child: SingleChildScrollView(
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: data.topics.map((topic) {
                      final selected = data.selectedTopicIds.contains(topic.id);
                      return FilterChip(
                        label: Text(topic.name),
                        selected: selected,
                        onSelected: (_) => ref
                            .read(repositoryControllerProvider.notifier)
                            .toggleTopicFilter(topic.id),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(localizations.doneAction),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
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
            const SizedBox(height: 12),
            AppListRow(
              leading: const Icon(Icons.person_outline_rounded),
              title: paper.authorName,
              subtitle: paper.authorInstitution,
            ),
            const Divider(height: 18),
            AppListRow(
              leading: const Icon(Icons.event_note_outlined),
              title: paper.eventName,
              subtitle: _paperSummarySubtitle(paper),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: paper.topicNames
                  .take(2)
                  .map((name) => Chip(label: Text(name)))
                  .toList(),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AppStatusBadge(
                  label: paper.hasDownloadableFile
                      ? localizations.repositoryReadyToDownload
                      : localizations.repositoryNoFileAvailable,
                  tone: paper.hasDownloadableFile
                      ? AppStatusTone.success
                      : AppStatusTone.neutral,
                ),
                if ((paper.fileContentType ?? '').isNotEmpty)
                  AppStatusBadge(
                    label: paper.fileContentType!,
                    tone: AppStatusTone.info,
                  ),
              ],
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

class _RepositoryFilterSummaryRow extends StatelessWidget {
  const _RepositoryFilterSummaryRow({required this.data});

  final RepositoryState data;

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final topicSummary = data.selectedTopicIds.isEmpty
        ? localizations.allTopicsSummary(data.topics.length)
        : localizations.selectedTopicsCount(data.selectedTopicIds.length);
    final wilayaSummary = data.selectedWilayaId == null
        ? localizations.repositoryAllWilayas
        : data.wilayas
                .where((wilaya) => wilaya.id == data.selectedWilayaId)
                .firstOrNull
                ?.name ??
            localizations.repositoryAllWilayas;

    return Row(
      children: [
        Expanded(
          child: AppListRow(
            leading: const Icon(Icons.filter_alt_outlined),
            title: topicSummary,
            subtitle: wilayaSummary,
          ),
        ),
      ],
    );
  }
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}

String _paperSummarySubtitle(RepositoryPaper paper) {
  final location = switch ((paper.wilayaName, paper.dairaName)) {
    (final String wilaya?, final String daira?) => '$wilaya, $daira',
    (final String wilaya?, _) => wilaya,
    _ => null,
  };
  final lines = <String>[
    _formatDate(paper.submissionDate),
    if (location != null && location.isNotEmpty) location,
  ];
  return lines.join('\n');
}
