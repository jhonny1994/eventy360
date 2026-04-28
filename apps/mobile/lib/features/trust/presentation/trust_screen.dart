import 'dart:async';
import 'dart:io';

import 'package:eventy360/app/application/app_settings_provider.dart';
import 'package:eventy360/app/router/route_paths.dart';
import 'package:eventy360/core/presentation/app_feedback.dart';
import 'package:eventy360/core/presentation/widgets/app_error_view.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/core/presentation/widgets/app_loading_view.dart';
import 'package:eventy360/core/presentation/widgets/app_page_scaffold.dart';
import 'package:eventy360/features/account/application/subscription_overview_provider.dart';
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
    final subscriptionOverview = ref.watch(subscriptionOverviewProvider);
    final appSettings = ref.watch(appPaymentSettingsProvider).asData?.value;
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
            child: AppPageContainer(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16),
                children: [
                  AppPageHero(
                    badge: localizations.trustCenterTitle,
                    icon: Icons.verified_user_outlined,
                    title: localizations.trustCenterTitle,
                    subtitle: localizations.trustOverviewBody,
                    trailing: _VerificationBadge(
                      status: data.verification.isVerified
                          ? VerificationRequestStatus.approved
                          : data.verification.latestRequest?.status,
                      isVerified: data.verification.isVerified,
                    ),
                  ),
                  AppSectionCard(
                    title: localizations.subscriptionStatusTitle,
                    subtitle: localizations.subscriptionOverviewBody,
                    leading: const Icon(Icons.workspace_premium_outlined),
                    child: subscriptionOverview.when(
                      data: (overview) => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _subscriptionStatusLabel(localizations, overview),
                            style: Theme.of(context).textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          if ((overview.daysRemaining ?? 0) > 0) ...[
                            const SizedBox(height: 6),
                            Text(
                              localizations.subscriptionDaysRemaining(
                                overview.daysRemaining!,
                              ),
                            ),
                          ],
                          if (appSettings != null) ...[
                            const SizedBox(height: 10),
                            Text(
                              localizations.paymentTrustFlowHint,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                          const SizedBox(height: 14),
                          LayoutBuilder(
                            builder: (context, constraints) {
                              final compact = constraints.maxWidth < 560;
                              final first = FilledButton.icon(
                                onPressed: () async {
                                  await context.push(
                                    RoutePaths.reportPayment,
                                  );
                                  ref.invalidate(
                                    subscriptionOverviewProvider,
                                  );
                                  await controller.refresh();
                                },
                                icon: const Icon(
                                  Icons.upload_file_outlined,
                                ),
                                label: Text(
                                  localizations.reportPaymentTitle,
                                ),
                              );
                              final second = FilledButton.tonalIcon(
                                onPressed: () async {
                                  await context.push(RoutePaths.account);
                                  ref.invalidate(
                                    subscriptionOverviewProvider,
                                  );
                                  await controller.refresh();
                                },
                                icon: const Icon(
                                  Icons.manage_accounts_outlined,
                                ),
                                label: Text(localizations.accountTitle),
                              );

                              if (compact) {
                                return Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    first,
                                    const SizedBox(height: 10),
                                    second,
                                  ],
                                );
                              }

                              return Row(
                                children: [
                                  Expanded(child: first),
                                  const SizedBox(width: 10),
                                  Expanded(child: second),
                                ],
                              );
                            },
                          ),
                        ],
                      ),
                      error: (error, _) => Text(error.toString()),
                      loading: () => const LinearProgressIndicator(),
                    ),
                  ),
                  AppSectionCard(
                    title: localizations.verificationCenterTitle,
                    subtitle: data.verification.isVerified
                        ? localizations.verificationApprovedBody
                        : data.verification.hasPendingRequest
                        ? localizations.verificationPendingBody
                        : localizations.verificationRequiredBody,
                    leading: const Icon(Icons.verified_user_outlined),
                    trailing: _VerificationBadge(
                      status: data.verification.isVerified
                          ? VerificationRequestStatus.approved
                          : data.verification.latestRequest?.status,
                      isVerified: data.verification.isVerified,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppInlineMessage.info(
                          message: localizations.secureDocsBody,
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
                              child: AppInlineMessage.error(
                                message:
                                    '${localizations.rejectionReasonLabel}: ${data.verification.latestRequest!.rejectionReason!}',
                              ),
                            ),
                          if ((data.verification.latestRequest!.documentPath ??
                                  '')
                              .isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: FilledButton.tonalIcon(
                                onPressed: () => _openDocument(
                                  data
                                      .verification
                                      .latestRequest!
                                      .documentPath!,
                                ),
                                icon: const Icon(Icons.lock_open_outlined),
                                label: Text(localizations.viewUploadedDocument),
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
                            label: Text(localizations.pickVerificationDocument),
                          ),
                          const SizedBox(height: 8),
                          DecoratedBox(
                            decoration: BoxDecoration(
                              color: Theme.of(
                                context,
                              ).colorScheme.surfaceContainerLow,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Text(
                                _verificationFile?.fileName ??
                                    localizations.noFileSelected,
                              ),
                            ),
                          ),
                          if (_localError != null) ...[
                            const SizedBox(height: 8),
                            AppInlineMessage.error(message: _localError!),
                          ],
                          const SizedBox(height: 12),
                          FilledButton.icon(
                            onPressed:
                                data.isUploadingVerification ||
                                    _verificationFile == null
                                ? null
                                : () async {
                                    await controller.uploadVerificationDocument(
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
                  AppSectionCard(
                    title: localizations.paymentHistoryTitle,
                    subtitle: localizations.paymentHistoryBody,
                    leading: const Icon(Icons.receipt_long_outlined),
                    trailing: FilledButton.tonalIcon(
                      onPressed: () async {
                        await context.push(RoutePaths.reportPayment);
                        ref.invalidate(subscriptionOverviewProvider);
                        await controller.refresh();
                      },
                      icon: const Icon(Icons.receipt_long_outlined),
                      label: Text(localizations.reportPaymentTitle),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if ((state?.errorMessage ?? '').isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: AppInlineMessage.error(
                              message: state!.errorMessage!,
                            ),
                          ),
                        if (data.payments.isEmpty)
                          AppEmptyState(
                            icon: Icons.receipt_long_outlined,
                            title: localizations.paymentHistoryTitle,
                            body: localizations.noPaymentsFound,
                          )
                        else
                          ...data.payments.map(
                            (payment) => _PaymentTile(
                              payment: payment,
                              onOpenDocument: payment.proofDocumentPath == null
                                  ? null
                                  : () => _openDocument(
                                      payment.proofDocumentPath!,
                                    ),
                            ),
                          ),
                      ],
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
    final tone = switch ((isVerified, status)) {
      (true, _) => AppStatusTone.success,
      (false, VerificationRequestStatus.pending) => AppStatusTone.info,
      (false, VerificationRequestStatus.rejected) => AppStatusTone.error,
      _ => AppStatusTone.neutral,
    };
    final label = switch ((isVerified, status)) {
      (true, _) => localizations.verifiedStatus,
      (false, VerificationRequestStatus.pending) =>
        localizations.verificationPendingStatus,
      (false, VerificationRequestStatus.rejected) =>
        localizations.verificationRejectedStatus,
      _ => localizations.notVerifiedStatus,
    };
    return AppStatusBadge(label: label, tone: tone);
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
    return AppSectionCard(
      title: '${payment.amount.toStringAsFixed(2)} DZD',
      trailing: _PaymentStatusChip(status: payment.status),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppListRow(
            leading: const Icon(Icons.calendar_month_outlined),
            title: localizations.billingPeriodLabel,
            subtitle: _billingPeriodLabel(localizations, payment.billingPeriod),
          ),
          const Divider(height: 18),
          AppListRow(
            leading: const Icon(Icons.payments_outlined),
            title: localizations.paymentMethodLabel,
            subtitle: _paymentMethodLabel(
              localizations,
              payment.paymentMethod,
            ),
          ),
          const Divider(height: 18),
          AppListRow(
            leading: const Icon(Icons.schedule_outlined),
            title: localizations.reportedAtLabel,
            subtitle: _formatDate(payment.reportedAt),
          ),
          if ((payment.referenceNumber ?? '').trim().isNotEmpty) ...[
            const Divider(height: 18),
            AppListRow(
              leading: const Icon(Icons.tag_outlined),
              title: localizations.referenceNumberLabel,
              subtitle: payment.referenceNumber!,
            ),
          ],
          if ((payment.payerNotes ?? '').trim().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: AppInlineMessage.info(message: payment.payerNotes!),
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
    );
  }
}

class _PaymentStatusChip extends StatelessWidget {
  const _PaymentStatusChip({required this.status});

  final PaymentStatus status;

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final (label, tone) = switch (status) {
      PaymentStatus.pendingVerification => (
        localizations.paymentPendingStatus,
        AppStatusTone.info,
      ),
      PaymentStatus.verified => (
        localizations.paymentVerifiedStatus,
        AppStatusTone.success,
      ),
      PaymentStatus.rejected => (
        localizations.paymentRejectedStatus,
        AppStatusTone.error,
      ),
    };
    return AppStatusBadge(label: label, tone: tone);
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

String _subscriptionStatusLabel(
  S localizations,
  SubscriptionOverview overview,
) {
  if (overview.isTrial) {
    return localizations.subscriptionTrialHeadline;
  }
  if (overview.isActive) {
    return localizations.subscriptionActiveHeadline;
  }
  return switch (overview.status) {
    'expired' => localizations.subscriptionExpiredHeadline,
    'cancelled' => localizations.subscriptionCancelledHeadline,
    _ => localizations.subscriptionInactive,
  };
}
