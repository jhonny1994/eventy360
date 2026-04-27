import 'package:flutter/material.dart';

class AdaptivePageBody extends StatelessWidget {
  const AdaptivePageBody({
    required this.child,
    super.key,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final horizontalPadding = constraints.maxWidth >= 900 ? 24.0 : 16.0;
        final availableWidth = constraints.maxWidth.isFinite
            ? constraints.maxWidth
            : 760.0;
        final contentWidth = availableWidth.clamp(0.0, 760.0);
        return Center(
          child: SizedBox(
            width: contentWidth,
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: child,
            ),
          ),
        );
      },
    );
  }
}
