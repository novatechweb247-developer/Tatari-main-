import crypto from 'node:crypto';

export interface CloudinaryConfigStatus {
  isConfigured: boolean;
  cloudName: string | null;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  missingKeys: string[];
}

export function getCloudinaryConfig(): CloudinaryConfigStatus {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || null;
  const apiKey = process.env.CLOUDINARY_API_KEY || null;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || null;

  const missingKeys: string[] = [];
  if (!cloudName) missingKeys.push('CLOUDINARY_CLOUD_NAME');
  if (!apiKey) missingKeys.push('CLOUDINARY_API_KEY');
  if (!apiSecret) missingKeys.push('CLOUDINARY_API_SECRET');

  return {
    isConfigured: missingKeys.length === 0,
    cloudName,
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    missingKeys,
  };
}

/**
 * Generates an authenticated Cloudinary upload signature.
 * Cloudinary signature algorithm:
 * 1. Collect all parameters to sign (exclude file, cloud_name, resource_type, api_key).
 * 2. Sort parameter keys alphabetically.
 * 3. Join with "key=value&...".
 * 4. Append API Secret to the end.
 * 5. Compute SHA-1 hex digest (or SHA-256).
 */
export function generateUploadSignature(paramsToSign: Record<string, string | number>) {
  const config = getCloudinaryConfig();
  if (!config.isConfigured || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured on the server.');
  }

  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join('&');

  const stringToSign = `${serialized}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  return {
    signature,
    timestamp: paramsToSign.timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

/**
 * Uploads a file (base64 or remote URL) directly to Cloudinary using signed server-side REST API.
 */
export async function uploadToCloudinary(fileDataOrUrl: string, options: {
  folder?: string;
  resourceType?: 'image' | 'video' | 'auto';
  publicId?: string;
}) {
  const config = getCloudinaryConfig();
  if (!config.isConfigured || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cannot upload: Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing in environment variables.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = options.folder || 'tatari_furniture';
  const resourceType = options.resourceType || 'auto';

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };
  if (options.publicId) {
    paramsToSign.public_id = options.publicId;
  }

  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&');
  const signature = crypto
    .createHash('sha1')
    .update(`${serialized}${process.env.CLOUDINARY_API_SECRET}`)
    .digest('hex');

  const formData = new URLSearchParams();
  formData.append('file', fileDataOrUrl);
  formData.append('api_key', process.env.CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);
  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }

  const apiUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = (errorJson as any)?.error?.message || `Cloudinary upload failed with HTTP status ${response.status}`;
    throw new Error(message);
  }

  const result = await response.json();
  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    url: result.url,
    format: result.format,
    resourceType: result.resource_type as 'image' | 'video' | 'raw',
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    originalFilename: result.original_filename,
    createdAt: result.created_at,
  };
}
