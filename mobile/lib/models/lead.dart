class Lead {
  final String id;
  final String referenceNumber;
  final String fullName;
  final String mobileNumber;
  final String? email;
  final String? city;
  final String loanCategory;
  final double? requestedAmount;
  final String? employmentType;
  final double? monthlyIncome;
  final String status;
  final String? assignedConsultantId;
  final String? assignedConsultantName;
  final String? notes;
  final DateTime createdAt;

  const Lead({
    required this.id,
    required this.referenceNumber,
    required this.fullName,
    required this.mobileNumber,
    this.email,
    this.city,
    required this.loanCategory,
    this.requestedAmount,
    this.employmentType,
    this.monthlyIncome,
    required this.status,
    this.assignedConsultantId,
    this.assignedConsultantName,
    this.notes,
    required this.createdAt,
  });

  bool get isAssigned => assignedConsultantId != null && assignedConsultantId!.isNotEmpty;
  bool get isNew => status.toUpperCase() == 'NEW';
  bool get isContacted => status.toUpperCase() == 'CONTACTED';
  bool get isQualified => status.toUpperCase() == 'QUALIFIED';
  bool get isConverted => status.toUpperCase() == 'CONVERTED';

  factory Lead.fromJson(Map<String, dynamic> json) {
    return Lead(
      id: (json['id'] ?? '').toString(),
      referenceNumber: json['reference_number'] as String? ?? 'REF-NEW',
      fullName: json['full_name'] as String? ?? '',
      mobileNumber: json['mobile_number'] as String? ?? '',
      email: json['email'] as String?,
      city: json['city'] as String?,
      loanCategory: (json['loan_category'] ?? 'PERSONAL').toString(),
      requestedAmount: (json['requested_amount'] as num?)?.toDouble(),
      employmentType: json['employment_type'] as String?,
      monthlyIncome: (json['monthly_income'] as num?)?.toDouble(),
      status: (json['status'] ?? 'NEW').toString(),
      assignedConsultantId: json['assigned_consultant_id']?.toString(),
      assignedConsultantName: json['assigned_consultant_name'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reference_number': referenceNumber,
      'full_name': fullName,
      'mobile_number': mobileNumber,
      'email': email,
      'city': city,
      'loan_category': loanCategory,
      'requested_amount': requestedAmount,
      'employment_type': employmentType,
      'monthly_income': monthlyIncome,
      'status': status,
      'assigned_consultant_id': assignedConsultantId,
      'assigned_consultant_name': assignedConsultantName,
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
