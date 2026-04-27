import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class SubmissionDetailScreen extends ConsumerStatefulWidget {
  const SubmissionDetailScreen({
    required this.submissionId,
    super.key,
  });

  final String submissionId;

  @override
  ConsumerState<SubmissionDetailScreen> createState() =>
      _SubmissionDetailScreenState();
}

class _SubmissionDetailScreenState
    extends ConsumerState<SubmissionDetailScreen> {
  @override
  void initState() {
    super.initState();
    unawaited(
      Future<void>.microtask(
        () => ref
            .read(submissionsControllerProvider.notifier)
            .loadSubmissionDetail(widget.submissionId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final state = ref.watch(submissionsControllerProvider);
    final data = state.asData?.value;

    if (state.isLoading && data == null) {
      return const Scaffold(body: AppLoadingView());
    }
    final detail = data?.selectedDetail;
    if (state.hasError || detail == null) {
      return Scaffold(
        appBar: AppBar(title: Text(localizations.submissionDetailTitle)),
        body: AppErrorView(
          message:
              state.error?.toString() ?? localizations.submissionDetailMissing,
          onRetry: () => ref
              .read(submissionsControllerProvider.notifier)
              .loadSubmissionDetail(widget.submissionId),
        ),
      );
    }
    final record = detail.record;
    return Scaffold(
      appBar: AppBar(title: Text(localizations.submissionDetailTitle)),
      body: AppPageContainer(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            AppPageHero(
              badge: localizations.submissionsTitle,
              icon: Icons.timeline_outlined,
              title: record.title,
              subtitle: localizations.submissionDetailOverviewBody,
            ),
            AppSectionCard(
              title: record.eventTitle,
              subtitle: _statusNarrative(localizations, record.status),
              trailing: AppStatusBadge(
                label: _statusLabel(localizations, record.status),
                tone: _statusTone(record.status),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppListRow(
                    leading: const Icon(Icons.event_note_outlined),
                    title: localizations.eventSelectionLabel,
                    subtitle: record.eventTitle,
                  ),
                  const Divider(height: 20),
                  AppListRow(
                    leading: const Icon(Icons.schedule_outlined),
                    title: localizations.submittedOnLabel,
                    subtitle: _formatDateTime(record.submissionDate),
                  ),
                  const Divider(height: 20),
                  AppListRow(
                    leading: const Icon(Icons.update_outlined),
                    title: localizations.lastUpdatedLabel,
                    subtitle: _formatDateTime(record.updatedAt),
                  ),
                  if (detail.abstractDeadline != null) ...[
                    const Divider(height: 20),
                    AppListRow(
                      leading: const Icon(Icons.timer_outlined),
                      title: localizations.abstractDeadlineLabel,
                      subtitle: _formatDate(detail.abstractDeadline!),
                    ),
                  ],
                  if (detail.fullPaperDeadline != null) ...[
                    const Divider(height: 20),
                    AppListRow(
                      leading: const Icon(Icons.article_outlined),
                      title: localizations.fullPaperDeadlineLabel,
                      subtitle: _formatDate(detail.fullPaperDeadline!),
                    ),
                  ],
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.abstractArLabel,
              child: Text(record.abstractText),
            ),
            if (detail.fileDetails != null)
              AppSectionCard(
                title: localizations.submissionFilesTitle,
                subtitle: localizations.submissionFilesBody,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppListRow(
                      leading: const Icon(Icons.description_outlined),
                      title: detail.fileDetails!.fileName ??
                          localizations.repositoryPaperFileFallback,
                      subtitle: localizations.openSubmissionFileAction,
                    ),
                    if (detail.fileDetails!.fileSizeBytes != null) ...[
                      const Divider(height: 20),
                      AppListRow(
                        leading: const Icon(Icons.storage_outlined),
                        title: localizations.fileSizeLabel,
                        subtitle: _formatFileSize(
                          detail.fileDetails!.fileSizeBytes!,
                        ),
                      ),
                    ],
                    if ((detail.fileDetails!.contentType ?? '').isNotEmpty) ...[
                      const Divider(height: 20),
                      AppListRow(
                        leading: const Icon(Icons.info_outline_rounded),
                        title: localizations.fileTypeLabel,
                        subtitle: detail.fileDetails!.contentType!,
                      ),
                    ],
                    if ((detail.fileDetails!.revisionNotes ?? '')
                        .trim()
                        .isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(detail.fileDetails!.revisionNotes!),
                    ],
                    const SizedBox(height: 12),
                    FilledButton.tonalIcon(
                      onPressed: () => _openFile(detail.fileDetails!.fileUrl),
                      icon: const Icon(Icons.open_in_new_outlined),
                      label: Text(localizations.openSubmissionFileAction),
                    ),
                  ],
                ),
              ),
            if (detail.feedback.isNotEmpty)
              AppSectionCard(
                title: localizations.submissionFeedbackTitle,
                subtitle: localizations.submissionFeedbackBody,
                child: Column(
                  children: detail.feedback
                      .map(
                        (entry) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: _feedbackBackground(context, entry.role),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _feedbackRoleLabel(
                                      localizations,
                                      entry.role,
                                    ),
                                    style: Theme.of(context)
                                        .textTheme
                                        .labelLarge
                                        ?.copyWith(fontWeight: FontWeight.w700),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(entry.content),
                                  const SizedBox(height: 8),
                                  Text(
                                    _formatDateTime(entry.timestamp),
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
            AppSectionCard(
              title: localizations.submissionTimelineTitle,
              child: Column(
                children: detail.timeline
                    .map(
                      (entry) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: AppListRow(
                          leading: const Icon(Icons.timeline_outlined),
                          title: entry.title,
                          subtitle:
                              '${entry.description}\n${_formatDateTime(entry.timestamp)}',
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),
            if (record.canSubmitFullPaper || record.canSubmitRevision)
              AppSectionCard(
                title: localizations.continueAction,
                subtitle: localizations.submissionsOverviewBody,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (record.canSubmitFullPaper)
                      FilledButton(
                        onPressed: () async {
                          await context.push(
                            RoutePaths.submissionFullPaper(record.id),
                          );
                          if (!context.mounted) {
                            return;
                          }
                          await ref
                              .read(submissionsControllerProvider.notifier)
                              .loadSubmissionDetail(widget.submissionId);
                        },
                        child: Text(localizations.submitFullPaperAction),
                      ),
                    if (record.canSubmitRevision) ...[
                      if (record.canSubmitFullPaper) const SizedBox(height: 10),
                      FilledButton.tonal(
                        onPressed: () async {
                          await context.push(
                            RoutePaths.submissionRevision(record.id),
                          );
                          if (!context.mounted) {
                            return;
                          }
                          await ref
                              .read(submissionsControllerProvider.notifier)
                              .loadSubmissionDetail(widget.submissionId);
                        },
                        child: Text(localizations.submitRevisionAction),
                      ),
                    ],
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _openFile(String url) async {
    final fileOpenFailed = S.of(context).fileOpenFailed;
    try {
      final uri = Uri.parse(url);
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        throw Exception('launch failed');
      }
    } on Object {
      AppFeedback.showError(fileOpenFailed);
    }
  }

  String _statusLabel(S localizations, SubmissionStatus status) {
    switch (status) {
      case SubmissionStatus.abstractSubmitted:
        return localizations.statusAbstractSubmitted;
      case SubmissionStatus.abstractAccepted:
        return localizations.statusAbstractAccepted;
      case SubmissionStatus.abstractRejected:
        return localizations.statusAbstractRejected;
      case SubmissionStatus.fullPaperSubmitted:
        return localizations.statusFullPaperSubmitted;
      case SubmissionStatus.fullPaperAccepted:
        return localizations.statusFullPaperAccepted;
      case SubmissionStatus.fullPaperRejected:
        return localizations.statusFullPaperRejected;
      case SubmissionStatus.revisionRequested:
        return localizations.statusRevisionRequested;
      case SubmissionStatus.revisionUnderReview:
        return localizations.statusRevisionUnderReview;
      case SubmissionStatus.completed:
        return localizations.statusCompleted;
    }
  }

  AppStatusTone _statusTone(SubmissionStatus status) {
    switch (status) {
      case SubmissionStatus.abstractAccepted:
      case SubmissionStatus.fullPaperAccepted:
      case SubmissionStatus.completed:
        return AppStatusTone.success;
      case SubmissionStatus.abstractRejected:
      case SubmissionStatus.fullPaperRejected:
        return AppStatusTone.error;
      case SubmissionStatus.revisionRequested:
      case SubmissionStatus.revisionUnderReview:
        return AppStatusTone.info;
      case SubmissionStatus.abstractSubmitted:
      case SubmissionStatus.fullPaperSubmitted:
        return AppStatusTone.neutral;
    }
  }

  String _statusNarrative(S localizations, SubmissionStatus status) {
    switch (status) {
      case SubmissionStatus.abstractSubmitted:
        return localizations.statusNarrativeAbstractSubmitted;
      case SubmissionStatus.abstractAccepted:
        return localizations.statusNarrativeAbstractAccepted;
      case SubmissionStatus.abstractRejected:
        return localizations.statusNarrativeAbstractRejected;
      case SubmissionStatus.fullPaperSubmitted:
        return localizations.statusNarrativeFullPaperSubmitted;
      case SubmissionStatus.fullPaperAccepted:
        return localizations.statusNarrativeFullPaperAccepted;
      case SubmissionStatus.fullPaperRejected:
        return localizations.statusNarrativeFullPaperRejected;
      case SubmissionStatus.revisionRequested:
        return localizations.statusNarrativeRevisionRequested;
      case SubmissionStatus.revisionUnderReview:
        return localizations.statusNarrativeRevisionUnderReview;
      case SubmissionStatus.completed:
        return localizations.statusNarrativeCompleted;
    }
  }

  String _feedbackRoleLabel(S localizations, String role) {
    switch (role) {
      case 'organizer':
      case 'admin':
        return localizations.feedbackReviewerLabel;
      default:
        return localizations.feedbackResearcherLabel;
    }
  }

  Color _feedbackBackground(BuildContext context, String role) {
    final colorScheme = Theme.of(context).colorScheme;
    switch (role) {
      case 'organizer':
      case 'admin':
        return colorScheme.secondaryContainer;
      default:
        return colorScheme.surfaceContainerHighest;
    }
  }
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}

String _formatDateTime(DateTime date) {
  final hh = date.hour.toString().padLeft(2, '0');
  final mm = date.minute.toString().padLeft(2, '0');
  return '${_formatDate(date)} $hh:$mm';
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
