enum AuthDeepLinkAction {
  passwordRecovery,
}

class AuthDeepLinkIntent {
  const AuthDeepLinkIntent({required this.action});

  final AuthDeepLinkAction action;
}
