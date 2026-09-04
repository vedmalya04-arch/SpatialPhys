import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { PhysicsStudio } from './components/studio/PhysicsStudio';

export type AppViewMode = 'landing' | 'studio';

export const App: React.FC = () => {
  // Determine initial view from URL hash or default to 'landing'
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    return window.location.hash === '#studio' ? 'studio' : 'landing';
  });

  // Listen to browser hash changes (Back/Forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const isStudio = window.location.hash === '#studio';
      setViewMode(isStudio ? 'studio' : 'landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (mode: AppViewMode) => {
    setViewMode(mode);
    if (mode === 'studio') {
      window.location.hash = 'studio';
    } else {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (viewMode === 'studio') {
    return <PhysicsStudio onBackToOverview={() => navigateTo('landing')} />;
  }

  return <LandingPage onLaunchStudio={() => navigateTo('studio')} />;
};
