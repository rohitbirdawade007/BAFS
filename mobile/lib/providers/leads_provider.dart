import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/api_endpoints.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exception.dart';
import '../models/lead.dart';
import 'auth_provider.dart';

// CRM Leads State for Staff
class LeadsState {
  final bool isLoading;
  final List<Lead> leads;
  final String? filterStatus;
  final String? searchQuery;
  final String? errorMessage;

  const LeadsState({
    this.isLoading = false,
    this.leads = const [],
    this.filterStatus,
    this.searchQuery,
    this.errorMessage,
  });

  List<Lead> get filteredLeads {
    return leads.where((lead) {
      if (filterStatus != null && filterStatus!.isNotEmpty && filterStatus != 'ALL') {
        if (lead.status.toUpperCase() != filterStatus!.toUpperCase()) return false;
      }
      if (searchQuery != null && searchQuery!.isNotEmpty) {
        final q = searchQuery!.toLowerCase();
        final matchesRef = lead.referenceNumber.toLowerCase().contains(q);
        final matchesName = lead.fullName.toLowerCase().contains(q);
        final matchesPhone = lead.mobileNumber.contains(q);
        if (!matchesRef && !matchesName && !matchesPhone) return false;
      }
      return true;
    }).toList();
  }

  LeadsState copyWith({
    bool? isLoading,
    List<Lead>? leads,
    String? filterStatus,
    String? searchQuery,
    String? errorMessage,
    bool clearError = false,
  }) {
    return LeadsState(
      isLoading: isLoading ?? this.isLoading,
      leads: leads ?? this.leads,
      filterStatus: filterStatus ?? this.filterStatus,
      searchQuery: searchQuery ?? this.searchQuery,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class LeadsNotifier extends StateNotifier<LeadsState> {
  final ApiClient _api;

  LeadsNotifier(this._api) : super(const LeadsState());

  Future<void> fetchLeads() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.get(ApiEndpoints.crmLeads);
      final dynamic raw = response.data;
      final List<dynamic> list = raw is Map && raw['items'] is List
          ? raw['items'] as List<dynamic>
          : (raw is List ? raw : <dynamic>[]);
      final leads = list.map((e) => Lead.fromJson(e as Map<String, dynamic>)).toList();
      state = state.copyWith(isLoading: false, leads: leads);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load leads. Please check your connection.',
      );
    }
  }

  void setFilterStatus(String? status) {
    state = state.copyWith(filterStatus: status);
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  Future<bool> assignLeadToMe(String leadId) async {
    try {
      await _api.post(ApiEndpoints.assignLead(leadId));
      await fetchLeads();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<String?> submitPublicEnquiry({
    required String fullName,
    required String mobileNumber,
    String? email,
    String? city,
    required String loanCategory,
    double? requestedAmount,
    String? employmentType,
    double? monthlyIncome,
    required bool privacyConsent,
  }) async {
    try {
      final response = await _api.post(
        ApiEndpoints.createLead,
        data: {
          'full_name': fullName,
          'mobile_number': mobileNumber,
          'email': email,
          'city': city,
          'loan_category': loanCategory,
          'requested_amount': requestedAmount,
          'employment_type': employmentType,
          'monthly_income': monthlyIncome,
          'privacy_consent': privacyConsent,
        },
      );

      final data = response.data as Map<String, dynamic>;
      return data['reference_number'] as String?;
    } on ApiException catch (e) {
      state = state.copyWith(errorMessage: e.message);
      return null;
    } catch (e) {
      state = state.copyWith(
        errorMessage: 'Failed to submit loan enquiry. Please try again.',
      );
      return null;
    }
  }
}

final leadsNotifierProvider =
    StateNotifierProvider<LeadsNotifier, LeadsState>((ref) {
  final api = ref.watch(apiClientProvider);
  return LeadsNotifier(api);
});
