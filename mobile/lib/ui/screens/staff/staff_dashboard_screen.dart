import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/applications_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/leads_provider.dart';
import '../../widgets/bafs_badge.dart';

class StaffDashboardScreen extends ConsumerStatefulWidget {
  const StaffDashboardScreen({super.key});

  @override
  ConsumerState<StaffDashboardScreen> createState() => _StaffDashboardScreenState();
}

class _StaffDashboardScreenState extends ConsumerState<StaffDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(leadsNotifierProvider.notifier).fetchLeads();
      ref.read(applicationsNotifierProvider.notifier).fetchApplications();
    });
  }

  void _refreshAll() {
    ref.read(leadsNotifierProvider.notifier).fetchLeads();
    ref.read(applicationsNotifierProvider.notifier).fetchApplications();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final leadsState = ref.watch(leadsNotifierProvider);
    final appsState = ref.watch(applicationsNotifierProvider);
    final user = authState.user;

    final newLeadsCount = leadsState.leads.where((l) => l.isNew).length;
    final assignedLeadsCount = leadsState.leads.where((l) => l.assignedConsultantId == user?.id).length;
    final pendingAppsCount = appsState.applications.where((a) => a.isUnderReview).length;
    final totalDisbursedCount = appsState.applications.where((a) => a.isDisbursed).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Consultant & DSA CRM'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _refreshAll),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authNotifierProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _refreshAll(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Staff Header Card
              Container(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primaryDarkMaroon, AppColors.primaryMaroon],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(24),
                    bottomRight: Radius.circular(24),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          user?.designation ?? 'Consultant Workspace',
                          style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13),
                        ),
                        if (user != null) BafsBadge.role(user.role),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      user?.displayName ?? 'Staff Officer',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (user?.branchName != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Branch: ${user!.branchName!}',
                        style: const TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // KPI Counters Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Operational Overview',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildKpiCard(
                            title: 'New Enquiries',
                            count: '$newLeadsCount',
                            subtitle: 'Unassigned leads',
                            color: const Color(0xFF0284C7),
                            icon: Icons.mark_email_unread_outlined,
                            onTap: () => context.go('/staff/leads'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildKpiCard(
                            title: 'My Assigned Leads',
                            count: '$assignedLeadsCount',
                            subtitle: 'In follow-up',
                            color: AppColors.accentYellowGreen,
                            icon: Icons.assignment_ind_outlined,
                            onTap: () => context.go('/staff/leads'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildKpiCard(
                            title: 'In Verification',
                            count: '$pendingAppsCount',
                            subtitle: 'Active applications',
                            color: const Color(0xFFD97706),
                            icon: Icons.fact_check_outlined,
                            onTap: () => context.go('/staff/applications'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildKpiCard(
                            title: 'Disbursed',
                            count: '$totalDisbursedCount',
                            subtitle: 'Commission eligible',
                            color: const Color(0xFF16A34A),
                            icon: Icons.check_circle_outline,
                            onTap: () => context.go('/staff/commissions'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Quick Actions
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Quick Actions',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 12),
                        ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: const CircleAvatar(
                            backgroundColor: Color(0xFFE0F2FE),
                            child: Icon(Icons.person_add, color: Color(0xFF0284C7), size: 20),
                          ),
                          title: const Text('Browse New Unassigned Leads'),
                          subtitle: const Text('Self-assign open leads from customer website'),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                          onTap: () => context.go('/staff/leads'),
                        ),
                        const Divider(),
                        ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: const CircleAvatar(
                            backgroundColor: Color(0xFFFEF3C7),
                            child: Icon(Icons.verified, color: Color(0xFFD97706), size: 20),
                          ),
                          title: const Text('Review Loan Applications'),
                          subtitle: const Text('Check KYC documents and upload lender submissions'),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                          onTap: () => context.go('/staff/applications'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String count,
    required String subtitle,
    required Color color,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 22),
                Text(
                  count,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
