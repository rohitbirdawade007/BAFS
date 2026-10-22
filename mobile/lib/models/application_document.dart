class ApplicationDocument {
  final String id;
  final String applicationId;
  final String category;
  final String originalFilename;
  final String storageKey;
  final String mimeType;
  final int fileSizeBytes;
  final String verificationStatus;
  final String? rejectionReason;
  final String? uploadedById;
  final DateTime createdAt;

  const ApplicationDocument({
    required this.id,
    required this.applicationId,
    required this.category,
    required this.originalFilename,
    required this.storageKey,
    required this.mimeType,
    required this.fileSizeBytes,
    required this.verificationStatus,
    this.rejectionReason,
    this.uploadedById,
    required this.createdAt,
  });

  bool get isVerified => verificationStatus.toUpperCase() == 'VERIFIED';
  bool get isRejected => verificationStatus.toUpperCase() == 'REJECTED';
  bool get isPending => verificationStatus.toUpperCase() == 'PENDING' || verificationStatus.toUpperCase() == 'UNDER_REVIEW';
  bool get requiresResubmission => verificationStatus.toUpperCase() == 'RESUBMISSION_REQUIRED';

  String get formattedFileSize {
    if (fileSizeBytes < 1024) return '$fileSizeBytes B';
    if (fileSizeBytes < 1024 * 1024) {
      return '${(fileSizeBytes / 1024).toStringAsFixed(1)} KB';
    }
    return '${(fileSizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  factory ApplicationDocument.fromJson(Map<String, dynamic> json) {
    return ApplicationDocument(
      id: (json['id'] ?? '').toString(),
      applicationId: (json['application_id'] ?? '').toString(),
      category: (json['document_category'] ?? 'OTHER').toString(),
      originalFilename: json['original_filename'] as String? ?? 'document',
      storageKey: json['storage_key'] as String? ?? '',
      mimeType: json['mime_type'] as String? ?? 'application/pdf',
      fileSizeBytes: (json['file_size_bytes'] as num?)?.toInt() ?? 0,
      verificationStatus: (json['verification_status'] ?? 'PENDING').toString(),
      rejectionReason: json['rejection_reason'] as String?,
      uploadedById: json['uploaded_by_id']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'application_id': applicationId,
      'document_category': category,
      'original_filename': originalFilename,
      'storage_key': storageKey,
      'mime_type': mimeType,
      'file_size_bytes': fileSizeBytes,
      'verification_status': verificationStatus,
      'rejection_reason': rejectionReason,
      'uploaded_by_id': uploadedById,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
