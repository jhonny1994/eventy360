import 'package:flutter/material.dart';

final GlobalKey<ScaffoldMessengerState> appScaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

enum AppFeedbackType {
  info,
  success,
  error,
}

class AppFeedback {
  const AppFeedback._();

  static void showInfo(
    String message, {
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    _show(
      message,
      type: AppFeedbackType.info,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }

  static void showSuccess(
    String message, {
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    _show(
      message,
      type: AppFeedbackType.success,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }

  static void showError(
    String message, {
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    _show(
      message,
      type: AppFeedbackType.error,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }

  static void _show(
    String message, {
    required AppFeedbackType type,
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    final messenger = appScaffoldMessengerKey.currentState;
    if (messenger == null || message.trim().isEmpty) {
      return;
    }
    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: _backgroundColorFor(type),
          action: actionLabel == null || onAction == null
              ? null
              : SnackBarAction(
                  label: actionLabel,
                  onPressed: onAction,
                ),
        ),
      );
  }

  static Color? _backgroundColorFor(AppFeedbackType type) {
    final context = appScaffoldMessengerKey.currentContext;
    if (context == null) {
      return null;
    }
    final colorScheme = Theme.of(context).colorScheme;
    return switch (type) {
      AppFeedbackType.info => colorScheme.inverseSurface,
      AppFeedbackType.success => colorScheme.primary,
      AppFeedbackType.error => colorScheme.error,
    };
  }
}
