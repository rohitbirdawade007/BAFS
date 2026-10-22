import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/leads_provider.dart';

class LoanEnquiryScreen extends ConsumerStatefulWidget {
  const LoanEnquiryScreen({super.key});

  @override
  ConsumerState<LoanEnquiryScreen> createState() => _LoanEnquiryScreenState();
}

class _LoanEnquiryScreenState extends ConsumerState<LoanEnquiryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _cityController = TextEditingController();
  final _amountController = TextEditingController();
  final _incomeController = TextEditingController();

  String _category = 'PERSONAL';
  String? _employmentType = 'SALARIED';
  bool _privacyConsent = true;
  bool _isSubmitting = false;
  String? _generatedReference;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _cityController.dispose();
    _amountController.dispose();
    _incomeController.dispose();
    super.dispose();
  }

  void _submitEnquiry() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_privacyConsent) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please accept the privacy consent to continue'),
          backgroundColor: AppColors.statusRejected,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final refNum = await ref.read(leadsNotifierProvider.notifier).submitPublicEnquiry(
      fullName: _nameController.text.trim(),
      mobileNumber: _phoneController.text.trim(),
      email: _emailController.text.trim().isNotEmpty ? _emailController.text.trim() : null,
      city: _cityController.text.trim().isNotEmpty ? _cityController.text.trim() : null,
      loanCategory: _category,
      requestedAmount: double.tryParse(_amountController.text.trim()),
      employmentType: _employmentType,
      monthlyIncome: double.tryParse(_incomeController.text.trim()),
      privacyConsent: _privacyConsent,
    );
    setState(() => _isSubmitting = false);

    if (refNum != null && mounted) {
      setState(() => _generatedReference = refNum);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_generatedReference != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Enquiry Submitted')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        color: AppColors.accentLightGreen,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_circle,
                        color: AppColors.accentYellowGreen,
                        size: 48,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Enquiry Received!',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Your loan enquiry has been registered with BAFS. A dedicated consultant will review your request.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: AppColors.textMedium),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Tracking Reference',
                                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                              ),
                              Text(
                                _generatedReference!,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryMaroon,
                                ),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 20, color: AppColors.primaryMaroon),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _generatedReference!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Reference copied to clipboard')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Back to Home'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Instant Loan Enquiry'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Tell us about your loan requirement',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Get matched with optimal rates from 40+ lending institutions.',
                style: TextStyle(fontSize: 13, color: AppColors.textMedium),
              ),
              const SizedBox(height: 24),

              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name *',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (v) => v == null || v.trim().isEmpty ? 'Enter your full name' : null,
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Mobile Number *',
                  prefixText: '+91 ',
                  prefixIcon: Icon(Icons.phone_android),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Enter mobile number';
                  final clean = v.replaceAll(RegExp(r'\D'), '');
                  if (clean.length != 10) return 'Must be 10 digits';
                  return null;
                },
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: 'Current City',
                  prefixIcon: Icon(Icons.location_city_outlined),
                ),
              ),
              const SizedBox(height: 14),

              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(
                  labelText: 'Loan Category *',
                  prefixIcon: Icon(Icons.category_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: 'PERSONAL', child: Text('Personal Loan')),
                  DropdownMenuItem(value: 'BUSINESS', child: Text('Business Loan')),
                  DropdownMenuItem(value: 'HOME', child: Text('Home Loan')),
                  DropdownMenuItem(value: 'LOAN_AGAINST_PROPERTY', child: Text('Loan Against Property (LAP)')),
                  DropdownMenuItem(value: 'VEHICLE', child: Text('Vehicle Loan')),
                  DropdownMenuItem(value: 'EDUCATION', child: Text('Education Loan')),
                  DropdownMenuItem(value: 'GOLD', child: Text('Gold Loan')),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _category = v);
                },
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Required Loan Amount (₹)',
                  prefixIcon: Icon(Icons.currency_rupee),
                ),
              ),
              const SizedBox(height: 14),

              DropdownButtonFormField<String>(
                value: _employmentType,
                decoration: const InputDecoration(
                  labelText: 'Employment Type',
                  prefixIcon: Icon(Icons.work_outline),
                ),
                items: const [
                  DropdownMenuItem(value: 'SALARIED', child: Text('Salaried Employee')),
                  DropdownMenuItem(value: 'SELF_EMPLOYED', child: Text('Self-Employed / Freelancer')),
                  DropdownMenuItem(value: 'BUSINESS_OWNER', child: Text('Business Owner / Director')),
                  DropdownMenuItem(value: 'RETIRED', child: Text('Retired / Pensioner')),
                ],
                onChanged: (v) => setState(() => _employmentType = v),
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _incomeController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Monthly In-Hand Income (₹)',
                  prefixIcon: Icon(Icons.payments_outlined),
                ),
              ),
              const SizedBox(height: 16),

              // Consent Checkbox
              CheckboxListTile(
                value: _privacyConsent,
                onChanged: (v) => setState(() => _privacyConsent = v ?? false),
                contentPadding: EdgeInsets.zero,
                activeColor: AppColors.primaryMaroon,
                title: const Text(
                  'I authorize BAFS to contact me regarding my loan requirement and verify my eligibility in accordance with BAFS Privacy Policy.',
                  style: TextStyle(fontSize: 12, color: AppColors.textMedium),
                ),
              ),

              const SizedBox(height: 20),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitEnquiry,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Submit Loan Enquiry'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
