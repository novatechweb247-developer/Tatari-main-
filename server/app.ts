import express from 'express';
import dotenv from 'dotenv';
import { db } from './db';
import {
  getAdminSecretPath,
  createAdminSessionToken,
  requireAdminAuth,
} from './adminAuth';
import {
  getCloudinaryConfig,
  generateUploadSignature,
  uploadToCloudinary,
} from './cloudinary';

dotenv.config();

export const app = express();

// CORS & Preflight handling for iframe previews and cross-origin environments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Secret-Path, X-Admin-Token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Body parsers with generous limits for media upload payloads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Serverless URL normalization (in case rewrites pass /admin/* or /health without /api prefix)
app.use((req, _res, next) => {
  if (req.url.startsWith('/admin/') && !req.url.startsWith('/api/admin/')) {
    req.url = '/api' + req.url;
  } else if (req.url === '/content' || req.url.startsWith('/content?')) {
    req.url = '/api' + req.url;
  }
  next();
});

// ----------------------------------------------------
// Public APIs
// ----------------------------------------------------

// 1. Published website content
app.get('/api/content', (_req, res) => {
  try {
    const published = db.getPublishedContent();
    res.json(published);
  } catch (err: any) {
    console.error('[API] Failed to get published content:', err);
    res.status(500).json({ error: 'Failed to retrieve website content' });
  }
});

// 2. Public contact & booking enquiry submission
app.post('/api/inquiries', (req, res) => {
  try {
    const { fullName, phone, category, subject, message, preferredContact } = req.body;
    if (!fullName?.trim() || !phone?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, phone number, and message are required.' });
    }

    const saved = db.addInquiry({
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      category: String(category || 'Living Room').trim(),
      subject: String(subject || 'General Showroom Enquiry').trim(),
      message: String(message).trim(),
      preferredContact: preferredContact || 'WhatsApp',
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry received successfully! Our showroom team will contact you shortly.',
      inquiryId: saved.id,
    });
  } catch (err: any) {
    console.error('[API] Failed to submit enquiry:', err);
    res.status(500).json({ error: 'Failed to save enquiry. Please try again or message via WhatsApp.' });
  }
});

// 3. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// Protected Admin APIs (Secret Session Required)
// ----------------------------------------------------

// Admin Session Acquisition (can exchange secret path for signed session token)
app.post('/api/admin/session', (req, res) => {
  const secretPathProvided = (req.body?.secretPath || req.headers['x-secret-path'] || req.query?.secret_path) as string | undefined;
  const normalizePath = (p?: string) => p ? p.trim().replace(/\/+$/, '') : '';
  const configuredSecret = normalizePath(getAdminSecretPath());

  if (secretPathProvided && normalizePath(secretPathProvided) === configuredSecret) {
    const token = createAdminSessionToken();
    res.cookie('tatari_adm_token', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 3600 * 1000,
    });
    return res.json({
      success: true,
      token,
      secretPath: getAdminSecretPath(),
    });
  }
  res.status(404).json({ error: 'Not Found' });
});

// Verify active admin session
app.get('/api/admin/verify', requireAdminAuth, (_req, res) => {
  res.json({ authorized: true, secretPath: getAdminSecretPath() });
});

// Content management: Retrieve draft & published versions
app.get('/api/admin/content', requireAdminAuth, (_req, res) => {
  try {
    const draft = db.getDraftContent();
    const published = db.getPublishedContent();
    const diagnostics = db.getDiagnostics();
    res.json({ draft, published, meta: diagnostics });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load content' });
  }
});

// Save Draft (does NOT affect the live website until published)
app.put('/api/admin/content/draft', requireAdminAuth, (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ error: 'Invalid content payload' });
    }
    const updatedDraft = db.saveDraft(content);
    res.json({
      success: true,
      message: 'Draft changes saved successfully to database.',
      draft: updatedDraft,
      savedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Admin API] Save draft failed:', err);
    res.status(500).json({ error: 'Failed to persist draft changes.' });
  }
});

// Publish Changes (makes current draft live on the public website)
app.post('/api/admin/content/publish', requireAdminAuth, (_req, res) => {
  try {
    const updatedPublished = db.publishChanges();
    res.json({
      success: true,
      message: 'Changes published successfully! Public website is now displaying latest version.',
      published: updatedPublished,
      publishedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Admin API] Publish failed:', err);
    res.status(500).json({ error: 'Failed to publish changes.' });
  }
});

// Discard draft and revert to currently published version
app.post('/api/admin/content/discard', requireAdminAuth, (_req, res) => {
  try {
    const revertedDraft = db.discardDraft();
    res.json({
      success: true,
      message: 'Draft discarded. Reverted to currently published content.',
      draft: revertedDraft,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to discard draft.' });
  }
});

// Inquiries list
app.get('/api/admin/inquiries', requireAdminAuth, (_req, res) => {
  try {
    const list = db.getInquiries();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve inquiries' });
  }
});

// Update inquiry status or notes
app.patch('/api/admin/inquiries/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updated = db.updateInquiryStatus(id, status, notes);
    if (!updated) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json({ success: true, inquiry: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// Delete inquiry
app.delete('/api/admin/inquiries/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteInquiry(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// Media Library list
app.get('/api/admin/media', requireAdminAuth, (_req, res) => {
  try {
    const assets = db.getMediaAssets();
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve media library' });
  }
});

// Record uploaded media asset
app.post('/api/admin/media', requireAdminAuth, (req, res) => {
  try {
    const { secureUrl, url, publicId, format, resourceType, width, height, bytes, originalFilename } = req.body;
    if (!secureUrl || !publicId) {
      return res.status(400).json({ error: 'Missing secureUrl or publicId' });
    }
    const saved = db.recordMediaAsset({
      secureUrl,
      url: url || secureUrl,
      publicId,
      format,
      resourceType: resourceType || 'image',
      width,
      height,
      bytes,
      originalFilename,
    });
    res.status(201).json({ success: true, asset: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save media asset' });
  }
});

// Delete media asset record
app.delete('/api/admin/media/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteMediaAsset(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete media asset' });
  }
});

// Cloudinary configuration status (never leaks secrets)
app.get('/api/admin/cloudinary/config', requireAdminAuth, (_req, res) => {
  res.json(getCloudinaryConfig());
});

// Generate signature for signed direct browser upload to Cloudinary
app.post('/api/admin/cloudinary/sign', requireAdminAuth, (req, res) => {
  try {
    const { paramsToSign } = req.body;
    if (!paramsToSign || typeof paramsToSign !== 'object') {
      return res.status(400).json({ error: 'Invalid paramsToSign' });
    }
    const signed = generateUploadSignature(paramsToSign);
    res.json(signed);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Signature generation failed' });
  }
});

// Upload media file via secure server-side proxy to Cloudinary
app.post('/api/admin/cloudinary/upload', requireAdminAuth, async (req, res) => {
  try {
    const { file, folder, resourceType, publicId } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'Missing file payload (base64 or URL)' });
    }

    const uploaded = await uploadToCloudinary(file, {
      folder: folder || 'tatari_furniture',
      resourceType: resourceType || 'auto',
      publicId,
    });

    // Auto-record to database media library
    const savedAsset = db.recordMediaAsset({
      secureUrl: uploaded.secureUrl,
      url: uploaded.url,
      publicId: uploaded.publicId,
      format: uploaded.format,
      resourceType: uploaded.resourceType,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
      originalFilename: uploaded.originalFilename,
    });

    res.json({
      success: true,
      asset: savedAsset,
      cloudinary: uploaded,
    });
  } catch (err: any) {
    console.error('[Cloudinary Upload Error]:', err);
    res.status(400).json({ error: err.message || 'Upload to Cloudinary failed' });
  }
});

// Admin Diagnostics
app.get('/api/admin/diagnostics', requireAdminAuth, (_req, res) => {
  try {
    const dbDiag = db.getDiagnostics();
    const cloudDiag = getCloudinaryConfig();
    res.json({
      database: {
        status: 'online',
        provider: 'Persistent JSON Store (Atomic Swap)',
        ...dbDiag,
      },
      cloudinary: {
        configured: cloudDiag.isConfigured,
        cloudName: cloudDiag.cloudName,
        missingKeys: cloudDiag.missingKeys,
      },
      serverTime: new Date().toISOString(),
      secretPath: getAdminSecretPath(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to run diagnostics' });
  }
});
