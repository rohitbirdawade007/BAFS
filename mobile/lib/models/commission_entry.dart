class CommissionEntry {
  final String id;
  final String disbursementId;
  final String agreementId;
  final double commissionBasis;
  final double expectedCommission;
  final double? confirmedCommission;
  final double? receivedAmount;
  final double? tdsDeducted;
  final double? gstAmount;
  final DateTime? payoutDate;
  final String status;
  final String? notes;
  final DateTime createdAt;

  const CommissionEntry({
    required this.id,
    required this.disbursementId,
    required this.agreementId,
    required this.commissionBasis,
    required this.expectedCommission,
    this.confirmedCommission,
    this.receivedAmount,
    this.tdsDeducted,
    this.gstAmount,
    this.payoutDate,
    required this.status,
    this.notes,
    required this.createdAt,
  });

  bool get isPaid =>
      status.toUpperCase() == 'RECEIVED' ||
      status.toUpperCase() == 'PAID' ||
      status.toUpperCase() == 'RECONCILED';
  bool get isExpected =>
      status.toUpperCase() == 'EXPECTED' || status.toUpperCase() == 'ACCRUED';
  bool get isConfirmed => status.toUpperCase() == 'CONFIRMED';
  bool get isDisputed => status.toUpperCase() == 'DISPUTED';
  bool get isReversed => status.toUpperCase() == 'REVERSED';

  factory CommissionEntry.fromJson(Map<String, dynamic> json) {
    return CommissionEntry(
      id: (json['id'] ?? '').toString(),
      disbursementId: (json['disbursement_id'] ?? '').toString(),
      agreementId: (json['agreement_id'] ?? '').toString(),
      commissionBasis: (json['commission_basis'] as num?)?.toDouble() ?? 0.0,
      expectedCommission: (json['expected_commission'] as num?)?.toDouble() ?? 0.0,
      confirmedCommission: (json['confirmed_commission'] as num?)?.toDouble(),
      receivedAmount: (json['received_amount'] as num?)?.toDouble(),
      tdsDeducted: (json['tds_deducted'] as num?)?.toDouble(),
      gstAmount: (json['gst_amount'] as num?)?.toDouble(),
      payoutDate: json['payout_date'] != null
          ? DateTime.tryParse(json['payout_date'].toString())
          : null,
      status: (json['status'] ?? 'EXPECTED').toString(),
      notes: json['notes'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'disbursement_id': disbursementId,
      'agreement_id': agreementId,
      'commission_basis': commissionBasis,
      'expected_commission': expectedCommission,
      'confirmed_commission': confirmedCommission,
      'received_amount': receivedAmount,
      'tds_deducted': tdsDeducted,
      'gst_amount': gstAmount,
      'payout_date': payoutDate?.toIso8601String(),
      'status': status,
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
