import 'dart:typed_data';

import 'package:eventy360/core/domain/operation_receipt.dart';

class TrustUploadFile {
  const TrustUploadFile({
    required this.bytes,
    required this.fileName,
    required this.mimeType,
  });

  final Uint8List bytes;
  final String fileName;
  final String mimeType;

  int get sizeInBytes => bytes.lengthInBytes;
}

enum VerificationRequestStatus { pending, approved, rejected }

enum PaymentStatus { pendingVerification, verified, rejected }

enum BillingPeriod { monthly, quarterly, biannual, annual }

enum PaymentMethod { bank, check, cash, online }

VerificationRequestStatus verificationRequestStatusFromDb(String value) {
  switch (value) {
    case 'approved':
      return VerificationRequestStatus.approved;
    case 'rejected':
      return VerificationRequestStatus.rejected;
    case 'pending':
    default:
      return VerificationRequestStatus.pending;
  }
}

PaymentStatus paymentStatusFromDb(String value) {
  switch (value) {
    case 'verified':
      return PaymentStatus.verified;
    case 'rejected':
      return PaymentStatus.rejected;
    case 'pending_verification':
    default:
      return PaymentStatus.pendingVerification;
  }
}

String billingPeriodToDb(BillingPeriod value) {
  switch (value) {
    case BillingPeriod.monthly:
      return 'monthly';
    case BillingPeriod.quarterly:
      return 'quarterly';
    case BillingPeriod.biannual:
      return 'biannual';
    case BillingPeriod.annual:
      return 'annual';
  }
}

String paymentMethodToDb(PaymentMethod value) {
  switch (value) {
    case PaymentMethod.bank:
      return 'bank';
    case PaymentMethod.check:
      return 'check';
    case PaymentMethod.cash:
      return 'cash';
    case PaymentMethod.online:
      return 'online';
  }
}

class VerificationRequestRecord {
  const VerificationRequestRecord({
    required this.id,
    required this.status,
    required this.submittedAt,
    this.documentPath,
    this.notes,
    this.rejectionReason,
    this.processedAt,
  });

  final String id;
  final VerificationRequestStatus status;
  final DateTime submittedAt;
  final String? documentPath;
  final String? notes;
  final String? rejectionReason;
  final DateTime? processedAt;
}

class VerificationStatusSnapshot {
  const VerificationStatusSnapshot({
    required this.isVerified,
    this.latestRequest,
  });

  final bool isVerified;
  final VerificationRequestRecord? latestRequest;

  bool get hasPendingRequest =>
      latestRequest?.status == VerificationRequestStatus.pending;
}

class PaymentRecord {
  const PaymentRecord({
    required this.id,
    required this.amount,
    required this.billingPeriod,
    required this.paymentMethod,
    required this.status,
    required this.reportedAt,
    this.referenceNumber,
    this.payerNotes,
    this.proofDocumentPath,
    this.verifiedAt,
  });

  final String id;
  final double amount;
  final BillingPeriod billingPeriod;
  final PaymentMethod paymentMethod;
  final PaymentStatus status;
  final DateTime reportedAt;
  final String? referenceNumber;
  final String? payerNotes;
  final String? proofDocumentPath;
  final DateTime? verifiedAt;
}

class VerificationUploadResult {
  const VerificationUploadResult({
    required this.requestId,
    required this.receipt,
  });

  final String requestId;
  final OperationReceipt receipt;
}

class PaymentReportInput {
  const PaymentReportInput({
    required this.amount,
    required this.billingPeriod,
    required this.paymentMethod,
    required this.file,
    this.referenceNumber = '',
    this.payerNotes = '',
  });

  final double amount;
  final BillingPeriod billingPeriod;
  final PaymentMethod paymentMethod;
  final TrustUploadFile file;
  final String referenceNumber;
  final String payerNotes;
}

class PaymentReportResult {
  const PaymentReportResult({
    required this.paymentId,
    required this.receipt,
  });

  final String paymentId;
  final OperationReceipt receipt;
}

class TrustError implements Exception {
  TrustError(this.message);

  final String message;

  @override
  String toString() => message;
}
