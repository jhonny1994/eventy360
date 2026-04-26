import 'package:eventy360/core/domain/operation_receipt.dart';
import 'package:eventy360/features/trust/domain/trust_models.dart';

class TrustState {
  const TrustState({
    this.verification = const VerificationStatusSnapshot(isVerified: false),
    this.payments = const <PaymentRecord>[],
    this.isUploadingVerification = false,
    this.isReportingPayment = false,
    this.errorMessage,
    this.lastReceipt,
  });

  final VerificationStatusSnapshot verification;
  final List<PaymentRecord> payments;
  final bool isUploadingVerification;
  final bool isReportingPayment;
  final String? errorMessage;
  final OperationReceipt? lastReceipt;

  TrustState copyWith({
    VerificationStatusSnapshot? verification,
    List<PaymentRecord>? payments,
    bool? isUploadingVerification,
    bool? isReportingPayment,
    String? errorMessage,
    bool clearError = false,
    OperationReceipt? lastReceipt,
    bool clearReceipt = false,
  }) {
    return TrustState(
      verification: verification ?? this.verification,
      payments: payments ?? this.payments,
      isUploadingVerification:
          isUploadingVerification ?? this.isUploadingVerification,
      isReportingPayment: isReportingPayment ?? this.isReportingPayment,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      lastReceipt: clearReceipt ? null : (lastReceipt ?? this.lastReceipt),
    );
  }
}
