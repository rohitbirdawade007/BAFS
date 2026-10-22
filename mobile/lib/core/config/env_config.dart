import 'dart:io';
import 'package:flutter/foundation.dart';

class EnvConfig {
  EnvConfig._();

  /// Default local development port for FastAPI
  static const int defaultPort = 8000;

  /// Override API base URL via --dart-define=API_BASE_URL=https://api.yourdomain.com
  static const String _overrideBaseUrl = String.fromEnvironment('API_BASE_URL');

  /// Dynamic runtime override (persisted across app restarts)
  static String? _runtimeBaseUrl;

  /// Known default IP endpoints for rapid developer switching
  static const String defaultLanBaseUrl = 'http://10.35.218.102:8000/api/v1';
  static const String defaultEmulatorBaseUrl = 'http://10.0.2.2:8000/api/v1';
  static const String defaultProductionBaseUrl = 'https://api.bafs.in/api/v1';

  /// Sets or clears runtime base URL override
  static void setRuntimeBaseUrl(String? url) {
    if (url == null || url.trim().isEmpty) {
      _runtimeBaseUrl = null;
    } else {
      String clean = url.trim();
      while (clean.endsWith('/')) {
        clean = clean.substring(0, clean.length - 1);
      }
      if (!clean.endsWith('/api/v1')) {
        clean = '$clean/api/v1';
      }
      _runtimeBaseUrl = clean;
    }
  }

  /// Returns current active runtime override if set
  static String? get runtimeBaseUrl => _runtimeBaseUrl;

  /// Resolves the correct base URL based on runtime settings, compile flags, and platform
  static String get apiBaseUrl {
    if (_runtimeBaseUrl != null && _runtimeBaseUrl!.isNotEmpty) {
      return _runtimeBaseUrl!;
    }

    if (_overrideBaseUrl.isNotEmpty) {
      return _overrideBaseUrl;
    }

    if (kReleaseMode) {
      // In release mode, unconfigured base URL must not silently default to cleartext localhost
      debugPrint('WARNING: API_BASE_URL not configured for release build! Defaulting to secure production endpoint.');
      return defaultProductionBaseUrl;
    }

    if (kIsWeb) {
      return 'http://127.0.0.1:$defaultPort/api/v1';
    }

    if (Platform.isAndroid) {
      // Physical Android handset on Wi-Fi hotspot or local network defaults to host IP
      return defaultLanBaseUrl;
    }

    // iOS Simulator, macOS, Windows desktop, Linux
    return 'http://127.0.0.1:$defaultPort/api/v1';
  }

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);
}

