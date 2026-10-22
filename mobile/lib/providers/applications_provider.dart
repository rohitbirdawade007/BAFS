import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exception.dart';
import '../models/loan_application.dart';
import 'auth_provider.dart';

class ApplicationsState {
  final bool isLoading;
  final List<LoanApplication> applications;
  final LoanApplication? selectedApplication;
  final String? errorMessage;

  const ApplicationsState({
    this.isLoading = false,
    this.applications = const [],
    this.selectedApplication,
    this.errorMessage,
  });

  ApplicationsState copyWith({
    bool? isLoading,
    List<LoanApplication>? applications,
    LoanApplication? selectedApplication,
    String? errorMessage,
    bool clearSelected = false,
    bool clearError = false,
  }) {
    return ApplicationsState(
      isLoading: isLoading ?? this.isLoading,
      applications: applications ?? this.applications,
      selectedApplication: clearSelected
          ? null
          : (selectedApplication ?? this.selectedApplication),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class ApplicationsNotifier extends StateNotifier<ApplicationsState> {
  final ApiClient _api;

  ApplicationsNotifier(this._api) : super(const ApplicationsState());

  Future<void> fetchApplications() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.get(ApiEndpoints.applications);
      final dynamic raw = response.data;
      final List<dynamic> list = raw is Map && raw['items'] is List
          ? raw['items'] as List<dynamic>
          : (raw is List ? raw : <dynamic>[]);
      final applications =
          list.map((e) => LoanApplication.fromJson(e as Map<String, dynamic>)).toList();
      state = state.copyWith(isLoading: false, applications: applications);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to load applications.',
      );
    }
  }

  Future<LoanApplication?> fetchApplicationDetail(String id) async {
    try {
      final response = await _api.get(ApiEndpoints.applicationDetails(id));
      final app = LoanApplication.fromJson(response.data as Map<String, dynamic>);
      state = state.copyWith(selectedApplication: app);
      return app;
    } catch (e) {
      return null;
    }
  }

  Future<LoanApplication?> createApplication({
    required String loanCategory,
    required double requestedAmount,
    int? requestedTenureMonths,
    String? purpose,
    required String applicantName,
    required String applicantMobile,
    String? employmentType,
    double? monthlyIncome,
    double? existingEmi,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.post(
        ApiEndpoints.applications,
        data: {
          'loan_category': loanCategory,
          'requested_amount': requestedAmount,
          'requested_tenure_months': requestedTenureMonths,
          'purpose': purpose,
          'applicant_name': applicantName,
          'applicant_mobile': applicantMobile,
          'employment_type': employmentType,
          'monthly_income': monthlyIncome,
          'existing_emi': existingEmi,
        },
      );

      final newApp = LoanApplication.fromJson(response.data as Map<String, dynamic>);
      state = state.copyWith(
        isLoading: false,
        applications: [newApp, ...state.applications],
      );
      return newApp;
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
      return null;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to create application.',
      );
      return null;
    }
  }

  Future<bool> uploadDocument({
    required String applicationId,
    required String category,
    required String filename,
    required List<int> bytes,
    required String mimeType,
  }) async {
    try {
      // 1. Get presigned upload URL from backend
      final urlResponse = await _api.post(
        ApiEndpoints.requestDocumentUploadUrl(applicationId),
        data: {
          'document_category': category,
          'original_filename': filename,
          'mime_type': mimeType,
          'file_size_bytes': bytes.length,
        },
      );

      final uploadData = urlResponse.data as Map<String, dynamic>;
      final uploadUrl = uploadData['upload_url'] as String;

      // 2. Upload binary stream to the presigned URL via PUT
      final uploadDio = Dio();
      await uploadDio.put(
        uploadUrl,
        data: bytes,
        options: Options(
          headers: {
            'Content-Type': mimeType,
          },
        ),
      );

      // 3. Refresh application details to reflect newly uploaded document
      await fetchApplicationDetail(applicationId);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> verifyDocument({
    required String documentId,
    required String applicationId,
    required String status,
    String? notes,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.verifyDocument(documentId),
        data: {
          'status': status,
          'notes': notes,
        },
      );
      await fetchApplicationDetail(applicationId);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> submitToLender({
    required String applicationId,
    required String lenderId,
    String? loanProductId,
    String? externalReference,
    String? internalNotes,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.lenderSubmissions(applicationId),
        data: {
          'lender_id': lenderId,
          'loan_product_id': loanProductId,
          'external_reference': externalReference,
          'internal_notes': internalNotes,
        },
      );
      await fetchApplicationDetail(applicationId);
      return true;
    } catch (e) {
      return false;
    }
  }
}

final applicationsNotifierProvider =
    StateNotifierProvider<ApplicationsNotifier, ApplicationsState>((ref) {
  final api = ref.watch(apiClientProvider);
  return ApplicationsNotifier(api);
});
