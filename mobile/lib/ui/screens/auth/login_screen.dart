import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _onRequestOtp() async {
    if (!_formKey.currentState!.validate()) return;
    final phone = _phoneController.text.trim();
    final success = await ref.read(authNotifierProvider.notifier).requestOtp(phone);
    if (success && mounted) {
      final state = ref.read(authNotifierProvider);
      if (state.debugOtp != null) {
        _otpController.text = state.debugOtp!;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            state.debugOtp != null
                ? 'OTP Sent! Dev OTP: ${state.debugOtp}'
                : 'OTP Sent successfully to +91 $phone',
          ),
          backgroundColor: AppColors.accentYellowGreen,
        ),
      );
    }
  }

  void _onVerifyOtp() async {
    final phone = _phoneController.text.trim();
    final otp = _otpController.text.trim();
    if (otp.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter the 6-digit OTP'),
          backgroundColor: AppColors.statusRejected,
        ),
      );
      return;
    }

    final success = await ref.read(authNotifierProvider.notifier).verifyOtp(phone, otp);
    if (success && mounted) {
      final authState = ref.read(authNotifierProvider);
      if (authState.user != null) {
        if (authState.user!.isCustomer) {
          context.go('/customer');
        } else {
          context.go('/staff');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppColors.primaryMaroon.withOpacity(0.08),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.account_balance,
                      size: 40,
                      color: AppColors.primaryMaroon,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'BAFS Portal',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryMaroon,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Customer & Consultant Secure Access',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textMedium,
                  ),
                ),
                const SizedBox(height: 36),

                if (authState.errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.statusRejected, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            authState.errorMessage!,
                            style: const TextStyle(color: AppColors.statusRejected, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Phone Input Field
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  enabled: !authState.isOtpSent && !authState.isLoading,
                  decoration: InputDecoration(
                    labelText: 'Mobile Number',
                    hintText: '9876543210',
                    prefixIcon: const Icon(Icons.phone_android, color: AppColors.primaryMaroon),
                    prefixText: '+91 ',
                    suffixIcon: authState.isOtpSent
                        ? IconButton(
                            icon: const Icon(Icons.edit, size: 18),
                            onPressed: () {
                              ref.read(authNotifierProvider.notifier).resetOtp();
                            },
                          )
                        : null,
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Enter mobile number';
                    final clean = v.replaceAll(RegExp(r'\D'), '');
                    if (clean.length != 10) return 'Must be exactly 10 digits';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // OTP Section when OTP is sent
                if (authState.isOtpSent) ...[
                  if (authState.debugOtp != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.accentLightGreen,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.accentYellowGreen.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.verified_user, color: AppColors.accentYellowGreen, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Dev Environment OTP: ${authState.debugOtp}',
                            style: const TextStyle(
                              color: Color(0xFF3B5311),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),

                  TextFormField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: const InputDecoration(
                      labelText: '6-Digit OTP',
                      hintText: 'Enter OTP',
                      prefixIcon: Icon(Icons.lock_clock, color: AppColors.primaryMaroon),
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 20),

                  ElevatedButton(
                    onPressed: authState.isLoading ? null : _onVerifyOtp,
                    child: authState.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Verify & Proceed'),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: authState.isLoading ? null : _onRequestOtp,
                    child: const Text('Resend OTP'),
                  ),
                ] else ...[
                  ElevatedButton(
                    onPressed: authState.isLoading ? null : _onRequestOtp,
                    child: authState.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Send Verification OTP'),
                  ),
                ],

                const SizedBox(height: 36),
                const Divider(),
                const SizedBox(height: 16),

                OutlinedButton.icon(
                  onPressed: () {
                    context.go('/customer/catalogue');
                  },
                  icon: const Icon(Icons.calculate_outlined),
                  label: const Text('Browse Loan Catalogue & EMI Tools'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    context.go('/customer/enquiry');
                  },
                  icon: const Icon(Icons.send_outlined),
                  label: const Text('Submit Instant Loan Enquiry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
