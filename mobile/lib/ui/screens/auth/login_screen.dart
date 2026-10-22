import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/env_config.dart';
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

  void _showServerSettingsModal(BuildContext context) {
    final currentUrl = ref.read(apiBaseUrlProvider);
    final urlController = TextEditingController(text: currentUrl);
    bool isTesting = false;
    String? testStatus;
    bool? testSuccess;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.dns_rounded, color: AppColors.primaryMaroon),
                          SizedBox(width: 8),
                          Text(
                            'Server Connection',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textDark,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Specify the backend API address for this device. '
                    'For physical handsets on the PC Wi-Fi hotspot, use the PC LAN address.',
                    style: TextStyle(fontSize: 13, color: AppColors.textMedium),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: urlController,
                    decoration: InputDecoration(
                      labelText: 'API Base URL',
                      hintText: 'http://10.35.218.102:8000/api/v1',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.link),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Quick Presets:',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textDark),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      ActionChip(
                        avatar: const Icon(Icons.wifi, size: 16),
                        label: const Text('Hotspot (10.35.218.102)'),
                        onPressed: () {
                          setModalState(() {
                            urlController.text = EnvConfig.defaultLanBaseUrl;
                            testStatus = null;
                            testSuccess = null;
                          });
                        },
                      ),
                      ActionChip(
                        avatar: const Icon(Icons.phone_android, size: 16),
                        label: const Text('Emulator (10.0.2.2)'),
                        onPressed: () {
                          setModalState(() {
                            urlController.text = EnvConfig.defaultEmulatorBaseUrl;
                            testStatus = null;
                            testSuccess = null;
                          });
                        },
                      ),
                      ActionChip(
                        avatar: const Icon(Icons.cloud_outlined, size: 16),
                        label: const Text('Production (api.bafs.in)'),
                        onPressed: () {
                          setModalState(() {
                            urlController.text = EnvConfig.defaultProductionBaseUrl;
                            testStatus = null;
                            testSuccess = null;
                          });
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (testStatus != null) ...[
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: testSuccess == true ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            testSuccess == true ? Icons.check_circle : Icons.error,
                            size: 18,
                            color: testSuccess == true ? const Color(0xFF16A34A) : AppColors.statusRejected,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              testStatus!,
                              style: TextStyle(
                                fontSize: 13,
                                color: testSuccess == true ? const Color(0xFF16A34A) : AppColors.statusRejected,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: isTesting
                              ? null
                              : () async {
                                  final targetUrl = urlController.text.trim();
                                  setModalState(() {
                                    isTesting = true;
                                    testStatus = 'Testing connection...';
                                    testSuccess = null;
                                  });
                                  try {
                                    final cleanTarget = targetUrl.replaceAll('/api/v1', '');
                                    final healthUrl = '$cleanTarget/api/v1/health';
                                    final testDio = Dio(
                                      BaseOptions(
                                        connectTimeout: const Duration(seconds: 4),
                                        receiveTimeout: const Duration(seconds: 4),
                                      ),
                                    );
                                    final response = await testDio.get(healthUrl);
                                    if (response.statusCode == 200) {
                                      setModalState(() {
                                        isTesting = false;
                                        testSuccess = true;
                                        testStatus = 'Connection verified! Server is online.';
                                      });
                                    } else {
                                      setModalState(() {
                                        isTesting = false;
                                        testSuccess = false;
                                        testStatus = 'Server returned HTTP ${response.statusCode}';
                                      });
                                    }
                                  } catch (e) {
                                    setModalState(() {
                                      isTesting = false;
                                      testSuccess = false;
                                      testStatus = 'Failed to reach server: ${e.toString().split('\n').first}';
                                    });
                                  }
                                },
                          child: isTesting
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Test Ping'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryMaroon,
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () async {
                            final targetUrl = urlController.text.trim();
                            await ref.read(apiBaseUrlProvider.notifier).setBaseUrl(targetUrl);
                            if (context.mounted) {
                              Navigator.of(context).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Server endpoint set to $targetUrl'),
                                  backgroundColor: AppColors.primaryMaroon,
                                ),
                              );
                            }
                          },
                          child: const Text('Save & Apply'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
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
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.topRight,
                  child: IconButton(
                    icon: const Icon(Icons.settings_ethernet, color: AppColors.primaryMaroon),
                    tooltip: 'Server Settings',
                    onPressed: () => _showServerSettingsModal(context),
                  ),
                ),
                Center(
                  child: InkWell(
                    borderRadius: BorderRadius.circular(36),
                    onTap: () => _showServerSettingsModal(context),
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
                ),
                const SizedBox(height: 16),
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
                const SizedBox(height: 28),

                if (authState.errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
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
                        const SizedBox(height: 8),
                        InkWell(
                          onTap: () => _showServerSettingsModal(context),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.tune, size: 16, color: AppColors.primaryMaroon),
                              SizedBox(width: 4),
                              Text(
                                'Change Server IP / URL',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primaryMaroon,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ],
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
