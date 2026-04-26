import 'package:supabase_flutter/supabase_flutter.dart' as supabase;
import 'package:firebase_messaging/firebase_messaging.dart' as fcm;

class PushNotificationService {
  PushNotificationService();

  fcm.FirebaseMessaging get _messaging => fcm.FirebaseMessaging.instance;

  Future<fcm.NotificationSettings> requestPermission() {
    return _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
  }

  Future<String?> getToken() => _messaging.getToken();

  Stream<fcm.RemoteMessage> onMessageOpenedApp() =>
      fcm.FirebaseMessaging.onMessageOpenedApp;

  Future<fcm.RemoteMessage?> getInitialMessage() =>
      _messaging.getInitialMessage();

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
