/**
 * Unified upload utility
 * Supports both S3 and Cloudinary based on configuration
 */

const UPLOAD_PROVIDER = process.env.UPLOAD_PROVIDER || 'cloudinary'; // 's3' or 'cloudinary'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024, // 5MB
  video: 500 * 1024 * 1024, // 500MB
  document: 10 * 1024 * 1024, // 10MB
};

export function validateFile(
  file: File,
  type: 'image' | 'video' | 'document'
): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = MAX_FILE_SIZE[type];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  let allowedTypes: string[];
  switch (type) {
    case 'image':
      allowedTypes = ALLOWED_IMAGE_TYPES;
      break;
    case 'video':
      allowedTypes = ALLOWED_VIDEO_TYPES;
      break;
    case 'document':
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
      break;
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}
