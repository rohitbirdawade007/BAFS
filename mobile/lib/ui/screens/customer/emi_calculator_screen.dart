import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class EmiCalculatorScreen extends StatefulWidget {
  final double initialAmount;
  final double initialRate;
  final int initialTenureYears;

  const EmiCalculatorScreen({
    super.key,
    this.initialAmount = 2500000,
    this.initialRate = 9.5,
    this.initialTenureYears = 15,
  });

  @override
  State<EmiCalculatorScreen> createState() => _EmiCalculatorScreenState();
}

class _EmiCalculatorScreenState extends State<EmiCalculatorScreen> {
  late double _amount;
  late double _rate;
  late int _tenureYears;

  @override
  void initState() {
    super.initState();
    _amount = widget.initialAmount;
    _rate = widget.initialRate;
    _tenureYears = widget.initialTenureYears;
  }

  // Exact standard EMI formula
  double get _monthlyEmi {
    final principal = _amount;
    final monthlyRate = _rate / (12 * 100);
    final totalMonths = _tenureYears * 12;

    if (monthlyRate == 0) return principal / totalMonths;

    final factor = pow(1 + monthlyRate, totalMonths).toDouble();
    return (principal * monthlyRate * factor) / (factor - 1);
  }

  double get _totalPayable => _monthlyEmi * (_tenureYears * 12);
  double get _totalInterest => _totalPayable - _amount;

  @override
  Widget build(BuildContext context) {
    final emi = _monthlyEmi;
    final totalPayable = _totalPayable;
    final totalInterest = _totalInterest;
    final interestRatio = totalPayable > 0 ? (totalInterest / totalPayable) : 0.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('EMI Calculator'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // EMI Highlight Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primaryMaroon, AppColors.primaryLightMaroon],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryMaroon.withOpacity(0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Text(
                    'ESTIMATED MONTHLY EMI',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '₹${emi.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white24),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildEmiStat('Principal', '₹${(_amount / 100000).toStringAsFixed(1)} L'),
                      _buildEmiStat('Total Interest', '₹${(totalInterest / 100000).toStringAsFixed(1)} L'),
                      _buildEmiStat('Total Payable', '₹${(totalPayable / 100000).toStringAsFixed(1)} L'),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Interest vs Principal Ratio Bar
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Payment Breakdown',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: Row(
                        children: [
                          Expanded(
                            flex: (max(1 - interestRatio, 0.05) * 100).toInt(),
                            child: Container(
                              height: 12,
                              color: AppColors.primaryMaroon,
                            ),
                          ),
                          Expanded(
                            flex: (max(interestRatio, 0.05) * 100).toInt(),
                            child: Container(
                              height: 12,
                              color: AppColors.accentGold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(width: 10, height: 10, color: AppColors.primaryMaroon),
                            const SizedBox(width: 6),
                            Text(
                              'Principal (${((1 - interestRatio) * 100).toStringAsFixed(0)}%)',
                              style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(width: 10, height: 10, color: AppColors.accentGold),
                            const SizedBox(width: 6),
                            Text(
                              'Interest (${(interestRatio * 100).toStringAsFixed(0)}%)',
                              style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Slider 1: Loan Amount
            _buildSliderCard(
              title: 'Loan Amount',
              displayValue: '₹${_amount.toStringAsFixed(0)}',
              value: _amount,
              min: 50000,
              max: 20000000,
              divisions: 199,
              onChanged: (v) => setState(() => _amount = v),
            ),

            const SizedBox(height: 12),

            // Slider 2: Interest Rate
            _buildSliderCard(
              title: 'Annual Interest Rate',
              displayValue: '${_rate.toStringAsFixed(2)}% p.a.',
              value: _rate,
              min: 7.5,
              max: 24.0,
              divisions: 66,
              onChanged: (v) => setState(() => _rate = v),
            ),

            const SizedBox(height: 12),

            // Slider 3: Loan Tenure
            _buildSliderCard(
              title: 'Tenure (Years)',
              displayValue: '$_tenureYears Years (${_tenureYears * 12} Months)',
              value: _tenureYears.toDouble(),
              min: 1,
              max: 30,
              divisions: 29,
              onChanged: (v) => setState(() => _tenureYears = v.toInt()),
            ),

            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: () {
                context.push('/customer/apply?amount=${_amount.toStringAsFixed(0)}&tenure=${_tenureYears * 12}');
              },
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Apply with this Amount & Tenure'),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildEmiStat(String title, String value) {
    return Column(
      children: [
        Text(
          title,
          style: const TextStyle(color: Colors.white60, fontSize: 11),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildSliderCard({
    required String title,
    required String displayValue,
    required double value,
    required double min,
    required double max,
    required int divisions,
    required ValueChanged<double> onChanged,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMedium,
                  ),
                ),
                Text(
                  displayValue,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryMaroon,
                  ),
                ),
              ],
            ),
            Slider(
              value: value.clamp(min, max),
              min: min,
              max: max,
              divisions: divisions,
              activeColor: AppColors.primaryMaroon,
              inactiveColor: AppColors.borderLight,
              onChanged: onChanged,
            ),
          ],
        ),
      ),
    );
  }
}
