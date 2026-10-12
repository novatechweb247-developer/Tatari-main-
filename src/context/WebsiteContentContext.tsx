import React, { createContext, useContext, useState, useEffect } from 'react';
import { BUSINESS_INFO, HERO_SLIDES, PRODUCTS, GALLERY_ITEMS } from '../data';
import { Product, GalleryItem, EnquiryFormData } from '../types';

export interface WebsiteContentState {
  businessInfo: typeof BUSINESS_INFO;
  heroSlides: typeof HERO_SLIDES;
  products: Product[];
  galleryItems: GalleryItem[];
  editorial: {
    badge: string;
    heading: string;
    subheading: string;
    description: string;
    image: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
  };
  featuredCollections: {
    livingRoom: {
      title: string;
      subtitle: string;
      image: string;
      link: string;
    };
    bedroom: {
      title: string;
      subtitle: string;
      image: string;
      link: string;
    };
    custom: {
      title: string;
      subtitle: string;
      image: string;
      link: string;
    };
  };
  aboutStory: {
    heroHeading: string;
    heroSubtitle: string;
    storyHeading: string;
    storyParagraph1: string;
    storyParagraph2: string;
    showroomImage: string;
  };
}

const DEFAULT_CONTENT: WebsiteContentState = {
  businessInfo: BUSINESS_INFO,
  heroSlides: HERO_SLIDES,
  products: PRODUCTS,
  galleryItems: GALLERY_ITEMS,
  editorial: {
    badge: "Tatari Furniture Showcase",
    heading: "FURNITURE FOR THE WAY YOU LIVE.",
    subheading: "Curated Comfort & Elegance in Jos",
    description: "Explore furniture created to bring comfort, style and character into everyday spaces. Located in Jos, we offer carefully curated pieces that define modern Nigerian living with elegance and durability.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85",
    ctaPrimaryText: "Our Story & Showroom",
    ctaPrimaryLink: "/about",
    ctaSecondaryText: "View Gallery",
    ctaSecondaryLink: "/gallery",
  },
  featuredCollections: {
    livingRoom: {
      title: "Sofas & Lounge Sets",
      subtitle: "Living Room",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85",
      link: "/living-room",
    },
    bedroom: {
      title: "Beds & Wardrobes",
      subtitle: "Bedroom",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85",
      link: "/bedroom",
    },
    custom: {
      title: "Custom Furniture",
      subtitle: "Bespoke",
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=85",
      link: "/custom-furniture",
    },
  },
  aboutStory: {
    heroHeading: "FURNITURE WITH CHARACTER.",
    heroSubtitle: "Serving customers in Jos, Plateau State, Tatari Furniture is dedicated to bringing exceptional comfort, lasting quality, and distinctive style into every home.",
    storyHeading: "Crafting Spaces That Inspire Comfort & Style",
    storyParagraph1: "Your home is your sanctuary. At Tatari Furniture, we believe that every sofa, bed, and custom living piece should do more than simply fill a room—it should enrich your daily living experience.",
    storyParagraph2: `Located at ${BUSINESS_INFO.address}, we welcome clients to explore our showroom and discover pieces selected for their visual elegance, ergonomic comfort, and enduring durability.`,
    showroomImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
  },
};

interface WebsiteContentContextValue {
  content: WebsiteContentState;
  isLoading: boolean;
  refreshContent: () => Promise<void>;
  submitInquiry: (data: EnquiryFormData) => Promise<{ success: boolean; message: string; error?: string }>;
}

const WebsiteContentContext = createContext<WebsiteContentContextValue>({
  content: DEFAULT_CONTENT,
  isLoading: false,
  refreshContent: async () => {},
  submitInquiry: async () => ({ success: false, message: 'Not initialized' }),
});

export const WebsiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<WebsiteContentState>(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        if (data && data.businessInfo && data.heroSlides) {
          setContent(data);
        }
      }
    } catch (err) {
      console.warn('[WebsiteContentProvider] Using cached/default content, failed to load live content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const submitInquiry = async (data: EnquiryFormData) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, message: result.error || 'Failed to submit enquiry.', error: result.error };
      }
      return { success: true, message: result.message || 'Enquiry received successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error occurred.', error: err.message };
    }
  };

  return (
    <WebsiteContentContext.Provider
      value={{
        content,
        isLoading,
        refreshContent: fetchContent,
        submitInquiry,
      }}
    >
      {children}
    </WebsiteContentContext.Provider>
  );
};

export const useWebsiteContent = () => useContext(WebsiteContentContext);
