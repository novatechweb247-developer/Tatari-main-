import React, { useState } from 'react';
import { CloudinaryUploader } from './CloudinaryUploader';
import { Eye, Check, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
}

interface HeroSlidesEditorProps {
  slides: HeroSlide[];
  onChange: (slides: HeroSlide[]) => void;
  onOpenMediaLibrary: () => void;
}

export const HeroSlidesEditor: React.FC<HeroSlidesEditorProps> = ({
  slides,
  onChange,
  onOpenMediaLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Guarantee exactly 3 slides
  const safeSlides: HeroSlide[] = [
    slides[0] || {
      id: 1,
      title: 'FURNITURE THAT COMPLETES YOUR SPACE.',
      subtitle: 'Discover furniture designed to bring comfort, character and style into your home.',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85',
      badge: 'Mastercrafted Living Spaces',
    },
    slides[1] || {
      id: 2,
      title: 'TIMELESS ELEGANCE FOR EVERY ROOM.',
      subtitle: 'From luxurious sectional sofas to refined bedroom suites crafted for absolute relaxation.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=85',
      badge: 'Signature Living Sets',
    },
    slides[2] || {
      id: 3,
      title: 'BESPOKE CUSTOM FURNITURE.',
      subtitle: 'Tailored to your precise dimensions, aesthetic preferences, and lifestyle needs.',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1920&q=85',
      badge: 'Custom Craftsmanship',
    },
  ];

  const handleFieldChange = (index: number, field: keyof HeroSlide, value: any) => {
    const updated = [...safeSlides];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const currentSlide = safeSlides[activeTab];

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Homepage Carousel</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
              Hero Slides Management
            </h2>
            <p className="text-xs text-[#3A271C]/70 mt-1">
              Tatari Furniture utilizes exactly three signature hero slides. Each slide is independently managed and persisted.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#5A3E2B] bg-[#F6F1E8] px-3 py-1.5 rounded-full border border-[#D8CEC0]">
              Fixed Carousel: 3 Slides
            </span>
          </div>
        </div>

        {/* Slide Selection Tabs - Exactly Slide 1, Slide 2, Slide 3 */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#ECE4D8]">
          {[0, 1, 2].map((idx) => {
            const slide = safeSlides[idx];
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-[#C9A45C] bg-[#F6F1E8] shadow-sm ring-2 ring-[#C9A45C]/20'
                    : 'border-[#D8CEC0] bg-white hover:bg-[#F6F1E8]/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C1511]">
                    Hero Slide {idx + 1}
                  </span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#C9A45C]" />}
                </div>
                <span className="text-[11px] text-[#3A271C]/80 line-clamp-1 font-serif">
                  {slide.title}
                </span>
                <span className="text-[10px] text-[#C9A45C] tracking-wide mt-1 uppercase font-mono">
                  {slide.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Live Preview for Active Slide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#D8CEC0] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#ECE4D8]">
            <h3 className="font-serif text-xl text-[#1C1511] font-normal">
              Editing Hero Slide {activeTab + 1}
            </h3>
            <span className="text-xs text-[#3A271C]/60">Independent configuration</span>
          </div>

          <div className="space-y-5">
            {/* Badge */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Slide Badge / Accent Label
              </label>
              <input
                type="text"
                value={currentSlide.badge}
                onChange={(e) => handleFieldChange(activeTab, 'badge', e.target.value)}
                placeholder="e.g. Mastercrafted Living Spaces"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] bg-[#F6F1E8]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm text-[#1C1511]"
              />
              <p className="text-[10px] text-[#3A271C]/60 mt-1">Displayed in golden pill banner above the main heading.</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Main Headline Title
              </label>
              <textarea
                rows={2}
                value={currentSlide.title}
                onChange={(e) => handleFieldChange(activeTab, 'title', e.target.value)}
                placeholder="e.g. FURNITURE THAT COMPLETES YOUR SPACE."
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] bg-[#F6F1E8]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm text-[#1C1511] font-serif"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={currentSlide.subtitle}
                onChange={(e) => handleFieldChange(activeTab, 'subtitle', e.target.value)}
                placeholder="Discover furniture designed to bring comfort, character and style into your home."
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] bg-[#F6F1E8]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-sm text-[#1C1511]"
              />
            </div>

            {/* Cloudinary Image Uploader */}
            <div className="pt-2">
              <CloudinaryUploader
                label={`Hero Slide ${activeTab + 1} Image (Cloudinary Permanent Media)`}
                currentUrl={currentSlide.image}
                onUploadSuccess={(url) => handleFieldChange(activeTab, 'image', url)}
                onOpenMediaLibrary={onOpenMediaLibrary}
                folder="tatari_furniture/hero"
              />
            </div>

            {/* Direct Image URL fallback input */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A3E2B]/70 mb-1">
                Image URL Reference
              </label>
              <input
                type="text"
                value={currentSlide.image}
                onChange={(e) => handleFieldChange(activeTab, 'image', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8CEC0] text-xs font-mono text-[#3A271C] bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A45C]"
              />
            </div>
          </div>
        </div>

        {/* Live Slide Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#D8CEC0] shadow-sm">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[#5A3E2B] uppercase tracking-wider">
              <span>Slide {activeTab + 1} Visual Mockup</span>
              <Eye className="w-4 h-4 text-[#C9A45C]" />
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[#1C1511] text-white flex flex-col justify-end p-6 border border-[#3A271C]">
              {/* Slide Background Image */}
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1511] via-[#1C1511]/40 to-transparent" />

              {/* Overlay Content */}
              <div className="relative z-10 space-y-2 text-center">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-[#DFC27A] text-[9px] uppercase tracking-[0.2em]">
                  {currentSlide.badge}
                </div>
                <h4 className="font-serif text-lg leading-tight font-light text-[#F6F1E8]">
                  {currentSlide.title}
                </h4>
                <p className="text-[11px] text-[#D8CEC0] font-light line-clamp-2">
                  {currentSlide.subtitle}
                </p>
                <div className="pt-2 flex items-center justify-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-[#C9A45C] text-[#1C1511] text-[9px] uppercase font-semibold">
                    Explore Collections
                  </span>
                  <span className="px-3 py-1 rounded-full border border-white/40 text-white text-[9px] uppercase">
                    Contact Us
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#3A271C]/60 mt-3 text-center">
              Changes update immediately in draft. Click "Save Draft" or "Publish Changes" in top bar to persist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
