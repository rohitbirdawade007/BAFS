import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import 'package:bafs_mobile/core/config/env_config.dart';
import 'package:bafs_mobile/models/auth_user.dart';
import 'package:bafs_mobile/models/loan_product.dart';
import 'package:bafs_mobile/models/lead.dart';
import 'package:bafs_mobile/models/loan_application.dart';

void main() {
  group('Group 1: EMI Financial Calculation Precision', () {
    test('Calculates standard home loan EMI accurately', () {
      const principal = 2500000.0; // 25 Lakhs
      const annualRate = 9.0; // 9% p.a.
      const tenureYears = 20; // 20 years = 240 months

      const monthlyRate = annualRate / (12 * 100);
      const totalMonths = tenureYears * 12;
      final factor = pow(1 + monthlyRate, totalMonths).toDouble();
      final emi = (principal * monthlyRate * factor) / (factor - 1);

      expect(emi.round(), 22493, reason: 'Monthly EMI should match standard actuarial value');
      final totalPayable = emi * totalMonths;
      expect(totalPayable > principal, true);
      final totalInterest = totalPayable - principal;
      expect(totalInterest.round(), 2898356, reason: 'Total interest payable check');
    });

    test('Handles 0% zero-interest edge case without division by zero', () {
      const principal = 60000.0;
      const totalMonths = 12;
      const monthlyRate = 0.0;
      const emi = monthlyRate == 0 ? (principal / totalMonths) : 0.0;
      expect(emi, 5000.0);
    });
  });

  group('Group 2: AuthUser Role Resolution & Permissions Isolation', () {
    test('Customer role resolves properly and restricts staff privileges', () {
      final customer = AuthUser.fromJson({
        'user_id': 'u100',
        'mobile_number': '9876543210',
        'primary_role': 'CUSTOMER',
        'full_name': 'Ramesh Kumar',
        'is_active': true,
      });

      expect(customer.isCustomer, true);
      expect(customer.isStaff, false);
      expect(customer.isConsultant, false);
      expect(customer.isVerifier, false);
      expect(customer.isAdmin, false);
      expect(customer.displayName, 'Ramesh Kumar');
    });

    test('Loan Consultant role gains CRM assignment privileges', () {
      final consultant = AuthUser.fromJson({
        'user_id': 'c200',
        'mobile_number': '9876500001',
        'primary_role': 'LOAN_CONSULTANT',
        'full_name': 'Amit Verma',
        'designation': 'Senior Consultant',
      });

      expect(consultant.isCustomer, false);
      expect(consultant.isStaff, true);
      expect(consultant.isConsultant, true);
      expect(consultant.isVerifier, false);
      expect(consultant.isAdmin, false);
    });

    test('Document Verifier role gains verification privileges', () {
      final verifier = AuthUser.fromJson({
        'user_id': 'v300',
        'mobile_number': '9876500002',
        'primary_role': 'DOCUMENT_VERIFIER',
        'full_name': 'Pooja Patil',
      });

      expect(verifier.isStaff, true);
      expect(verifier.isVerifier, true);
    });

    test('Super Admin inherits all staff and management roles', () {
      final admin = AuthUser.fromJson({
        'user_id': 'a400',
        'mobile_number': '9876500003',
        'primary_role': 'SUPER_ADMIN',
        'full_name': 'Rohit Birdawade',
        'is_superuser': true,
      });

      expect(admin.isStaff, true);
      expect(admin.isAdmin, true);
      expect(admin.isConsultant, true);
      expect(admin.isVerifier, true);
      expect(admin.isBranchManager, true);
    });
  });

  group('Group 3: LoanProduct Model Parsing & Defaults', () {
    test('Correctly maps backend catalogue schemas and JSON values', () {
      final product = LoanProduct.fromJson({
        'id': 'lp-101',
        'name': 'Prime Business Growth Loan',
        'loan_category': 'BUSINESS',
        'min_amount': 200000,
        'max_amount': 10000000,
        'min_tenure_months': 12,
        'max_tenure_months': 84,
        'indicative_rate_min': 11.5,
        'indicative_rate_max': 16.0,
        'processing_fee_pct': 1.5,
        'required_documents': ['GST Certificate', 'ITR (2 Years)', 'Bank Statement'],
      });

      expect(product.id, 'lp-101');
      expect(product.category, 'BUSINESS');
      expect(product.minInterestRate, 11.5);
      expect(product.maxInterestRate, 16.0);
      expect(product.processingFeePercent, 1.5);
      expect(product.requiredDocuments.length, 3);
    });
  });

  group('Group 4: Lead CRM Model Parsing & Serialization', () {
    test('Maps lead fields and assignment state correctly', () {
      final lead = Lead.fromJson({
        'id': 'lead-999',
        'reference_number': 'REF-20261022-8877',
        'full_name': 'Sunil Shinde',
        'mobile_number': '9988776655',
        'loan_category': 'PERSONAL',
        'requested_amount': 300000,
        'status': 'NEW',
        'assigned_consultant_id': null,
      });

      expect(lead.isNew, true);
      expect(lead.isAssigned, false);
      expect(lead.referenceNumber, 'REF-20261022-8877');
      expect(lead.requestedAmount, 300000.0);
    });
  });

  group('Group 5: LoanApplication & Document Hierarchy', () {
    test('Deserializes application with embedded documents and lender submissions', () {
      final app = LoanApplication.fromJson({
        'id': 'app-555',
        'reference_number': 'APP-2026-0042',
        'customer_id': 'cust-10',
        'loan_category': 'HOME',
        'requested_amount': 4500000,
        'requested_tenure_months': 180,
        'status': 'VERIFICATION_IN_PROGRESS',
        'applicant_name': 'Meera Joshi',
        'applicant_mobile': '9822001122',
        'documents': [
          {
            'id': 'doc-1',
            'application_id': 'app-555',
            'document_category': 'PAN_CARD',
            'original_filename': 'pan.pdf',
            'storage_key': 'docs/pan.pdf',
            'mime_type': 'application/pdf',
            'file_size_bytes': 1048576, // 1 MB
            'verification_status': 'VERIFIED',
          },
          {
            'id': 'doc-2',
            'application_id': 'app-555',
            'document_category': 'SALARY_SLIP',
            'original_filename': 'slip.pdf',
            'storage_key': 'docs/slip.pdf',
            'mime_type': 'application/pdf',
            'file_size_bytes': 2097152, // 2 MB
            'verification_status': 'UNDER_REVIEW',
          }
        ],
        'lender_submissions': [
          {
            'id': 'sub-1',
            'application_id': 'app-555',
            'lender_id': 'b0000000-0000-0000-0000-000000000001',
            'lender_name': 'HDFC Bank',
            'status': 'SUBMITTED',
            'external_reference': 'HDFC-88229',
          }
        ]
      });

      expect(app.referenceNumber, 'APP-2026-0042');
      expect(app.isUnderReview, true);
      expect(app.documents.length, 2);
      expect(app.documents[0].isVerified, true);
      expect(app.documents[0].formattedFileSize, '1.0 MB');
      expect(app.documents[1].isPending, true);
      expect(app.lenderSubmissions.length, 1);
      expect(app.lenderSubmissions[0].externalReference, 'HDFC-88229');
    });
  });

  group('Group 6: EnvConfig Dynamic Base URL Resolution & Normalization', () {
    test('Normalizes custom URL without /api/v1 prefix and strips trailing slashes', () {
      EnvConfig.setRuntimeBaseUrl('http://192.168.1.50:8000/');
      expect(EnvConfig.apiBaseUrl, 'http://192.168.1.50:8000/api/v1');

      EnvConfig.setRuntimeBaseUrl('https://api.mycustomdomain.com/api/v1///');
      expect(EnvConfig.apiBaseUrl, 'https://api.mycustomdomain.com/api/v1');

      EnvConfig.setRuntimeBaseUrl(null);
      expect(EnvConfig.runtimeBaseUrl, isNull);
    });
  });
}

