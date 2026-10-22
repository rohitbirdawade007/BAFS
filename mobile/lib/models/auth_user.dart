class AuthUser {
  final String id;
  final String phone;
  final String? fullName;
  final String? email;
  final String role;
  final bool isActive;
  final bool isVerified;
  final bool isSuperuser;
  final String? branchName;
  final String? designation;

  const AuthUser({
    required this.id,
    required this.phone,
    this.fullName,
    this.email,
    required this.role,
    this.isActive = true,
    this.isVerified = false,
    this.isSuperuser = false,
    this.branchName,
    this.designation,
  });

  bool get isCustomer => role.toUpperCase() == 'CUSTOMER';
  bool get isStaff => !isCustomer;
  bool get isConsultant =>
      role.toUpperCase() == 'LOAN_CONSULTANT' ||
      role.toUpperCase() == 'CONSULTANT' ||
      role.toUpperCase() == 'DSA_AGENT' ||
      isBranchManager ||
      isAdmin;
  bool get isBranchManager =>
      role.toUpperCase() == 'BRANCH_MANAGER' || isAdmin;
  bool get isVerifier =>
      role.toUpperCase() == 'DOCUMENT_VERIFIER' ||
      role.toUpperCase() == 'VERIFIER' ||
      isBranchManager ||
      isAdmin;
  bool get isOperations =>
      role.toUpperCase() == 'OPERATIONS_ADMIN' ||
      role.toUpperCase() == 'OPERATIONS' ||
      isBranchManager ||
      isAdmin;
  bool get isFinance =>
      role.toUpperCase() == 'FINANCE_OFFICER' ||
      role.toUpperCase() == 'FINANCE' ||
      isAdmin;
  bool get isAdmin =>
      role.toUpperCase() == 'SUPER_ADMIN' ||
      role.toUpperCase() == 'ADMIN' ||
      isSuperuser;

  String get displayName {
    if (fullName != null && fullName!.trim().isNotEmpty) {
      return fullName!;
    }
    return phone;
  }

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    final rawId = json['user_id'] ?? json['id'] ?? '';
    final rawPhone = json['mobile_number'] ?? json['phone'] ?? '';
    final rawRole = json['primary_role'] ?? json['role'] ?? 'CUSTOMER';

    return AuthUser(
      id: rawId.toString(),
      phone: rawPhone.toString(),
      fullName: json['full_name'] as String?,
      email: json['email'] as String?,
      role: rawRole.toString().toUpperCase(),
      isActive: json['is_active'] as bool? ?? true,
      isVerified: json['is_verified'] as bool? ?? false,
      isSuperuser: json['is_superuser'] as bool? ?? false,
      branchName: json['branch_name'] as String?,
      designation: json['designation'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': id,
      'mobile_number': phone,
      'full_name': fullName,
      'email': email,
      'primary_role': role,
      'is_active': isActive,
      'is_verified': isVerified,
      'is_superuser': isSuperuser,
      'branch_name': branchName,
      'designation': designation,
    };
  }
}
