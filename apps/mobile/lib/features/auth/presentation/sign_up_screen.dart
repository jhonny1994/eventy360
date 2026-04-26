import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
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

    return Scaffold(
      appBar: AppBar(title: Text(localizations.signUp)),
      body: SafeArea(
        child: AdaptivePageBody(
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
                const SizedBox(height: 12),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: InputDecoration(labelText: localizations.password),
                  validator: (value) =>
                      (value == null || value.length < 8) ? localizations.passwordTooShort : null,
                ),
                const SizedBox(height: 12),
                if (_error != null)
                  Text(
                    _error!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                const SizedBox(height: 16),
                Semantics(
                  button: true,
                  label: localizations.signUp,
                  child: FilledButton(
                    onPressed: isBusy ? null : _submit,
                    child: Text(localizations.signUp),
                  ),
                ),
                TextButton(
                  onPressed: () => context.go(RoutePaths.signIn),
                  child: Text(localizations.haveAccountSignIn),
                ),
              ],
            ),
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
    setState(() => _error = null);
    try {
      await ref.read(sessionControllerProvider.notifier).signUp(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(localizations.accountCreated)),
        );
      }
    } catch (error) {
      setState(() {
        _error = error is AuthException ? error.message : localizations.genericError;
      });
    }
  }
}
