import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/features/auth/presentation/widgets/auth_scaffold.dart';
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
  var _obscurePassword = true;
  var _obscureConfirmPassword = true;

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
    final title = widget.isRecoveryMode
        ? localizations.updatePasswordTitle
        : localizations.resetPassword;
    return AuthScaffold(
      badge: localizations.authResearcherBadge,
      icon: Icons.lock_reset_outlined,
      title: title,
      subtitle: localizations.resetPasswordHeroBody,
      bottom: Center(
        child: TextButton(
          onPressed: () => context.go(RoutePaths.signIn),
          child: Text(localizations.backToSignIn),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (widget.isRecoveryMode) ...[
            Form(
              key: _updateFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: localizations.newPassword,
                      suffixIcon: IconButton(
                        onPressed: () {
                          setState(() => _obscurePassword = !_obscurePassword);
                        },
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                        ),
                      ),
                    ),
                    validator: (value) => (value == null || value.length < 8)
                        ? localizations.passwordTooShort
                        : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _confirmPasswordController,
                    obscureText: _obscureConfirmPassword,
                    decoration: InputDecoration(
                      labelText: localizations.confirmPassword,
                      suffixIcon: IconButton(
                        onPressed: () {
                          setState(
                            () => _obscureConfirmPassword =
                                !_obscureConfirmPassword,
                          );
                        },
                        icon: Icon(
                          _obscureConfirmPassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                        ),
                      ),
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
            const SizedBox(height: 18),
            Divider(color: Theme.of(context).colorScheme.outlineVariant),
            const SizedBox(height: 18),
          ],
          Form(
            key: _requestFormKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
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
                FilledButton.tonal(
                  onPressed: _submitResetRequest,
                  child: Text(localizations.sendResetLink),
                ),
              ],
            ),
          ),
          if (_message != null) ...[
            const SizedBox(height: 12),
            AppInlineMessage.info(message: _message!),
          ],
          if (_error != null) ...[
            const SizedBox(height: 12),
            AppInlineMessage.error(message: _error!),
          ],
        ],
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
