import { createContext, useContext, useState, ReactNode } from 'react';

interface MemoryBookContextType {
  memoryBookId: string | null;
  setMemoryBookId: (id: string | null) => void;
}

const MemoryBookContext = createContext<MemoryBookContextType | undefined>(undefined);

export function MemoryBookProvider({ children }: { children: ReactNode }) {
  const [memoryBookId, setMemoryBookId] = useState<string | null>(() => {
    // Load from localStorage for persistence
    return localStorage.getItem('currentMemoryBookId');
  });

  const updateMemoryBookId = (id: string | null) => {
    setMemoryBookId(id);
    if (id) {
      localStorage.setItem('currentMemoryBookId', id);
    } else {
      localStorage.removeItem('currentMemoryBookId');
    }
  };

  return (
    <MemoryBookContext.Provider
      value={{ memoryBookId, setMemoryBookId: updateMemoryBookId }}
    >
      {children}
    </MemoryBookContext.Provider>
  );
}

export function useMemoryBook() {
  const context = useContext(MemoryBookContext);
  if (context === undefined) {
    throw new Error('useMemoryBook must be used within a MemoryBookProvider');
  }
  return context;
}
