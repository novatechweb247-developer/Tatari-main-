import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

// Secure configurable secret URL path - never obvious paths like /admin or /cms
export const DEFAULT_SECRET_PATH = '/portal-tatari-vault-7k9w2x4m8q';

export function getAdminSecretPath(): string {
  const configured = process.env.ADMIN_SECRET_PATH?.trim();
  if (configured && configured.startsWith('/')) {
    return configured;
  }
  return DEFAULT_SECRET_PATH;
}

// Internal session secret for token signing (ephemeral per deployment or configured)
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'tatari-secret-portal-session-key-2026';

/**
 * Creates a cryptographically signed time-stamped admin session token.
 */
export function createAdminSessionToken(): string {
  const payload = `tatari-admin:${Date.now()}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

/**
 * Validates a signed admin session token.
 */
export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [prefix, timestampStr, providedHmac] = parts;
    if (prefix !== 'tatari-admin') return false;

    // Optional expiration check (e.g. 7 days)
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 3600 * 1000) {
      return false;
    }

    const payload = `${prefix}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

/**
 * Parses cookies from cookie header.
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });
  return list;
}

/**
 * Express middleware to guard all /api/admin/* routes.
 * Requests must carry a valid session token either in cookies or X-Admin-Token header.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie);
  const tokenFromCookie = cookies['tatari_adm_token'];
  const tokenFromHeader = req.headers['x-admin-token'] as string | undefined;

  const token = tokenFromHeader || tokenFromCookie;

  if (verifyAdminSessionToken(token)) {
    return next();
  }

  // Obscure non-administrative access: Return 404 to hide the existence of the endpoint
  res.status(404).json({ error: 'Not Found' });
}
