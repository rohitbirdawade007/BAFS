import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/auth_provider.dart';
import '../../widgets/bafs_badge.dart';

class CustomerProfileScreen extends ConsumerWidget {
  const CustomerProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile & Support'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // User Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: AppColors.primaryMaroon.withValues(alpha: 0.1),
                      child: Text(
                        user != null && user.displayName.isNotEmpty
                            ? user.displayName.substring(0, 1).toUpperCase()
                            : 'C',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryMaroon,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      user?.displayName ?? 'Valued Customer',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.phone != null ? '+91 ${user!.phone}' : '',
                      style: const TextStyle(fontSize: 14, color: AppColors.textMedium),
                    ),
                    const SizedBox(height: 8),
                    if (user != null) BafsBadge.role(user.role),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Corporate Support & Partner Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Birdawade Associates & Financial Services',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Authorized DSA & Multi-Bank Loan Advisory',
                      style: TextStyle(fontSize: 12, color: AppColors.textMedium),
                    ),
                    const SizedBox(height: 16),
                    _buildContactRow(Icons.email_outlined, 'Support Email', 'birdawadeassociate@gmail.com'),
                    const SizedBox(height: 12),
                    _buildContactRow(Icons.phone_outlined, 'Helpline', '+91 98765 43210'),
                    const SizedBox(height: 12),
                    _buildContactRow(Icons.location_on_outlined, 'Corporate Office', 'Pune, Maharashtra, India'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Security & Privacy
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Security & Compliance',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Your data is protected under RBI Digital Lending Guidelines and 256-bit encryption.',
                      style: TextStyle(fontSize: 12, color: AppColors.textMedium),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: () async {
                await ref.read(authNotifierProvider.notifier).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.statusRejected,
              ),
              icon: const Icon(Icons.logout),
              label: const Text('Sign Out'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppColors.primaryMaroon),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
      ],
    );
  }
}
