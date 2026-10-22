import 'dart:io';
import 'package:flutter/foundation.dart';

class EnvConfig {
  EnvConfig._();

  /// Default local development port for FastAPI
  static const int defaultPort = 8000;

  /// Override API base URL via --dart-define=API_BASE_URL=https://api.yourdomain.com
  static const String _overrideBaseUrl = String.fromEnvironment('API_BASE_URL');

  /// Resolves the correct base URL based on platform
  static String get apiBaseUrl {
    if (_overrideBaseUrl.isNotEmpty) {
      return _overrideBaseUrl;
    }

    if (kReleaseMode) {
      // In release mode, unconfigured base URL must not silently default to cleartext localhost
      debugPrint('WARNING: API_BASE_URL not configured for release build! Defaulting to secure production endpoint.');
      return 'https://api.bafs.in/api/v1';
    }

    if (kIsWeb) {
      return 'http://127.0.0.1:$defaultPort/api/v1';
    }

    if (Platform.isAndroid) {
      // Android emulator connects to host localhost via 10.0.2.2
      return 'http://10.0.2.2:$defaultPort/api/v1';
    }

    // iOS Simulator, macOS, Windows desktop, Linux
    return 'http://127.0.0.1:$defaultPort/api/v1';
  }

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);
}
