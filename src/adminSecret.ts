export const DEFAULT_ADMIN_SECRET_PATH = '/portal-tatari-vault-7k9w2x4m8q';

export function getClientAdminSecretPath(): string {
  if (typeof window !== 'undefined' && (window as any).__TATARI_ADMIN_BOOTSTRAP__?.secretPath) {
    return (window as any).__TATARI_ADMIN_BOOTSTRAP__.secretPath;
  }
  return DEFAULT_ADMIN_SECRET_PATH;
}
