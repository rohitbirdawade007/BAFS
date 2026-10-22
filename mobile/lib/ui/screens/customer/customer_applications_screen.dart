import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/applications_provider.dart';
import '../../widgets/bafs_badge.dart';

class CustomerApplicationsScreen extends ConsumerStatefulWidget {
  const CustomerApplicationsScreen({super.key});

  @override
  ConsumerState<CustomerApplicationsScreen> createState() => _CustomerApplicationsScreenState();
}

class _CustomerApplicationsScreenState extends ConsumerState<CustomerApplicationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(applicationsNotifierProvider.notifier).fetchApplications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final appsState = ref.watch(applicationsNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/customer/apply'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(applicationsNotifierProvider.notifier).fetchApplications(),
        child: appsState.isLoading
            ? const Center(child: CircularProgressIndicator())
            : appsState.applications.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.folder_open, size: 64, color: AppColors.textMuted),
                          const SizedBox(height: 16),
                          const Text(
                            'No loan applications found',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Apply online to receive loan offers from 40+ lenders.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppColors.textMedium, fontSize: 13),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: () => context.push('/customer/apply'),
                            icon: const Icon(Icons.add),
                            label: const Text('New Loan Application'),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    itemCount: appsState.applications.length,
                    itemBuilder: (context, index) {
                      final app = appsState.applications[index];
                      return Card(
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          title: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                app.loanCategory.replaceAll('_', ' '),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              BafsBadge.status(app.status),
                            ],
                          ),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '₹${app.requestedAmount.toStringAsFixed(0)}',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primaryMaroon,
                                      ),
                                    ),
                                    Text(
                                      '${app.documents.length} Docs Uploaded',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Ref: ${app.referenceNumber}',
                                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                ),
                              ],
                            ),
                          ),
                          trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted),
                          onTap: () => context.push('/customer/application/${app.id}'),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
