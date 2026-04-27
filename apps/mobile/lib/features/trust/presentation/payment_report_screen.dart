import 'dart:io';

import 'package:eventy360/app/application/app_settings_provider.dart';
import 'package:eventy360/core/presentation/widgets/app_inline_message.dart';
import 'package:eventy360/features/account/application/subscription_overview_provider.dart';
import 'package:eventy360/features/auth/presentation/widgets/auth_scaffold.dart';
import 'package:eventy360/features/trust/application/trust_controller.dart';
import 'package:eventy360/features/trust/domain/trust_models.dart';
import 'package:eventy360/l10n/generated/l10n.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PaymentReportScreen extends ConsumerStatefulWidget {
  const PaymentReportScreen({super.key});

  @override
  ConsumerState<PaymentReportScreen> createState() =>
      _PaymentReportScreenState();
}

class _PaymentReportScreenState extends ConsumerState<PaymentReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _referenceController = TextEditingController();
  final _notesController = TextEditingController();
  BillingPeriod _billingPeriod = BillingPeriod.monthly;
  PaymentMethod _paymentMethod = PaymentMethod.bank;
  TrustUploadFile? _selectedFile;
  String? _localError;

  @override
  void initState() {
    super.initState();
    _syncAmountFromSettings();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _referenceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
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
    final mimeType = switch ((picked.extension ?? '').toLowerCase()) {
      'pdf' => 'application/pdf',
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      _ => null,
    };
    if (mimeType == null) {
      setState(() => _localError = localizations.secureFileTypeError);
      return;
    }
    if (bytes.lengthInBytes > 10 * 1024 * 1024) {
      setState(() => _localError = localizations.secureFileSizeError);
      return;
    }
    setState(() {
      _selectedFile = TrustUploadFile(
        bytes: bytes!,
        fileName: picked.name,
        mimeType: mimeType,
      );
      _localError = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final localizations = S.of(context);
    final trustState = ref.watch(trustControllerProvider);
    final settings = ref.watch(appPaymentSettingsProvider).asData?.value;
    final subscriptionOverview = ref.watch(subscriptionOverviewProvider);
    final state = trustState.asData?.value;
    final isSubmitting = state?.isReportingPayment ?? false;
    final recommendedPrice = settings?.priceForResearcher(
      _appBillingPeriodFromTrust(_billingPeriod),
    );
    if (_amountController.text.trim().isEmpty && recommendedPrice != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && _amountController.text.trim().isEmpty) {
          _amountController.text = recommendedPrice.finalPrice.toStringAsFixed(0);
        }
      });
    }

    return Scaffold(
      appBar: AppBar(title: Text(localizations.reportPaymentTitle)),
      body: AuthScaffold(
        badge: localizations.trustCenterTitle,
        icon: Icons.receipt_long_outlined,
        title: localizations.reportPaymentTitle,
        subtitle: localizations.reportPaymentOverviewBody,
        bottom: Center(
          child: TextButton(
            onPressed: () => context.pop(),
            child: Text(localizations.cancelAction),
          ),
        ),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AppInlineMessage.info(
                message: localizations.reportPaymentBody,
              ),
              if (recommendedPrice != null) ...[
                const SizedBox(height: 16),
                AppInlineMessage.info(
                  message: localizations.subscriptionRecommendedPrice(
                    recommendedPrice.finalPrice.toStringAsFixed(0),
                    recommendedPrice.currency,
                    _billingPeriodLabel(localizations, _billingPeriod),
                  ),
                ),
              ],
              if (settings != null &&
                  ((settings.bankName ?? '').isNotEmpty ||
                      (settings.accountHolder ?? '').isNotEmpty ||
                      (settings.accountNumberRib ?? '').isNotEmpty ||
                      (settings.paymentEmail ?? '').isNotEmpty)) ...[
                const SizedBox(height: 16),
                _InstructionCard(
                  title: localizations.paymentInstructionsTitle,
                  children: [
                    if ((settings.bankName ?? '').isNotEmpty)
                      _InstructionLine(
                        label: localizations.paymentInstructionBankLabel,
                        value: settings.bankName!,
                      ),
                    if ((settings.accountHolder ?? '').isNotEmpty)
                      _InstructionLine(
                        label: localizations.paymentInstructionAccountHolderLabel,
                        value: settings.accountHolder!,
                      ),
                    if ((settings.accountNumberRib ?? '').isNotEmpty)
                      _InstructionLine(
                        label: localizations.paymentInstructionRibLabel,
                        value: settings.accountNumberRib!,
                      ),
                    if ((settings.paymentEmail ?? '').isNotEmpty)
                      _InstructionLine(
                        label: localizations.paymentInstructionEmailLabel,
                        value: settings.paymentEmail!,
                      ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              subscriptionOverview.when(
                data: (overview) => AppInlineMessage.info(
                  message: overview.hasSubscription && overview.isActive
                      ? localizations.paymentReportRenewalHint
                      : localizations.paymentReportActivationHint,
                ),
                error: (_, _) => const SizedBox.shrink(),
                loading: () => const SizedBox.shrink(),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: InputDecoration(
                  labelText: localizations.paymentAmountLabel,
                ),
                validator: (value) {
                  final amount = double.tryParse((value ?? '').trim());
                  if (amount == null || amount <= 0) {
                    return localizations.paymentAmountError;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<BillingPeriod>(
                initialValue: _billingPeriod,
                items: BillingPeriod.values
                    .map(
                      (value) => DropdownMenuItem(
                        value: value,
                        child: Text(_billingPeriodLabel(localizations, value)),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _billingPeriod = value;
                      _syncAmountFromSettings();
                    });
                  }
                },
                decoration: InputDecoration(
                  labelText: localizations.billingPeriodLabel,
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<PaymentMethod>(
                initialValue: _paymentMethod,
                items: PaymentMethod.values
                    .map(
                      (value) => DropdownMenuItem(
                        value: value,
                        child: Text(_paymentMethodLabel(localizations, value)),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _paymentMethod = value);
                  }
                },
                decoration: InputDecoration(
                  labelText: localizations.paymentMethodLabel,
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _referenceController,
                decoration: InputDecoration(
                  labelText: localizations.referenceNumberLabel,
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _notesController,
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: localizations.paymentNotesLabel,
                ),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: isSubmitting ? null : _pickFile,
                icon: const Icon(Icons.attach_file_outlined),
                label: Text(localizations.pickProofDocument),
              ),
              const SizedBox(height: 8),
              Text(_selectedFile?.fileName ?? localizations.noFileSelected),
              if (_selectedFile != null) ...[
                const SizedBox(height: 4),
                Text(
                  '${_selectedFile!.mimeType} • ${_formatFileSize(_selectedFile!.sizeInBytes)}',
                ),
              ],
              if (_localError != null) ...[
                const SizedBox(height: 8),
                AppInlineMessage.error(message: _localError!),
              ],
              if ((state?.errorMessage ?? '').isNotEmpty) ...[
                const SizedBox(height: 8),
                AppInlineMessage.error(message: state!.errorMessage!),
              ],
              const SizedBox(height: 18),
              FilledButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        if (!_formKey.currentState!.validate() ||
                            _selectedFile == null) {
                          if (_selectedFile == null) {
                            setState(
                              () => _localError =
                                  localizations.secureFileRequiredError,
                            );
                          }
                          return;
                        }
                        await ref
                            .read(trustControllerProvider.notifier)
                            .reportPayment(
                              PaymentReportInput(
                                amount: double.parse(
                                  _amountController.text.trim(),
                                ),
                                billingPeriod: _billingPeriod,
                                paymentMethod: _paymentMethod,
                                file: _selectedFile!,
                                referenceNumber:
                                    _referenceController.text.trim(),
                                payerNotes: _notesController.text.trim(),
                              ),
                            );
                        final nextState = ref
                            .read(trustControllerProvider)
                            .asData
                            ?.value;
                        if (!context.mounted) {
                          return;
                        }
                        if (nextState?.errorMessage == null) {
                          context.pop();
                        }
                      },
                child: isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.2),
                      )
                    : Text(localizations.submitPaymentReportAction),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _syncAmountFromSettings() {
    final settings = ref.read(appPaymentSettingsProvider).asData?.value;
    final price = settings?.priceForResearcher(
      _appBillingPeriodFromTrust(_billingPeriod),
    );
    if (price == null) {
      return;
    }
    _amountController.text = price.finalPrice.toStringAsFixed(0);
  }
}

class _InstructionCard extends StatelessWidget {
  const _InstructionCard({
    required this.title,
    required this.children,
  });

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _InstructionLine extends StatelessWidget {
  const _InstructionLine({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text('$label: $value'),
    );
  }
}

AppBillingPeriod _appBillingPeriodFromTrust(BillingPeriod value) {
  return switch (value) {
    BillingPeriod.monthly => AppBillingPeriod.monthly,
    BillingPeriod.quarterly => AppBillingPeriod.quarterly,
    BillingPeriod.biannual => AppBillingPeriod.biannual,
    BillingPeriod.annual => AppBillingPeriod.annual,
  };
}

String _formatFileSize(int bytes) {
  if (bytes < 1024) {
    return '$bytes B';
  }
  if (bytes < 1024 * 1024) {
    return '${(bytes / 1024).toStringAsFixed(1)} KB';
  }
  return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
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
