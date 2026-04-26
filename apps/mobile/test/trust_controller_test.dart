import 'dart:typed_data';

import 'package:eventy360/core/domain/operation_receipt.dart';
import 'package:eventy360/features/trust/application/trust_controller.dart';
import 'package:eventy360/features/trust/domain/trust_models.dart';
import 'package:eventy360/features/trust/domain/trust_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('loads verification and payments on build', () async {
    final repository = _FakeTrustRepository();
    final container = ProviderContainer(
      overrides: [
        trustRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    final state = await container.read(trustControllerProvider.future);

    expect(state.verification.hasPendingRequest, isTrue);
    expect(state.payments, hasLength(1));
  });

  test('uploads verification and stores receipt', () async {
    final repository = _FakeTrustRepository();
    final container = ProviderContainer(
      overrides: [
        trustRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    await container.read(trustControllerProvider.future);
    await container
        .read(trustControllerProvider.notifier)
        .uploadVerificationDocument(
          TrustUploadFile(
            bytes: Uint8List.fromList(<int>[1, 2, 3]),
            fileName: 'id.pdf',
            mimeType: 'application/pdf',
          ),
        );

    final state = container.read(trustControllerProvider).asData!.value;
    expect(state.verification.hasPendingRequest, isTrue);
    expect(state.lastReceipt?.id, 'req-2');
  });

  test('reports payment and refreshes payment history', () async {
    final repository = _FakeTrustRepository();
    final container = ProviderContainer(
      overrides: [
        trustRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    await container.read(trustControllerProvider.future);
    await container
        .read(trustControllerProvider.notifier)
        .reportPayment(
          PaymentReportInput(
            amount: 2500,
            billingPeriod: BillingPeriod.annual,
            paymentMethod: PaymentMethod.bank,
            file: TrustUploadFile(
              bytes: Uint8List.fromList(<int>[5, 6, 7]),
              fileName: 'proof.pdf',
              mimeType: 'application/pdf',
            ),
          ),
        );

    final state = container.read(trustControllerProvider).asData!.value;
    expect(state.payments, hasLength(2));
    expect(state.lastReceipt?.id, 'pay-2');
  });

  test('surfaces repository errors for trust flows', () async {
    final repository = _FakeTrustRepository()..failUpload = true;
    final container = ProviderContainer(
      overrides: [
        trustRepositoryProvider.overrideWithValue(repository),
      ],
    );
    addTearDown(container.dispose);

    await container.read(trustControllerProvider.future);
    await container
        .read(trustControllerProvider.notifier)
        .uploadVerificationDocument(
          TrustUploadFile(
            bytes: Uint8List.fromList(<int>[1]),
            fileName: 'id.pdf',
            mimeType: 'application/pdf',
          ),
        );

    final state = container.read(trustControllerProvider).asData!.value;
    expect(state.errorMessage, 'upload failed');
  });
}

class _FakeTrustRepository implements TrustRepository {
  VerificationStatusSnapshot verification = VerificationStatusSnapshot(
    isVerified: false,
    latestRequest: VerificationRequestRecord(
      id: 'req-1',
      status: VerificationRequestStatus.pending,
      submittedAt: DateTime(2026, 4),
      documentPath: 'verification_documents/u1/id.pdf',
    ),
  );

  final List<PaymentRecord> _payments = <PaymentRecord>[
    PaymentRecord(
      id: 'pay-1',
      amount: 1200,
      billingPeriod: BillingPeriod.monthly,
      paymentMethod: PaymentMethod.bank,
      status: PaymentStatus.pendingVerification,
      reportedAt: DateTime(2026, 4, 2),
      proofDocumentPath: 'payment_proofs/u1/proof.pdf',
    ),
  ];

  bool failUpload = false;

  @override
  Future<Uri> createProtectedDocumentUri(String documentPath) async {
    return Uri.parse('https://example.com/$documentPath');
  }

  @override
  Future<List<PaymentRecord>> fetchPayments() async {
    return List<PaymentRecord>.from(_payments);
  }

  @override
  Future<VerificationStatusSnapshot> fetchVerificationSnapshot() async {
    return verification;
  }

  @override
  Future<PaymentReportResult> reportPayment(PaymentReportInput input) async {
    _payments.add(
      PaymentRecord(
        id: 'pay-2',
        amount: input.amount,
        billingPeriod: input.billingPeriod,
        paymentMethod: input.paymentMethod,
        status: PaymentStatus.pendingVerification,
        reportedAt: DateTime(2026, 4, 3),
        proofDocumentPath: 'payment_proofs/u1/${input.file.fileName}',
      ),
    );
    return PaymentReportResult(
      paymentId: 'pay-2',
      receipt: OperationReceipt(
        id: 'pay-2',
        message: 'ok',
        timestamp: DateTime(2026),
      ),
    );
  }

  @override
  Future<VerificationUploadResult> uploadVerificationDocument(
    TrustUploadFile file,
  ) async {
    if (failUpload) {
      throw TrustError('upload failed');
    }
    verification = VerificationStatusSnapshot(
      isVerified: false,
      latestRequest: VerificationRequestRecord(
        id: 'req-2',
        status: VerificationRequestStatus.pending,
        submittedAt: DateTime(2026, 4, 4),
        documentPath: 'verification_documents/u1/${file.fileName}',
      ),
    );
    return VerificationUploadResult(
      requestId: 'req-2',
      receipt: OperationReceipt(
        id: 'req-2',
        message: 'ok',
        timestamp: DateTime(2026),
      ),
    );
  }
}
