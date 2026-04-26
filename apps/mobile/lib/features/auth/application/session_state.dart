import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'session_state.freezed.dart';
part 'session_state.g.dart';

@freezed
abstract class SessionState with _$SessionState {
  const factory SessionState({
    AuthUser? user,
    required bool onboardingCompleted,
    required bool profileCompleted,
  }) = _SessionState;

  const SessionState._();

  bool get isAuthenticated => user != null;
  bool get isResearcher => (user?.role ?? 'researcher') == 'researcher';

  factory SessionState.fromJson(Map<String, dynamic> json) =>
      _$SessionStateFromJson(json);
}
