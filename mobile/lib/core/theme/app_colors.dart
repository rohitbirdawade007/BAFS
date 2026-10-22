import 'package:flutter/material.dart';

/// BAFS Brand Colors according to visiting card and corporate identity
class AppColors {
  AppColors._();

  // Primary BAFS Maroon
  static const Color primaryMaroon = Color(0xFF6B1724);
  static const Color primaryDarkMaroon = Color(0xFF4A0E17);
  static const Color primaryLightMaroon = Color(0xFF8B2635);

  // Accent Yellow-Green / Golden Olive
  static const Color accentYellowGreen = Color(0xFF7A9A3B);
  static const Color accentGold = Color(0xFFD4AF37);
  static const Color accentLightGreen = Color(0xFFEBF3D8);

  // Background & Surfaces
  static const Color background = Color(0xFFF8F9FA);
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF1F3F5);

  // Neutral & Typography
  static const Color textDark = Color(0xFF1E293B);
  static const Color textMedium = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFE2E8F0);

  // Status & Alerts
  static const Color statusSubmitted = Color(0xFF0284C7); // Sky Blue
  static const Color statusUnderReview = Color(0xFFD97706); // Amber
  static const Color statusApproved = Color(0xFF16A34A); // Emerald Green
  static const Color statusRejected = Color(0xFFDC2626); // Crimson Red
  static const Color statusDisbursed = Color(0xFF7C3AED); // Purple
  static const Color statusDraft = Color(0xFF64748B); // Slate

  // Role Badges
  static const Color roleCustomer = Color(0xFF0284C7);
  static const Color roleConsultant = Color(0xFF7A9A3B);
  static const Color roleAdmin = Color(0xFF6B1724);
  static const Color roleVerifier = Color(0xFFD97706);
}
