import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:flutter/material.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: AppLoadingView(),
    );
  }
}
