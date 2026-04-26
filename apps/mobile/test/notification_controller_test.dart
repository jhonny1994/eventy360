import 'dart:async';

import 'package:eventy360/features/notifications/application/notification_controller.dart';
import 'package:eventy360/features/notifications/application/notification_state.dart';
import 'package:eventy360/features/notifications/infrastructure/push_notification_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('loads pending event from initial push message', () async {
    final service = _FakePushNotificationService(
      initial: const PushNotificationMessage(data: {'event_id': 'evt-42'}),
    );
    final container = ProviderContainer(
      overrides: [
        pushNotificationServiceProvider.overrideWithValue(service),
      ],
    );
    addTearDown(container.dispose);

    final state = await container.read(notificationControllerProvider.future);
    expect(state.pendingEventId, 'evt-42');
  });

  test('captures opened-app push message event id', () async {
    final service = _FakePushNotificationService();
    final container = ProviderContainer(
      overrides: [
        pushNotificationServiceProvider.overrideWithValue(service),
      ],
    );
    addTearDown(container.dispose);

    await container.read(notificationControllerProvider.future);
    service.emit(const PushNotificationMessage(data: {'event_id': 'evt-77'}));
    await Future<void>.delayed(const Duration(milliseconds: 10));

    final state = container.read(notificationControllerProvider).asData?.value;
    expect(state?.pendingEventId, 'evt-77');
  });

  test(
    'captures foreground notification message for in-app feedback',
    () async {
      final service = _FakePushNotificationService();
      final container = ProviderContainer(
        overrides: [
          pushNotificationServiceProvider.overrideWithValue(service),
        ],
      );
      addTearDown(container.dispose);

      await container.read(notificationControllerProvider.future);
      service.emitForeground(
        const PushNotificationMessage(
          data: {'event_id': 'evt-88'},
          title: 'New event',
          body: 'Tap to view details',
        ),
      );
      await Future<void>.delayed(const Duration(milliseconds: 10));

      final state = container
          .read(notificationControllerProvider)
          .asData
          ?.value;
      expect(state?.foregroundTitle, 'New event');
      expect(state?.foregroundBody, 'Tap to view details');
      expect(state?.foregroundEventId, 'evt-88');
    },
  );

  test('updates permission flag when permission is granted', () async {
    final service = _FakePushNotificationService(
      permission: PushAuthorizationStatus.authorized,
    );
    final container = ProviderContainer(
      overrides: [
        pushNotificationServiceProvider.overrideWithValue(service),
      ],
    );
    addTearDown(container.dispose);

    await container.read(notificationControllerProvider.future);
    await container
        .read(notificationControllerProvider.notifier)
        .requestPermissionForTopicIntent();

    final state =
        container.read(notificationControllerProvider).asData?.value ??
        NotificationState.initial();
    expect(state.permissionGranted, isTrue);
  });
}

class _FakePushNotificationService implements PushNotificationService {
  _FakePushNotificationService({
    this.initial,
    this.permission = PushAuthorizationStatus.denied,
  });

  final PushNotificationMessage? initial;
  final PushAuthorizationStatus permission;
  final StreamController<PushNotificationMessage> _openedController =
      StreamController<PushNotificationMessage>.broadcast();
  final StreamController<PushNotificationMessage> _foregroundController =
      StreamController<PushNotificationMessage>.broadcast();

  void emit(PushNotificationMessage message) => _openedController.add(message);

  void emitForeground(PushNotificationMessage message) =>
      _foregroundController.add(message);

  @override
  Future<PushNotificationMessage?> getInitialMessage() async => initial;

  @override
  Future<String?> getToken() async => 'fake-token';

  @override
  Stream<PushNotificationMessage> onForegroundMessage() =>
      _foregroundController.stream;

  @override
  Stream<PushNotificationMessage> onMessageOpenedApp() =>
      _openedController.stream;

  @override
  Future<PushAuthorizationStatus> requestPermission() async => permission;

  @override
  Future<void> registerTokenToBackend({
    required String token,
    required String topicId,
  }) async {}

  @override
  Future<void> unregisterTokenFromBackend({
    required String token,
    required String topicId,
  }) async {}
}
