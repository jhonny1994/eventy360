import 'package:eventy360/app/app.dart';
import 'package:eventy360/app/providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('renders onboarding on first launch', (tester) async {
    SharedPreferences.setMockInitialValues(const {});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
        child: const Eventy360App(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Welcome to Eventy360'), findsOneWidget);
  });
}
