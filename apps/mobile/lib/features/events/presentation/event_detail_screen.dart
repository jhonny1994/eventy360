import 'dart:async';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/events/domain/event_detail.dart';
import 'package:eventy360/features/events/presentation/saved_events_screen.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class EventDetailScreen extends ConsumerWidget {
  const EventDetailScreen({
    required this.eventId,
    super.key,
  });

  final String eventId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final detailAsync = ref.watch(eventDetailProvider(eventId));
    final submissionsState = ref
        .watch(submissionsControllerProvider)
        .asData
        ?.value;

    return Scaffold(
      appBar: AppBar(title: Text(localizations.eventDetailsTitle)),
      body: detailAsync.when(
        loading: AppLoadingView.new,
        error: (error, _) => AppErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(eventDetailProvider(eventId)),
        ),
        data: (detail) {
          if (detail == null) {
            return AppPageContainer(
              child: Center(child: Text(localizations.eventNotFound)),
            );
          }
          final location = detail.location;

          final existingSubmission = submissionsState?.submissions
              .where((entry) => entry.eventId == detail.id)
              .firstOrNull;

          return AppPageContainer(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                AppPageHero(
                  badge: localizations.eventsTitle,
                  icon: Icons.event_outlined,
                  title: detail.title,
                  subtitle: detail.subtitle?.trim().isNotEmpty == true
                      ? detail.subtitle!
                      : localizations.eventDetailsOverviewBody,
                ),
                AppSectionCard(
                  title: localizations.eventDetailsTitle,
                  subtitle: localizations.eventHeaderSummaryBody,
                  child: Column(
                    children: [
                      if (detail.organizer != null)
                        _OrganizerRow(organizer: detail.organizer!),
                      if (detail.organizer != null) const Divider(height: 24),
                      AppListRow(
                        title: localizations.eventCreatedLabel,
                        subtitle: _formatDate(detail.createdAt),
                        leading: const Icon(Icons.calendar_today_outlined),
                      ),
                      const Divider(height: 18),
                      AppListRow(
                        title: localizations.eventTypeLabel,
                        subtitle: _humanizeEnum(detail.eventType),
                        leading: const Icon(Icons.category_outlined),
                      ),
                      const Divider(height: 18),
                      AppListRow(
                        title: localizations.eventStatusLabel,
                        subtitle: _humanizeEnum(detail.status),
                        leading: const Icon(Icons.verified_outlined),
                      ),
                      const Divider(height: 18),
                      AppListRow(
                        title: localizations.eventFormatLabel,
                        subtitle: _humanizeEnum(detail.format),
                        leading: const Icon(Icons.public_outlined),
                      ),
                      const Divider(height: 18),
                      AppListRow(
                        title: localizations.eventFeeLabel,
                        subtitle: detail.price == null || detail.price == 0
                            ? localizations.eventFreeLabel
                            : '${detail.price!.toStringAsFixed(0)} DZD',
                        leading: const Icon(Icons.payments_outlined),
                      ),
                    ],
                  ),
                ),
                AppSectionCard(
                  title: localizations.eventTimelineSectionTitle,
                  subtitle: localizations.eventTimelineSectionBody,
                  child: Column(
                    children: [
                      _TimelineRow(
                        title: localizations.eventStartsLabel,
                        value: _formatDateTime(detail.eventDate),
                      ),
                      if (detail.eventEndDate != null) ...[
                        const SizedBox(height: 12),
                        _TimelineRow(
                          title: localizations.eventEndsLabel,
                          value: _formatDateTime(detail.eventEndDate!),
                        ),
                      ],
                      if (detail.abstractSubmissionDeadline != null) ...[
                        const SizedBox(height: 12),
                        _TimelineRow(
                          title: localizations.abstractDeadlineLabel,
                          value: _formatDateTime(
                            detail.abstractSubmissionDeadline!,
                          ),
                        ),
                      ],
                      if (detail.fullPaperSubmissionDeadline != null) ...[
                        const SizedBox(height: 12),
                        _TimelineRow(
                          title: localizations.fullPaperDeadlineLabel,
                          value: _formatDateTime(
                            detail.fullPaperSubmissionDeadline!,
                          ),
                        ),
                      ],
                      if (detail.abstractReviewResultDate != null) ...[
                        const SizedBox(height: 12),
                        _TimelineRow(
                          title: localizations.eventReviewResultLabel,
                          value: _formatDateTime(
                            detail.abstractReviewResultDate!,
                          ),
                        ),
                      ],
                      if (detail.submissionVerdictDeadline != null) ...[
                        const SizedBox(height: 12),
                        _TimelineRow(
                          title: localizations.eventVerdictDeadlineLabel,
                          value: _formatDateTime(
                            detail.submissionVerdictDeadline!,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (location != null)
                  AppSectionCard(
                    title: localizations.eventLocationSectionTitle,
                    subtitle: location,
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _openExternal(
                              _mapsUrl(location),
                              localizations.fileOpenFailed,
                            ),
                            icon: const Icon(Icons.directions_outlined),
                            label: Text(localizations.getDirectionsAction),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: FilledButton.tonalIcon(
                            onPressed: () async {
                              await Clipboard.setData(
                                ClipboardData(text: location),
                              );
                              AppFeedback.showSuccess(
                                localizations.locationCopiedSuccess,
                              );
                            },
                            icon: const Icon(Icons.copy_all_outlined),
                            label: Text(localizations.copyLocationAction),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (_hasAnyDescriptionContent(detail))
                  AppSectionCard(
                    title: localizations.eventDetailsTitle,
                    subtitle: localizations.eventOrganizerBody,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_hasText(detail.whoOrganizes))
                          _DetailBlock(
                            title: localizations.eventWhoOrganizesTitle,
                            body: detail.whoOrganizes!,
                            icon: Icons.groups_2_outlined,
                          ),
                        if (_hasText(detail.problemStatement))
                          _DetailBlock(
                            title: localizations.eventProblemStatementTitle,
                            body: detail.problemStatement!,
                            icon: Icons.lightbulb_outline,
                          ),
                        if (_hasText(detail.description))
                          _DetailBlock(
                            title: localizations.eventObjectivesTitle,
                            body: detail.description!,
                            icon: Icons.track_changes_outlined,
                          ),
                        if (_hasText(detail.eventAxes))
                          _DetailBlock(
                            title: localizations.eventAxesSectionTitle,
                            body: detail.eventAxes!,
                            icon: Icons.account_tree_outlined,
                          ),
                        if (detail.topics.isNotEmpty) ...[
                          _DetailHeading(
                            title: localizations.eventTopicsSectionTitle,
                            icon: Icons.sell_outlined,
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: detail.topics
                                .map((topic) => Chip(label: Text(topic)))
                                .toList(),
                          ),
                          const SizedBox(height: 14),
                        ],
                        if (_hasText(detail.submissionGuidelines))
                          _DetailBlock(
                            title:
                                localizations.eventSubmissionGuidelinesTitle,
                            body: detail.submissionGuidelines!,
                            icon: Icons.rule_folder_outlined,
                          ),
                        if (_hasText(detail.targetAudience))
                          _DetailBlock(
                            title: localizations.eventTargetAudienceTitle,
                            body: detail.targetAudience!,
                            icon: Icons.person_search_outlined,
                          ),
                        if (_hasText(detail.scientificCommittees))
                          _DetailBlock(
                            title:
                                localizations.eventScientificCommitteeTitle,
                            body: detail.scientificCommittees!,
                            icon: Icons.groups_outlined,
                          ),
                        if (_hasText(detail.speakersKeynotes))
                          _DetailBlock(
                            title: localizations.eventSpeakersTitle,
                            body: detail.speakersKeynotes!,
                            icon: Icons.record_voice_over_outlined,
                            isLast: true,
                          ),
                      ],
                    ),
                  ),
                if (_hasAnyAsset(detail))
                  AppSectionCard(
                    title: localizations.eventAssetsSectionTitle,
                    subtitle: localizations.eventAssetsSectionBody,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (_hasText(detail.logoUrl))
                          _ImagePreview(
                            title: localizations.eventLogoTitle,
                            imageUrl: detail.logoUrl!,
                          ),
                        if (_hasText(detail.logoUrl) &&
                            _hasText(detail.qrCodeUrl))
                          const SizedBox(height: 12),
                        if (_hasText(detail.qrCodeUrl))
                          _ImagePreview(
                            title: localizations.eventQrTitle,
                            imageUrl: detail.qrCodeUrl!,
                          ),
                        if (_hasText(detail.brochureUrl)) ...[
                          const SizedBox(height: 12),
                          OutlinedButton.icon(
                            onPressed: () => _openExternal(
                              detail.brochureUrl!,
                              localizations.fileOpenFailed,
                            ),
                            icon: const Icon(Icons.menu_book_outlined),
                            label: Text(localizations.eventBrochureAction),
                          ),
                        ],
                      ],
                    ),
                  ),
                AppSectionCard(
                  title: localizations.eventContactSectionTitle,
                  subtitle: localizations.eventContactSectionBody,
                  child: Column(
                    children: [
                      if (_hasText(detail.email))
                        AppListRow(
                          title: localizations.email,
                          subtitle: detail.email,
                          leading: const Icon(Icons.mail_outline),
                          trailing: const Icon(Icons.open_in_new_outlined),
                          onTap: () => _openExternal(
                            'mailto:${detail.email}',
                            localizations.fileOpenFailed,
                          ),
                        ),
                      if (_hasText(detail.email) && _hasText(detail.phone))
                        const SizedBox(height: 12),
                      if (_hasText(detail.phone))
                        AppListRow(
                          title: localizations.phoneLabel,
                          subtitle: detail.phone,
                          leading: const Icon(Icons.call_outlined),
                          trailing: const Icon(Icons.open_in_new_outlined),
                          onTap: () => _openExternal(
                            'tel:${detail.phone}',
                            localizations.fileOpenFailed,
                          ),
                        ),
                      if ((_hasText(detail.email) || _hasText(detail.phone)) &&
                          _hasText(detail.website))
                        const SizedBox(height: 12),
                      if (_hasText(detail.website))
                        AppListRow(
                          title: localizations.websiteLabel,
                          subtitle: detail.website!,
                          leading: const Icon(Icons.language_outlined),
                          trailing: const Icon(Icons.open_in_new_outlined),
                          onTap: () => _openExternal(
                            detail.website!,
                            localizations.fileOpenFailed,
                          ),
                        ),
                    ],
                  ),
                ),
                AppSectionCard(
                  title: localizations.eventActionsSectionTitle,
                  subtitle: localizations.eventActionsSectionBody,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      FilledButton.icon(
                        onPressed: () async {
                          await ref
                              .read(eventsControllerProvider.notifier)
                              .toggleBookmark(detail.id);
                          ref
                            ..invalidate(bookmarkedEventsProvider)
                            ..invalidate(eventDetailProvider(eventId));
                          AppFeedback.showSuccess(
                            detail.isBookmarked
                                ? localizations.removeBookmark
                                : localizations.addBookmark,
                          );
                        },
                        icon: Icon(
                          detail.isBookmarked
                              ? Icons.bookmark
                              : Icons.bookmark_border,
                        ),
                        label: Text(
                          detail.isBookmarked
                              ? localizations.removeBookmark
                              : localizations.addBookmark,
                        ),
                      ),
                      const SizedBox(height: 10),
                      OutlinedButton.icon(
                        onPressed: () {
                          if (existingSubmission != null) {
                            AppFeedback.showInfo(
                              localizations.existingSubmissionRedirectBody,
                            );
                            unawaited(
                              context.push(
                                RoutePaths.submissionDetail(
                                  existingSubmission.id,
                                ),
                              ),
                            );
                            return;
                          }
                          unawaited(
                            context.push(
                              RoutePaths.newAbstractSubmissionForEvent(
                                detail.id,
                              ),
                            ),
                          );
                        },
                        icon: Icon(
                          existingSubmission != null
                              ? Icons.visibility_outlined
                              : Icons.upload_file_outlined,
                        ),
                        label: Text(
                          existingSubmission != null
                              ? localizations.viewSubmissionAction
                              : localizations.submitAbstractAction,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _openExternal(String url, String failureMessage) async {
    try {
      final uri = Uri.parse(url);
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        throw Exception('launch failed');
      }
    } on Object {
      AppFeedback.showError(failureMessage);
    }
  }
}

class _OrganizerRow extends StatelessWidget {
  const _OrganizerRow({required this.organizer});

  final EventOrganizerDetail organizer;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Row(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: colorScheme.primaryContainer,
          backgroundImage: _hasText(organizer.profilePictureUrl)
              ? NetworkImage(organizer.profilePictureUrl!)
              : null,
          child: !_hasText(organizer.profilePictureUrl)
              ? Text(
                  (organizer.displayName ?? 'O').characters.first.toUpperCase(),
                  style: TextStyle(
                    color: colorScheme.onPrimaryContainer,
                    fontWeight: FontWeight.w700,
                  ),
                )
              : null,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                organizer.displayName ?? S.of(context).organizerLabel,
                style: Theme.of(
                  context,
                ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
              ),
              if (_hasText(organizer.institutionType)) ...[
                const SizedBox(height: 4),
                Text(_humanizeEnum(organizer.institutionType!)),
              ],
            ],
          ),
        ),
        if (organizer.isVerified)
          AppStatusBadge(
            label: S.of(context).verifiedStatus,
            tone: AppStatusTone.success,
          ),
      ],
    );
  }
}

class _TimelineRow extends StatelessWidget {
  const _TimelineRow({
    required this.title,
    required this.value,
  });

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return AppListRow(
      title: title,
      subtitle: value,
      leading: const Icon(Icons.schedule_outlined),
    );
  }
}

class _DetailBlock extends StatelessWidget {
  const _DetailBlock({
    required this.title,
    required this.body,
    required this.icon,
    this.isLast = false,
  });

  final String title;
  final String body;
  final IconData icon;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _DetailHeading(title: title, icon: icon),
          const SizedBox(height: 8),
          Text(
            body,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailHeading extends StatelessWidget {
  const _DetailHeading({
    required this.title,
    required this.icon,
  });

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }
}

class _ImagePreview extends StatelessWidget {
  const _ImagePreview({
    required this.title,
    required this.imageUrl,
  });

  final String title;
  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: Image.network(
              imageUrl,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) => DecoratedBox(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Center(
                  child: Text(S.of(context).imageUnavailableLabel),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

bool _hasText(String? value) => value != null && value.trim().isNotEmpty;

bool _hasAnyDescriptionContent(EventDetail detail) {
  return _hasText(detail.whoOrganizes) ||
      _hasText(detail.problemStatement) ||
      _hasText(detail.description) ||
      _hasText(detail.eventAxes) ||
      detail.topics.isNotEmpty ||
      _hasText(detail.submissionGuidelines) ||
      _hasText(detail.targetAudience) ||
      _hasText(detail.scientificCommittees) ||
      _hasText(detail.speakersKeynotes);
}

bool _hasAnyAsset(EventDetail detail) {
  return _hasText(detail.logoUrl) ||
      _hasText(detail.qrCodeUrl) ||
      _hasText(detail.brochureUrl);
}

String _humanizeEnum(String value) {
  if (value.trim().isEmpty) {
    return value;
  }
  return value
      .split('_')
      .map(
        (part) => part.isEmpty
            ? part
            : '${part[0].toUpperCase()}${part.substring(1)}',
      )
      .join(' ');
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

String _mapsUrl(String location) {
  return 'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(location)}';
}
