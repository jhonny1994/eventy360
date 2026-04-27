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
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
        children: [
          Text(
            localizations.securityBody,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    localizations.sendResetLink,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(localizations.securityResetBody(email)),
                  const SizedBox(height: 16),
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
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      localizations.updatePasswordTitle,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(localizations.securityDirectPasswordBody),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _newPasswordController,
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
                      validator: (value) =>
                          value != _newPasswordController.text
                          ? localizations.passwordsDoNotMatch
                          : null,
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
          ),
          if ((_message ?? '').isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              _message!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
          if ((_errorMessage ?? '').isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              _errorMessage!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.error,
              ),
            ),
          ],
        ],
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
      await ref.read(sessionControllerProvider.notifier).sendPasswordReset(email);
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
