import 'package:dio/dio.dart';
import '../config/env_config.dart';
import '../storage/secure_storage_service.dart';
import 'auth_interceptor.dart';
import 'api_exception.dart';

class ApiClient {
  final Dio dio;
  final SecureStorageService storage;

  ApiClient({
    required this.storage,
    Dio? customDio,
    void Function()? onSessionExpired,
  }) : dio = customDio ??
            Dio(
              BaseOptions(
                baseUrl: EnvConfig.apiBaseUrl,
                connectTimeout: EnvConfig.connectTimeout,
                receiveTimeout: EnvConfig.receiveTimeout,
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              ),
            ) {
    dio.interceptors.add(
      AuthInterceptor(
        storage: storage,
        dio: dio,
        onSessionExpired: onSessionExpired,
      ),
    );
  }

  ApiException _handleDioError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.connectionError) {
      return NetworkException();
    }

    final response = error.response;
    if (response != null) {
      final statusCode = response.statusCode;
      final data = response.data;
      String message = 'An unexpected error occurred.';

      if (data is Map<String, dynamic> && data.containsKey('detail')) {
        final detail = data['detail'];
        if (detail is String) {
          message = detail;
        } else if (detail is List && detail.isNotEmpty) {
          // FastAPI validation error array
          message = detail.map((e) => e['msg'] ?? e.toString()).join('\n');
        }
      }

      switch (statusCode) {
        case 401:
          return UnauthorizedException(message: message);
        case 403:
          return ForbiddenException(message: message);
        case 404:
          return NotFoundException(message: message);
        case 422:
          return ValidationException(message: message, details: data);
        default:
          return ApiException(message: message, statusCode: statusCode, details: data);
      }
    }

    return ApiException(message: error.message ?? 'Unknown error', statusCode: null);
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.get<T>(path, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.post<T>(path, data: data, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await dio.patch<T>(path, data: data, queryParameters: queryParameters, options: options);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
}
