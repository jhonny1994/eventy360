import 'dart:async';

import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
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
                  title: '${paper.authorName} - ${paper.authorInstitution}',
                  subtitle: paper.eventName,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (paper.wilayaName != null)
                        Text(
                          paper.dairaName == null
                              ? paper.wilayaName!
                              : '${paper.wilayaName!}, ${paper.dairaName!}',
                        ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: paper.topicNames
                            .map((name) => Chip(label: Text(name)))
                            .toList(),
                      ),
                    ],
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
                      paper.fileName ?? localizations.repositoryPaperFileFallback,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (paper.fileSizeBytes != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(_formatFileSize(paper.fileSizeBytes!)),
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
