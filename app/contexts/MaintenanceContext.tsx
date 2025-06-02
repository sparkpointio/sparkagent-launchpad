"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UnderMaintenance from '../components/ui/under-maintenance';

interface MaintenanceContextType {
  isUnderMaintenance: boolean;
  isLimitedAccess: boolean;
  isFeatureDisabled: (feature?: string) => boolean;
  showMaintenanceModal: () => void;
  hideMaintenanceModal: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const isUnderMaintenance = process.env.NEXT_PUBLIC_UNDER_MAINTENANCE === "true";
  const isLimitedAccess = process.env.NEXT_PUBLIC_LIMITED_ACCESS === "true";
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scrollingg when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const isFeatureDisabled = (feature?: string) => {
    // If under full maintenance, everything is disabled
    if (isUnderMaintenance) return true;

    if (process.env.NODE_ENV === "development") {
      console.log(`Checking feature: ${feature}`);
    }
    
    // If in limited access mode, specific features are disabled
    if (isLimitedAccess) return true;
    
    // Normal operation
    return false;
  };

  const showMaintenanceModal = () => setShowModal(true);
  const hideMaintenanceModal = () => setShowModal(false);

  return (
    <MaintenanceContext.Provider value={{ 
      isUnderMaintenance, 
      isLimitedAccess,
      isFeatureDisabled,
      showMaintenanceModal,
      hideMaintenanceModal
    }}>
      {children}
      
      {mounted && showModal && createPortal(
        <UnderMaintenance 
          isModal={true} 
          onClick={hideMaintenanceModal} 
        />,
        document.body
      )}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}