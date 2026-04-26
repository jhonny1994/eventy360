import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/auth_exception.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
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
      appBar: AppBar(title: Text(localizations.signIn)),
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
                const SizedBox(height: 12),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: InputDecoration(labelText: localizations.password),
                  validator: (value) =>
                      (value == null || value.isEmpty) ? localizations.requiredField : null,
                ),
                const SizedBox(height: 12),
                if (_error != null)
                  Text(
                    _error!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: isBusy ? null : _submit,
                  child: Text(localizations.signIn),
                ),
                TextButton(
                  onPressed: () => context.go(RoutePaths.signUp),
                  child: Text(localizations.createAccount),
                ),
                TextButton(
                  onPressed: () => context.go(RoutePaths.resetPassword),
                  child: Text(localizations.forgotPassword),
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
    setState(() => _error = null);
    try {
      await ref.read(sessionControllerProvider.notifier).signIn(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
    } catch (error) {
      setState(() {
        _error = error is AuthException ? error.message : localizations.genericError;
      });
    }
  }
}
