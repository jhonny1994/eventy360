import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SecurityScreen extends ConsumerStatefulWidget {
  const SecurityScreen({super.key});

  @override
  ConsumerState<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends ConsumerState<SecurityScreen> {
  final _formKey = GlobalKey<FormState>();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _sendingReset = false;
  bool _updatingPassword = false;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  String? _message;
  String? _errorMessage;

  @override
  void dispose() {
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final session = ref.watch(sessionControllerProvider).asData?.value;
    final email = session?.user?.email ?? '';
    return Scaffold(
      appBar: AppBar(title: Text(localizations.securityTitle)),
      body: AppPageContainer(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            AppPageHero(
              badge: localizations.accountTitle,
              icon: Icons.security_outlined,
              title: localizations.securityTitle,
              subtitle: localizations.securityBody,
              trailing: email.isEmpty
                  ? null
                  : AppStatusBadge(
                      label: email,
                      tone: AppStatusTone.neutral,
                    ),
            ),
            if ((_message ?? '').isNotEmpty)
              AppInlineMessage.info(message: _message!),
            if ((_errorMessage ?? '').isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: AppInlineMessage.error(message: _errorMessage!),
              ),
            AppSectionCard(
              title: localizations.sendResetLink,
              subtitle: localizations.securityResetBody(email),
              leading: const Icon(Icons.mark_email_read_outlined),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FilledButton.tonalIcon(
                    onPressed: _sendingReset ? null : () => _sendReset(email),
                    icon: _sendingReset
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.mark_email_read_outlined),
                    label: Text(localizations.sendResetLink),
                  ),
                ],
              ),
            ),
            AppSectionCard(
              title: localizations.updatePasswordTitle,
              subtitle: localizations.securityDirectPasswordBody,
              leading: const Icon(Icons.lock_reset_outlined),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextFormField(
                      controller: _newPasswordController,
                      obscureText: _obscureNewPassword,
                      autofillHints: const [AutofillHints.newPassword],
                      decoration: InputDecoration(
                        labelText: localizations.newPassword,
                        helperText: localizations.passwordTooShort,
                        suffixIcon: IconButton(
                          onPressed: () {
                            setState(
                              () => _obscureNewPassword = !_obscureNewPassword,
                            );
                          },
                          icon: Icon(
                            _obscureNewPassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                        ),
                      ),
                      validator: (value) => (value == null || value.length < 8)
                          ? localizations.passwordTooShort
                          : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _confirmPasswordController,
                      obscureText: _obscureConfirmPassword,
                      autofillHints: const [AutofillHints.newPassword],
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
                        if (value != _newPasswordController.text) {
                          return localizations.passwordsDoNotMatch;
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: _updatingPassword ? null : _updatePassword,
                      icon: _updatingPassword
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.lock_reset_outlined),
                      label: Text(localizations.updatePasswordAction),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendReset(String email) async {
    setState(() {
      _sendingReset = true;
      _message = null;
      _errorMessage = null;
    });
    try {
      await ref
          .read(sessionControllerProvider.notifier)
          .sendPasswordReset(email);
      if (!mounted) {
        return;
      }
      setState(() => _message = S.of(context).resetEmailSent);
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _errorMessage = error.toString());
    } finally {
      if (mounted) {
        setState(() => _sendingReset = false);
      }
    }
  }

  Future<void> _updatePassword() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() {
      _updatingPassword = true;
      _message = null;
      _errorMessage = null;
    });
    try {
      await ref
          .read(sessionControllerProvider.notifier)
          .updatePassword(_newPasswordController.text);
      if (!mounted) {
        return;
      }
      setState(() => _message = S.of(context).passwordUpdatedSuccess);
      _newPasswordController.clear();
      _confirmPasswordController.clear();
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _errorMessage = error.toString());
    } finally {
      if (mounted) {
        setState(() => _updatingPassword = false);
      }
    }
  }
}
