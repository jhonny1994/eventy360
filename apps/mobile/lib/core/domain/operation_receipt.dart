import 'package:freezed_annotation/freezed_annotation.dart';

part 'operation_receipt.freezed.dart';
part 'operation_receipt.g.dart';

@freezed
abstract class OperationReceipt with _$OperationReceipt {
  const factory OperationReceipt({
    required String id,
    required String message,
    required DateTime timestamp,
  }) = _OperationReceipt;

  factory OperationReceipt.fromJson(Map<String, dynamic> json) =>
      _$OperationReceiptFromJson(json);
}
