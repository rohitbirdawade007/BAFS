import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/config/env_config.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    final prefs = await SharedPreferences.getInstance();
    final savedBaseUrl = prefs.getString('custom_api_base_url');
    if (savedBaseUrl != null && savedBaseUrl.isNotEmpty) {
      EnvConfig.setRuntimeBaseUrl(savedBaseUrl);
    }
  } catch (_) {
    // Graceful fallback to default configuration
  }

  runApp(
    const ProviderScope(
      child: BafsMobileApp(),
    ),
  );
}


class BafsMobileApp extends ConsumerWidget {
  const BafsMobileApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Birdawade Associates & Financial Services',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
