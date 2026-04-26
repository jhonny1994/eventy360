import 'dart:async';
import 'dart:io';

import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/adaptive_page_body.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/features/trust/application/trust_controller.dart';
import 'package:eventy360/features/trust/domain/trust_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class TrustScreen extends ConsumerStatefulWidget {
  const TrustScreen({super.key});

  @override
  ConsumerState<TrustScreen> createState() => _TrustScreenState();
}

class _TrustScreenState extends ConsumerState<TrustScreen> {
  TrustUploadFile? _verificationFile;
  String? _localError;

  Future<void> _pickVerificationFile() async {
    final localizations = S.of(context);
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'jpg', 'jpeg', 'png'],
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
      setState(() => _localError = localizations.fileReadFailed);
      return;
    }
    final mimeType = _mimeTypeForExtension(picked.extension);
    if (mimeType == null) {
      setState(() => _localError = localizations.secureFileTypeError);
      return;
    }
    if (bytes.lengthInBytes > 10 * 1024 * 1024) {
      setState(() => _localError = localizations.secureFileSizeError);
      return;
    }
    setState(() {
      _verificationFile = TrustUploadFile(
        bytes: bytes!,
        fileName: picked.name,
        mimeType: mimeType,
      );
      _localError = null;
    });
  }

  Future<void> _openDocument(String documentPath) async {
    final localizations = S.of(context);
    try {
      final uri = await ref
          .read(trustControllerProvider.notifier)
          .createProtectedDocumentUri(documentPath);
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        throw Exception('launch failed');
      }
    } on Object {
      if (!mounted) {
        return;
      }
      AppFeedback.showError(localizations.fileOpenFailed);
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final trustState = ref.watch(trustControllerProvider);
    final state = trustState.asData?.value;
    final controller = ref.read(trustControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: Text(localizations.trustCenterTitle)),
      body: trustState.when(
        data: (data) {
          final receipt = data.lastReceipt;
          if (receipt != null) {
            scheduleMicrotask(() async {
              await controller.clearReceipt();
              if (!context.mounted) {
                return;
              }
              AppFeedback.showSuccess(receipt.message);
            });
          }
          return RefreshIndicator(
            onRefresh: controller.refresh,
            child: AdaptivePageBody(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            localizations.secureDocsTitle,
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(localizations.secureDocsBody),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.verified_user_outlined),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  localizations.verificationCenterTitle,
                                  style: Theme.of(
                                    context,
                                  ).textTheme.titleMedium,
                                ),
                              ),
                              _VerificationBadge(
                                status: data.verification.isVerified
                                    ? VerificationRequestStatus.approved
                                    : data.verification.latestRequest?.status,
                                isVerified: data.verification.isVerified,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            data.verification.isVerified
                                ? localizations.verificationApprovedBody
                                : data.verification.hasPendingRequest
                                ? localizations.verificationPendingBody
                                : localizations.verificationRequiredBody,
                          ),
                          if (data.verification.latestRequest != null) ...[
                            const SizedBox(height: 12),
                            Text(
                              '${localizations.latestRequestLabel}: ${_formatDate(data.verification.latestRequest!.submittedAt)}',
                            ),
                            if ((data
                                        .verification
                                        .latestRequest!
                                        .rejectionReason ??
                                    '')
                                .trim()
                                .isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(
                                  '${localizations.rejectionReasonLabel}: ${data.verification.latestRequest!.rejectionReason!}',
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.error,
                                  ),
                                ),
                              ),
                            if ((data
                                        .verification
                                        .latestRequest!
                                        .documentPath ??
                                    '')
                                .isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: TextButton.icon(
                                  onPressed: () => _openDocument(
                                    data
                                        .verification
                                        .latestRequest!
                                        .documentPath!,
                                  ),
                                  icon: const Icon(Icons.lock_open_outlined),
                                  label: Text(
                                    localizations.viewUploadedDocument,
                                  ),
                                ),
                              ),
                          ],
                          if (!data.verification.isVerified &&
                              !data.verification.hasPendingRequest) ...[
                            const SizedBox(height: 16),
                            OutlinedButton.icon(
                              onPressed: data.isUploadingVerification
                                  ? null
                                  : _pickVerificationFile,
                              icon: const Icon(Icons.attach_file_outlined),
                              label: Text(
                                localizations.pickVerificationDocument,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _verificationFile?.fileName ??
                                  localizations.noFileSelected,
                            ),
                            if (_localError != null) ...[
                              const SizedBox(height: 8),
                              AppInlineMessage.error(
                                message: _localError!,
                              ),
                            ],
                            const SizedBox(height: 12),
                            FilledButton.icon(
                              onPressed:
                                  data.isUploadingVerification ||
                                      _verificationFile == null
                                  ? null
                                  : () async {
                                      await controller
                                          .uploadVerificationDocument(
                                            _verificationFile!,
                                          );
                                      if (mounted &&
                                          ref
                                                  .read(trustControllerProvider)
                                                  .asData
                                                  ?.value
                                                  .errorMessage ==
                                              null) {
                                        setState(() {
                                          _verificationFile = null;
                                          _localError = null;
                                        });
                                      }
                                    },
                              icon: data.isUploadingVerification
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.upload_file_outlined),
                              label: Text(
                                localizations.submitVerificationRequest,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  localizations.paymentHistoryTitle,
                                  style: Theme.of(
                                    context,
                                  ).textTheme.titleMedium,
                                ),
                              ),
                              FilledButton.tonalIcon(
                                onPressed: () =>
                                    context.push(RoutePaths.reportPayment),
                                icon: const Icon(Icons.receipt_long_outlined),
                                label: Text(localizations.reportPaymentTitle),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if ((state?.errorMessage ?? '').isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: AppInlineMessage.error(
                                message: state!.errorMessage!,
                              ),
                            ),
                          if (data.payments.isEmpty)
                            Text(localizations.noPaymentsFound)
                          else
                            ...data.payments.map(
                              (payment) => _PaymentTile(
                                payment: payment,
                                onOpenDocument:
                                    payment.proofDocumentPath == null
                                    ? null
                                    : () => _openDocument(
                                        payment.proofDocumentPath!,
                                      ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        error: (error, stackTrace) => AppErrorView(
          message: error.toString(),
          onRetry: () => ref.read(trustControllerProvider.notifier).refresh(),
        ),
        loading: AppLoadingView.new,
      ),
    );
  }

  String? _mimeTypeForExtension(String? extension) {
    switch ((extension ?? '').toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return null;
    }
  }
}

class _VerificationBadge extends StatelessWidget {
  const _VerificationBadge({
    required this.status,
    required this.isVerified,
  });

  final VerificationRequestStatus? status;
  final bool isVerified;

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final colorScheme = Theme.of(context).colorScheme;
    final (label, color) = switch ((isVerified, status)) {
      (true, _) => (localizations.verifiedStatus, colorScheme.primaryContainer),
      (false, VerificationRequestStatus.pending) => (
        localizations.verificationPendingStatus,
        colorScheme.secondaryContainer,
      ),
      (false, VerificationRequestStatus.rejected) => (
        localizations.verificationRejectedStatus,
        colorScheme.errorContainer,
      ),
      _ => (
        localizations.notVerifiedStatus,
        colorScheme.surfaceContainerHighest,
      ),
    };
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Text(label),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  const _PaymentTile({
    required this.payment,
    required this.onOpenDocument,
  });

  final PaymentRecord payment;
  final VoidCallback? onOpenDocument;

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${payment.amount.toStringAsFixed(2)} DZD',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                _PaymentStatusChip(status: payment.status),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '${localizations.billingPeriodLabel}: ${_billingPeriodLabel(localizations, payment.billingPeriod)}',
            ),
            Text(
              '${localizations.paymentMethodLabel}: ${_paymentMethodLabel(localizations, payment.paymentMethod)}',
            ),
            Text(
              '${localizations.reportedAtLabel}: ${_formatDate(payment.reportedAt)}',
            ),
            if ((payment.referenceNumber ?? '').trim().isNotEmpty)
              Text(
                '${localizations.referenceNumberLabel}: ${payment.referenceNumber}',
              ),
            if ((payment.payerNotes ?? '').trim().isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(payment.payerNotes!),
              ),
            if (onOpenDocument != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: TextButton.icon(
                  onPressed: onOpenDocument,
                  icon: const Icon(Icons.lock_open_outlined),
                  label: Text(localizations.viewProofDocument),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _PaymentStatusChip extends StatelessWidget {
  const _PaymentStatusChip({required this.status});

  final PaymentStatus status;

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final colorScheme = Theme.of(context).colorScheme;
    final (label, color) = switch (status) {
      PaymentStatus.pendingVerification => (
        localizations.paymentPendingStatus,
        colorScheme.secondaryContainer,
      ),
      PaymentStatus.verified => (
        localizations.paymentVerifiedStatus,
        colorScheme.primaryContainer,
      ),
      PaymentStatus.rejected => (
        localizations.paymentRejectedStatus,
        colorScheme.errorContainer,
      ),
    };
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Text(label),
      ),
    );
  }
}

String _billingPeriodLabel(S localizations, BillingPeriod value) {
  switch (value) {
    case BillingPeriod.monthly:
      return localizations.billingPeriodMonthly;
    case BillingPeriod.quarterly:
      return localizations.billingPeriodQuarterly;
    case BillingPeriod.biannual:
      return localizations.billingPeriodBiannual;
    case BillingPeriod.annual:
      return localizations.billingPeriodAnnual;
  }
}

String _paymentMethodLabel(S localizations, PaymentMethod value) {
  switch (value) {
    case PaymentMethod.bank:
      return localizations.paymentMethodBank;
    case PaymentMethod.check:
      return localizations.paymentMethodCheck;
    case PaymentMethod.cash:
      return localizations.paymentMethodCash;
    case PaymentMethod.online:
      return localizations.paymentMethodOnline;
  }
}

String _formatDate(DateTime date) {
  final mm = date.month.toString().padLeft(2, '0');
  final dd = date.day.toString().padLeft(2, '0');
  return '${date.year}-$mm-$dd';
}
