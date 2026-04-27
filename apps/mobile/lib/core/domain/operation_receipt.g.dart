// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operation_receipt.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_OperationReceipt _$OperationReceiptFromJson(Map<String, dynamic> json) =>
    _OperationReceipt(
      id: json['id'] as String,
      message: json['message'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );

Map<String, dynamic> _$OperationReceiptToJson(_OperationReceipt instance) =>
    <String, dynamic>{
      'id': instance.id,
      'message': instance.message,
      'timestamp': instance.timestamp.toIso8601String(),
    };
