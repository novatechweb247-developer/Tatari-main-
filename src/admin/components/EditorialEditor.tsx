import React from 'react';
import { CloudinaryUploader } from './CloudinaryUploader';
import { Sparkles, BookOpen, Image as ImageIcon } from 'lucide-react';
import { WebsiteContentState } from '../../context/WebsiteContentContext';

interface EditorialEditorProps {
  editorial: WebsiteContentState['editorial'];
  aboutStory: WebsiteContentState['aboutStory'];
  onChangeEditorial: (editorial: WebsiteContentState['editorial']) => void;
  onChangeAboutStory: (aboutStory: WebsiteContentState['aboutStory']) => void;
  onOpenMediaLibrary: () => void;
}

export const EditorialEditor: React.FC<EditorialEditorProps> = ({
  editorial,
  aboutStory,
  onChangeEditorial,
  onChangeAboutStory,
  onOpenMediaLibrary,
}) => {
  const handleEditorialField = (field: keyof WebsiteContentState['editorial'], value: string) => {
    onChangeEditorial({
      ...editorial,
      [field]: value,
    });
  };

  const handleStoryField = (field: keyof WebsiteContentState['aboutStory'], value: string) => {
    onChangeAboutStory({
      ...aboutStory,
      [field]: value,
    });
  };

  return (
    <div className="space-y-10">
      {/* 1. Homepage Editorial Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8CEC0] shadow-sm space-y-6">
        <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C]">
          <Sparkles className="w-4 h-4" />
          <span>Homepage Section</span>
        </div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
            Editorial Showcase & Brand Introduction
          </h2>
          <p className="text-xs text-[#3A271C]/70 mt-1">
            Displayed prominently on the homepage directly below the hero carousel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-[#ECE4D8]">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Badge / Accent Tag
              </label>
              <input
                type="text"
                value={editorial.badge}
                onChange={(e) => handleEditorialField('badge', e.target.value)}
                placeholder="Tatari Furniture Showcase"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Section Heading
              </label>
              <input
                type="text"
                value={editorial.heading}
                onChange={(e) => handleEditorialField('heading', e.target.value)}
                placeholder="FURNITURE FOR THE WAY YOU LIVE."
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] font-serif focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Editorial Description
              </label>
              <textarea
                rows={4}
                value={editorial.description}
                onChange={(e) => handleEditorialField('description', e.target.value)}
                placeholder="Explore furniture created to bring comfort, style and character into everyday spaces..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={editorial.ctaPrimaryText}
                  onChange={(e) => handleEditorialField('ctaPrimaryText', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEC0] text-xs text-[#1C1511]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Secondary Button Label
                </label>
                <input
                  type="text"
                  value={editorial.ctaSecondaryText}
                  onChange={(e) => handleEditorialField('ctaSecondaryText', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEC0] text-xs text-[#1C1511]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <CloudinaryUploader
              label="Homepage Editorial Image (Cloudinary Permanent Media)"
              currentUrl={editorial.image}
              onUploadSuccess={(url) => handleEditorialField('image', url)}
              onOpenMediaLibrary={onOpenMediaLibrary}
              folder="tatari_furniture/editorial"
            />
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A3E2B]/70 mb-1">
                Image URL Reference
              </label>
              <input
                type="text"
                value={editorial.image}
                onChange={(e) => handleEditorialField('image', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8CEC0] text-xs font-mono text-[#3A271C]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. About Page Story & Showroom Image */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8CEC0] shadow-sm space-y-6">
        <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#5A3E2B]">
          <BookOpen className="w-4 h-4 text-[#C9A45C]" />
          <span>About Page Story & Showroom</span>
        </div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
            Showroom Philosophy & Story Content
          </h2>
          <p className="text-xs text-[#3A271C]/70 mt-1">
            Displayed on the dedicated /about page and showroom introduction section.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-[#ECE4D8]">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                About Banner Title
              </label>
              <input
                type="text"
                value={aboutStory.heroHeading}
                onChange={(e) => handleStoryField('heroHeading', e.target.value)}
                placeholder="FURNITURE WITH CHARACTER."
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] font-serif focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                About Banner Subtitle
              </label>
              <textarea
                rows={2}
                value={aboutStory.heroSubtitle}
                onChange={(e) => handleStoryField('heroSubtitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Story Section Headline
              </label>
              <input
                type="text"
                value={aboutStory.storyHeading}
                onChange={(e) => handleStoryField('storyHeading', e.target.value)}
                placeholder="Crafting Spaces That Inspire Comfort & Style"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] font-serif focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Story Paragraph 1
              </label>
              <textarea
                rows={3}
                value={aboutStory.storyParagraph1}
                onChange={(e) => handleStoryField('storyParagraph1', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                Story Paragraph 2 (Showroom & Location note)
              </label>
              <textarea
                rows={3}
                value={aboutStory.storyParagraph2}
                onChange={(e) => handleStoryField('storyParagraph2', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] focus:ring-2 focus:ring-[#C9A45C] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <CloudinaryUploader
              label="About Showroom Featured Photograph (Cloudinary Media)"
              currentUrl={aboutStory.showroomImage}
              onUploadSuccess={(url) => handleStoryField('showroomImage', url)}
              onOpenMediaLibrary={onOpenMediaLibrary}
              folder="tatari_furniture/about"
            />
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A3E2B]/70 mb-1">
                Showroom Image URL Reference
              </label>
              <input
                type="text"
                value={aboutStory.showroomImage}
                onChange={(e) => handleStoryField('showroomImage', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8CEC0] text-xs font-mono text-[#3A271C]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
