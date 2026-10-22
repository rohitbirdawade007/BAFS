import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/leads_provider.dart';
import '../../widgets/bafs_badge.dart';

class CrmLeadsScreen extends ConsumerStatefulWidget {
  const CrmLeadsScreen({super.key});

  @override
  ConsumerState<CrmLeadsScreen> createState() => _CrmLeadsScreenState();
}

class _CrmLeadsScreenState extends ConsumerState<CrmLeadsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(leadsNotifierProvider.notifier).fetchLeads();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final leadsState = ref.watch(leadsNotifierProvider);
    final user = ref.watch(authNotifierProvider).user;
    final filteredLeads = leadsState.filteredLeads;

    return Scaffold(
      appBar: AppBar(
        title: const Text('CRM Leads Inbox'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(leadsNotifierProvider.notifier).fetchLeads(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (v) => ref.read(leadsNotifierProvider.notifier).setSearchQuery(v),
                  decoration: InputDecoration(
                    hintText: 'Search by Name, Mobile, or REF...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              ref.read(leadsNotifierProvider.notifier).setSearchQuery('');
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildStatusFilter(null, 'All (${leadsState.leads.length})'),
                      const SizedBox(width: 8),
                      _buildStatusFilter('NEW', 'New (${leadsState.leads.where((l) => l.isNew).length})'),
                      const SizedBox(width: 8),
                      _buildStatusFilter('CONTACTED', 'Contacted'),
                      const SizedBox(width: 8),
                      _buildStatusFilter('QUALIFIED', 'Qualified'),
                      const SizedBox(width: 8),
                      _buildStatusFilter('CONVERTED', 'Converted'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // Leads List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(leadsNotifierProvider.notifier).fetchLeads(),
              child: leadsState.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filteredLeads.isEmpty
                      ? const Center(
                          child: Text('No leads found matching current criteria.'),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          itemCount: filteredLeads.length,
                          itemBuilder: (context, index) {
                            final lead = filteredLeads[index];
                            final isAssignedToMe = lead.assignedConsultantId == user?.id;

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
                                            lead.fullName,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                              color: AppColors.textDark,
                                            ),
                                          ),
                                        ),
                                        BafsBadge.status(lead.status),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        const Icon(Icons.phone, size: 14, color: AppColors.textMuted),
                                        const SizedBox(width: 6),
                                        Text(
                                          '+91 ${lead.mobileNumber}',
                                          style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
                                        ),
                                        if (lead.city != null) ...[
                                          const SizedBox(width: 12),
                                          const Icon(Icons.location_on, size: 14, color: AppColors.textMuted),
                                          const SizedBox(width: 4),
                                          Text(
                                            lead.city!,
                                            style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: AppColors.surfaceMuted,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            lead.loanCategory.replaceAll('_', ' '),
                                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                          ),
                                          Text(
                                            lead.requestedAmount != null
                                                ? '₹${lead.requestedAmount!.toStringAsFixed(0)}'
                                                : 'Amount Open',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.primaryMaroon,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Ref: ${lead.referenceNumber}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                        ),
                                        if (!lead.isAssigned)
                                          ElevatedButton.icon(
                                            onPressed: () async {
                                              final success = await ref
                                                  .read(leadsNotifierProvider.notifier)
                                                  .assignLeadToMe(lead.id);
                                              if (success && context.mounted) {
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(
                                                    content: Text('Lead ${lead.referenceNumber} assigned to you!'),
                                                    backgroundColor: AppColors.accentYellowGreen,
                                                  ),
                                                );
                                              }
                                            },
                                            icon: const Icon(Icons.person_add, size: 16),
                                            label: const Text('Assign to Me'),
                                            style: ElevatedButton.styleFrom(
                                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                              textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                            ),
                                          )
                                        else
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: isAssignedToMe
                                                  ? AppColors.accentLightGreen
                                                  : AppColors.surfaceMuted,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              isAssignedToMe ? 'Assigned to You' : 'Assigned to Staff',
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                                color: isAssignedToMe
                                                    ? const Color(0xFF3B5311)
                                                    : AppColors.textMedium,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusFilter(String? statusKey, String label) {
    final current = ref.watch(leadsNotifierProvider).filterStatus;
    final isSelected = current == statusKey || (statusKey == null && (current == null || current.isEmpty));

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) {
        ref.read(leadsNotifierProvider.notifier).setFilterStatus(statusKey);
      },
      selectedColor: AppColors.primaryMaroon,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textDark,
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      backgroundColor: AppColors.surfaceMuted,
    );
  }
}
