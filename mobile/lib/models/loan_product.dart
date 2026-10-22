class LoanProduct {
  final String id;
  final String? lenderId;
  final String name;
  final String category;
  final String? description;
  final String? eligibilityNotes;
  final double minAmount;
  final double maxAmount;
  final int minTenureMonths;
  final int maxTenureMonths;
  final double minInterestRate;
  final double maxInterestRate;
  final double processingFeePercent;
  final bool isActive;
  final List<String> requiredDocuments;

  const LoanProduct({
    required this.id,
    this.lenderId,
    required this.name,
    required this.category,
    this.description,
    this.eligibilityNotes,
    required this.minAmount,
    required this.maxAmount,
    required this.minTenureMonths,
    required this.maxTenureMonths,
    required this.minInterestRate,
    required this.maxInterestRate,
    required this.processingFeePercent,
    this.isActive = true,
    this.requiredDocuments = const [],
  });

  factory LoanProduct.fromJson(Map<String, dynamic> json) {
    final rawCategory = json['loan_category'] ?? json['category'] ?? 'PERSONAL';
    final minRate = (json['indicative_rate_min'] ?? json['min_interest_rate'] as num?)?.toDouble() ?? 8.5;
    final maxRate = (json['indicative_rate_max'] ?? json['max_interest_rate'] as num?)?.toDouble() ?? 14.5;
    final fee = (json['processing_fee_pct'] ?? json['processing_fee_percent'] as num?)?.toDouble() ?? 1.0;

    return LoanProduct(
      id: (json['id'] ?? '').toString(),
      lenderId: json['lender_id']?.toString(),
      name: json['name'] as String? ?? '',
      category: rawCategory.toString(),
      description: json['description'] as String?,
      eligibilityNotes: json['eligibility_notes'] as String?,
      minAmount: (json['min_amount'] as num?)?.toDouble() ?? 50000.0,
      maxAmount: (json['max_amount'] as num?)?.toDouble() ?? 50000000.0,
      minTenureMonths: json['min_tenure_months'] as int? ?? 12,
      maxTenureMonths: json['max_tenure_months'] as int? ?? 360,
      minInterestRate: minRate,
      maxInterestRate: maxRate,
      processingFeePercent: fee,
      isActive: json['is_active'] as bool? ?? true,
      requiredDocuments: (json['required_documents'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [
            'PAN Card',
            'Aadhaar Card',
            'Income Proof / Salary Slips',
            'Bank Statement (6 Months)'
          ],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lender_id': lenderId,
      'name': name,
      'loan_category': category,
      'description': description,
      'eligibility_notes': eligibilityNotes,
      'min_amount': minAmount,
      'max_amount': maxAmount,
      'min_tenure_months': minTenureMonths,
      'max_tenure_months': maxTenureMonths,
      'indicative_rate_min': minInterestRate,
      'indicative_rate_max': maxInterestRate,
      'processing_fee_pct': processingFeePercent,
      'is_active': isActive,
      'required_documents': requiredDocuments,
    };
  }
}
