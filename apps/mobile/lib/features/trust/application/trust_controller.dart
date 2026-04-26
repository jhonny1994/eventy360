import 'package:eventy360/features/trust/application/trust_state.dart';
import 'package:eventy360/features/trust/domain/trust_models.dart';
import 'package:eventy360/features/trust/domain/trust_repository.dart';
import 'package:eventy360/features/trust/infrastructure/supabase_trust_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'trust_controller.g.dart';

@Riverpod(keepAlive: true)
TrustRepository trustRepository(Ref ref) {
  return SupabaseTrustRepository();
}

@Riverpod(keepAlive: true)
class TrustController extends _$TrustController {
  @override
  Future<TrustState> build() async {
    final repository = ref.watch(trustRepositoryProvider);
    final verification = await repository.fetchVerificationSnapshot();
    final payments = await repository.fetchPayments();
    return TrustState(
      verification: verification,
      payments: payments,
    );
  }

  Future<void> refresh() async {
    final current = state.asData?.value ?? const TrustState();
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(trustRepositoryProvider);
      final verification = await repository.fetchVerificationSnapshot();
      final payments = await repository.fetchPayments();
      return current.copyWith(
        verification: verification,
        payments: payments,
        clearError: true,
      );
    });
  }

  Future<void> uploadVerificationDocument(TrustUploadFile file) async {
    final current = state.asData?.value ?? const TrustState();
    if (current.isUploadingVerification) {
      return;
    }
    state = AsyncData(
      current.copyWith(
        isUploadingVerification: true,
        clearError: true,
      ),
    );
    try {
      final result = await ref
          .read(trustRepositoryProvider)
          .uploadVerificationDocument(file);
      final verification = await ref
          .read(trustRepositoryProvider)
          .fetchVerificationSnapshot();
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          verification: verification,
          isUploadingVerification: false,
          lastReceipt: result.receipt,
          clearError: true,
        ),
      );
    } on TrustError catch (error) {
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          isUploadingVerification: false,
          errorMessage: error.message,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          isUploadingVerification: false,
          errorMessage: error.toString(),
        ),
      );
    }
  }

  Future<void> reportPayment(PaymentReportInput input) async {
    final current = state.asData?.value ?? const TrustState();
    if (current.isReportingPayment) {
      return;
    }
    state = AsyncData(
      current.copyWith(
        isReportingPayment: true,
        clearError: true,
      ),
    );
    try {
      final result = await ref
          .read(trustRepositoryProvider)
          .reportPayment(input);
      final payments = await ref.read(trustRepositoryProvider).fetchPayments();
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          payments: payments,
          isReportingPayment: false,
          lastReceipt: result.receipt,
          clearError: true,
        ),
      );
    } on TrustError catch (error) {
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          isReportingPayment: false,
          errorMessage: error.message,
        ),
      );
    } on Object catch (error) {
      state = AsyncData(
        (state.asData?.value ?? current).copyWith(
          isReportingPayment: false,
          errorMessage: error.toString(),
        ),
      );
    }
  }

  Future<Uri> createProtectedDocumentUri(String documentPath) {
    return ref
        .read(trustRepositoryProvider)
        .createProtectedDocumentUri(documentPath);
  }

  Future<void> clearReceipt() async {
    final current = state.asData?.value;
    if (current == null) {
      return;
    }
    state = AsyncData(current.copyWith(clearReceipt: true));
  }
}
