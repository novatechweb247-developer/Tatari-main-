import React, { useState } from 'react';
import { Product } from '../../types';
import { CloudinaryUploader } from './CloudinaryUploader';
import { Plus, Trash2, Edit3, X, Check, Search, Sliders, Image as ImageIcon } from 'lucide-react';

interface ProductsEditorProps {
  products: Product[];
  onChange: (products: Product[]) => void;
  onOpenMediaLibrary: () => void;
}

export const ProductsEditor: React.FC<ProductsEditorProps> = ({
  products,
  onChange,
  onOpenMediaLibrary,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'living-room' | 'bedroom' | 'custom' | 'other'>('living-room');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMaterials, setFormMaterials] = useState('');
  const [formDimensions, setFormDimensions] = useState('');
  const [formFeatures, setFormFeatures] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('living-room');
    setFormImage('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85');
    setFormDescription('');
    setFormMaterials('');
    setFormDimensions('');
    setFormFeatures('');
    setIsCreatingNew(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormImage(p.image);
    setFormDescription(p.description);
    setFormMaterials(p.materials || '');
    setFormDimensions(p.dimensions || '');
    setFormFeatures((p.features || []).join('\n'));
    setIsCreatingNew(false);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const categoryLabels: Record<string, string> = {
      'living-room': 'Living Room',
      'bedroom': 'Bedroom',
      'custom': 'Custom Bespoke',
      'other': 'Other Furniture',
    };

    const featuresArray = formFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (isCreatingNew) {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        categoryLabel: categoryLabels[formCategory] || 'Furniture',
        image: formImage.trim(),
        description: formDescription.trim(),
        materials: formMaterials.trim() || undefined,
        dimensions: formDimensions.trim() || undefined,
        features: featuresArray.length > 0 ? featuresArray : undefined,
      };
      onChange([newProduct, ...products]);
    } else if (editingProduct) {
      const updated = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formName.trim(),
            category: formCategory,
            categoryLabel: categoryLabels[formCategory] || 'Furniture',
            image: formImage.trim(),
            description: formDescription.trim(),
            materials: formMaterials.trim() || undefined,
            dimensions: formDimensions.trim() || undefined,
            features: featuresArray.length > 0 ? featuresArray : undefined,
          };
        }
        return p;
      });
      onChange(updated);
    }
    closeModal();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      onChange(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with actions and filter */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C] mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Furniture Catalog</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
            Products & Inventory Management
          </h2>
          <p className="text-xs text-[#3A271C]/70">
            Total of {products.length} catalog items across living room, bedroom, and custom pieces.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#1C1511] hover:bg-[#3A271C] text-[#F6F1E8] text-xs font-semibold uppercase tracking-wider transition-colors shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Furniture Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'living-room', label: 'Living Room' },
            { id: 'bedroom', label: 'Bedroom' },
            { id: 'custom', label: 'Custom' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#5A3E2B] text-white shadow-sm'
                  : 'bg-white text-[#3A271C] border border-[#D8CEC0] hover:bg-[#F6F1E8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#3A271C]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by piece name..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-[#D8CEC0] bg-white text-xs text-[#1C1511] focus:outline-none focus:ring-1 focus:ring-[#C9A45C]"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-[#D8CEC0] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 bg-[#1C1511] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-[#1C1511]/80 text-[#C9A45C] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {product.categoryLabel}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-serif text-lg text-[#1C1511] font-normal mb-1">{product.name}</h3>
                <p className="text-xs text-[#3A271C]/70 line-clamp-2 mb-3 font-light">{product.description}</p>
                {product.materials && (
                  <div className="text-[11px] text-[#5A3E2B] font-mono bg-[#F6F1E8] px-2.5 py-1 rounded mb-2">
                    {product.materials}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-[#ECE4D8] flex items-center justify-between">
              <span className="text-[10px] text-[#3A271C]/50 font-mono">ID: {product.id}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => openEditModal(product)}
                  className="p-2 rounded-lg bg-[#F6F1E8] hover:bg-[#5A3E2B] hover:text-white text-[#5A3E2B] transition-colors"
                  title="Edit product"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="p-2 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#D8CEC0]">
          <p className="text-sm text-[#3A271C]/70 font-light">No products found matching your search or category filter.</p>
        </div>
      )}

      {/* Edit / Create Modal */}
      {(isCreatingNew || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-[#1C1511]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D8CEC0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE4D8] mb-6">
              <h3 className="font-serif text-2xl text-[#1C1511]">
                {isCreatingNew ? 'Add New Furniture Piece' : `Edit: ${editingProduct?.name}`}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-full text-[#3A271C]/60 hover:bg-[#F6F1E8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. The Royal Executive Sectional"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                    Room / Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511] bg-white"
                  >
                    <option value="living-room">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="custom">Custom Furniture</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                    Materials
                  </label>
                  <input
                    type="text"
                    value={formMaterials}
                    onChange={(e) => setFormMaterials(e.target.value)}
                    placeholder="e.g. Teak Hardwood & Velvet"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed description of craftsmanship, cushions, and design features..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  placeholder="High-density foam core&#10;Kiln-dried hardwood frame&#10;Stain-resistant fabric"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8CEC0] text-sm text-[#1C1511]"
                />
              </div>

              {/* Cloudinary Uploader */}
              <CloudinaryUploader
                label="Product Photography (Cloudinary Media)"
                currentUrl={formImage}
                onUploadSuccess={(url) => setFormImage(url)}
                onOpenMediaLibrary={onOpenMediaLibrary}
                folder="tatari_furniture/products"
              />

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5A3E2B]/70 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#D8CEC0] text-xs font-mono"
                />
              </div>

              <div className="pt-4 border-t border-[#ECE4D8] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full border border-[#D8CEC0] text-xs font-medium uppercase text-[#3A271C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#1C1511] text-[#F6F1E8] text-xs font-semibold uppercase tracking-wider hover:bg-[#3A271C]"
                >
                  {isCreatingNew ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
