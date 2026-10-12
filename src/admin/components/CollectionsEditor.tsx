import React from 'react';
import { CloudinaryUploader } from './CloudinaryUploader';
import { Layers } from 'lucide-react';
import { WebsiteContentState } from '../../context/WebsiteContentContext';

interface CollectionsEditorProps {
  collections: WebsiteContentState['featuredCollections'];
  onChange: (collections: WebsiteContentState['featuredCollections']) => void;
  onOpenMediaLibrary: () => void;
}

export const CollectionsEditor: React.FC<CollectionsEditorProps> = ({
  collections,
  onChange,
  onOpenMediaLibrary,
}) => {
  const handleCollectionChange = (
    key: 'livingRoom' | 'bedroom' | 'custom',
    field: string,
    value: string
  ) => {
    onChange({
      ...collections,
      [key]: {
        ...collections[key],
        [field]: value,
      },
    });
  };

  const collectionList: Array<{
    key: 'livingRoom' | 'bedroom' | 'custom';
    name: string;
    path: string;
  }> = [
    { key: 'livingRoom', name: 'Living Room Collection', path: '/living-room' },
    { key: 'bedroom', name: 'Bedroom Collection', path: '/bedroom' },
    { key: 'custom', name: 'Custom & Bespoke Furniture', path: '/custom-furniture' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D8CEC0] shadow-sm space-y-6">
      <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C]">
        <Layers className="w-4 h-4" />
        <span>Curated Spaces</span>
      </div>
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
          Featured Collection Showcase Cards
        </h2>
        <p className="text-xs text-[#3A271C]/70 mt-1">
          Manage the 3 category cards showcased on the homepage that link directly into individual room catalogs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#ECE4D8]">
        {collectionList.map(({ key, name, path }) => {
          const item = collections[key];
          return (
            <div key={key} className="p-5 rounded-2xl border border-[#D8CEC0] bg-[#F6F1E8]/20 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#ECE4D8]">
                <h3 className="font-serif text-lg text-[#1C1511] font-medium">{name}</h3>
                <span className="text-[10px] font-mono text-[#5A3E2B] bg-[#F6F1E8] px-2 py-0.5 rounded">
                  {path}
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Card Title
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleCollectionChange(key, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEC0] bg-white text-xs text-[#1C1511]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Tag / Subtitle
                </label>
                <input
                  type="text"
                  value={item.subtitle}
                  onChange={(e) => handleCollectionChange(key, 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEC0] bg-white text-xs text-[#1C1511]"
                />
              </div>

              <div>
                <CloudinaryUploader
                  label="Category Card Image"
                  currentUrl={item.image}
                  onUploadSuccess={(url) => handleCollectionChange(key, 'image', url)}
                  onOpenMediaLibrary={onOpenMediaLibrary}
                  folder="tatari_furniture/collections"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={item.image}
                  onChange={(e) => handleCollectionChange(key, 'image', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg border border-[#D8CEC0] bg-white text-[11px] font-mono text-[#3A271C]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
