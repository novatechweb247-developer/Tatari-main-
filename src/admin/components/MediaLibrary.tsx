import React, { useState, useEffect } from 'react';
import { CloudinaryUploader } from './CloudinaryUploader';
import {
  Cloud,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  RefreshCw,
  Video,
  Image as ImageIcon,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface StoredMediaAsset {
  id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  resourceType: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  bytes?: number;
  originalFilename?: string;
  createdAt: string;
}

interface MediaLibraryProps {
  onSelectMedia?: (url: string) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelectMedia }) => {
  const [assets, setAssets] = useState<StoredMediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<StoredMediaAsset | null>(null);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const [resMedia, resConfig] = await Promise.all([
        fetch('/api/admin/media'),
        fetch('/api/admin/cloudinary/config'),
      ]);

      if (resMedia.ok) {
        const data = await resMedia.json();
        setAssets(data);
      }
      if (resConfig.ok) {
        const conf = await resConfig.json();
        setConfigStatus(conf);
      }
    } catch (err) {
      console.error('[Media Library] Failed to load assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this asset record from the Media Library?')) {
      try {
        const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setAssets((prev) => prev.filter((a) => a.id !== id));
          if (selectedAsset?.id === id) setSelectedAsset(null);
        }
      } catch (err) {
        alert('Failed to delete asset');
      }
    }
  };

  const handleUploadComplete = (_url: string, newAsset?: StoredMediaAsset) => {
    if (newAsset) {
      setAssets((prev) => [newAsset, ...prev]);
    } else {
      fetchAssets();
    }
  };

  return (
    <div className="space-y-8">
      {/* Cloudinary Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C] mb-1">
            <Cloud className="w-3.5 h-3.5" />
            <span>Permanent Storage Infrastructure</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
            Cloudinary Media Library
          </h2>
          <p className="text-xs text-[#3A271C]/70">
            Cloudinary stores and delivers all optimized images, videos, and portfolio media globally.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium flex items-center space-x-1.5 ${
              configStatus?.isConfigured
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${configStatus?.isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            <span>
              {configStatus?.isConfigured
                ? `Cloudinary Connected (${configStatus.cloudName})`
                : 'Needs Cloudinary Keys in .env'}
            </span>
          </div>

          <button
            onClick={fetchAssets}
            className="p-2.5 rounded-full border border-[#D8CEC0] bg-white hover:bg-[#F6F1E8] text-[#3A271C]"
            title="Refresh Assets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notice if keys are missing */}
      {configStatus && !configStatus.isConfigured && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex items-start space-x-3 text-xs text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold text-sm block mb-1">Cloudinary Configuration Required:</span>
            <p className="mb-2 leading-relaxed">
              To upload permanent media directly from the Admin Center to Cloudinary, configure the following server environment variables in your deployment or <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code> file:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-amber-900">
              {configStatus.missingKeys.map((k: string) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* New Media Upload Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8CEC0] shadow-sm">
        <h3 className="font-serif text-xl text-[#1C1511] font-normal mb-4">Upload New Asset</h3>
        <CloudinaryUploader
          label="Select File from Device to Store Permanently in Cloudinary"
          onUploadSuccess={handleUploadComplete}
          folder="tatari_furniture/uploads"
          resourceType="auto"
        />
      </div>

      {/* Asset Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-[#1C1511] font-normal">
            Uploaded Assets ({assets.length})
          </h3>
          <span className="text-xs text-[#3A271C]/60">Permanent Cloudinary URLs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-[#D8CEC0] overflow-hidden shadow-sm flex flex-col justify-between group"
            >
              <div
                className="relative aspect-square bg-[#1C1511] cursor-pointer overflow-hidden"
                onClick={() => setSelectedAsset(asset)}
              >
                {asset.resourceType === 'video' ? (
                  <video src={asset.secureUrl} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={asset.secureUrl}
                    alt={asset.publicId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <span className="text-[10px] text-white uppercase font-semibold bg-black/60 px-2 py-1 rounded">
                    Inspect
                  </span>
                </div>

                <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                  {asset.format || asset.resourceType}
                </span>
              </div>

              <div className="p-2.5 border-t border-[#ECE4D8] space-y-2">
                <div className="text-[11px] font-mono text-[#3A271C] truncate" title={asset.publicId}>
                  {asset.originalFilename || asset.publicId}
                </div>

                <div className="flex items-center justify-between pt-1">
                  {onSelectMedia ? (
                    <button
                      type="button"
                      onClick={() => onSelectMedia(asset.secureUrl)}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] hover:text-[#5A3E2B]"
                    >
                      Use Asset
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCopy(asset.id, asset.secureUrl)}
                      className="text-[10px] text-[#5A3E2B] flex items-center space-x-1 hover:text-[#1C1511]"
                      title="Copy URL"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="text-[#3A271C]/40 hover:text-red-600 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {assets.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#D8CEC0]">
            <Cloud className="w-8 h-8 text-[#C9A45C] mx-auto mb-3" />
            <p className="text-sm text-[#1C1511] font-medium">No assets uploaded yet</p>
            <p className="text-xs text-[#3A271C]/60 mt-1 font-light">
              Use the upload area above to send your first image or video to Cloudinary.
            </p>
          </div>
        )}
      </div>

      {/* Asset Inspection Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-[#1C1511]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D8CEC0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE4D8]">
              <h3 className="font-serif text-xl text-[#1C1511]">Cloudinary Asset Details</h3>
              <button onClick={() => setSelectedAsset(null)} className="text-[#3A271C]/60 hover:text-[#1C1511]">
                ✕
              </button>
            </div>

            <div className="h-48 bg-[#1C1511] rounded-xl overflow-hidden flex items-center justify-center">
              {selectedAsset.resourceType === 'video' ? (
                <video src={selectedAsset.secureUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img
                  src={selectedAsset.secureUrl}
                  alt={selectedAsset.publicId}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="space-y-2 text-xs font-mono bg-[#F6F1E8]/50 p-4 rounded-xl border border-[#D8CEC0]">
              <div>
                <span className="text-[#5A3E2B] font-semibold">Public ID:</span> {selectedAsset.publicId}
              </div>
              <div>
                <span className="text-[#5A3E2B] font-semibold">Format:</span> {selectedAsset.format || 'N/A'}
              </div>
              <div>
                <span className="text-[#5A3E2B] font-semibold">Type:</span> {selectedAsset.resourceType}
              </div>
              {selectedAsset.width && (
                <div>
                  <span className="text-[#5A3E2B] font-semibold">Dimensions:</span> {selectedAsset.width} × {selectedAsset.height} px
                </div>
              )}
              {selectedAsset.bytes && (
                <div>
                  <span className="text-[#5A3E2B] font-semibold">Size:</span> {(selectedAsset.bytes / 1024).toFixed(1)} KB
                </div>
              )}
              <div className="break-all">
                <span className="text-[#5A3E2B] font-semibold">Secure URL:</span> {selectedAsset.secureUrl}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => handleCopy(selectedAsset.id, selectedAsset.secureUrl)}
                className="px-4 py-2 rounded-full border border-[#5A3E2B] text-xs font-semibold uppercase text-[#5A3E2B] hover:bg-[#5A3E2B] hover:text-white"
              >
                Copy URL
              </button>
              {onSelectMedia && (
                <button
                  onClick={() => {
                    onSelectMedia(selectedAsset.secureUrl);
                    setSelectedAsset(null);
                  }}
                  className="px-4 py-2 rounded-full bg-[#1C1511] text-xs font-semibold uppercase text-[#F6F1E8]"
                >
                  Select for Field
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
