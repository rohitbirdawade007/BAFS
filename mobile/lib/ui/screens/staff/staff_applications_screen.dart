import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/loan_application.dart';
import '../../../providers/applications_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../widgets/bafs_badge.dart';

class StaffApplicationsScreen extends ConsumerStatefulWidget {
  const StaffApplicationsScreen({super.key});

  @override
  ConsumerState<StaffApplicationsScreen> createState() => _StaffApplicationsScreenState();
}

class _StaffApplicationsScreenState extends ConsumerState<StaffApplicationsScreen> {
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
    final user = ref.watch(authNotifierProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Application Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(applicationsNotifierProvider.notifier).fetchApplications(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(applicationsNotifierProvider.notifier).fetchApplications(),
        child: appsState.isLoading
            ? const Center(child: CircularProgressIndicator())
            : appsState.applications.isEmpty
                ? const Center(child: Text('No applications in queue.'))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    itemCount: appsState.applications.length,
                    itemBuilder: (context, index) {
                      final app = appsState.applications[index];
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
                                      app.applicantName,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.textDark,
                                      ),
                                    ),
                                  ),
                                  BafsBadge.status(app.status),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Category: ${app.loanCategory.replaceAll('_', ' ')} • Mobile: ${app.applicantMobile}',
                                style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Requested Loan',
                                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                                      ),
                                      Text(
                                        '₹${app.requestedAmount.toStringAsFixed(0)}',
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primaryMaroon,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      const Text(
                                        'Docs & Submissions',
                                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                                      ),
                                      Text(
                                        '${app.documents.length} Docs / ${app.lenderSubmissions.length} Lenders',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              const Divider(height: 1),
                              const SizedBox(height: 10),

                              // Staff Action Row
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Ref: ${app.referenceNumber}',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                  Row(
                                    children: [
                                      if (user?.isVerifier == true)
                                        OutlinedButton(
                                          onPressed: () {
                                            _showVerifyModal(context, app);
                                          },
                                          style: OutlinedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                            textStyle: const TextStyle(fontSize: 11),
                                          ),
                                          child: const Text('Verify Docs'),
                                        ),
                                      const SizedBox(width: 8),
                                      if (user?.isConsultant == true)
                                        ElevatedButton(
                                          onPressed: () {
                                            _showLenderSubmitModal(context, app);
                                          },
                                          style: ElevatedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                            textStyle: const TextStyle(fontSize: 11),
                                          ),
                                          child: const Text('Submit Lender'),
                                        ),
                                    ],
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
    );
  }

  void _showVerifyModal(BuildContext context, LoanApplication app) {
    if (app.documents.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No documents uploaded for this application yet.')),
      );
      return;
    }

    final doc = app.documents.first;
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Verify Document'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Document: ${doc.originalFilename}'),
              Text('Category: ${doc.category}'),
              const SizedBox(height: 12),
              TextField(
                controller: notesController,
                decoration: const InputDecoration(
                  labelText: 'Verifier Notes',
                  hintText: 'e.g. Identity and PAN verified against NSDL records.',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            OutlinedButton(
              onPressed: () async {
                Navigator.pop(context);
                await ref.read(applicationsNotifierProvider.notifier).verifyDocument(
                      documentId: doc.id,
                      applicationId: app.id,
                      status: 'REJECTED',
                      notes: notesController.text,
                    );
                ref.read(applicationsNotifierProvider.notifier).fetchApplications();
              },
              child: const Text('Reject', style: TextStyle(color: AppColors.statusRejected)),
            ),
            ElevatedButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final nav = Navigator.of(context);
                nav.pop();
                final ok = await ref.read(applicationsNotifierProvider.notifier).verifyDocument(
                      documentId: doc.id,
                      applicationId: app.id,
                      status: 'VERIFIED',
                      notes: notesController.text,
                    );
                if (ok && mounted) {
                  messenger.showSnackBar(
                    const SnackBar(
                      content: Text('Document marked as VERIFIED!'),
                      backgroundColor: AppColors.accentYellowGreen,
                    ),
                  );
                }
                ref.read(applicationsNotifierProvider.notifier).fetchApplications();
              },
              child: const Text('Approve / Verify'),
            ),
          ],
        );
      },
    );
  }

  void _showLenderSubmitModal(BuildContext context, LoanApplication app) {
    final refController = TextEditingController(text: 'HDFC-${DateTime.now().millisecondsSinceEpoch % 100000}');
    final notesController = TextEditingController(text: 'Submitted prime file for processing');
    String selectedLenderId = 'b0000000-0000-0000-0000-000000000001'; // Default seed Lender UUID

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Submit to Partner Lender'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: selectedLenderId,
                decoration: const InputDecoration(labelText: 'Partner Lender'),
                items: const [
                  DropdownMenuItem(
                    value: 'b0000000-0000-0000-0000-000000000001',
                    child: Text('HDFC Bank Ltd'),
                  ),
                  DropdownMenuItem(
                    value: 'b0000000-0000-0000-0000-000000000002',
                    child: Text('ICICI Bank Ltd'),
                  ),
                  DropdownMenuItem(
                    value: 'b0000000-0000-0000-0000-000000000003',
                    child: Text('State Bank of India'),
                  ),
                  DropdownMenuItem(
                    value: 'b0000000-0000-0000-0000-000000000004',
                    child: Text('Tata Capital Financial'),
                  ),
                ],
                onChanged: (v) {
                  if (v != null) selectedLenderId = v;
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: refController,
                decoration: const InputDecoration(
                  labelText: 'Lender External Reference / Lead ID',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesController,
                decoration: const InputDecoration(labelText: 'Submission Notes'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final messenger = ScaffoldMessenger.of(context);
                final nav = Navigator.of(context);
                nav.pop();
                final ok = await ref.read(applicationsNotifierProvider.notifier).submitToLender(
                      applicationId: app.id,
                      lenderId: selectedLenderId,
                      externalReference: refController.text.trim(),
                      internalNotes: notesController.text.trim(),
                    );
                if (ok && mounted) {
                  messenger.showSnackBar(
                    const SnackBar(
                      content: Text('Application submitted to lender successfully!'),
                      backgroundColor: AppColors.accentYellowGreen,
                    ),
                  );
                }
                ref.read(applicationsNotifierProvider.notifier).fetchApplications();
              },
              child: const Text('Submit to Lender'),
            ),
          ],
        );
      },
    );
  }
}
