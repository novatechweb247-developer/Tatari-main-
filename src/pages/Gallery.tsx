import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { GalleryItem } from '../types';
import { LightboxModal } from '../components/LightboxModal';
import { Eye } from 'lucide-react';

export const Gallery: React.FC = () => {
  const { content } = useWebsiteContent();
  const galleryItems = content.galleryItems || [];
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const categories = ['All', 'Living Room', 'Bedroom', 'Furniture', 'Showroom', 'Interiors'];

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  const handleOpenLightbox = (index: number) => {
    setSelectedItemIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedItemIndex(null);
  };

  const handleNext = () => {
    if (selectedItemIndex === null) return;
    setSelectedItemIndex((prev) => (prev! + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (selectedItemIndex === null) return;
    setSelectedItemIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#5A3E2B] font-semibold block mb-4">
            Visual Showroom & Interiors
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#1C1511] mb-6">
            GALLERY.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#3A271C] font-light leading-relaxed">
            Immerse yourself in our editorial showcase of furniture craftsmanship and showroom displays in Jos.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-6 py-3 text-xs uppercase tracking-wider font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#1C1511] text-[#F6F1E8] shadow-lg'
                  : 'bg-white text-[#3A271C] border border-[#D8CEC0] hover:bg-[#D8CEC0]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry / Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => handleOpenLightbox(index)}
              className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-[#1C1511] border border-[#D8CEC0]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1511]/90 via-[#1C1511]/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1C1511]/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Eye className="w-5 h-5 text-[#C9A45C]" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A45C] block mb-1">
                  {item.category}
                </span>
                <h3 className="font-serif text-2xl font-normal mb-2 text-[#F6F1E8]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#D8CEC0] font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItemIndex !== null && (
        <LightboxModal
          items={filteredItems}
          currentIndex={selectedItemIndex}
          onClose={handleCloseLightbox}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};
