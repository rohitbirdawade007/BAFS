class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => 'ApiException(statusCode: $statusCode, message: $message)';
}

class NetworkException extends ApiException {
  NetworkException({super.message = 'Network connection failure. Please check your internet connection.'})
      : super(statusCode: 0);
}

class UnauthorizedException extends ApiException {
  UnauthorizedException({super.message = 'Session expired. Please log in again.'})
      : super(statusCode: 401);
}

class ForbiddenException extends ApiException {
  ForbiddenException({super.message = 'You do not have permission to perform this action.'})
      : super(statusCode: 403);
}

class NotFoundException extends ApiException {
  NotFoundException({super.message = 'The requested resource was not found.'})
      : super(statusCode: 404);
}

class ValidationException extends ApiException {
  ValidationException({required super.message, super.details})
      : super(statusCode: 422);
}
