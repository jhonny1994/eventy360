import 'dart:async';

import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/features/auth/application/session_controller.dart';
import 'package:eventy360/features/auth/domain/location_option.dart';
import 'package:eventy360/features/auth/domain/researcher_profile.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _institutionController = TextEditingController();
  final _academicPositionController = TextEditingController();
  final _bioController = TextEditingController();

  List<LocationOption> _wilayas = const [];
  List<LocationOption> _dairas = const [];
  int? _selectedWilayaId;
  int? _selectedDairaId;
  bool _loading = true;
  bool _saving = false;
  bool _loadingDairas = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    unawaited(_loadProfile());
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _institutionController.dispose();
    _academicPositionController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(localizations.editProfileTitle),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator.adaptive())
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
              children: [
                Text(
                  localizations.editProfileBody,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                if ((_errorMessage ?? '').isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _fullNameController,
                        decoration: InputDecoration(
                          labelText: localizations.fullName,
                        ),
                        validator: (value) =>
                            (value == null || value.trim().isEmpty)
                            ? localizations.requiredField
                            : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _institutionController,
                        decoration: InputDecoration(
                          labelText: localizations.institution,
                        ),
                        validator: (value) =>
                            (value == null || value.trim().isEmpty)
                            ? localizations.requiredField
                            : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _academicPositionController,
                        decoration: InputDecoration(
                          labelText: localizations.academicPositionLabel,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _bioController,
                        maxLines: 4,
                        decoration: InputDecoration(
                          labelText: localizations.profileBioLabel,
                        ),
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
                        onChanged: (value) async {
                          setState(() {
                            _selectedWilayaId = value;
                            _selectedDairaId = null;
                            _dairas = const [];
                          });
                          if (value != null) {
                            await _loadDairas(value);
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
                      if (_loadingDairas) ...[
                        const SizedBox(height: 12),
                        const LinearProgressIndicator(),
                      ],
                      const SizedBox(height: 20),
                      FilledButton.icon(
                        onPressed: _saving ? null : _save,
                        icon: _saving
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.save_outlined),
                        label: Text(localizations.saveProfileAction),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Future<void> _loadProfile() async {
    final localeCode =
        WidgetsBinding.instance.platformDispatcher.locale.languageCode;
    final repository = ref.read(authRepositoryProvider);
    try {
      final results = await Future.wait<Object>([
        repository.fetchResearcherProfile(),
        repository.fetchWilayas(localeCode),
      ]);
      final profile = results[0] as ResearcherProfile;
      final wilayas = results[1] as List<LocationOption>;
      _fullNameController.text = profile.fullName;
      _institutionController.text = profile.institution;
      _academicPositionController.text = profile.academicPosition;
      _bioController.text = profile.bio;
      _selectedWilayaId = profile.wilayaId;
      _selectedDairaId = profile.dairaId;
      if (profile.wilayaId != null) {
        _dairas = await repository.fetchDairas(
          wilayaId: profile.wilayaId!,
          localeCode: localeCode,
        );
      }
      if (!mounted) {
        return;
      }
      setState(() {
        _wilayas = wilayas;
        _loading = false;
        _errorMessage = null;
      });
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _loading = false;
        _errorMessage = error.toString();
      });
    }
  }

  Future<void> _loadDairas(int wilayaId) async {
    final localeCode =
        WidgetsBinding.instance.platformDispatcher.locale.languageCode;
    setState(() => _loadingDairas = true);
    try {
      final dairas = await ref
          .read(authRepositoryProvider)
          .fetchDairas(
            wilayaId: wilayaId,
            localeCode: localeCode,
          );
      if (!mounted) {
        return;
      }
      setState(() {
        _dairas = dairas;
        _loadingDairas = false;
      });
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _loadingDairas = false;
        _errorMessage = error.toString();
      });
    }
  }

  Future<void> _save() async {
    final localizations = S.of(context);
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final wilayaId = _selectedWilayaId;
    final dairaId = _selectedDairaId;
    if (wilayaId == null || dairaId == null) {
      return;
    }
    setState(() {
      _saving = true;
      _errorMessage = null;
    });
    try {
      await ref
          .read(authRepositoryProvider)
          .updateResearcherProfile(
            fullName: _fullNameController.text.trim(),
            institution: _institutionController.text.trim(),
            academicPosition: _academicPositionController.text.trim(),
            bio: _bioController.text.trim(),
            wilayaId: wilayaId,
            dairaId: dairaId,
          );
      if (!mounted) {
        return;
      }
      AppFeedback.showSuccess(localizations.profileSavedSuccess);
      Navigator.of(context).pop();
    } on Object catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _errorMessage = error.toString());
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }
}
