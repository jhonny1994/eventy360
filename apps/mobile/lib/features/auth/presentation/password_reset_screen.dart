import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PasswordResetScreen extends ConsumerStatefulWidget {
  const PasswordResetScreen({super.key});

  @override
  ConsumerState<PasswordResetScreen> createState() => _PasswordResetScreenState();
}

class _PasswordResetScreenState extends ConsumerState<PasswordResetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  String? _message;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(localizations.resetPassword)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(labelText: localizations.email),
                  validator: (value) =>
                      (value == null || value.isEmpty) ? localizations.requiredField : null,
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _submit,
                  child: Text(localizations.sendResetLink),
                ),
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  Text(_message!),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.go(RoutePaths.signIn),
                  child: Text(localizations.backToSignIn),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final localizations = S.of(context);
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() {
      _error = null;
      _message = null;
    });
    try {
      await ref
          .read(sessionControllerProvider.notifier)
          .sendPasswordReset(_emailController.text.trim());
      setState(() => _message = localizations.resetEmailSent);
    } catch (error) {
      setState(() {
        _error = error is AuthException ? error.message : localizations.genericError;
      });
    }
  }
}
