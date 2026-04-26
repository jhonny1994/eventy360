import 'package:eventy360/l10n/generated/app_localizations.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context);
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
