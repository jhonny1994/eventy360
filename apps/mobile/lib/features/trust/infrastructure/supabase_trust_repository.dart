import 'dart:convert';

import 'package:eventy360/core/domain/operation_receipt.dart';
import 'package:eventy360/features/trust/domain/trust_models.dart';
import 'package:eventy360/features/trust/domain/trust_repository.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseTrustRepository implements TrustRepository {
  SupabaseClient get _client => Supabase.instance.client;

  static const String _supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String _supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
  );
  static const int _maxFileSizeBytes = 10 * 1024 * 1024;
  static const Set<String> _allowedMimeTypes = <String>{
    'application/pdf',
    'image/jpeg',
    'image/png',
  };

  String get _userId {
    final user = _client.auth.currentUser;
    if (user == null) {
      throw TrustError('User is not authenticated.');
    }
    return user.id;
  }

  String get _accessToken {
    final token = _client.auth.currentSession?.accessToken;
    if (token == null || token.isEmpty) {
      throw TrustError('User session is missing. Please sign in again.');
    }
    return token;
  }

  @override
  Future<VerificationStatusSnapshot> fetchVerificationSnapshot() async {
    try {
      final profileRow = await _client
          .from('profiles')
          .select('is_verified')
          .eq('id', _userId)
          .single();
      final latestRow = await _client
          .from('latest_verification_requests')
          .select(
            'id,status,submitted_at,document_path,notes,rejection_reason,processed_at',
          )
          .eq('user_id', _userId)
          .order('submitted_at', ascending: false)
          .limit(1)
          .maybeSingle();

      return VerificationStatusSnapshot(
        isVerified: profileRow['is_verified'] == true,
        latestRequest: latestRow == null
            ? null
            : _mapVerificationRequest(latestRow),
      );
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<List<PaymentRecord>> fetchPayments() async {
    try {
      final rows = await _client
          .from('payments')
          .select(
            'id,amount,billing_period,payment_method_reported,status,reported_at,reference_number,payer_notes,proof_document_path,verified_at',
          )
          .eq('user_id', _userId)
          .order('reported_at', ascending: false);
      return (rows as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(_mapPayment)
          .toList();
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<VerificationUploadResult> uploadVerificationDocument(
    TrustUploadFile file,
  ) async {
    _validateUploadFile(file);
    final payload = await _sendMultipartRequest(
      functionName: 'upload-verification-document',
      file: file,
    );
    final requestId = payload['requestId']?.toString();
    if (requestId == null || requestId.isEmpty) {
      throw TrustError('Verification request completed without an id.');
    }
    return VerificationUploadResult(
      requestId: requestId,
      receipt: OperationReceipt(
        id: requestId,
        message:
            payload['message']?.toString() ??
            'Verification document uploaded successfully.',
        timestamp: DateTime.now(),
      ),
    );
  }

  @override
  Future<PaymentReportResult> reportPayment(PaymentReportInput input) async {
    _validateUploadFile(input.file);
    if (input.amount <= 0) {
      throw TrustError('Payment amount must be greater than zero.');
    }
    final payload = await _sendMultipartRequest(
      functionName: 'upload-payment-proof',
      file: input.file,
      fields: {
        'paymentData': jsonEncode({
          'amount': input.amount,
          'billing_period': billingPeriodToDb(input.billingPeriod),
          'payment_method_reported': paymentMethodToDb(input.paymentMethod),
          'reference_number': input.referenceNumber.trim().isEmpty
              ? null
              : input.referenceNumber.trim(),
          'payer_notes': input.payerNotes.trim().isEmpty
              ? null
              : input.payerNotes.trim(),
        }),
      },
    );
    final paymentId = payload['paymentId']?.toString();
    if (paymentId == null || paymentId.isEmpty) {
      throw TrustError('Payment report completed without an id.');
    }
    return PaymentReportResult(
      paymentId: paymentId,
      receipt: OperationReceipt(
        id: paymentId,
        message:
            payload['message']?.toString() ??
            'Payment proof uploaded successfully.',
        timestamp: DateTime.now(),
      ),
    );
  }

  @override
  Future<Uri> createProtectedDocumentUri(String documentPath) async {
    try {
      final parts = documentPath.split('/');
      if (parts.length < 2) {
        throw TrustError('Document path is invalid.');
      }
      final bucket = parts.first;
      final path = parts.sublist(1).join('/');
      final response = await _client.storage
          .from(bucket)
          .createSignedUrl(path, 60);
      return Uri.parse(response);
    } on Object catch (error) {
      throw _mapError(error);
    }
  }

  VerificationRequestRecord _mapVerificationRequest(Map<String, dynamic> row) {
    return VerificationRequestRecord(
      id: row['id']?.toString() ?? '',
      status: verificationRequestStatusFromDb(
        row['status']?.toString() ?? 'pending',
      ),
      submittedAt:
          DateTime.tryParse(row['submitted_at']?.toString() ?? '') ??
          DateTime.now(),
      documentPath: row['document_path']?.toString(),
      notes: row['notes']?.toString(),
      rejectionReason: row['rejection_reason']?.toString(),
      processedAt: DateTime.tryParse(row['processed_at']?.toString() ?? ''),
    );
  }

  PaymentRecord _mapPayment(Map<String, dynamic> row) {
    return PaymentRecord(
      id: row['id']?.toString() ?? '',
      amount: (row['amount'] as num?)?.toDouble() ?? 0,
      billingPeriod: _billingPeriodFromDb(
        row['billing_period']?.toString() ?? 'monthly',
      ),
      paymentMethod: _paymentMethodFromDb(
        row['payment_method_reported']?.toString() ?? 'bank',
      ),
      status: paymentStatusFromDb(
        row['status']?.toString() ?? 'pending_verification',
      ),
      reportedAt:
          DateTime.tryParse(row['reported_at']?.toString() ?? '') ??
          DateTime.now(),
      referenceNumber: row['reference_number']?.toString(),
      payerNotes: row['payer_notes']?.toString(),
      proofDocumentPath: row['proof_document_path']?.toString(),
      verifiedAt: DateTime.tryParse(row['verified_at']?.toString() ?? ''),
    );
  }

  BillingPeriod _billingPeriodFromDb(String value) {
    switch (value) {
      case 'quarterly':
        return BillingPeriod.quarterly;
      case 'biannual':
        return BillingPeriod.biannual;
      case 'annual':
        return BillingPeriod.annual;
      case 'monthly':
      default:
        return BillingPeriod.monthly;
    }
  }

  PaymentMethod _paymentMethodFromDb(String value) {
    switch (value) {
      case 'check':
        return PaymentMethod.check;
      case 'cash':
        return PaymentMethod.cash;
      case 'online':
        return PaymentMethod.online;
      case 'bank':
      default:
        return PaymentMethod.bank;
    }
  }

  Future<Map<String, dynamic>> _sendMultipartRequest({
    required String functionName,
    required TrustUploadFile file,
    Map<String, String> fields = const <String, String>{},
  }) async {
    final uri = Uri.parse('$_supabaseUrl/functions/v1/$functionName');
    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $_accessToken'
      ..headers['apikey'] = _supabaseAnonKey
      ..fields.addAll(fields)
      ..files.add(
        http.MultipartFile.fromBytes(
          'file',
          file.bytes,
          filename: file.fileName,
          contentType: MediaType.parse(file.mimeType),
        ),
      );

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final decoded = response.body.isEmpty
        ? const <String, dynamic>{}
        : (jsonDecode(response.body) as Map<String, dynamic>);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw TrustError(
        decoded['error']?.toString() ??
            decoded['details']?.toString() ??
            'Request failed with status ${response.statusCode}.',
      );
    }
    return decoded;
  }

  void _validateUploadFile(TrustUploadFile file) {
    if (!_allowedMimeTypes.contains(file.mimeType)) {
      throw TrustError('Unsupported file type. Use PDF, JPG, or PNG.');
    }
    if (file.sizeInBytes > _maxFileSizeBytes) {
      throw TrustError('File exceeds the 10 MB limit.');
    }
  }

  TrustError _mapError(Object error) {
    if (error is TrustError) {
      return error;
    }
    if (error is PostgrestException) {
      return TrustError(error.message);
    }
    if (error is StorageException) {
      return TrustError(error.message);
    }
    return TrustError(error.toString());
  }
}
