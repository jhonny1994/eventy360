import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
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
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(record.title, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text('${localizations.eventSelectionLabel}: ${record.eventTitle}'),
          const SizedBox(height: 8),
          Text(
            '${localizations.submissionStatusLabel}: '
            '${_statusLabel(localizations, record.status)}',
          ),
          const SizedBox(height: 12),
          Text(
            localizations.abstractArLabel,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 4),
          Text(record.abstractText),
          if ((record.fullPaperFileUrl ?? '').isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              localizations.fileUrlLabel,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            SelectableText(record.fullPaperFileUrl!),
          ],
          const SizedBox(height: 16),
          Text(
            localizations.submissionTimelineTitle,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          ...detail.timeline.map(
            (entry) => ListTile(
              dense: true,
              leading: const Icon(Icons.timeline_outlined),
              title: Text(entry.title),
              subtitle: Text(
                '${entry.description}\n${entry.timestamp.toIso8601String()}',
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (record.canSubmitFullPaper)
            FilledButton(
              onPressed: () => context.go(
                '${RoutePaths.submissions}/${record.id}/full-paper',
              ),
              child: Text(localizations.submitFullPaperAction),
            ),
          if (record.canSubmitRevision)
            FilledButton.tonal(
              onPressed: () => context.go(
                '${RoutePaths.submissions}/${record.id}/revision',
              ),
              child: Text(localizations.submitRevisionAction),
            ),
        ],
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
}
