import 'application_document.dart';
import 'lender_submission.dart';

class ApplicationStatusHistory {
  final String id;
  final String? fromStatus;
  final String toStatus;
  final String? reason;
  final DateTime createdAt;

  const ApplicationStatusHistory({
    required this.id,
    this.fromStatus,
    required this.toStatus,
    this.reason,
    required this.createdAt,
  });

  factory ApplicationStatusHistory.fromJson(Map<String, dynamic> json) {
    return ApplicationStatusHistory(
      id: (json['id'] ?? '').toString(),
      fromStatus: json['from_status']?.toString(),
      toStatus: (json['to_status'] ?? '').toString(),
      reason: json['reason'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class LoanApplication {
  final String id;
  final String referenceNumber;
  final String customerId;
  final String? leadId;
  final String loanCategory;
  final double requestedAmount;
  final int? requestedTenureMonths;
  final String? purpose;
  final String status;
  final String? assignedConsultantId;
  final String applicantName;
  final String applicantMobile;
  final String? employmentType;
  final double? monthlyIncome;
  final double? existingEmi;
  final int wizardStep;
  final String? internalNotes;
  final String? rejectionReason;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ApplicationStatusHistory> statusHistory;
  final List<ApplicationDocument> documents;
  final List<LenderSubmission> lenderSubmissions;

  const LoanApplication({
    required this.id,
    required this.referenceNumber,
    required this.customerId,
    this.leadId,
    required this.loanCategory,
    required this.requestedAmount,
    this.requestedTenureMonths,
    this.purpose,
    required this.status,
    this.assignedConsultantId,
    required this.applicantName,
    required this.applicantMobile,
    this.employmentType,
    this.monthlyIncome,
    this.existingEmi,
    this.wizardStep = 1,
    this.internalNotes,
    this.rejectionReason,
    required this.createdAt,
    required this.updatedAt,
    this.statusHistory = const [],
    this.documents = const [],
    this.lenderSubmissions = const [],
  });

  bool get isApproved => status.toUpperCase().contains('APPROVED') || status.toUpperCase().contains('DISBURSEMENT');
  bool get isRejected => status.toUpperCase().contains('REJECTED');
  bool get isDisbursed => status.toUpperCase().contains('DISBURSEMENT_CONFIRMED');
  bool get isUnderReview =>
      status.toUpperCase().contains('VERIFICATION') ||
      status.toUpperCase().contains('SUBMITTED') ||
      status.toUpperCase().contains('REVIEW');

  factory LoanApplication.fromJson(Map<String, dynamic> json) {
    final rawDocs = (json['documents'] as List<dynamic>?)
            ?.map((e) => ApplicationDocument.fromJson(e as Map<String, dynamic>))
            .toList() ??
        const [];

    final rawSubmissions = (json['lender_submissions'] as List<dynamic>?)
            ?.map((e) => LenderSubmission.fromJson(e as Map<String, dynamic>))
            .toList() ??
        const [];

    final rawHistory = (json['status_history'] as List<dynamic>?)
            ?.map((e) => ApplicationStatusHistory.fromJson(e as Map<String, dynamic>))
            .toList() ??
        const [];

    return LoanApplication(
      id: (json['id'] ?? '').toString(),
      referenceNumber: json['reference_number'] as String? ?? 'APP-NEW',
      customerId: (json['customer_id'] ?? '').toString(),
      leadId: json['lead_id']?.toString(),
      loanCategory: (json['loan_category'] ?? 'PERSONAL').toString(),
      requestedAmount: (json['requested_amount'] as num?)?.toDouble() ?? 0.0,
      requestedTenureMonths: (json['requested_tenure_months'] as num?)?.toInt(),
      purpose: json['purpose'] as String?,
      status: (json['status'] ?? 'ENQUIRY_RECEIVED').toString(),
      assignedConsultantId: json['assigned_consultant_id']?.toString(),
      applicantName: json['applicant_name'] as String? ?? '',
      applicantMobile: json['applicant_mobile'] as String? ?? '',
      employmentType: json['employment_type'] as String?,
      monthlyIncome: (json['monthly_income'] as num?)?.toDouble(),
      existingEmi: (json['existing_emi'] as num?)?.toDouble(),
      wizardStep: (json['wizard_step'] as num?)?.toInt() ?? 1,
      internalNotes: json['internal_notes'] as String?,
      rejectionReason: json['rejection_reason'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      statusHistory: rawHistory,
      documents: rawDocs,
      lenderSubmissions: rawSubmissions,
    );
  }
}
