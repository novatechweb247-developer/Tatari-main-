import React, { useState, useEffect } from 'react';
import { WebsiteContentState, DEFAULT_CONTENT } from '../context/WebsiteContentContext';
import { OverviewDashboard } from './components/OverviewDashboard';
import { HeroSlidesEditor } from './components/HeroSlidesEditor';
import { EditorialEditor } from './components/EditorialEditor';
import { CollectionsEditor } from './components/CollectionsEditor';
import { ProductsEditor } from './components/ProductsEditor';
import { GalleryEditor } from './components/GalleryEditor';
import { InquiriesManager } from './components/InquiriesManager';
import { MediaLibrary } from './components/MediaLibrary';
import { SettingsEditor } from './components/SettingsEditor';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Layers,
  Sliders,
  Image as ImageIcon,
  MessageSquare,
  Cloud,
  Settings,
  Activity,
  Save,
  Send,
  RotateCcw,
  ExternalLink,
  Menu,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

interface AdminCenterProps {
  secretPath: string;
  onNavigate: (path: string) => void;
}

export const AdminCenter: React.FC<AdminCenterProps> = ({ secretPath, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [content, setContent] = useState<WebsiteContentState>(DEFAULT_CONTENT);
  const [publishedSnapshot, setPublishedSnapshot] = useState<WebsiteContentState>(DEFAULT_CONTENT);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(null);

  const getAdminToken = (): string | null => {
    if (typeof window !== 'undefined') {
      const bootstrapToken = (window as any).__TATARI_ADMIN_BOOTSTRAP__?.token;
      if (bootstrapToken) return bootstrapToken;
      try {
        return sessionStorage.getItem('tatari_adm_token') || localStorage.getItem('tatari_adm_token');
      } catch {
        return null;
      }
    }
    return null;
  };

  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    headers.set('X-Secret-Path', secretPath);
    const token = getAdminToken();
    if (token) {
      headers.set('X-Admin-Token', token);
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers, credentials: 'include' });
  };

  // Load initial draft, published, inquiries, and diagnostics
  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      // 1. Initialize session and acquire signed token if available
      try {
        const sessRes = await fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Secret-Path': secretPath },
          body: JSON.stringify({ secretPath }),
          credentials: 'include',
        });
        if (sessRes.ok) {
          const sessData = await sessRes.json();
          if (sessData.token) {
            try {
              sessionStorage.setItem('tatari_adm_token', sessData.token);
            } catch {}
          }
        }
      } catch {
        // Proceed with direct secret header
      }

      // 2. Load administrative endpoints concurrently with allSettled
      // Each fetch has a 5-second timeout to prevent any infinite freeze
      const fetchWithTimeout = async (endpoint: string, timeoutMs = 5000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await adminFetch(endpoint, { signal: controller.signal });
          clearTimeout(timer);
          return res;
        } catch (e) {
          clearTimeout(timer);
          throw e;
        }
      };

      const [resContentSettled, resInquiriesSettled, resDiagSettled] = await Promise.allSettled([
        fetchWithTimeout('/api/admin/content'),
        fetchWithTimeout('/api/admin/inquiries'),
        fetchWithTimeout('/api/admin/diagnostics'),
      ]);

      let loadedContent = false;
      if (resContentSettled.status === 'fulfilled' && resContentSettled.value.ok) {
        const data = await resContentSettled.value.json();
        if (data.draft) {
          setContent(data.draft);
          loadedContent = true;
        }
        if (data.published) {
          setPublishedSnapshot(data.published);
        }
      }

      if (resInquiriesSettled.status === 'fulfilled' && resInquiriesSettled.value.ok) {
        const inqs = await resInquiriesSettled.value.json();
        setInquiries(inqs);
      }

      if (resDiagSettled.status === 'fulfilled' && resDiagSettled.value.ok) {
        const diag = await resDiagSettled.value.json();
        setDiagnostics(diag);
      }

      setIsConnected(loadedContent);
      if (!loadedContent) {
        showNotification('error', 'Working in offline mode with cached content. Click Reconnect to sync.');
      }
    } catch (err: any) {
      setIsConnected(false);
      showNotification('error', 'Working in offline mode with cached content.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // Maximum 3.5s loading ceiling: Never hold the user on a blank loader
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(safetyTimer);
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Content mutation handler
  const updateContent = (updater: (prev: WebsiteContentState) => WebsiteContentState) => {
    if (!content) return;
    setContent(updater(content));
    setHasUnsavedChanges(true);
  };

  // Save Draft to database
  const handleSaveDraft = async () => {
    if (!content) return;
    setIsSavingDraft(true);
    try {
      const res = await adminFetch('/api/admin/content/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save draft failed.');

      setHasUnsavedChanges(false);
      showNotification('success', 'Draft saved successfully to persistent database.');
      // Refresh diagnostics
      const diagRes = await adminFetch('/api/admin/diagnostics');
      if (diagRes.ok) setDiagnostics(await diagRes.json());
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to persist draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Publish Changes to live website
  const handlePublish = async () => {
    if (!content) return;
    if (
      !window.confirm(
        'Publish all changes to the live website? Public visitors will immediately see the updated content.'
      )
    ) {
      return;
    }

    setIsPublishing(true);
    try {
      // First persist draft
      await adminFetch('/api/admin/content/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      // Then trigger publish
      const res = await adminFetch('/api/admin/content/publish', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publication failed.');

      setPublishedSnapshot(JSON.parse(JSON.stringify(content)));
      setHasUnsavedChanges(false);
      showNotification('success', 'Published successfully! Live website updated.');

      const diagRes = await adminFetch('/api/admin/diagnostics');
      if (diagRes.ok) setDiagnostics(await diagRes.json());
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to publish changes.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Discard draft
  const handleDiscard = async () => {
    if (
      !window.confirm(
        'Discard all draft edits and revert to the currently published version? All unsaved work will be lost.'
      )
    ) {
      return;
    }

    try {
      const res = await adminFetch('/api/admin/content/discard', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.draft) {
        setContent(data.draft);
        setHasUnsavedChanges(false);
        showNotification('success', 'Reverted draft to currently published version.');
      }
    } catch {
      showNotification('error', 'Failed to revert draft.');
    }
  };

  // Inquiries actions
  const handleUpdateInquiry = async (id: string, status: any, notes?: string) => {
    try {
      const res = await adminFetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status, notes } : i))
        );
        showNotification('success', 'Inquiry status updated.');
      }
    } catch {
      showNotification('error', 'Failed to update inquiry.');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        showNotification('success', 'Inquiry deleted.');
      }
    } catch {
      showNotification('error', 'Failed to delete inquiry.');
    }
  };

  // Open Media Picker callback
  const handleOpenMediaPicker = (onSelect: (url: string) => void) => {
    setMediaPickerCallback(() => (url: string) => {
      onSelect(url);
      setMediaPickerOpen(false);
      setMediaPickerCallback(null);
    });
    setMediaPickerOpen(true);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero Slides (3)', icon: Sparkles },
    { id: 'editorial', label: 'Editorial & Story', icon: BookOpen },
    { id: 'collections', label: 'Showcase Collections', icon: Layers },
    { id: 'products', label: 'Furniture Catalog', icon: Sliders },
    { id: 'gallery', label: 'Visual Gallery', icon: ImageIcon },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: MessageSquare,
      badge: inquiries.filter((i) => i.status === 'new').length,
    },
    { id: 'media', label: 'Cloudinary Media', icon: Cloud },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F1E8] flex flex-col items-center justify-center p-6 text-[#1C1511]">
        <Loader2 className="w-10 h-10 text-[#C9A45C] animate-spin mb-4" />
        <h2 className="font-serif text-2xl font-light">Loading Admin Center...</h2>
        <p className="text-xs text-[#3A271C]/60 mt-1 font-mono">Authenticating secure session...</p>
        <button
          onClick={() => setIsLoading(false)}
          className="mt-6 px-5 py-2 text-xs font-semibold text-[#1C1511] bg-white border border-[#D8CEC0] rounded-full hover:bg-[#ECE4D8] transition-all shadow-sm"
        >
          Enter Admin Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1E8] text-[#1C1511] flex flex-col antialiased">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-[#1C1511] text-[#F6F1E8] border-b border-[#3A271C] px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 text-white"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-lg tracking-[0.15em] text-[#F6F1E8] font-light">
                TATARI
              </span>
              <span className="text-[9px] bg-[#C9A45C] text-[#1C1511] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                Admin Center
              </span>
            </div>
            <span className="text-[10px] text-[#D8CEC0]/60 font-light hidden sm:block">
              Master Persistent CMS • Cloudinary Storage
            </span>
          </div>
        </div>

        {/* Global Save & Publish Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {hasUnsavedChanges && (
            <button
              onClick={handleDiscard}
              className="hidden lg:inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs text-[#D8CEC0]/70 hover:text-white transition-colors"
              title="Discard unsaved changes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className={`inline-flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
              hasUnsavedChanges
                ? 'border-[#C9A45C] bg-[#C9A45C]/20 text-[#DFC27A] hover:bg-[#C9A45C] hover:text-[#1C1511]'
                : 'border-white/20 text-[#D8CEC0] hover:bg-white/10'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
            <span className="sm:hidden">Save</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center space-x-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#C9A45C] hover:bg-[#DFC27A] text-[#1C1511] text-xs font-semibold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Preview Live Website"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Offline / Reconnecting Banner */}
      {isConnected === false && (
        <div className="bg-amber-800 text-amber-50 px-4 py-2 text-xs flex items-center justify-between border-b border-amber-900 shadow-inner">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-300" />
            <span>
              <strong>Administrative Backend Offline or Syncing:</strong> Running on resilient local cached content.
            </span>
          </div>
          <button
            onClick={() => loadAdminData()}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold uppercase tracking-wider text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-grow flex">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1C1511] text-[#F6F1E8] border-r border-[#3A271C] flex flex-col justify-between pt-16 md:pt-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#C9A45C] tracking-[0.2em]">
              Administration
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#C9A45C] text-[#1C1511] font-semibold shadow-sm'
                      : 'text-[#D8CEC0] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#1C1511] text-[#C9A45C]' : 'bg-red-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#3A271C] space-y-2 text-[11px] text-[#D8CEC0]/60">
            <div className="flex items-center justify-between">
              <span>Database:</span>
              <span className="font-mono text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cloudinary:</span>
              <span className="font-mono text-[#C9A45C]">
                {diagnostics?.cloudinary?.configured ? 'Active' : 'Unconfigured'}
              </span>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeSection === 'overview' && (
            <OverviewDashboard
              content={content}
              hasUnsavedChanges={hasUnsavedChanges}
              diagnostics={diagnostics}
              inquiries={inquiries}
              onNavigateSection={setActiveSection}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              isSaving={isSavingDraft}
              isPublishing={isPublishing}
            />
          )}

          {activeSection === 'hero' && (
            <HeroSlidesEditor
              slides={content.heroSlides}
              onChange={(slides) => updateContent((prev) => ({ ...prev, heroSlides: slides }))}
              onOpenMediaLibrary={() =>
                handleOpenMediaPicker((url) => {
                  // Media picker handles through callback
                })
              }
            />
          )}

          {activeSection === 'editorial' && (
            <EditorialEditor
              editorial={content.editorial}
              aboutStory={content.aboutStory}
              onChangeEditorial={(ed) => updateContent((prev) => ({ ...prev, editorial: ed }))}
              onChangeAboutStory={(ab) => updateContent((prev) => ({ ...prev, aboutStory: ab }))}
              onOpenMediaLibrary={() => handleOpenMediaPicker((url) => {})}
            />
          )}

          {activeSection === 'collections' && (
            <CollectionsEditor
              collections={content.featuredCollections}
              onChange={(cols) => updateContent((prev) => ({ ...prev, featuredCollections: cols }))}
              onOpenMediaLibrary={() => handleOpenMediaPicker((url) => {})}
            />
          )}

          {activeSection === 'products' && (
            <ProductsEditor
              products={content.products}
              onChange={(prods) => updateContent((prev) => ({ ...prev, products: prods }))}
              onOpenMediaLibrary={() => handleOpenMediaPicker((url) => {})}
            />
          )}

          {activeSection === 'gallery' && (
            <GalleryEditor
              items={content.galleryItems}
              onChange={(items) => updateContent((prev) => ({ ...prev, galleryItems: items }))}
              onOpenMediaLibrary={() => handleOpenMediaPicker((url) => {})}
            />
          )}

          {activeSection === 'inquiries' && (
            <InquiriesManager
              inquiries={inquiries}
              onRefresh={loadAdminData}
              onUpdateStatus={handleUpdateInquiry}
              onDelete={handleDeleteInquiry}
            />
          )}

          {activeSection === 'media' && <MediaLibrary />}

          {activeSection === 'settings' && (
            <SettingsEditor
              businessInfo={content.businessInfo}
              onChange={(info) => updateContent((prev) => ({ ...prev, businessInfo: info }))}
            />
          )}

          {activeSection === 'diagnostics' && (
            <DiagnosticsPanel diagnostics={diagnostics} onRefresh={loadAdminData} />
          )}
        </main>
      </div>

      {/* Global Media Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1511]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl border border-[#D8CEC0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE4D8]">
              <h3 className="font-serif text-2xl text-[#1C1511]">Choose from Media Library</h3>
              <button
                onClick={() => setMediaPickerOpen(false)}
                className="p-1 rounded-full text-[#3A271C]/60 hover:bg-[#F6F1E8]"
              >
                ✕
              </button>
            </div>
            <MediaLibrary
              onSelectMedia={(url) => {
                if (mediaPickerCallback) mediaPickerCallback(url);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
