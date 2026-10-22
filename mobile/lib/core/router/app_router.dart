import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../ui/screens/auth/login_screen.dart';
import '../../ui/screens/common/splash_screen.dart';
import '../../ui/screens/customer/application_create_screen.dart';
import '../../ui/screens/customer/application_detail_screen.dart';
import '../../ui/screens/customer/customer_applications_screen.dart';
import '../../ui/screens/customer/customer_home_screen.dart';
import '../../ui/screens/customer/customer_shell.dart';
import '../../ui/screens/customer/emi_calculator_screen.dart';
import '../../ui/screens/customer/loan_catalogue_screen.dart';
import '../../ui/screens/customer/loan_enquiry_screen.dart';
import '../../ui/screens/customer/profile_screen.dart';
import '../../ui/screens/staff/commissions_screen.dart';
import '../../ui/screens/staff/crm_leads_screen.dart';
import '../../ui/screens/staff/staff_applications_screen.dart';
import '../../ui/screens/staff/staff_dashboard_screen.dart';
import '../../ui/screens/staff/staff_shell.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isSplash = state.uri.path == '/';
      final isLoggingIn = state.uri.path == '/login';
      final isPublicTool = state.uri.path.startsWith('/customer/catalogue') ||
          state.uri.path.startsWith('/customer/emi') ||
          state.uri.path.startsWith('/customer/enquiry');

      if (isSplash) return null;

      // If unauthenticated, allow login and public tools
      if (!authState.isAuthenticated) {
        if (isLoggingIn || isPublicTool) return null;
        return '/login';
      }

      // If authenticated, prevent staying on /login
      if (isLoggingIn) {
        return authState.user!.isCustomer ? '/customer' : '/staff';
      }

      // Role isolation: Customers cannot access /staff
      if (authState.user!.isCustomer && state.uri.path.startsWith('/staff')) {
        return '/customer';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Customer Shell with Bottom Nav
      ShellRoute(
        builder: (context, state, child) => CustomerShell(child: child),
        routes: [
          GoRoute(
            path: '/customer',
            builder: (context, state) => const CustomerHomeScreen(),
          ),
          GoRoute(
            path: '/customer/applications',
            builder: (context, state) => const CustomerApplicationsScreen(),
          ),
          GoRoute(
            path: '/customer/catalogue',
            builder: (context, state) => const LoanCatalogueScreen(),
          ),
          GoRoute(
            path: '/customer/profile',
            builder: (context, state) => const CustomerProfileScreen(),
          ),
        ],
      ),

      // Customer Direct Feature Routes
      GoRoute(
        path: '/customer/apply',
        builder: (context, state) {
          final category = state.uri.queryParameters['category'];
          final amountStr = state.uri.queryParameters['amount'];
          final tenureStr = state.uri.queryParameters['tenure'];
          return ApplicationCreateScreen(
            initialCategory: category,
            initialAmount: amountStr != null ? double.tryParse(amountStr) : null,
            initialTenureMonths: tenureStr != null ? int.tryParse(tenureStr) : null,
          );
        },
      ),
      GoRoute(
        path: '/customer/application/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ApplicationDetailScreen(applicationId: id);
        },
      ),
      GoRoute(
        path: '/customer/emi',
        builder: (context, state) {
          final rateStr = state.uri.queryParameters['rate'];
          final amountStr = state.uri.queryParameters['amount'];
          return EmiCalculatorScreen(
            initialRate: rateStr != null ? double.tryParse(rateStr) ?? 9.5 : 9.5,
            initialAmount: amountStr != null ? double.tryParse(amountStr) ?? 2500000 : 2500000,
          );
        },
      ),
      GoRoute(
        path: '/customer/enquiry',
        builder: (context, state) => const LoanEnquiryScreen(),
      ),

      // Staff Shell with Bottom Nav
      ShellRoute(
        builder: (context, state, child) => StaffShell(child: child),
        routes: [
          GoRoute(
            path: '/staff',
            builder: (context, state) => const StaffDashboardScreen(),
          ),
          GoRoute(
            path: '/staff/leads',
            builder: (context, state) => const CrmLeadsScreen(),
          ),
          GoRoute(
            path: '/staff/applications',
            builder: (context, state) => const StaffApplicationsScreen(),
          ),
          GoRoute(
            path: '/staff/commissions',
            builder: (context, state) => const StaffCommissionsScreen(),
          ),
        ],
      ),
    ],
  );
});
