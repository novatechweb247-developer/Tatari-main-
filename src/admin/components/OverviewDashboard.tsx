import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Cloud,
  Database,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { WebsiteContentState } from '../../context/WebsiteContentContext';

interface OverviewDashboardProps {
  content: WebsiteContentState;
  hasUnsavedChanges: boolean;
  diagnostics: any;
  inquiries: any[];
  onNavigateSection: (sectionId: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  content,
  hasUnsavedChanges,
  diagnostics,
  inquiries,
  onNavigateSection,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
}) => {
  const newInquiriesCount = (inquiries || []).filter((i) => i?.status === 'new').length;
  const isCloudinaryConfigured = diagnostics?.cloudinary?.configured;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Status */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#D8CEC0]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C] mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Tatari Master Administrative Center</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1511] font-normal">
              Store & Content Overview
            </h1>
            <p className="text-[#3A271C]/80 text-sm mt-1 max-w-2xl font-light">
              Manage website content, inquiries, Cloudinary assets, and publishing workflow for Tatari Furniture (Jos, Plateau State).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-[#5A3E2B] text-[#5A3E2B] hover:bg-[#5A3E2B] hover:text-white transition-all text-xs font-medium uppercase tracking-wider disabled:opacity-50"
            >
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#1C1511] hover:bg-[#3A271C] text-[#F6F1E8] shadow-md transition-all text-xs font-medium uppercase tracking-wider disabled:opacity-50"
            >
              <span>{isPublishing ? 'Publishing...' : 'Publish Changes'}</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-[#F6F1E8] hover:bg-[#ECE4D8] text-[#1C1511] transition-all text-xs font-medium"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Change Status Alert */}
        <div className="mt-6 pt-6 border-t border-[#ECE4D8] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>You have unsaved changes in this session</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All edits saved to database draft</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-6 text-[#3A271C]/70">
            <div>
              <span className="font-semibold text-[#1C1511]">Last Draft Save:</span> {formatDate(diagnostics?.database?.lastDraftSavedAt)}
            </div>
            <div>
              <span className="font-semibold text-[#1C1511]">Last Published:</span> {formatDate(diagnostics?.database?.lastPublishedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Inquiries Card */}
        <div
          onClick={() => onNavigateSection('inquiries')}
          className="bg-white p-6 rounded-2xl border border-[#D8CEC0] shadow-sm hover:border-[#C9A45C] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A45C] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            {newInquiriesCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                {newInquiriesCount} New
              </span>
            )}
          </div>
          <div className="text-3xl font-serif text-[#1C1511] font-normal mb-1">{inquiries?.length || 0}</div>
          <div className="text-xs text-[#3A271C]/70 uppercase tracking-wider font-semibold">Customer Inquiries</div>
          <div className="mt-4 pt-3 border-t border-[#ECE4D8] flex items-center text-xs text-[#C9A45C] font-medium group-hover:translate-x-1 transition-transform">
            <span>Manage Inquiries</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

        {/* Products Card */}
        <div
          onClick={() => onNavigateSection('products')}
          className="bg-white p-6 rounded-2xl border border-[#D8CEC0] shadow-sm hover:border-[#C9A45C] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-[#5A3E2B] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-[#3A271C]/60 uppercase tracking-wider">Catalog</span>
          </div>
          <div className="text-3xl font-serif text-[#1C1511] font-normal mb-1">{content?.products?.length || 0}</div>
          <div className="text-xs text-[#3A271C]/70 uppercase tracking-wider font-semibold">Furniture Products</div>
          <div className="mt-4 pt-3 border-t border-[#ECE4D8] flex items-center text-xs text-[#C9A45C] font-medium group-hover:translate-x-1 transition-transform">
            <span>Edit Inventory</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

        {/* Cloudinary Media Card */}
        <div
          onClick={() => onNavigateSection('media')}
          className="bg-white p-6 rounded-2xl border border-[#D8CEC0] shadow-sm hover:border-[#C9A45C] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                isCloudinaryConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isCloudinaryConfigured ? 'Connected' : 'Needs Keys'}
            </span>
          </div>
          <div className="text-3xl font-serif text-[#1C1511] font-normal mb-1">
            {diagnostics?.database?.mediaCount ?? 0}
          </div>
          <div className="text-xs text-[#3A271C]/70 uppercase tracking-wider font-semibold">Cloudinary Assets</div>
          <div className="mt-4 pt-3 border-t border-[#ECE4D8] flex items-center text-xs text-[#C9A45C] font-medium group-hover:translate-x-1 transition-transform">
            <span>Open Media Library</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>

        {/* Database Status Card */}
        <div
          onClick={() => onNavigateSection('diagnostics')}
          className="bg-white p-6 rounded-2xl border border-[#D8CEC0] shadow-sm hover:border-[#C9A45C] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          <div className="text-lg font-serif text-[#1C1511] font-normal mb-1 truncate">
            Persistent Store
          </div>
          <div className="text-xs text-[#3A271C]/70 uppercase tracking-wider font-semibold">Atomic DB Engine</div>
          <div className="mt-4 pt-3 border-t border-[#ECE4D8] flex items-center text-xs text-[#C9A45C] font-medium group-hover:translate-x-1 transition-transform">
            <span>Diagnostics & Logs</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>

      {/* Quick Launch & Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#D8CEC0] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C9A45C] font-semibold">Hero Carousel</span>
            <h3 className="font-serif text-xl text-[#1C1511] mt-1 mb-2">3 Signature Hero Slides</h3>
            <p className="text-xs text-[#3A271C]/70 leading-relaxed font-light">
              Independently update titles, subtitles, badges, and high-resolution images for each slide of the homepage carousel.
            </p>
          </div>
          <button
            onClick={() => onNavigateSection('hero')}
            className="mt-6 w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#F6F1E8] hover:bg-[#5A3E2B] hover:text-white text-xs font-semibold uppercase tracking-wider text-[#1C1511] transition-colors"
          >
            Edit Hero Slides
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#D8CEC0] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C9A45C] font-semibold">Brand Story</span>
            <h3 className="font-serif text-xl text-[#1C1511] mt-1 mb-2">Editorial & Showroom Story</h3>
            <p className="text-xs text-[#3A271C]/70 leading-relaxed font-light">
              Manage the homepage editorial showcase copy and the About page showroom image and craftsmanship philosophy.
            </p>
          </div>
          <button
            onClick={() => onNavigateSection('editorial')}
            className="mt-6 w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#F6F1E8] hover:bg-[#5A3E2B] hover:text-white text-xs font-semibold uppercase tracking-wider text-[#1C1511] transition-colors"
          >
            Edit Editorial Section
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#D8CEC0] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C9A45C] font-semibold">Visual Gallery</span>
            <h3 className="font-serif text-xl text-[#1C1511] mt-1 mb-2">{content?.galleryItems?.length || 0} Gallery Photos</h3>
            <p className="text-xs text-[#3A271C]/70 leading-relaxed font-light">
              Upload showroom photographs and interior staging pictures. Categorize by Living Room, Bedroom, Showroom, and Interiors.
            </p>
          </div>
          <button
            onClick={() => onNavigateSection('gallery')}
            className="mt-6 w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#F6F1E8] hover:bg-[#5A3E2B] hover:text-white text-xs font-semibold uppercase tracking-wider text-[#1C1511] transition-colors"
          >
            Manage Gallery
          </button>
        </div>
      </div>
    </div>
  );
};
