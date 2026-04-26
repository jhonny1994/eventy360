import 'package:firebase_messaging/firebase_messaging.dart' as fcm;
import 'package:supabase_flutter/supabase_flutter.dart' as supabase;

enum PushAuthorizationStatus {
  authorized,
  provisional,
  denied,
  notDetermined,
}

class PushNotificationMessage {
  const PushNotificationMessage({required this.data});

  final Map<String, dynamic> data;
}

abstract class PushNotificationService {
  Future<PushAuthorizationStatus> requestPermission();
  Future<String?> getToken();
  Stream<PushNotificationMessage> onMessageOpenedApp();
  Future<PushNotificationMessage?> getInitialMessage();
  Future<void> registerTokenToBackend({
    required String token,
    required String topicId,
  });
}

class FirebasePushNotificationService implements PushNotificationService {
  FirebasePushNotificationService();

  fcm.FirebaseMessaging get _messaging => fcm.FirebaseMessaging.instance;

  @override
  Future<PushAuthorizationStatus> requestPermission() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    return switch (settings.authorizationStatus) {
      fcm.AuthorizationStatus.authorized => PushAuthorizationStatus.authorized,
      fcm.AuthorizationStatus.provisional => PushAuthorizationStatus.provisional,
      fcm.AuthorizationStatus.denied => PushAuthorizationStatus.denied,
      _ => PushAuthorizationStatus.notDetermined,
    };
  }

  @override
  Future<String?> getToken() => _messaging.getToken();

  @override
  Stream<PushNotificationMessage> onMessageOpenedApp() {
    return fcm.FirebaseMessaging.onMessageOpenedApp.map(
      (message) => PushNotificationMessage(data: message.data),
    );
  }

  @override
  Future<PushNotificationMessage?> getInitialMessage() async {
    final message = await _messaging.getInitialMessage();
    if (message == null) {
      return null;
    }
    return PushNotificationMessage(data: message.data);
  }

  @override
  Future<void> registerTokenToBackend({
    required String token,
    required String topicId,
  }) async {
    try {
      final client = supabase.Supabase.instance.client;
      final userId = client.auth.currentUser?.id;
      if (userId == null) {
        return;
      }
      await client.from('device_tokens').upsert({
        'profile_id': userId,
        'token': token,
        'topic_id': topicId,
      });
    } catch (_) {}
  }
}
