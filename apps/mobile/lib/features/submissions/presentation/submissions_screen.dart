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
      ),
      body: state.when(
        loading: () => const AppLoadingView(),
        error: (error, stackTrace) => AppErrorView(
          message: error.toString(),
          onRetry: () =>
              ref.read(submissionsControllerProvider.notifier).refresh(),
        ),
        data: (data) {
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(submissionsControllerProvider.notifier).refresh(),
            child: AppPageContainer(
              child: ListView(
                key: const PageStorageKey<String>('submissions-list'),
                padding: const EdgeInsets.symmetric(vertical: 16),
                children: [
                  AppPageHero(
                    title: localizations.submissionsTitle,
                    subtitle: localizations.submissionsOverviewBody,
                  ),
                  AppSectionCard(
                    title: localizations.exploreEvents,
                    subtitle: localizations.submissionsStartFromEventBody,
                    child: Semantics(
                      button: true,
                      label: localizations.exploreEvents,
                      child: FilledButton.icon(
                        onPressed: () => context.go(RoutePaths.events),
                        icon: const Icon(Icons.event_note_outlined),
                        label: Text(localizations.exploreEvents),
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
                        child: AppListRow(
                          title: submission.title,
                          subtitle: _submissionSubtitle(
                            context,
                            localizations,
                            submission,
                          ),
                          trailing: AppStatusBadge(
                            label: _statusLabel(
                              localizations,
                              submission.status,
                            ),
                            tone: _statusTone(submission.status),
                          ),
                          onTap: () async {
                            await context.push(
                              RoutePaths.submissionDetail(submission.id),
                            );
                            await ref
                                .read(submissionsControllerProvider.notifier)
                                .refresh();
                          },
                        ),
                      ),
                    ),
                ],
              ),
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

  String _submissionSubtitle(
    BuildContext context,
    S localizations,
    SubmissionRecord submission,
  ) {
    final eventTitle = submission.eventTitle.trim();
    final title = submission.title.trim();
    if (eventTitle.isNotEmpty && !_sameLabel(eventTitle, title)) {
      return eventTitle;
    }

    final date = MaterialLocalizations.of(
      context,
    ).formatShortDate(submission.updatedAt);
    return '${localizations.lastUpdatedLabel}: $date';
  }

  bool _sameLabel(String first, String second) {
    String normalize(String value) =>
        value.toLowerCase().replaceAll(RegExp(r'\s+'), ' ').trim();

    return normalize(first) == normalize(second);
  }
}
