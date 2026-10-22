import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/applications_provider.dart';
import '../../../providers/auth_provider.dart';

class ApplicationCreateScreen extends ConsumerStatefulWidget {
  final String? initialCategory;
  final double? initialAmount;
  final int? initialTenureMonths;

  const ApplicationCreateScreen({
    super.key,
    this.initialCategory,
    this.initialAmount,
    this.initialTenureMonths,
  });

  @override
  ConsumerState<ApplicationCreateScreen> createState() => _ApplicationCreateScreenState();
}

class _ApplicationCreateScreenState extends ConsumerState<ApplicationCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _amountController;
  late TextEditingController _tenureController;
  late TextEditingController _incomeController;
  late TextEditingController _existingEmiController;
  late TextEditingController _purposeController;

  late String _category;
  String? _employmentType = 'SALARIED';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final authUser = ref.read(authNotifierProvider).user;
    _category = widget.initialCategory ?? 'PERSONAL';
    _nameController = TextEditingController(text: authUser?.fullName ?? '');
    _phoneController = TextEditingController(text: authUser?.phone ?? '');
    _amountController = TextEditingController(
      text: widget.initialAmount != null ? widget.initialAmount!.toStringAsFixed(0) : '500000',
    );
    _tenureController = TextEditingController(
      text: widget.initialTenureMonths != null ? widget.initialTenureMonths.toString() : '60',
    );
    _incomeController = TextEditingController(text: '75000');
    _existingEmiController = TextEditingController(text: '0');
    _purposeController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _amountController.dispose();
    _tenureController.dispose();
    _incomeController.dispose();
    _existingEmiController.dispose();
    _purposeController.dispose();
    super.dispose();
  }

  void _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    final app = await ref.read(applicationsNotifierProvider.notifier).createApplication(
      loanCategory: _category,
      requestedAmount: double.parse(_amountController.text.trim()),
      requestedTenureMonths: int.tryParse(_tenureController.text.trim()),
      purpose: _purposeController.text.trim().isNotEmpty ? _purposeController.text.trim() : null,
      applicantName: _nameController.text.trim(),
      applicantMobile: _phoneController.text.trim(),
      employmentType: _employmentType,
      monthlyIncome: double.tryParse(_incomeController.text.trim()),
      existingEmi: double.tryParse(_existingEmiController.text.trim()),
    );
    setState(() => _isSubmitting = false);

    if (app != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Application ${app.referenceNumber} created successfully!'),
          backgroundColor: AppColors.accentYellowGreen,
        ),
      );
      context.go('/customer/application/${app.id}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Loan Application'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Applicant & Financial Details',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Please provide accurate details to accelerate bank verification.',
                style: TextStyle(fontSize: 13, color: AppColors.textMedium),
              ),
              const SizedBox(height: 20),

              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Applicant Full Name *',
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Applicant Mobile Number *',
                  prefixIcon: Icon(Icons.phone),
                ),
                validator: (v) => v == null || v.trim().isEmpty ? 'Phone is required' : null,
              ),
              const SizedBox(height: 14),

              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(
                  labelText: 'Loan Category *',
                  prefixIcon: Icon(Icons.category),
                ),
                items: const [
                  DropdownMenuItem(value: 'PERSONAL', child: Text('Personal Loan')),
                  DropdownMenuItem(value: 'BUSINESS', child: Text('Business Loan')),
                  DropdownMenuItem(value: 'HOME', child: Text('Home Loan')),
                  DropdownMenuItem(value: 'LOAN_AGAINST_PROPERTY', child: Text('Loan Against Property')),
                  DropdownMenuItem(value: 'VEHICLE', child: Text('Vehicle Loan')),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _category = v);
                },
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Amount (₹) *',
                        prefixIcon: Icon(Icons.currency_rupee),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Required';
                        final num = double.tryParse(v);
                        if (num == null || num <= 0) return 'Invalid';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      controller: _tenureController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Tenure (Mo)',
                        suffixText: 'Mo',
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              DropdownButtonFormField<String>(
                value: _employmentType,
                decoration: const InputDecoration(
                  labelText: 'Employment Type',
                  prefixIcon: Icon(Icons.work),
                ),
                items: const [
                  DropdownMenuItem(value: 'SALARIED', child: Text('Salaried')),
                  DropdownMenuItem(value: 'SELF_EMPLOYED', child: Text('Self-Employed Professional')),
                  DropdownMenuItem(value: 'BUSINESS_OWNER', child: Text('Business Owner')),
                ],
                onChanged: (v) => setState(() => _employmentType = v),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _incomeController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Monthly Income (₹)',
                        prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _existingEmiController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Existing EMIs (₹)',
                        prefixIcon: Icon(Icons.money_off_outlined),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _purposeController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Loan Purpose (Optional)',
                  hintText: 'e.g. Home Renovation, Business Equipment, Working Capital',
                ),
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitApplication,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Submit Application'),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
