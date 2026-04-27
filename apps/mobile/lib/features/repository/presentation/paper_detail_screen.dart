import 'dart:async';

import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/repository/application/repository_controller.dart';
import 'package:eventy360/features/repository/domain/repository_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

class PaperDetailScreen extends ConsumerStatefulWidget {
  const PaperDetailScreen({required this.paperId, super.key});

  final String paperId;

  @override
  ConsumerState<PaperDetailScreen> createState() => _PaperDetailScreenState();
}

class _PaperDetailScreenState extends ConsumerState<PaperDetailScreen> {
  @override
  void initState() {
    super.initState();
    unawaited(
      Future<void>.microtask(
        () => ref
            .read(repositoryControllerProvider.notifier)
            .loadPaperDetail(widget.paperId),
      ),
    );
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
    final repositoryState = ref.watch(repositoryControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(localizations.repositoryDetailTitle)),
      body: repositoryState.when(
        data: (data) {
          final paper = data.selectedPaper;
          if (paper == null) {
            return const AppLoadingView();
          }
          return AppPageContainer(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                AppPageHero(
                  badge: localizations.repositoryTitle,
                  icon: Icons.description_outlined,
                  title: paper.title,
                  subtitle: localizations.repositoryDetailOverviewBody,
                ),
                AppSectionCard(
                  title: localizations.repositoryContextTitle,
                  subtitle: localizations.repositoryDetailOverviewBody,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      AppListRow(
                        leading: const Icon(Icons.person_outline_rounded),
                        title: paper.authorName,
                        subtitle: paper.authorInstitution,
                      ),
                      const Divider(height: 20),
                      AppListRow(
                        leading: const Icon(Icons.event_note_outlined),
                        title: paper.eventName,
                        subtitle: _paperContextSubtitle(
                          localizations: localizations,
                          submittedOn: paper.submissionDate,
                          wilayaName: paper.wilayaName,
                          dairaName: paper.dairaName,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          AppStatusBadge(
                            label: localizations.repositoryViewsLabel,
                            tone: AppStatusTone.info,
                          ),
                          Text('${paper.viewCount}'),
                          AppStatusBadge(
                            label: localizations.repositoryDownloadsLabel,
                            tone: AppStatusTone.success,
                          ),
                          Text('${paper.downloadCount}'),
                        ],
                      ),
                    ],
                  ),
                ),
                if (paper.topicNames.isNotEmpty)
                  AppSectionCard(
                    title: localizations.topicSubscriptionsTitle,
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: paper.topicNames
                          .map((name) => Chip(label: Text(name)))
                          .toList(),
                    ),
                  ),
                AppSectionCard(
                  title: localizations.repositoryAbstractTitle,
                  child: Text(
                    paper.abstractText.isEmpty ? '-' : paper.abstractText,
                  ),
                ),
                AppSectionCard(
                  title: localizations.repositoryDownloadSectionTitle,
                  subtitle:
                      paper.fileName ??
                      localizations.repositoryPaperFileFallback,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      AppInlineMessage.info(
                        message: localizations.repositoryProtectedDownloadBody,
                      ),
                      const SizedBox(height: 12),
                      if (paper.fileSizeBytes != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: AppListRow(
                            leading: const Icon(Icons.storage_outlined),
                            title: localizations.fileSizeLabel,
                            subtitle: _formatFileSize(paper.fileSizeBytes!),
                          ),
                        ),
                      if ((paper.fileContentType ?? '').isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: AppListRow(
                            leading: const Icon(Icons.description_outlined),
                            title: localizations.fileTypeLabel,
                            subtitle: paper.fileContentType!,
                          ),
                        ),
                      FilledButton.icon(
                        onPressed: paper.fullPaperFileUrl == null
                            ? null
                            : () => _downloadPaper(paper),
                        icon: const Icon(Icons.download_outlined),
                        label: Text(localizations.repositoryDownloadAction),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
        error: (error, stackTrace) => AppErrorView(
          message: error.toString(),
          onRetry: () => ref
              .read(repositoryControllerProvider.notifier)
              .loadPaperDetail(widget.paperId),
        ),
        loading: AppLoadingView.new,
      ),
    );
  }
}

String _formatFileSize(int bytes) {
  if (bytes < 1024) {
    return '$bytes B';
  }
  if (bytes < 1024 * 1024) {
    return '${(bytes / 1024).toStringAsFixed(1)} KB';
  }
  return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}

String _paperContextSubtitle({
  required S localizations,
  required DateTime submittedOn,
  required String? wilayaName,
  required String? dairaName,
}) {
  final location = switch ((wilayaName, dairaName)) {
    (final String wilaya?, final String daira?) => '$wilaya, $daira',
    (final String wilaya?, _) => wilaya,
    _ => null,
  };
  final details = <String>[
    '${localizations.submittedOnLabel}: ${_formatDate(submittedOn)}',
    if (location != null && location.isNotEmpty) location,
  ];
  return details.join('\n');
}
