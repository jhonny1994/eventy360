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

class SubmissionsScreen extends ConsumerWidget {
  const SubmissionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final state = ref.watch(submissionsControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.submissionsTitle),
        actions: [
          IconButton(
            onPressed: () =>
                ref.read(submissionsControllerProvider.notifier).refresh(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: state.when(
        loading: () => const AppLoadingView(),
        error: (error, stackTrace) => AppErrorView(
          message: error.toString(),
          onRetry: () =>
              ref.read(submissionsControllerProvider.notifier).refresh(),
        ),
        data: (data) {
          return AppPageContainer(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                AppPageHero(
                  badge: localizations.submissionsTitle,
                  icon: Icons.assignment_outlined,
                  title: localizations.submissionsTitle,
                  subtitle: localizations.submissionsOverviewBody,
                ),
                AppSectionCard(
                  title: localizations.submitAbstractAction,
                  subtitle: localizations.submissionsOverviewBody,
                  child: Semantics(
                    button: true,
                    label: localizations.submitAbstractAction,
                    child: FilledButton.icon(
                      onPressed: () =>
                          context.go(RoutePaths.newAbstractSubmission),
                      icon: const Icon(Icons.add_circle_outline),
                      label: Text(localizations.submitAbstractAction),
                    ),
                  ),
                ),
                if (data.submissions.isEmpty)
                  AppEmptyState(
                    icon: Icons.description_outlined,
                    title: localizations.submissionsTitle,
                    body: localizations.noSubmissionsFound,
                  )
                else
                  ...data.submissions.map(
                    (submission) => AppSectionCard(
                      child: ListTile(
                        title: Text(submission.title),
                        subtitle: Text(
                          '${submission.eventTitle}\n'
                          '${localizations.submissionStatusLabel}: '
                          '${_statusLabel(localizations, submission.status)}',
                        ),
                        isThreeLine: true,
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.go(
                          RoutePaths.submissionDetail(submission.id),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
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
