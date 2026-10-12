import React from 'react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { Product } from '../types';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CustomFurnitureProps {
  onNavigate: (path: string) => void;
}

export const CustomFurniture: React.FC<CustomFurnitureProps> = ({ onNavigate }) => {
  const { content } = useWebsiteContent();
  const customProducts = (content.products || []).filter((p) => p.category === 'custom');

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#5A3E2B] font-semibold block mb-4">
            Tailored Solutions
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#1C1511] mb-6">
            CUSTOM FURNITURE.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#3A271C] font-light leading-relaxed">
            Have specific dimensions or a unique design in mind? Let Tatari Furniture help you source or create furniture tailored precisely to your space.
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-[#1C1511] text-[#F6F1E8] rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
            <Sparkles className="w-96 h-96 text-[#C9A45C]" />
          </div>
          <div className="max-w-2xl relative z-10">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold block mb-3">
              Bespoke Craftsmanship Process
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light mb-6 text-[#F6F1E8]">
              Your Vision, Exact Dimensions, Our Expertise.
            </h2>
            <p className="text-[#D8CEC0] text-sm sm:text-base font-light leading-relaxed mb-8">
              Whether you need a custom-built dining set for large gatherings, an executive desk, or specialized sectional proportions to fit a unique living room layout in Jos, our artisans work with seasoned hardwoods and exquisite upholstery.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/contact"
                onClick={(e) => handleNav(e, '/contact')}
                className="inline-flex items-center justify-center rounded-full bg-[#C9A45C] hover:bg-[#DFC27A] text-[#1C1511] font-medium text-xs tracking-wider uppercase px-8 py-4 transition-all shadow-lg"
              >
                Discuss a Custom Project <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Custom Examples Grid */}
        <div className="mb-12">
          <h3 className="font-serif text-3xl font-normal text-[#1C1511] mb-8 text-center">
            Custom Portfolio Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {customProducts.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xl border border-[#D8CEC0] flex flex-col justify-between group"
              >
                <div className="relative h-80 overflow-hidden bg-[#1C1511]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-[#1C1511]/80 backdrop-blur-sm text-[#C9A45C] text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full">
                    Custom Build
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
                      {product.materials || 'Custom Hardwood'}
                    </span>
                    <a
                      href="/contact"
                      onClick={(e) => handleNav(e, '/contact')}
                      className="inline-flex items-center justify-center rounded-full bg-[#1C1511] hover:bg-[#3A271C] text-[#F6F1E8] font-medium text-xs tracking-wider uppercase px-6 py-3 transition-colors shadow-md"
                    >
                      Enquire Custom
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
