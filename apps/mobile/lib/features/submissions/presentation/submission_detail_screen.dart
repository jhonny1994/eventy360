import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
              subtitle: localizations.submissionStatusLabel,
              trailing: AppStatusBadge(
                label: _statusLabel(localizations, record.status),
                tone: _statusTone(record.status),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${localizations.eventSelectionLabel}: ${record.eventTitle}',
                  ),
                  const SizedBox(height: 10),
                  Text(
                    localizations.abstractArLabel,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(record.abstractText),
                  if ((record.fullPaperFileUrl ?? '').isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      localizations.fileUrlLabel,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    SelectableText(record.fullPaperFileUrl!),
                  ],
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.submissionTimelineTitle,
              child: Column(
                children: detail.timeline
                    .map(
                      (entry) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.timeline_outlined),
                        title: Text(entry.title),
                        subtitle: Text(
                          '${entry.description}\n${entry.timestamp.toIso8601String()}',
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
                        onPressed: () =>
                            context.go(RoutePaths.submissionFullPaper(record.id)),
                        child: Text(localizations.submitFullPaperAction),
                      ),
                    if (record.canSubmitRevision) ...[
                      if (record.canSubmitFullPaper) const SizedBox(height: 10),
                      FilledButton.tonal(
                        onPressed: () =>
                            context.go(RoutePaths.submissionRevision(record.id)),
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
}
