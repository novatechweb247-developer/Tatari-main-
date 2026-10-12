import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Video, FolderOpen } from 'lucide-react';

interface CloudinaryUploaderProps {
  currentUrl?: string;
  onUploadSuccess: (url: string, asset?: any) => void;
  folder?: string;
  resourceType?: 'image' | 'video' | 'auto';
  label?: string;
  onOpenMediaLibrary?: () => void;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  currentUrl,
  onUploadSuccess,
  folder = 'tatari_furniture',
  resourceType = 'image',
  label = 'Upload Media to Cloudinary',
  onOpenMediaLibrary,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate size (max 50MB for video, 20MB for image)
    const maxSize = resourceType === 'video' ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is ${(maxSize / (1024 * 1024))}MB.`);
      return;
    }

    // Local temporary preview for instant feedback
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      // Convert file to base64 data-url
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Send to server-side Cloudinary upload proxy with admin credentials
      const res = await fetch('/api/admin/cloudinary/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64Data,
          folder,
          resourceType,
          originalFilename: file.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed. Check Cloudinary credentials in .env.');
      }

      const permanentUrl = data.asset.secureUrl;
      setSuccess('Uploaded to Cloudinary successfully!');
      onUploadSuccess(permanentUrl, data.asset);
    } catch (err: any) {
      console.error('[Cloudinary Upload Error]:', err);
      setError(err.message || 'Failed to upload media. Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in server environment.');
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="space-y-3">
      {label && <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B]">{label}</label>}

      {/* Current Preview */}
      {displayUrl && (
        <div className="relative rounded-xl overflow-hidden border border-[#D8CEC0] bg-[#1C1511] h-48 w-full group">
          {resourceType === 'video' || displayUrl.endsWith('.mp4') ? (
            <video src={displayUrl} controls className="w-full h-full object-cover" />
          ) : (
            <img
              src={displayUrl}
              alt="Media Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}

          <div className="absolute top-2 right-2 flex items-center space-x-2">
            <span className="bg-[#1C1511]/80 backdrop-blur-sm text-[#C9A45C] text-[10px] font-mono px-2 py-1 rounded">
              {displayUrl.includes('res.cloudinary.com') ? 'Cloudinary Hosted' : 'Active Reference'}
            </span>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#C9A45C] bg-[#C9A45C]/10'
            : 'border-[#D8CEC0] hover:border-[#C9A45C] bg-white hover:bg-[#F6F1E8]/50'
        } ${isUploading ? 'opacity-70 cursor-wait' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={resourceType === 'video' ? 'video/*' : 'image/*'}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#C9A45C] animate-spin" />
              <p className="text-xs font-medium text-[#1C1511]">Uploading to Cloudinary & validating signature...</p>
              <p className="text-[10px] text-[#3A271C]/60">Permanent storage and CDN optimization in progress</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[#F6F1E8] flex items-center justify-center text-[#5A3E2B]">
                {resourceType === 'video' ? <Video className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
              </div>
              <div className="text-xs text-[#1C1511]">
                <span className="font-semibold text-[#5A3E2B]">Click to browse</span> or drag and drop
              </div>
              <p className="text-[10px] text-[#3A271C]/70">
                {resourceType === 'video' ? 'MP4, WebM up to 50MB' : 'PNG, JPG, WebP up to 20MB'} (Uploaded permanently to Cloudinary)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Select from Media Library Button */}
      {onOpenMediaLibrary && (
        <button
          type="button"
          onClick={onOpenMediaLibrary}
          className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border border-[#D8CEC0] bg-white hover:bg-[#F6F1E8] text-xs font-medium text-[#3A271C] transition-colors"
        >
          <FolderOpen className="w-4 h-4 text-[#C9A45C]" />
          <span>Choose from Existing Media Library Assets</span>
        </button>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <span className="font-semibold block">Upload Notice:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};
