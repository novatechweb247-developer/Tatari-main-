import React from 'react';
import { WebsiteContentState } from '../../context/WebsiteContentContext';
import { Settings, MapPin, Phone, MessageCircle, Globe } from 'lucide-react';

interface SettingsEditorProps {
  businessInfo: WebsiteContentState['businessInfo'];
  onChange: (info: WebsiteContentState['businessInfo']) => void;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  businessInfo,
  onChange,
}) => {
  const handleChange = (field: keyof WebsiteContentState['businessInfo'], value: string) => {
    onChange({
      ...businessInfo,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8CEC0] shadow-sm space-y-8">
      <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C]">
        <Settings className="w-4 h-4" />
        <span>Site-Wide Settings</span>
      </div>
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
          Business & Showroom Information
        </h2>
        <p className="text-xs text-[#3A271C]/70 mt-1">
          These settings populate the header brand, footer, showroom banners, contact page, and WhatsApp button across the site.
        </p>
      </div>

      <div className="space-y-6 pt-4 border-t border-[#ECE4D8]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
              Store / Brand Name
            </label>
            <input
              type="text"
              value={businessInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
              Brand Tagline
            </label>
            <input
              type="text"
              value={businessInfo.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
            Physical Showroom Address (Jos, Plateau)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A3E2B]" />
            <input
              type="text"
              value={businessInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
              Display Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A3E2B]" />
              <input
                type="text"
                value={businessInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0803 217 4376"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
              International Phone Format
            </label>
            <input
              type="text"
              value={businessInfo.phoneInternational}
              onChange={(e) => handleChange('phoneInternational', e.target.value)}
              placeholder="+2348032174376"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
              WhatsApp Direct Link
            </label>
            <div className="relative">
              <MessageCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
              <input
                type="text"
                value={businessInfo.whatsappUrl}
                onChange={(e) => handleChange('whatsappUrl', e.target.value)}
                placeholder="https://wa.me/2348032174376"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
              Google Maps Location Link
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A3E2B]" />
              <input
                type="text"
                value={businessInfo.mapUrl}
                onChange={(e) => handleChange('mapUrl', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
            Store Description (Footer & Meta)
          </label>
          <textarea
            rows={3}
            value={businessInfo.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
          />
        </div>
      </div>
    </div>
  );
};
