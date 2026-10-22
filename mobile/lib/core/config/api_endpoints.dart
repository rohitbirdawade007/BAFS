class ApiEndpoints {
  ApiEndpoints._();

  // Authentication
  static const String requestOtp = '/auth/otp/request';
  static const String verifyOtp = '/auth/otp/verify';
  static const String refreshToken = '/auth/refresh';
  static const String currentUser = '/auth/me';

  // Products Catalogue
  static const String loanProducts = '/loan-products';

  // Public Leads & CRM Leads
  static const String createLead = '/leads';
  static const String crmLeads = '/crm/leads';
  static String leadDetails(String id) => '/crm/leads/$id';
  static String assignLead(String id) => '/crm/leads/$id/assign';
  static String leadFollowups(String id) => '/crm/leads/$id/followups';

  // Applications
  static const String applications = '/applications';
  static String applicationDetails(String id) => '/applications/$id';
  static String requestDocumentUploadUrl(String id) => '/applications/$id/documents/upload-url';
  static String verifyDocument(String docId) => '/documents/$docId/verify';
  static String lenderSubmissions(String id) => '/applications/$id/lender-submissions';
  static String disbursements(String id) => '/applications/$id/disbursements';

  // Commissions
  static const String commissions = '/commissions';
  static String reconcileCommission(String id) => '/commissions/$id/reconcile';
}
