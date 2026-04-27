import 'package:eventy360/app/providers.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'initial_setup_controller.g.dart';

const _initialSetupCompletedKey = 'app.initial_setup_completed';

@Riverpod(keepAlive: true)
class InitialSetupController extends _$InitialSetupController {
  @override
  bool build() {
    return ref
            .watch(sharedPreferencesProvider)
            .getBool(_initialSetupCompletedKey) ??
        false;
  }

  Future<void> markCompleted() async {
    await ref
        .read(sharedPreferencesProvider)
        .setBool(_initialSetupCompletedKey, true);
    state = true;
  }

  Future<void> reset() async {
    await ref
        .read(sharedPreferencesProvider)
        .setBool(_initialSetupCompletedKey, false);
    state = false;
  }
}
