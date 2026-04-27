import 'package:flutter/material.dart';

class AppInlineMessage extends StatelessWidget {
  const AppInlineMessage.error({
    required this.message,
    super.key,
  }) : icon = Icons.error_outline,
       type = AppInlineMessageType.error;

  const AppInlineMessage.info({
    required this.message,
    super.key,
  }) : icon = Icons.info_outline,
       type = AppInlineMessageType.info;

  final String message;
  final IconData icon;
  final AppInlineMessageType type;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final (backgroundColor, foregroundColor) = switch (type) {
      AppInlineMessageType.error => (
        colorScheme.errorContainer,
        colorScheme.onErrorContainer,
      ),
      AppInlineMessageType.info => (
        colorScheme.secondaryContainer,
        colorScheme.onSecondaryContainer,
      ),
    };

    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: foregroundColor),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: foregroundColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum AppInlineMessageType {
  info,
  error,
}
