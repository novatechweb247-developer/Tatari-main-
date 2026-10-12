import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { Product } from '../types';

interface CollectionsProps {
  onNavigate: (path: string) => void;
}

export const Collections: React.FC<CollectionsProps> = ({ onNavigate }) => {
  const { content } = useWebsiteContent();
  const products = content.products || [];
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Collections' },
    { id: 'living-room', name: 'Living Room' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'custom', name: 'Custom Furniture' },
    { id: 'other', name: 'Other Furniture' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#5A3E2B] font-semibold block mb-4">
            Catalog & Showroom
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#1C1511] mb-6">
            OUR COLLECTIONS.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#3A271C] font-light leading-relaxed">
            Carefully curated furniture suites built for comfortable living, aesthetic charm, and everyday resilience.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-6 py-3 text-xs uppercase tracking-wider font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#1C1511] text-[#F6F1E8] shadow-lg'
                  : 'bg-white text-[#3A271C] border border-[#D8CEC0] hover:bg-[#D8CEC0]/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product: Product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xl border border-[#D8CEC0] flex flex-col justify-between group hover:shadow-2xl transition-all"
            >
              <div className="relative h-80 overflow-hidden bg-[#1C1511]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-[#1C1511]/80 backdrop-blur-sm text-[#C9A45C] text-[10px] uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full font-medium">
                  {product.categoryLabel}
                </div>
              </div>

              <div className="p-8 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#1C1511] mb-3">
                    {product.name}
                  </h3>
                  <p className="text-[#3A271C] text-sm font-light leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {product.features && product.features.length > 0 && (
                    <ul className="mb-6 space-y-1.5 text-xs text-[#5A3E2B]">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] mr-2" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-6 border-t border-[#ECE4D8] flex items-center justify-between">
                  <span className="text-xs text-[#5A3E2B] font-medium uppercase tracking-wider">
                    {product.materials || 'Mastercrafted'}
                  </span>
                  <a
                    href="/contact"
                    onClick={(e) => handleNav(e, '/contact')}
                    className="inline-flex items-center justify-center rounded-full bg-[#1C1511] hover:bg-[#3A271C] text-[#F6F1E8] font-medium text-xs tracking-wider uppercase px-6 py-3 transition-colors shadow-md"
                  >
                    Enquire Piece
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
