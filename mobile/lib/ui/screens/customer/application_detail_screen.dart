import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/loan_application.dart';
import '../../../providers/applications_provider.dart';
import '../../widgets/bafs_badge.dart';

class ApplicationDetailScreen extends ConsumerStatefulWidget {
  final String applicationId;

  const ApplicationDetailScreen({super.key, required this.applicationId});

  @override
  ConsumerState<ApplicationDetailScreen> createState() => _ApplicationDetailScreenState();
}

class _ApplicationDetailScreenState extends ConsumerState<ApplicationDetailScreen> {
  LoanApplication? _application;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    setState(() => _isLoading = true);
    final app = await ref
        .read(applicationsNotifierProvider.notifier)
        .fetchApplicationDetail(widget.applicationId);
    if (mounted) {
      setState(() {
        _application = app;
        _isLoading = false;
      });
    }
  }

  void _showUploadDialog() {
    String selectedCategory = 'PAN_CARD';
    final filenameController = TextEditingController(text: 'pan_card.pdf');
    bool isUploading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
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
                  const Text(
                    'Upload Verification Document',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Documents are stored in encrypted private storage.',
                    style: TextStyle(fontSize: 12, color: AppColors.textMedium),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: selectedCategory,
                    decoration: const InputDecoration(labelText: 'Document Type'),
                    items: const [
                      DropdownMenuItem(value: 'PAN_CARD', child: Text('PAN Card')),
                      DropdownMenuItem(value: 'AADHAAR_MASKED', child: Text('Masked Aadhaar Card')),
                      DropdownMenuItem(value: 'SALARY_SLIP', child: Text('Salary Slip (Recent)')),
                      DropdownMenuItem(value: 'BANK_STATEMENT', child: Text('Bank Statement (6 Months)')),
                      DropdownMenuItem(value: 'ITR', child: Text('Income Tax Return (ITR)')),
                      DropdownMenuItem(value: 'PROPERTY_DOCUMENT', child: Text('Property / Title Document')),
                    ],
                    onChanged: (v) {
                      if (v != null) {
                        setModalState(() {
                          selectedCategory = v;
                          filenameController.text = '${v.toLowerCase()}.pdf';
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: filenameController,
                    decoration: const InputDecoration(
                      labelText: 'File Name',
                      prefixIcon: Icon(Icons.attach_file),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: isUploading
                        ? null
                        : () async {
                            final messenger = ScaffoldMessenger.of(context);
                            final nav = Navigator.of(context);
                            setModalState(() => isUploading = true);
                            final bytes = utf8.encode(
                              '%PDF-1.4 Simulated Document Payload for ${filenameController.text}',
                            );

                            final success = await ref
                                .read(applicationsNotifierProvider.notifier)
                                .uploadDocument(
                                  applicationId: widget.applicationId,
                                  category: selectedCategory,
                                  filename: filenameController.text.trim(),
                                  bytes: bytes,
                                  mimeType: 'application/pdf',
                                );

                            if (mounted) {
                              nav.pop();
                              if (success) {
                                messenger.showSnackBar(
                                  const SnackBar(
                                    content: Text('Document uploaded successfully to private storage!'),
                                    backgroundColor: AppColors.accentYellowGreen,
                                  ),
                                );
                                _loadDetails();
                              } else {
                                messenger.showSnackBar(
                                  const SnackBar(
                                    content: Text('Upload failed. Please check storage connection.'),
                                    backgroundColor: AppColors.statusRejected,
                                  ),
                                );
                              }
                            }
                          },
                    icon: isUploading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.cloud_upload_outlined),
                    label: Text(isUploading ? 'Uploading...' : 'Upload Document'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Application Details')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_application == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Application Details')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Application not found or unauthorized.'),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _loadDetails, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    final app = _application!;

    return Scaffold(
      appBar: AppBar(
        title: Text(app.referenceNumber),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadDetails),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDetails,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            app.loanCategory.replaceAll('_', ' '),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textDark,
                            ),
                          ),
                          BafsBadge.status(app.status),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildDetailColumn('Requested Amount', '₹${app.requestedAmount.toStringAsFixed(0)}'),
                          _buildDetailColumn('Applicant', app.applicantName),
                          _buildDetailColumn('Tenure', '${app.requestedTenureMonths ?? 60} Mo'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Status Stepper Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Application Lifecycle',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const SizedBox(height: 12),
                      _buildStatusStep('1. Enquiry Registered', true, isCurrent: app.status == 'ENQUIRY_RECEIVED'),
                      _buildStatusStep('2. Document Verification', app.documents.isNotEmpty, isCurrent: app.status.contains('VERIF')),
                      _buildStatusStep('3. Submitted to Lender', app.lenderSubmissions.isNotEmpty, isCurrent: app.status.contains('SUBMITTED')),
                      _buildStatusStep('4. Lender Approval', app.isApproved, isCurrent: app.status.contains('APPROVED')),
                      _buildStatusStep('5. Loan Disbursed', app.isDisbursed, isCurrent: app.isDisbursed),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Documents Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Uploaded Documents',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          Text(
                            '${app.documents.length} files',
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      if (app.documents.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Text(
                            'No documents uploaded yet. Upload KYC to speed up verification.',
                            style: TextStyle(fontSize: 13, color: AppColors.textMedium),
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: app.documents.length,
                          separatorBuilder: (_, __) => const Divider(height: 12),
                          itemBuilder: (context, index) {
                            final doc = app.documents[index];
                            return Row(
                              children: [
                                const Icon(Icons.picture_as_pdf, color: AppColors.primaryMaroon, size: 28),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        doc.originalFilename,
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        '${doc.category} • ${doc.formattedFileSize}',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                      ),
                                    ],
                                  ),
                                ),
                                BafsBadge.status(doc.verificationStatus),
                              ],
                            );
                          },
                        ),
                      const SizedBox(height: 14),
                      OutlinedButton.icon(
                        onPressed: _showUploadDialog,
                        icon: const Icon(Icons.upload_file),
                        label: const Text('Upload Document'),
                      ),
                    ],
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

  Widget _buildDetailColumn(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textDark),
        ),
      ],
    );
  }

  Widget _buildStatusStep(String title, bool isDone, {bool isCurrent = false}) {
    Color color = isDone ? AppColors.accentYellowGreen : AppColors.textMuted;
    if (isCurrent) color = AppColors.primaryMaroon;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(
            isDone ? Icons.check_circle : (isCurrent ? Icons.radio_button_checked : Icons.radio_button_unchecked),
            size: 18,
            color: color,
          ),
          const SizedBox(width: 10),
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
              color: isDone || isCurrent ? AppColors.textDark : AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
