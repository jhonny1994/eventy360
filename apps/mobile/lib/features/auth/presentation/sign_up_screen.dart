import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/features/auth/presentation/widgets/auth_scaffold.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  var _obscurePassword = true;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final session = ref.watch(sessionControllerProvider);
    final isBusy = session.isLoading;

    return AuthScaffold(
      badge: localizations.authResearcherBadge,
      icon: Icons.person_add_alt_1_outlined,
      title: localizations.signUpHeroTitle,
      subtitle: localizations.signUpHeroBody,
      bottom: Center(
        child: TextButton(
          onPressed: () => context.go(RoutePaths.signIn),
          child: Text(localizations.haveAccountSignIn),
        ),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [
                AutofillHints.username,
                AutofillHints.email,
              ],
              textInputAction: TextInputAction.next,
              decoration: InputDecoration(labelText: localizations.email),
              validator: (value) => (value == null || value.isEmpty)
                  ? localizations.requiredField
                  : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              autofillHints: const [AutofillHints.newPassword],
              textInputAction: TextInputAction.done,
              decoration: InputDecoration(
                labelText: localizations.password,
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
            if (_error != null) AppInlineMessage.error(message: _error!),
            const SizedBox(height: 18),
            Semantics(
              button: true,
              label: localizations.signUp,
              child: FilledButton(
                onPressed: isBusy ? null : _submit,
                child: isBusy
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.2),
                      )
                    : Text(localizations.signUp),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final localizations = S.of(context);
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() => _error = null);
    try {
      await ref
          .read(sessionControllerProvider.notifier)
          .signUp(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
      if (mounted) {
        AppFeedback.showSuccess(localizations.accountCreated);
      }
    } on AuthException catch (error) {
      setState(() {
        _error = error.message;
      });
    } on Object {
      setState(() => _error = localizations.genericError);
    }
  }
}
