import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/notifications/application/notification_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class TopicSubscriptionsScreen extends ConsumerWidget {
  const TopicSubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localizations = S.of(context);
    final state = ref.watch(eventsControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.topicSubscriptionsTitle),
      ),
      body: state.when(
        loading: AppLoadingView.new,
        error: (error, _) => AppErrorView(
          message: error.toString(),
          onRetry: () => ref.read(eventsControllerProvider.notifier).refresh(),
        ),
        data: (data) => RefreshIndicator(
          onRefresh: () =>
              ref.read(eventsControllerProvider.notifier).refresh(),
          child: AppPageContainer(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                AppPageHero(
                  badge: localizations.topicSubscriptionsTitle,
                  icon: Icons.interests_outlined,
                  title: localizations.topicSubscriptionsTitle,
                  subtitle: localizations.topicSubscriptionsBody,
                  trailing: AppStatusBadge(
                    label: '${data.subscribedTopicIds.length}',
                    tone: data.subscribedTopicIds.isEmpty
                        ? AppStatusTone.neutral
                        : AppStatusTone.success,
                  ),
                ),
                AppSectionCard(
                  title: localizations.topicSubscriptionsManageTitle,
                  subtitle: localizations.topicSubscriptionsManageBody,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if ((data.errorMessage ?? '').isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: AppInlineMessage.error(
                            message: data.errorMessage!,
                          ),
                        ),
                      if (data.topics.isEmpty)
                        AppEmptyState(
                          icon: Icons.topic_outlined,
                          title: localizations.topicSubscriptionsTitle,
                          body: localizations.topicSubscriptionsEmptyState,
                        )
                      else
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: data.topics.map((topic) {
                            final subscribed = data.subscribedTopicIds.contains(
                              topic.id,
                            );
                            return FilterChip(
                              selected: subscribed,
                              label: Text(topic.name),
                              onSelected: (_) async {
                                await ref
                                    .read(eventsControllerProvider.notifier)
                                    .toggleTopicSubscription(topic.id);
                                final nextState = ref
                                    .read(eventsControllerProvider)
                                    .asData
                                    ?.value;
                                ref.invalidate(notificationControllerProvider);
                                if (!context.mounted ||
                                    (nextState?.errorMessage ?? '')
                                        .isNotEmpty) {
                                  return;
                                }
                                AppFeedback.showSuccess(topic.name);
                              },
                            );
                          }).toList(),
                        ),
                      const SizedBox(height: 14),
                      Text(
                        localizations.notificationPreferencesBody,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
