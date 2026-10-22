import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/config/api_endpoints.dart';
import '../core/config/env_config.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exception.dart';
import '../core/storage/secure_storage_service.dart';
import '../models/auth_user.dart';

// Service Providers
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final Provider<ApiClient> apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiClient(
    storage: storage,
    onSessionExpired: () {
      ref.read(authNotifierProvider.notifier).logout();
    },
  );
});

class ApiBaseUrlNotifier extends StateNotifier<String> {
  final ApiClient _api;

  ApiBaseUrlNotifier(this._api) : super(EnvConfig.apiBaseUrl) {
    _loadSavedUrl();
  }

  Future<void> _loadSavedUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString('custom_api_base_url');
      if (saved != null && saved.isNotEmpty) {
        EnvConfig.setRuntimeBaseUrl(saved);
        final resolved = EnvConfig.apiBaseUrl;
        _api.updateBaseUrl(resolved);
        state = resolved;
      }
    } catch (_) {}
  }

  Future<void> setBaseUrl(String newUrl) async {
    EnvConfig.setRuntimeBaseUrl(newUrl);
    final resolved = EnvConfig.apiBaseUrl;
    _api.updateBaseUrl(resolved);
    state = resolved;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('custom_api_base_url', resolved);
    } catch (_) {}
  }

  Future<void> resetToDefault() async {
    EnvConfig.setRuntimeBaseUrl(null);
    final resolved = EnvConfig.apiBaseUrl;
    _api.updateBaseUrl(resolved);
    state = resolved;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('custom_api_base_url');
    } catch (_) {}
  }
}

final apiBaseUrlProvider = StateNotifierProvider<ApiBaseUrlNotifier, String>((ref) {
  final api = ref.watch(apiClientProvider);
  return ApiBaseUrlNotifier(api);
});


// Auth State
class AuthState {
  final bool isLoading;
  final bool isOtpSent;
  final String? otpExpiresIn;
  final String? debugOtp;
  final AuthUser? user;
  final String? errorMessage;

  const AuthState({
    this.isLoading = false,
    this.isOtpSent = false,
    this.otpExpiresIn,
    this.debugOtp,
    this.user,
    this.errorMessage,
  });

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    bool? isLoading,
    bool? isOtpSent,
    String? otpExpiresIn,
    String? debugOtp,
    AuthUser? user,
    String? errorMessage,
    bool clearError = false,
    bool clearDebugOtp = false,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isOtpSent: isOtpSent ?? this.isOtpSent,
      otpExpiresIn: otpExpiresIn ?? this.otpExpiresIn,
      debugOtp: clearDebugOtp ? null : (debugOtp ?? this.debugOtp),
      user: user ?? this.user,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api;
  final SecureStorageService _storage;

  AuthNotifier(this._api, this._storage) : super(const AuthState()) {
    checkInitialAuth();
  }

  Future<void> checkInitialAuth() async {
    state = state.copyWith(isLoading: true, clearError: true);
    final hasToken = await _storage.hasValidToken();
    if (!hasToken) {
      state = state.copyWith(isLoading: false);
      return;
    }

    try {
      final response = await _api.get(ApiEndpoints.currentUser);
      final user = AuthUser.fromJson(response.data as Map<String, dynamic>);
      state = state.copyWith(isLoading: false, user: user);
    } catch (e) {
      await _storage.clearAll();
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> requestOtp(String mobileNumber) async {
    state = state.copyWith(isLoading: true, clearError: true, clearDebugOtp: true);
    try {
      final response = await _api.post(
        ApiEndpoints.requestOtp,
        data: {
          'mobile_number': mobileNumber,
          'purpose': 'login',
        },
      );

      final data = response.data as Map<String, dynamic>;
      final debugOtp = data['debug_otp'] as String?;
      final expiresIn = data['expires_in_minutes']?.toString();

      state = state.copyWith(
        isLoading: false,
        isOtpSent: true,
        debugOtp: debugOtp,
        otpExpiresIn: expiresIn,
      );
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to connect to BAFS service. Please check your network.',
      );
      return false;
    }
  }

  Future<bool> verifyOtp(String mobileNumber, String otp) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _api.post(
        ApiEndpoints.verifyOtp,
        data: {
          'mobile_number': mobileNumber,
          'otp': otp,
          'purpose': 'login',
        },
      );

      final data = response.data as Map<String, dynamic>;
      final accessToken = data['access_token'] as String;
      final refreshToken = data['refresh_token'] as String;

      await _storage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );

      // Fetch user profile
      final meResponse = await _api.get(ApiEndpoints.currentUser);
      final user = AuthUser.fromJson(meResponse.data as Map<String, dynamic>);

      state = state.copyWith(
        isLoading: false,
        isOtpSent: false,
        user: user,
      );
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'OTP verification failed. Please try again.',
      );
      return false;
    }
  }

  void resetOtp() {
    state = state.copyWith(isOtpSent: false, clearDebugOtp: true);
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _api.post('/auth/logout', data: {'refresh_token': refreshToken});
      }
    } catch (_) {
      // Ignore network failures to guarantee local session wipe
    } finally {
      await _storage.clearAll();
      state = const AuthState();
    }
  }
}

final StateNotifierProvider<AuthNotifier, AuthState> authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final api = ref.watch(apiClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(api, storage);
});
