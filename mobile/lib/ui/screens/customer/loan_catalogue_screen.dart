import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/loan_product.dart';
import '../../../providers/loan_products_provider.dart';

class LoanCatalogueScreen extends ConsumerStatefulWidget {
  const LoanCatalogueScreen({super.key});

  @override
  ConsumerState<LoanCatalogueScreen> createState() => _LoanCatalogueScreenState();
}

class _LoanCatalogueScreenState extends ConsumerState<LoanCatalogueScreen> {
  String _selectedCategory = 'ALL';

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(loanProductsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Loan Products Catalogue'),
      ),
      body: Column(
        children: [
          // Filter Chips Row
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildCategoryChip('ALL', 'All Loans'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('PERSONAL', 'Personal'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('BUSINESS', 'Business'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('HOME', 'Home Loan'),
                  const SizedBox(width: 8),
                  _buildCategoryChip('LOAN_AGAINST_PROPERTY', 'LAP'),
                ],
              ),
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // Products List
          Expanded(
            child: productsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.cloud_off, size: 48, color: AppColors.textMuted),
                    const SizedBox(height: 12),
                    Text(
                      'Failed to load catalogue: $err',
                      style: const TextStyle(color: AppColors.textMedium),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => ref.refresh(loanProductsProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (products) {
                final filtered = products.where((p) {
                  if (_selectedCategory == 'ALL') return true;
                  return p.category.toUpperCase() == _selectedCategory.toUpperCase();
                }).toList();

                if (filtered.isEmpty) {
                  return const Center(
                    child: Text('No loan products found in this category.'),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final product = filtered[index];
                    return _buildProductCard(context, product);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String categoryKey, String label) {
    final isSelected = _selectedCategory == categoryKey;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() => _selectedCategory = categoryKey);
        }
      },
      selectedColor: AppColors.primaryMaroon,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textDark,
        fontSize: 13,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      backgroundColor: AppColors.surfaceMuted,
      checkmarkColor: Colors.white,
    );
  }

  Widget _buildProductCard(BuildContext context, LoanProduct product) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.accentLightGreen,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${product.minInterestRate}% - ${product.maxInterestRate}% p.a.',
                    style: const TextStyle(
                      color: Color(0xFF3B5311),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            if (product.description != null) ...[
              const SizedBox(height: 8),
              Text(
                product.description!,
                style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
              ),
            ],
            const SizedBox(height: 14),

            // Key Stats Grid
            Row(
              children: [
                Expanded(
                  child: _buildProductSpec(
                    'Max Amount',
                    '₹${(product.maxAmount / 100000).toStringAsFixed(1)} Lakhs',
                  ),
                ),
                Expanded(
                  child: _buildProductSpec(
                    'Max Tenure',
                    '${product.maxTenureMonths ~/ 12} Years',
                  ),
                ),
                Expanded(
                  child: _buildProductSpec(
                    'Processing Fee',
                    '${product.processingFeePercent}%',
                  ),
                ),
              ],
            ),

            if (product.requiredDocuments.isNotEmpty) ...[
              const SizedBox(height: 14),
              const Text(
                'Required Documents:',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 4),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: product.requiredDocuments.take(4).map((doc) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      doc,
                      style: const TextStyle(fontSize: 11, color: AppColors.textMedium),
                    ),
                  );
                }).toList(),
              ),
            ],

            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      context.push(
                        '/customer/emi?rate=${product.minInterestRate}&amount=${product.minAmount}',
                      );
                    },
                    child: const Text('Calculate EMI'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      context.push(
                        '/customer/apply?category=${product.category}&amount=${product.minAmount}',
                      );
                    },
                    child: const Text('Apply Now'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductSpec(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
          ),
        ),
      ],
    );
  }
}
