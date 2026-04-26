import 'dart:async';

import 'package:eventy360/features/notifications/application/notification_state.dart';
import 'package:eventy360/features/notifications/infrastructure/push_notification_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'notification_controller.g.dart';

@Riverpod(keepAlive: true)
PushNotificationService pushNotificationService(Ref ref) {
  return FirebasePushNotificationService();
}

@Riverpod(keepAlive: true)
class NotificationController extends _$NotificationController {
  StreamSubscription<PushNotificationMessage>? _openedSub;

  @override
  Future<NotificationState> build() async {
    ref.onDispose(() => _openedSub?.cancel());
    final service = ref.watch(pushNotificationServiceProvider);
    final initialMessage = await service.getInitialMessage();
    final initialEventId = _extractEventId(initialMessage?.data);

    _openedSub = service.onMessageOpenedApp().listen((message) {
      final eventId = _extractEventId(message.data);
      if (eventId != null) {
        final current = state.asData?.value ?? NotificationState.initial();
        state = AsyncData(current.copyWith(pendingEventId: eventId));
      }
    });

    return NotificationState.initial().copyWith(
      pendingEventId: initialEventId,
    );
  }

  Future<void> requestPermissionForTopicIntent() async {
    final current = state.asData?.value ?? NotificationState.initial();
    final settings = await ref
        .read(pushNotificationServiceProvider)
        .requestPermission();
    final granted =
        settings == PushAuthorizationStatus.authorized ||
        settings == PushAuthorizationStatus.provisional;
    state = AsyncData(current.copyWith(permissionGranted: granted));
  }

  Future<void> registerCurrentToken({required String topicId}) async {
    final service = ref.read(pushNotificationServiceProvider);
    final token = await service.getToken();
    if (token == null) {
      return;
    }
    await service.registerTokenToBackend(token: token, topicId: topicId);
  }

  void clearPendingEvent() {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    state = AsyncData(current.copyWith(pendingEventId: null));
  }

  String? _extractEventId(Map<String, dynamic>? data) {
    if (data == null) {
      return null;
    }
    final eventId = data['event_id']?.toString();
    if (eventId == null || eventId.isEmpty) {
      return null;
    }
    return eventId;
  }
}
