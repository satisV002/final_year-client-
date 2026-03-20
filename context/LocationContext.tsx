'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export interface LocationState {
  state: string;
  district?: string;
}

interface LocationContextType {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  resetLocation: () => void;
}

const DEFAULT_LOCATION: LocationState = { state: 'All India' };
const COOKIE_NAME = 'aquawatch_location';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(DEFAULT_LOCATION);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from cookies on mount
  useEffect(() => {
    const saved = Cookies.get(COOKIE_NAME);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.state) {
          setLocationState(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved location', e);
      }
    }
    setIsInitialized(true);
  }, []);

  const setLocation = (loc: LocationState) => {
    setLocationState(loc);
    Cookies.set(COOKIE_NAME, JSON.stringify(loc), { expires: 30 }); // Save for 30 days
  };

  const resetLocation = () => {
    setLocation(DEFAULT_LOCATION);
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, resetLocation }}>
      {isInitialized ? children : <div className="min-h-screen bg-slate-950" />}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
