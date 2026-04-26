import 'package:eventy360/features/auth/domain/auth_user.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'session_state.freezed.dart';
part 'session_state.g.dart';

@freezed
abstract class SessionState with _$SessionState {
  const factory SessionState({
    required bool onboardingCompleted,
    required bool profileCompleted,
    required bool isVerified,
    AuthUser? user,
  }) = _SessionState;

  factory SessionState.fromJson(Map<String, dynamic> json) =>
      _$SessionStateFromJson(json);

  const SessionState._();

  bool get isAuthenticated => user != null;
  bool get isResearcher => (user?.role ?? 'researcher') == 'researcher';
}
