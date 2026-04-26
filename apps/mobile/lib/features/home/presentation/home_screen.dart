import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.homeTitle),
      ),
      body: Center(
        child: Text(localizations.homeSubtitle),
      ),
    );
  }
}
