import 'package:dio/dio.dart';
import '../storage/secure_storage_service.dart';
import '../config/api_endpoints.dart';
import '../config/env_config.dart';

class AuthInterceptor extends QueuedInterceptor {
  final SecureStorageService _storage;
  final Dio _dio;
  final void Function()? onSessionExpired;

  AuthInterceptor({
    required SecureStorageService storage,
    required Dio dio,
    this.onSessionExpired,
  })  : _storage = storage,
        _dio = dio;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Skip auth header for login and OTP endpoints
    final path = options.path;
    final isPublic = path.contains(ApiEndpoints.requestOtp) ||
        path.contains(ApiEndpoints.verifyOtp) ||
        path.contains(ApiEndpoints.refreshToken);

    if (!isPublic) {
      final token = await _storage.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    return handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Prevent infinite loop if the 401 came from the refresh endpoint itself
      if (err.requestOptions.path.contains(ApiEndpoints.refreshToken)) {
        await _storage.clearAll();
        onSessionExpired?.call();
        return handler.next(err);
      }

      // Check if token was already refreshed by a concurrent request
      final currentAccessToken = await _storage.getAccessToken();
      final requestAuthHeader = err.requestOptions.headers['Authorization'] as String?;
      if (currentAccessToken != null &&
          requestAuthHeader != null &&
          requestAuthHeader != 'Bearer $currentAccessToken') {
        // Retry immediately with the already refreshed access token
        try {
          final options = err.requestOptions;
          options.headers['Authorization'] = 'Bearer $currentAccessToken';
          final retryResponse = await _dio.fetch(options);
          return handler.resolve(retryResponse);
        } catch (_) {
          // If retry fails, continue to normal error handling
        }
      }

      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          // Attempt token refresh via isolated Dio instance to avoid infinite loop
          final refreshDio = Dio(BaseOptions(
            baseUrl: EnvConfig.apiBaseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
          ));

          final refreshResponse = await refreshDio.post(
            ApiEndpoints.refreshToken,
            data: {'refresh_token': refreshToken},
          );

          if (refreshResponse.statusCode == 200) {
            final data = refreshResponse.data;
            final newAccessToken = data['access_token'] as String;
            final newRefreshToken = (data['refresh_token'] as String?) ?? refreshToken;

            await _storage.saveTokens(
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            );

            // Retry the original request with new token
            final options = err.requestOptions;
            options.headers['Authorization'] = 'Bearer $newAccessToken';

            final retryResponse = await _dio.fetch(options);
            return handler.resolve(retryResponse);
          }
        } catch (refreshErr) {
          // Token refresh failed - session expired
          await _storage.clearAll();
          onSessionExpired?.call();
          return handler.reject(err);
        }
      } else {
        await _storage.clearAll();
        onSessionExpired?.call();
      }
    }

    return handler.next(err);
  }
}
