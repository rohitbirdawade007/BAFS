class LenderSubmission {
  final String id;
  final String applicationId;
  final String lenderId;
  final String? lenderName;
  final String? loanProductId;
  final String? submittedById;
  final DateTime submissionDate;
  final String? externalReference;
  final String status;
  final double? offeredAmount;
  final double? offeredRate;
  final int? offeredTenureMonths;
  final DateTime? decisionDate;
  final String? decisionReference;
  final String? rejectionReason;
  final String? internalNotes;

  const LenderSubmission({
    required this.id,
    required this.applicationId,
    required this.lenderId,
    this.lenderName,
    this.loanProductId,
    this.submittedById,
    required this.submissionDate,
    this.externalReference,
    required this.status,
    this.offeredAmount,
    this.offeredRate,
    this.offeredTenureMonths,
    this.decisionDate,
    this.decisionReference,
    this.rejectionReason,
    this.internalNotes,
  });

  bool get isApproved => status.toUpperCase() == 'APPROVED';
  bool get isRejected => status.toUpperCase() == 'REJECTED';
  bool get isSubmitted => status.toUpperCase() == 'SUBMITTED' || status.toUpperCase() == 'UNDER_REVIEW';

  factory LenderSubmission.fromJson(Map<String, dynamic> json) {
    return LenderSubmission(
      id: (json['id'] ?? '').toString(),
      applicationId: (json['application_id'] ?? '').toString(),
      lenderId: (json['lender_id'] ?? '').toString(),
      lenderName: json['lender_name'] as String?,
      loanProductId: json['loan_product_id']?.toString(),
      submittedById: json['submitted_by_id']?.toString(),
      submissionDate: json['submission_date'] != null
          ? DateTime.tryParse(json['submission_date'].toString()) ?? DateTime.now()
          : DateTime.now(),
      externalReference: json['external_reference'] as String?,
      status: (json['status'] ?? 'SUBMITTED').toString(),
      offeredAmount: (json['offered_amount'] as num?)?.toDouble(),
      offeredRate: (json['offered_rate'] as num?)?.toDouble(),
      offeredTenureMonths: (json['offered_tenure_months'] as num?)?.toInt(),
      decisionDate: json['decision_date'] != null
          ? DateTime.tryParse(json['decision_date'].toString())
          : null,
      decisionReference: json['decision_reference'] as String?,
      rejectionReason: json['rejection_reason'] as String?,
      internalNotes: json['internal_notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'application_id': applicationId,
      'lender_id': lenderId,
      'lender_name': lenderName,
      'loan_product_id': loanProductId,
      'submitted_by_id': submittedById,
      'submission_date': submissionDate.toIso8601String(),
      'external_reference': externalReference,
      'status': status,
      'offered_amount': offeredAmount,
      'offered_rate': offeredRate,
      'offered_tenure_months': offeredTenureMonths,
      'decision_date': decisionDate?.toIso8601String(),
      'decision_reference': decisionReference,
      'rejection_reason': rejectionReason,
      'internal_notes': internalNotes,
    };
  }
}
