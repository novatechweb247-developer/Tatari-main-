/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WebsiteContentProvider } from './context/WebsiteContentContext';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Collections } from './pages/Collections';
import { Gallery } from './pages/Gallery';
import { Contact } from './pages/Contact';
import { AdminCenter } from './admin/AdminCenter';
import { getClientAdminSecretPath } from './adminSecret';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

  const secretPath = getClientAdminSecretPath();
  const normalizePath = (p: string) => (p || '/').trim().replace(/\/+$/, '') || '/';
  const isAdminRoute =
    normalizePath(currentPath) === normalizePath(secretPath) ||
    Boolean((window as any).__TATARI_ADMIN_BOOTSTRAP__?.authorized);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // If directly accessing the secret Admin Center route
  if (isAdminRoute) {
    return (
      <WebsiteContentProvider>
        <AdminCenter secretPath={secretPath} onNavigate={handleNavigate} />
      </WebsiteContentProvider>
    );
  }

  // Exactly 5 mandatory public website pages: Home, About, Collection, Gallery, Contact
  const renderMandatoryPage = () => {
    switch (currentPath) {
      case '/':
        return <Home onNavigate={handleNavigate} />;
      case '/about':
        return <About onNavigate={handleNavigate} />;
      case '/collections':
      case '/collection':
      case '/living-room':
      case '/bedroom':
      case '/custom-furniture':
        return <Collections onNavigate={handleNavigate} />;
      case '/gallery':
        return <Gallery />;
      case '/contact':
        return <Contact />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <WebsiteContentProvider>
      <div className="min-h-screen flex flex-col bg-[#F6F1E8] text-[#1C1511] font-sans selection:bg-[#C9A45C] selection:text-white">
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />

        {loadingComplete && (
          <>
            <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
            <main className="flex-grow">
              {renderMandatoryPage()}
            </main>
            <Footer onNavigate={handleNavigate} />
            <WhatsAppButton />
          </>
        )}
      </div>
    </WebsiteContentProvider>
  );
}
