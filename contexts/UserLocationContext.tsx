import React, { createContext, ReactNode, useContext, useState } from 'react';

interface UserLocationContextType {
  city: string | null;
  state: string | null;
  setLocation: (city: string, state: string) => void;
}

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

interface UserLocationProviderProps {
  children: ReactNode;
}

export const UserLocationProvider: React.FC<UserLocationProviderProps> = ({ children }) => {
  const [city, setCity] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);

  const setLocation = (newCity: string, newState: string) => {
    setCity(newCity);
    setState(newState);
  };

  const value: UserLocationContextType = {
    city,
    state,
    setLocation,
  };

  return (
    <UserLocationContext.Provider value={value}>
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = (): UserLocationContextType => {
  const context = useContext(UserLocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used within a UserLocationProvider');
  }
  return context;
};
