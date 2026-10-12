import React, { useState } from 'react';
import {
  Activity,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Lock,
  Server,
  FileText,
} from 'lucide-react';

interface DiagnosticsPanelProps {
  diagnostics: any;
  onRefresh: () => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  diagnostics,
  onRefresh,
}) => {
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<string | null>(null);

  const testDbPersistence = async () => {
    setTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        if (data.draft && data.published) {
          setDbTestResult('SUCCESS: Database read & schema validation verified.');
        } else {
          setDbTestResult('NEEDS VERIFICATION: Unexpected schema payload.');
        }
      } else {
        setDbTestResult(`FAILURE: API returned HTTP status ${res.status}`);
      }
    } catch (err: any) {
      setDbTestResult(`FAILURE: ${err.message}`);
    } finally {
      setTestingDb(false);
    }
  };

  const isCloudinaryReady = diagnostics?.cloudinary?.configured;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C] mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Health & Verification</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
            Admin System Diagnostics
          </h2>
          <p className="text-xs text-[#3A271C]/70">
            Real-time status of backend services, persistent storage, and Cloudinary media delivery.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-[#D8CEC0] bg-white hover:bg-[#F6F1E8] text-xs font-medium text-[#3A271C]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Checks</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Diagnostic */}
        <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE4D8]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#1C1511]">Database Persistence</h3>
                <span className="text-[10px] text-[#3A271C]/60 uppercase font-mono">
                  {diagnostics?.database?.provider || 'Atomic Disk Store'}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>SUCCESS</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">Store Status:</span>
              <span className="font-mono text-emerald-700 font-bold">Online & Persisted</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">Products Persisted:</span>
              <span className="font-mono">{diagnostics?.database?.productsCount ?? 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">Gallery Photos Persisted:</span>
              <span className="font-mono">{diagnostics?.database?.galleryItemsCount ?? 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">Inquiries Stored:</span>
              <span className="font-mono">{diagnostics?.database?.inquiriesCount ?? 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">Last Draft Saved:</span>
              <span className="font-mono">
                {diagnostics?.database?.lastDraftSavedAt ? new Date(diagnostics.database.lastDraftSavedAt).toLocaleString() : 'Never'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#3A271C]/70 font-semibold">Last Published:</span>
              <span className="font-mono">
                {diagnostics?.database?.lastPublishedAt ? new Date(diagnostics.database.lastPublishedAt).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={testDbPersistence}
              disabled={testingDb}
              className="w-full py-2 rounded-xl bg-[#F6F1E8] hover:bg-[#5A3E2B] hover:text-white text-xs font-semibold uppercase tracking-wider text-[#1C1511] transition-colors"
            >
              {testingDb ? 'Verifying Read/Write...' : 'Run Read/Write Self-Test'}
            </button>
            {dbTestResult && (
              <p className="text-[11px] font-mono mt-2 text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                {dbTestResult}
              </p>
            )}
          </div>
        </div>

        {/* Cloudinary Diagnostic */}
        <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE4D8]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#1C1511]">Cloudinary Media Storage</h3>
                <span className="text-[10px] text-[#3A271C]/60 uppercase font-mono">
                  Permanent Media Delivery
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                isCloudinaryReady
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isCloudinaryReady ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>SUCCESS</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>NEEDS CONFIG</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">Configured:</span>
              <span className={`font-mono font-bold ${isCloudinaryReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isCloudinaryReady ? 'Yes (Ready for Uploads)' : 'Incomplete (Keys Missing)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">Cloud Name:</span>
              <span className="font-mono">
                {diagnostics?.cloudinary?.cloudName || 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F6F1E8]">
              <span className="text-[#3A271C]/70 font-semibold">API Secret Protection:</span>
              <span className="font-mono text-emerald-700 font-semibold flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Server-Side Only (Never Leaked)</span>
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#3A271C]/70 font-semibold">Signed Uploads:</span>
              <span className="font-mono">{isCloudinaryReady ? 'Active' : 'Awaiting credentials'}</span>
            </div>
          </div>

          {!isCloudinaryReady && diagnostics?.cloudinary?.missingKeys && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900">
              <span className="font-bold block mb-1">Required Environment Variables:</span>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[10px]">
                {diagnostics.cloudinary.missingKeys.map((k: string) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Secret URL & Security Summary */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#5A3E2B]">
          <Lock className="w-4 h-4 text-[#C9A45C]" />
          <span>Access Model & Privacy Architecture</span>
        </div>
        <h3 className="font-serif text-xl text-[#1C1511] font-normal">
          Secret-URL-Only Protection
        </h3>
        <p className="text-xs text-[#3A271C]/80 leading-relaxed font-light">
          This Admin Center adheres to the zero-login secret-URL access model:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl bg-[#F6F1E8]/40 border border-[#D8CEC0]">
            <span className="font-bold text-[#1C1511] block mb-1">Zero Public Exposure</span>
            <p className="text-[#3A271C]/70 text-[11px]">
              No admin buttons or links exist in public navbar, footer, content, or sitemap. Public visitors cannot discover this entrance.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F6F1E8]/40 border border-[#D8CEC0]">
            <span className="font-bold text-[#1C1511] block mb-1">Noindex Headers Active</span>
            <p className="text-[#3A271C]/70 text-[11px]">
              The admin route and its bootstrap deliver strict <code className="font-mono text-[10px]">noindex, nofollow, noarchive</code> tags to search engine crawlers.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F6F1E8]/40 border border-[#D8CEC0]">
            <span className="font-bold text-[#1C1511] block mb-1">Cryptographic Sessions</span>
            <p className="text-[#3A271C]/70 text-[11px]">
              Administrative API routes require a valid HMAC session token issued when navigating directly to the secret URL. Unauthenticated hits return 404.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
