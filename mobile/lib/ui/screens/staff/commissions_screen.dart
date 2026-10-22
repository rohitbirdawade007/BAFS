import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/commission_entry.dart';
import '../../../providers/auth_provider.dart';
import '../../widgets/bafs_badge.dart';

class StaffCommissionsScreen extends ConsumerStatefulWidget {
  const StaffCommissionsScreen({super.key});

  @override
  ConsumerState<StaffCommissionsScreen> createState() => _StaffCommissionsScreenState();
}

class _StaffCommissionsScreenState extends ConsumerState<StaffCommissionsScreen> {
  List<CommissionEntry> _commissions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCommissions();
  }

  Future<void> _fetchCommissions() async {
    setState(() => _isLoading = true);
    final api = ref.read(apiClientProvider);
    try {
      final response = await api.get(ApiEndpoints.commissions);
      final dynamic raw = response.data;
      final List<dynamic> list = raw is List
          ? raw
          : (raw is Map && raw['items'] is List
              ? raw['items'] as List<dynamic>
              : <dynamic>[]);
      final entries = list.map((e) => CommissionEntry.fromJson(e as Map<String, dynamic>)).toList();
      if (mounted) {
        setState(() {
          _commissions = entries;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalExpected = _commissions.fold<double>(0, (sum, c) => sum + c.expectedCommission);
    final totalReceived = _commissions.fold<double>(0, (sum, c) => sum + (c.receivedAmount ?? 0));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Commissions & Payouts'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchCommissions),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchCommissions,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Summary Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.accentYellowGreen, Color(0xFF5A7525)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accentYellowGreen.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Expected Commission',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '₹${totalExpected.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(height: 36, width: 1, color: Colors.white30),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(left: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Received & Reconciled',
                              style: TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '₹${totalReceived.toStringAsFixed(0)}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              const Text(
                'Commission Entries',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark),
              ),
              const SizedBox(height: 10),

              if (_isLoading)
                const Center(
                  child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()),
                )
              else if (_commissions.isEmpty)
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(
                      child: Text('No commission entries generated yet. Disburse loans to earn revenue.'),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _commissions.length,
                  itemBuilder: (context, index) {
                    final entry = _commissions[index];
                    return Card(
                      child: ListTile(
                        title: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Basis: ₹${entry.commissionBasis.toStringAsFixed(0)}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            BafsBadge.status(entry.status),
                          ],
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Expected: ₹${entry.expectedCommission.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  color: AppColors.primaryMaroon,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              if (entry.receivedAmount != null)
                                Text(
                                  'Received: ₹${entry.receivedAmount!.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    color: AppColors.accentYellowGreen,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
