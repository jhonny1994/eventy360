import 'package:eventy360/features/trust/domain/trust_models.dart';

abstract class TrustRepository {
  Future<VerificationStatusSnapshot> fetchVerificationSnapshot();

  Future<List<PaymentRecord>> fetchPayments();

  Future<VerificationUploadResult> uploadVerificationDocument(
    TrustUploadFile file,
  );

  Future<PaymentReportResult> reportPayment(PaymentReportInput input);

  Future<Uri> createProtectedDocumentUri(String documentPath);
}
