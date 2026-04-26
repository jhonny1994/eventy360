import 'dart:async';
import 'dart:io';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/features/events/application/events_controller.dart';
import 'package:eventy360/features/submissions/application/submissions_controller.dart';
import 'package:eventy360/features/submissions/domain/submission_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SubmissionWriteScreen extends ConsumerStatefulWidget {
  const SubmissionWriteScreen.abstract({
    this.prefilledEventId,
    super.key,
  }) : mode = SubmissionWriteKind.abstract,
       submissionId = null;

  const SubmissionWriteScreen.fullPaper({
    required this.submissionId,
    super.key,
  }) : mode = SubmissionWriteKind.fullPaper,
       prefilledEventId = null;

  const SubmissionWriteScreen.revision({
    required this.submissionId,
    super.key,
  }) : mode = SubmissionWriteKind.revision,
       prefilledEventId = null;

  final SubmissionWriteKind mode;
  final String? submissionId;
  final String? prefilledEventId;

  @override
  ConsumerState<SubmissionWriteScreen> createState() =>
      _SubmissionWriteScreenState();
}

class _SubmissionWriteScreenState extends ConsumerState<SubmissionWriteScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleArController;
  late final TextEditingController _titleEnController;
  late final TextEditingController _abstractArController;
  late final TextEditingController _abstractEnController;
  late final TextEditingController _revisionNotesController;

  String? _selectedEventId;
  SubmissionUploadFile? _selectedUploadFile;

  @override
  void initState() {
    super.initState();
    _titleArController = TextEditingController();
    _titleEnController = TextEditingController();
    _abstractArController = TextEditingController();
    _abstractEnController = TextEditingController();
    _revisionNotesController = TextEditingController();

    final idOrEvent = widget.mode == SubmissionWriteKind.abstract
        ? (widget.prefilledEventId ?? '')
        : (widget.submissionId ?? '');
    final draft = ref
        .read(submissionsControllerProvider.notifier)
        .getDraft(widget.mode, idOrEvent: idOrEvent);
    if (draft != null) {
      _selectedEventId = draft.eventId;
      _titleArController.text = draft.titleAr;
      _titleEnController.text = draft.titleEn;
      _abstractArController.text = draft.abstractAr;
      _abstractEnController.text = draft.abstractEn;
      _revisionNotesController.text = draft.revisionNotes;
    } else {
      _selectedEventId = widget.prefilledEventId;
    }

    _titleArController.addListener(_saveDraft);
    _titleEnController.addListener(_saveDraft);
    _abstractArController.addListener(_saveDraft);
    _abstractEnController.addListener(_saveDraft);
    _revisionNotesController.addListener(_saveDraft);
  }

  @override
  void dispose() {
    _titleArController.dispose();
    _titleEnController.dispose();
    _abstractArController.dispose();
    _abstractEnController.dispose();
    _revisionNotesController.dispose();
    super.dispose();
  }

  Future<void> _saveDraft() async {
    final draft = SubmissionDraft(
      kind: widget.mode,
      eventId: _selectedEventId,
      submissionId: widget.submissionId,
      titleAr: _titleArController.text,
      titleEn: _titleEnController.text,
      abstractAr: _abstractArController.text,
      abstractEn: _abstractEnController.text,
      revisionNotes: _revisionNotesController.text,
    );
    await ref.read(submissionsControllerProvider.notifier).saveDraft(draft);
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'doc', 'docx'],
      withData: true,
    );
    final picked = result?.files.single;
    if (picked == null) {
      return;
    }
    var bytes = picked.bytes;
    if (bytes == null && picked.path != null) {
      bytes = await File(picked.path!).readAsBytes();
    }
    if (bytes == null) {
      return;
    }
    setState(() {
      _selectedUploadFile = SubmissionUploadFile(
        bytes: bytes!,
        fileName: picked.name,
        mimeType: _mimeTypeForExtension(picked.extension),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final state = ref.watch(submissionsControllerProvider);
    final controller = ref.read(submissionsControllerProvider.notifier);
    final eventsState = ref.watch(eventsControllerProvider);
    final events = eventsState.asData?.value.events ?? const [];
    final submissions =
        state.asData?.value.submissions ?? const <SubmissionRecord>[];
    final isSubmitting = state.asData?.value.isSubmitting ?? false;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          switch (widget.mode) {
            SubmissionWriteKind.abstract => localizations.submitAbstractTitle,
            SubmissionWriteKind.fullPaper => localizations.submitFullPaperTitle,
            SubmissionWriteKind.revision => localizations.submitRevisionTitle,
          },
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (widget.mode == SubmissionWriteKind.abstract) ...[
              DropdownButtonFormField<String>(
                initialValue: _selectedEventId,
                items: events
                    .map(
                      (event) => DropdownMenuItem<String>(
                        value: event.id,
                        child: Text(event.title),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  setState(() => _selectedEventId = value);
                  unawaited(_saveDraft());
                },
                decoration: InputDecoration(
                  labelText: localizations.eventSelectionLabel,
                ),
                validator: (value) => value == null || value.isEmpty
                    ? localizations.requiredField
                    : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _titleArController,
                decoration: InputDecoration(
                  labelText: localizations.submissionTitleArLabel,
                ),
                validator: (value) => (value == null || value.trim().isEmpty)
                    ? localizations.requiredField
                    : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _titleEnController,
                decoration: InputDecoration(
                  labelText: localizations.submissionTitleEnLabel,
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _abstractArController,
                decoration: InputDecoration(
                  labelText: localizations.abstractArLabel,
                ),
                maxLines: 6,
                validator: (value) => (value == null || value.trim().isEmpty)
                    ? localizations.requiredField
                    : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _abstractEnController,
                decoration: InputDecoration(
                  labelText: localizations.abstractEnLabel,
                ),
                maxLines: 6,
              ),
            ],
            if (widget.mode != SubmissionWriteKind.abstract) ...[
              Text(
                localizations.filePickerHint,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: isSubmitting ? null : _pickFile,
                icon: const Icon(Icons.attach_file_outlined),
                label: Text(localizations.pickFileAction),
              ),
              const SizedBox(height: 8),
              Text(
                _selectedUploadFile?.fileName ?? localizations.noFileSelected,
              ),
            ],
            if (widget.mode == SubmissionWriteKind.revision) ...[
              const SizedBox(height: 12),
              TextFormField(
                controller: _revisionNotesController,
                decoration: InputDecoration(
                  labelText: localizations.revisionNotesLabel,
                ),
                maxLines: 4,
              ),
            ],
            const SizedBox(height: 16),
            if ((state.asData?.value.errorMessage ?? '').isNotEmpty)
              AppInlineMessage.error(
                message: state.asData!.value.errorMessage!,
              ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      final router = GoRouter.of(context);
                      if (!_formKey.currentState!.validate()) {
                        return;
                      }
                      if (widget.mode == SubmissionWriteKind.abstract) {
                        final eventId = _selectedEventId;
                        if (eventId == null || eventId.isEmpty) {
                          return;
                        }
                        await controller.submitAbstract(
                          SubmitAbstractInput(
                            eventId: eventId,
                            titleAr: _titleArController.text.trim(),
                            titleEn: _titleEnController.text.trim(),
                            abstractAr: _abstractArController.text.trim(),
                            abstractEn: _abstractEnController.text.trim(),
                            idempotencyKey:
                                'abstract:$eventId:${_titleArController.text.trim()}'
                                ':${_abstractArController.text.trim()}',
                          ),
                        );
                      } else if (widget.mode == SubmissionWriteKind.fullPaper) {
                        final submissionId = widget.submissionId!;
                        final selectedFile = _selectedUploadFile;
                        if (selectedFile == null) {
                          return;
                        }
                        await controller.submitFullPaper(
                          SubmitFullPaperInput(
                            submissionId: submissionId,
                            file: selectedFile,
                            idempotencyKey:
                                'fullPaper:$submissionId:${selectedFile.fileName}:${selectedFile.sizeInBytes}',
                          ),
                        );
                      } else {
                        final submissionId = widget.submissionId!;
                        final selectedFile = _selectedUploadFile;
                        if (selectedFile == null) {
                          return;
                        }
                        await controller.submitRevision(
                          SubmitRevisionInput(
                            submissionId: submissionId,
                            file: selectedFile,
                            revisionNotes: _revisionNotesController.text.trim(),
                            idempotencyKey:
                                'revision:$submissionId:${selectedFile.fileName}:${selectedFile.sizeInBytes}',
                          ),
                        );
                      }
                      final receipt = ref
                          .read(submissionsControllerProvider)
                          .asData
                          ?.value
                          .lastReceipt;
                      if (mounted && receipt != null) {
                        final selectedId = receipt.id;
                        await controller.clearReceipt();
                        if (!mounted) {
                          return;
                        }
                        router.go(RoutePaths.submissionDetail(selectedId));
                      }
                    },
              child: isSubmitting
                  ? const CircularProgressIndicator.adaptive()
                  : Text(
                      switch (widget.mode) {
                        SubmissionWriteKind.abstract =>
                          localizations.submitAbstractAction,
                        SubmissionWriteKind.fullPaper =>
                          localizations.submitFullPaperAction,
                        SubmissionWriteKind.revision =>
                          localizations.submitRevisionAction,
                      },
                    ),
            ),
            if (widget.mode != SubmissionWriteKind.abstract &&
                widget.submissionId != null) ...[
              const SizedBox(height: 12),
              TextButton(
                onPressed: () {
                  final id = widget.submissionId!;
                  final match = submissions.where((entry) => entry.id == id);
                  if (match.isNotEmpty) {
                    context.go(RoutePaths.submissionDetail(id));
                  } else {
                    context.pop();
                  }
                },
                child: Text(localizations.cancelAction),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _mimeTypeForExtension(String? extension) {
    switch ((extension ?? '').toLowerCase()) {
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'pdf':
      default:
        return 'application/pdf';
    }
  }
}
