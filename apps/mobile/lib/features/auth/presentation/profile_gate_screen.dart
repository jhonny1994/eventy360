import 'dart:async';

import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/location_option.dart';
import 'package:eventy360/features/auth/presentation/widgets/auth_scaffold.dart';
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
  List<LocationOption> _wilayas = const [];
  List<LocationOption> _dairas = const [];
  int? _selectedWilayaId;
  int? _selectedDairaId;
  bool _loadingLocations = true;
  bool _loadingDairas = false;
  String? _locationError;
  String? _loadedLocaleCode;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final localeCode = Localizations.localeOf(context).languageCode;
    if (_loadedLocaleCode == localeCode) {
      return;
    }
    _loadedLocaleCode = localeCode;
    unawaited(_loadWilayas(localeCode));
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _institutionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return AuthScaffold(
      badge: localizations.authResearcherBadge,
      icon: Icons.badge_outlined,
      title: localizations.completeProfileTitle,
      subtitle: localizations.completeProfileHeroBody,
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(localizations.completeProfileBody),
            const SizedBox(height: 16),
            TextFormField(
              controller: _fullNameController,
              decoration: InputDecoration(
                labelText: localizations.fullName,
              ),
              validator: (value) => (value == null || value.trim().isEmpty)
                  ? localizations.requiredField
                  : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _institutionController,
              decoration: InputDecoration(
                labelText: localizations.institution,
              ),
              validator: (value) => (value == null || value.trim().isEmpty)
                  ? localizations.requiredField
                  : null,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
              initialValue: _selectedWilayaId,
              items: _wilayas
                  .map(
                    (wilaya) => DropdownMenuItem<int>(
                      value: wilaya.id,
                      child: Text(wilaya.name),
                    ),
                  )
                  .toList(),
              onChanged: _loadingLocations
                  ? null
                  : (value) async {
                      setState(() {
                        _selectedWilayaId = value;
                        _selectedDairaId = null;
                        _dairas = const [];
                      });
                      if (value != null) {
                        await _loadDairas(
                          value,
                          Localizations.localeOf(context).languageCode,
                        );
                      }
                    },
              decoration: InputDecoration(
                labelText: localizations.wilayaLabel,
              ),
              validator: (value) =>
                  value == null ? localizations.requiredField : null,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
              initialValue: _selectedDairaId,
              items: _dairas
                  .map(
                    (daira) => DropdownMenuItem<int>(
                      value: daira.id,
                      child: Text(daira.name),
                    ),
                  )
                  .toList(),
              onChanged: _loadingDairas
                  ? null
                  : (value) {
                      setState(() => _selectedDairaId = value);
                    },
              decoration: InputDecoration(
                labelText: localizations.dairaLabel,
              ),
              validator: (value) =>
                  value == null ? localizations.requiredField : null,
            ),
            if (_loadingLocations || _loadingDairas) ...[
              const SizedBox(height: 12),
              const LinearProgressIndicator(),
            ],
            if ((_locationError ?? '').isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                _locationError!,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                ),
              ),
            ],
            const SizedBox(height: 18),
            FilledButton(
              onPressed: _loadingLocations ? null : _complete,
              child: Text(localizations.continueAction),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _complete() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final wilayaId = _selectedWilayaId;
    final dairaId = _selectedDairaId;
    if (wilayaId == null || dairaId == null) {
      return;
    }
    await ref
        .read(sessionControllerProvider.notifier)
        .completeResearcherProfile(
          fullName: _fullNameController.text.trim(),
          institution: _institutionController.text.trim(),
          wilayaId: wilayaId,
          dairaId: dairaId,
        );
  }

  Future<void> _loadWilayas(String localeCode) async {
    setState(() {
      _loadingLocations = true;
      _locationError = null;
    });
    try {
      final items = await ref
          .read(authRepositoryProvider)
          .fetchWilayas(localeCode);
      if (!mounted) {
        return;
      }
      setState(() {
        _wilayas = items;
        _loadingLocations = false;
      });
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _loadingLocations = false;
        _locationError = error.toString();
      });
    }
  }

  Future<void> _loadDairas(int wilayaId, String localeCode) async {
    setState(() {
      _loadingDairas = true;
      _locationError = null;
    });
    try {
      final items = await ref
          .read(authRepositoryProvider)
          .fetchDairas(
            wilayaId: wilayaId,
            localeCode: localeCode,
          );
      if (!mounted) {
        return;
      }
      setState(() {
        _dairas = items;
        _loadingDairas = false;
      });
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _loadingDairas = false;
        _locationError = error.toString();
      });
    }
  }
}
