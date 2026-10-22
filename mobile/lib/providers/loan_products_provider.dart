import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/api_endpoints.dart';
import '../models/loan_product.dart';
import 'auth_provider.dart';

final loanProductsProvider = FutureProvider<List<LoanProduct>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.get(ApiEndpoints.loanProducts);
    final dynamic raw = response.data;
    final List<dynamic> list = raw is Map && raw['items'] is List
        ? raw['items'] as List<dynamic>
        : (raw is List ? raw : <dynamic>[]);
    return list.map((item) => LoanProduct.fromJson(item as Map<String, dynamic>)).toList();
  } catch (e) {
    // If backend catalogue is empty, provide default products for offline/instant calculation
    return const [
      LoanProduct(
        id: '1',
        name: 'Instant Personal Loan',
        category: 'PERSONAL',
        description: 'Collateral-free personal loans with quick disbursement and flexible tenure.',
        minAmount: 50000,
        maxAmount: 2500000,
        minTenureMonths: 12,
        maxTenureMonths: 60,
        minInterestRate: 10.5,
        maxInterestRate: 16.0,
        processingFeePercent: 1.5,
        requiredDocuments: ['PAN Card', 'Aadhaar Card', 'Last 3 Months Salary Slips', 'Bank Statement (6 Months)'],
      ),
      LoanProduct(
        id: '2',
        name: 'Commercial & SME Business Loan',
        category: 'BUSINESS',
        description: 'Working capital and term loans for business expansion and inventory.',
        minAmount: 200000,
        maxAmount: 10000000,
        minTenureMonths: 12,
        maxTenureMonths: 84,
        minInterestRate: 12.0,
        maxInterestRate: 18.0,
        processingFeePercent: 2.0,
        requiredDocuments: ['PAN Card', 'GST Certificate', 'ITR (Last 2 Years)', 'Audited Financials', 'Bank Statement (12 Months)'],
      ),
      LoanProduct(
        id: '3',
        name: 'Prime Home Loan',
        category: 'HOME',
        description: 'Competitive interest rates for purchasing or constructing your dream home.',
        minAmount: 500000,
        maxAmount: 50000000,
        minTenureMonths: 60,
        maxTenureMonths: 360,
        minInterestRate: 8.4,
        maxInterestRate: 10.5,
        processingFeePercent: 0.5,
        requiredDocuments: ['PAN Card', 'Aadhaar Card', 'Property Agreement', 'Title Deeds', 'Form 16 / ITR'],
      ),
      LoanProduct(
        id: '4',
        name: 'Loan Against Property (LAP)',
        category: 'LOAN_AGAINST_PROPERTY',
        description: 'Unlock high loan values by mortgaging residential or commercial property.',
        minAmount: 1000000,
        maxAmount: 75000000,
        minTenureMonths: 36,
        maxTenureMonths: 180,
        minInterestRate: 9.0,
        maxInterestRate: 12.5,
        processingFeePercent: 1.0,
        requiredDocuments: ['PAN Card', 'Property Documents', 'Chain of Title', 'Income Proof', 'Bank Statement (6 Months)'],
      ),
    ];
  }
});
