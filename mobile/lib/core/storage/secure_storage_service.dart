import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  static const String _keyAccessToken = 'bafs_access_token';
  static const String _keyRefreshToken = 'bafs_refresh_token';
  static const String _keyUserRole = 'bafs_user_role';
  static const String _keyUserId = 'bafs_user_id';
  static const String _keyUserPhone = 'bafs_user_phone';
  static const String _keyUserName = 'bafs_user_name';

  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await _storage.write(key: _keyAccessToken, value: accessToken);
    await _storage.write(key: _keyRefreshToken, value: refreshToken);
  }

  Future<void> saveUserProfile({
    required String id,
    required String phone,
    required String role,
    String? fullName,
  }) async {
    await _storage.write(key: _keyUserId, value: id);
    await _storage.write(key: _keyUserPhone, value: phone);
    await _storage.write(key: _keyUserRole, value: role);
    if (fullName != null) {
      await _storage.write(key: _keyUserName, value: fullName);
    }
  }

  Future<String?> getAccessToken() async => await _storage.read(key: _keyAccessToken);
  Future<String?> getRefreshToken() async => await _storage.read(key: _keyRefreshToken);
  Future<String?> getUserRole() async => await _storage.read(key: _keyUserRole);
  Future<String?> getUserId() async => await _storage.read(key: _keyUserId);
  Future<String?> getUserPhone() async => await _storage.read(key: _keyUserPhone);
  Future<String?> getUserName() async => await _storage.read(key: _keyUserName);

  Future<bool> hasValidToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
