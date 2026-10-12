import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { CloudinaryUploader } from './CloudinaryUploader';
import { Plus, Trash2, Edit3, X, Image as ImageIcon } from 'lucide-react';

interface GalleryEditorProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  onOpenMediaLibrary: () => void;
}

export const GalleryEditor: React.FC<GalleryEditorProps> = ({
  items,
  onChange,
  onOpenMediaLibrary,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<GalleryItem['category']>('Showroom');
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const categories: Array<GalleryItem['category']> = [
    'Living Room',
    'Bedroom',
    'Furniture',
    'Showroom',
    'Interiors',
  ];

  const filtered = selectedCat === 'All' ? items : items.filter((i) => i.category === selectedCat);

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('Showroom');
    setFormImage('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85');
    setFormDesc('');
    setIsCreating(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormImage(item.image);
    setFormDesc(item.description);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImage.trim()) return;

    if (isCreating) {
      const newItem: GalleryItem = {
        id: `gal-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        image: formImage.trim(),
        description: formDesc.trim(),
      };
      onChange([newItem, ...items]);
    } else if (editingItem) {
      const updated = items.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              title: formTitle.trim(),
              category: formCategory,
              image: formImage.trim(),
              description: formDesc.trim(),
            }
          : i
      );
      onChange(updated);
    }
    setIsCreating(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this photo from the showroom gallery?')) {
      onChange(items.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C] mb-1">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Showroom Showcase</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
            Visual Gallery Management
          </h2>
          <p className="text-xs text-[#3A271C]/70">
            {items.length} high-resolution photographs displayed on the /gallery page with interactive lightbox modal.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#1C1511] hover:bg-[#3A271C] text-[#F6F1E8] text-xs font-semibold uppercase tracking-wider transition-colors shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gallery Photo</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
              selectedCat === cat
                ? 'bg-[#5A3E2B] text-white'
                : 'bg-white text-[#3A271C] border border-[#D8CEC0] hover:bg-[#F6F1E8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#D8CEC0] overflow-hidden shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-44 bg-[#1C1511] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2.5 left-2.5 bg-[#1C1511]/80 text-[#C9A45C] text-[9px] uppercase px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-serif text-base text-[#1C1511] font-medium line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-[#3A271C]/70 line-clamp-2 mt-1">{item.description}</p>
              </div>
            </div>

            <div className="p-3 border-t border-[#ECE4D8] flex items-center justify-end space-x-2">
              <button
                onClick={() => openEdit(item)}
                className="p-1.5 rounded bg-[#F6F1E8] hover:bg-[#5A3E2B] hover:text-white text-[#5A3E2B]"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded bg-red-50 hover:bg-red-600 hover:text-white text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(isCreating || editingItem) && (
        <div className="fixed inset-0 z-50 bg-[#1C1511]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D8CEC0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE4D8] mb-4">
              <h3 className="font-serif text-xl text-[#1C1511]">
                {isCreating ? 'Add Gallery Photograph' : 'Edit Gallery Item'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-full text-[#3A271C]/60 hover:bg-[#F6F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-[#5A3E2B] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8CEC0] text-xs text-[#1C1511]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#5A3E2B] mb-1">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8CEC0] text-xs text-[#1C1511] bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#5A3E2B] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8CEC0] text-xs text-[#1C1511]"
                />
              </div>

              <CloudinaryUploader
                label="Gallery Photo (Cloudinary Media)"
                currentUrl={formImage}
                onUploadSuccess={(url) => setFormImage(url)}
                onOpenMediaLibrary={onOpenMediaLibrary}
                folder="tatari_furniture/gallery"
              />

              <div className="pt-3 border-t border-[#ECE4D8] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-full border border-[#D8CEC0] text-xs uppercase font-medium text-[#3A271C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#1C1511] text-[#F6F1E8] text-xs uppercase font-semibold tracking-wider hover:bg-[#3A271C]"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
