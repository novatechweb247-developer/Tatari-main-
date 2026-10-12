import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BUSINESS_INFO, HERO_SLIDES, PRODUCTS, GALLERY_ITEMS } from '../src/data';
import { Product, GalleryItem, EnquiryFormData } from '../src/types';

export interface WebsiteContent {
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

export interface StoredInquiry extends EnquiryFormData {
  id: string;
  createdAt: string;
  status: 'new' | 'in-progress' | 'resolved' | 'archived';
  notes?: string;
}

export interface StoredMediaAsset {
  id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  resourceType: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  bytes?: number;
  originalFilename?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  version: number;
  contentDraft: WebsiteContent;
  contentPublished: WebsiteContent;
  inquiries: StoredInquiry[];
  mediaAssets: StoredMediaAsset[];
  meta: {
    lastDraftSavedAt: string | null;
    lastPublishedAt: string | null;
    createdAt: string;
  };
}

const isVercel = Boolean(process.env.VERCEL);
const DB_DIR = isVercel
  ? path.resolve('/tmp', 'tatari_data')
  : path.resolve(process.cwd(), 'server', 'data');
const SEED_FILE = path.resolve(process.cwd(), 'server', 'data', 'tatari_db.json');
const DB_FILE = path.join(DB_DIR, 'tatari_db.json');

const INITIAL_CONTENT: WebsiteContent = {
  businessInfo: { ...BUSINESS_INFO },
  heroSlides: JSON.parse(JSON.stringify(HERO_SLIDES)),
  products: JSON.parse(JSON.stringify(PRODUCTS)),
  galleryItems: JSON.parse(JSON.stringify(GALLERY_ITEMS)),
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

class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadOrCreate();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('[Database] Warning: Could not create DB directory, will fallback to memory:', err);
    }
  }

  private loadOrCreate(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.contentDraft && parsed.contentPublished) {
          return parsed;
        }
      }
      if (isVercel && fs.existsSync(SEED_FILE)) {
        const raw = fs.readFileSync(SEED_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.contentDraft && parsed.contentPublished) {
          this.persistSync(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Database] Could not read existing database file, initializing fresh:', err);
    }

    const initial: DatabaseSchema = {
      version: 1,
      contentDraft: JSON.parse(JSON.stringify(INITIAL_CONTENT)),
      contentPublished: JSON.parse(JSON.stringify(INITIAL_CONTENT)),
      inquiries: [
        {
          id: 'inq-seed-1',
          fullName: 'Chinedu Okafor',
          phone: '0802 345 6789',
          category: 'Living Room',
          subject: 'Royal Executive Sectional Inquiry',
          message: 'Hello Tatari Furniture team, I would like to know if the Royal Executive Sectional is currently on display at your Dogon Karfi showroom in Jos, and what color fabrics are available.',
          preferredContact: 'WhatsApp',
          status: 'new',
          createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          notes: 'Customer interested in viewing in Jos showroom.',
        },
        {
          id: 'inq-seed-2',
          fullName: 'Maryam Aliyu',
          phone: '0814 555 1234',
          category: 'Custom Furniture',
          subject: 'Custom Dining Table Request',
          message: 'Good day, do you build custom 8-seater dining tables using teak or mahogany hardwood? Please send catalog options to my WhatsApp.',
          preferredContact: 'WhatsApp',
          status: 'in-progress',
          createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          notes: 'Followed up via WhatsApp with wood sample photos.',
        }
      ],
      mediaAssets: [],
      meta: {
        lastDraftSavedAt: new Date().toISOString(),
        lastPublishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    };

    this.persistSync(initial);
    return initial;
  }

  private persistSync(dataToSave: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.warn('[Database] Warning: Could not write database file to disk, updated in-memory state:', err);
    }
  }

  public getPublishedContent(): WebsiteContent {
    return this.data.contentPublished;
  }

  public getDraftContent(): WebsiteContent {
    return this.data.contentDraft;
  }

  public saveDraft(content: Partial<WebsiteContent>): WebsiteContent {
    this.data.contentDraft = {
      ...this.data.contentDraft,
      ...content,
    };
    this.data.meta.lastDraftSavedAt = new Date().toISOString();
    this.persistSync(this.data);
    return this.data.contentDraft;
  }

  public publishChanges(): WebsiteContent {
    // Deep clone draft into published
    this.data.contentPublished = JSON.parse(JSON.stringify(this.data.contentDraft));
    this.data.meta.lastPublishedAt = new Date().toISOString();
    this.persistSync(this.data);
    return this.data.contentPublished;
  }

  public discardDraft(): WebsiteContent {
    this.data.contentDraft = JSON.parse(JSON.stringify(this.data.contentPublished));
    this.data.meta.lastDraftSavedAt = new Date().toISOString();
    this.persistSync(this.data);
    return this.data.contentDraft;
  }

  // Inquiries
  public getInquiries(): StoredInquiry[] {
    return this.data.inquiries;
  }

  public addInquiry(inquiryData: EnquiryFormData): StoredInquiry {
    const newInq: StoredInquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    this.data.inquiries.unshift(newInq);
    this.persistSync(this.data);
    return newInq;
  }

  public updateInquiryStatus(id: string, status: StoredInquiry['status'], notes?: string): StoredInquiry | null {
    const target = this.data.inquiries.find((i) => i.id === id);
    if (!target) return null;
    target.status = status;
    if (notes !== undefined) {
      target.notes = notes;
    }
    this.persistSync(this.data);
    return target;
  }

  public deleteInquiry(id: string): boolean {
    const initialLen = this.data.inquiries.length;
    this.data.inquiries = this.data.inquiries.filter((i) => i.id !== id);
    if (this.data.inquiries.length !== initialLen) {
      this.persistSync(this.data);
      return true;
    }
    return false;
  }

  // Media Assets
  public getMediaAssets(): StoredMediaAsset[] {
    return this.data.mediaAssets;
  }

  public recordMediaAsset(asset: Omit<StoredMediaAsset, 'id' | 'createdAt'>): StoredMediaAsset {
    const newAsset: StoredMediaAsset = {
      ...asset,
      id: `asset-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.mediaAssets.unshift(newAsset);
    this.persistSync(this.data);
    return newAsset;
  }

  public deleteMediaAsset(id: string): boolean {
    const initialLen = this.data.mediaAssets.length;
    this.data.mediaAssets = this.data.mediaAssets.filter((a) => a.id !== id);
    if (this.data.mediaAssets.length !== initialLen) {
      this.persistSync(this.data);
      return true;
    }
    return false;
  }

  public getDiagnostics() {
    return {
      status: 'connected',
      dbFilePath: DB_FILE,
      inquiriesCount: this.data.inquiries.length,
      newInquiriesCount: this.data.inquiries.filter(i => i.status === 'new').length,
      mediaCount: this.data.mediaAssets.length,
      productsCount: this.data.contentDraft.products.length,
      galleryItemsCount: this.data.contentDraft.galleryItems.length,
      lastDraftSavedAt: this.data.meta.lastDraftSavedAt,
      lastPublishedAt: this.data.meta.lastPublishedAt,
      createdAt: this.data.meta.createdAt,
    };
  }
}

export const db = new PersistentDatabase();
