import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProfileGateScreen extends ConsumerStatefulWidget {
  const ProfileGateScreen({super.key});

  @override
  ConsumerState<ProfileGateScreen> createState() => _ProfileGateScreenState();
}

class _ProfileGateScreenState extends ConsumerState<ProfileGateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _institutionController = TextEditingController();

  @override
  void dispose() {
    _fullNameController.dispose();
    _institutionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.completeProfileTitle),
      ),
      body: SafeArea(
        child: AdaptivePageBody(
          child: Padding(
            padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                Text(localizations.completeProfileBody),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _fullNameController,
                  decoration: InputDecoration(labelText: localizations.fullName),
                  validator: (value) =>
                      (value == null || value.trim().isEmpty) ? localizations.requiredField : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _institutionController,
                  decoration: InputDecoration(labelText: localizations.institution),
                  validator: (value) =>
                      (value == null || value.trim().isEmpty) ? localizations.requiredField : null,
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _complete,
                  child: Text(localizations.continueAction),
                ),
              ],
            ),
          ),
        ),
        ),
      ),
    );
  }

  Future<void> _complete() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    await ref.read(sessionControllerProvider.notifier).setProfileCompleted(true);
  }
}
