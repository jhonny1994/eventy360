import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PasswordResetScreen extends ConsumerStatefulWidget {
  const PasswordResetScreen({
    super.key,
    this.isRecoveryMode = false,
  });

  final bool isRecoveryMode;

  @override
  ConsumerState<PasswordResetScreen> createState() =>
      _PasswordResetScreenState();
}

class _PasswordResetScreenState extends ConsumerState<PasswordResetScreen> {
  final _requestFormKey = GlobalKey<FormState>();
  final _updateFormKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String? _message;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(localizations.resetPassword)),
      body: SafeArea(
        child: AdaptivePageBody(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: ListView(
              children: [
                if (widget.isRecoveryMode) ...[
                  Text(
                    localizations.updatePasswordTitle,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Form(
                    key: _updateFormKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: localizations.newPassword,
                          ),
                          validator: (value) =>
                              (value == null || value.length < 8)
                              ? localizations.passwordTooShort
                              : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: localizations.confirmPassword,
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return localizations.requiredField;
                            }
                            if (value != _passwordController.text) {
                              return localizations.passwordsDoNotMatch;
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: _submitPasswordUpdate,
                          child: Text(localizations.updatePasswordAction),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 32),
                ],
                Form(
                  key: _requestFormKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: localizations.email,
                        ),
                        validator: (value) => (value == null || value.isEmpty)
                            ? localizations.requiredField
                            : null,
                      ),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: _submitResetRequest,
                        child: Text(localizations.sendResetLink),
                      ),
                    ],
                  ),
                ),
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  Text(_message!),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
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

  Future<void> _submitResetRequest() async {
    final localizations = S.of(context);
    if (!_requestFormKey.currentState!.validate()) {
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
    } on AuthException catch (error) {
      setState(() {
        _error = error.message;
      });
    } on Object {
      setState(() => _error = localizations.genericError);
    }
  }

  Future<void> _submitPasswordUpdate() async {
    final localizations = S.of(context);
    if (!_updateFormKey.currentState!.validate()) {
      return;
    }
    setState(() {
      _error = null;
      _message = null;
    });
    try {
      await ref
          .read(sessionControllerProvider.notifier)
          .updatePassword(_passwordController.text);
      setState(() => _message = localizations.passwordUpdatedSuccess);
    } on AuthException catch (error) {
      setState(() {
        _error = error.message;
      });
    } on Object {
      setState(() => _error = localizations.genericError);
    }
  }
}
