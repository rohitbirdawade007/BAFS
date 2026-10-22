import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class BafsBadge extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;
  final IconData? icon;

  const BafsBadge({
    super.key,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
    this.icon,
  });

  factory BafsBadge.status(String status) {
    Color bg = AppColors.surfaceMuted;
    Color fg = AppColors.textMedium;
    final s = status.toUpperCase();

    if (s.contains('NEW') || s.contains('ENQUIRY_RECEIVED')) {
      bg = const Color(0xFFE0F2FE);
      fg = const Color(0xFF0369A1);
    } else if (s.contains('VERIF') || s.contains('REVIEW') || s.contains('CONTACT')) {
      bg = const Color(0xFFFEF3C7);
      fg = const Color(0xFFB45309);
    } else if (s.contains('APPROVED') || s.contains('QUALIFIED') || s.contains('CONVERTED')) {
      bg = const Color(0xFFDCFCE7);
      fg = const Color(0xFF15803D);
    } else if (s.contains('REJECTED') || s.contains('LOST') || s.contains('SPAM')) {
      bg = const Color(0xFFFEE2E2);
      fg = const Color(0xFFB91C1C);
    } else if (s.contains('DISBURSED') || s.contains('CONFIRMED')) {
      bg = const Color(0xFFF3E8FF);
      fg = const Color(0xFF7E22CE);
    }

    return BafsBadge(
      label: status.replaceAll('_', ' '),
      backgroundColor: bg,
      textColor: fg,
    );
  }

  factory BafsBadge.role(String role) {
    Color bg = AppColors.surfaceMuted;
    Color fg = AppColors.textMedium;
    final r = role.toUpperCase();

    if (r == 'CUSTOMER') {
      bg = const Color(0xFFE0F2FE);
      fg = const Color(0xFF0284C7);
    } else if (r.contains('CONSULTANT') || r.contains('DSA')) {
      bg = const Color(0xFFEBF3D8);
      fg = const Color(0xFF5A7525);
    } else if (r.contains('ADMIN')) {
      bg = const Color(0xFFFCE7F3);
      fg = AppColors.primaryMaroon;
    } else if (r.contains('VERIFIER')) {
      bg = const Color(0xFFFEF3C7);
      fg = const Color(0xFFB45309);
    }

    return BafsBadge(
      label: role.replaceAll('_', ' '),
      backgroundColor: bg,
      textColor: fg,
      icon: Icons.shield_outlined,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: textColor,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}
