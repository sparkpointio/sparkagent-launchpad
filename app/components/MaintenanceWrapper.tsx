"use client";

import { useMaintenance } from "../contexts/MaintenanceContext";
import UnderMaintenance from "./ui/under-maintenance";

interface MaintenanceWrapperProps {
  children: React.ReactNode;
  mode?: 'full' | 'conditional' | 'limited-access';
  fallback?: React.ReactNode;
  renderWhenMaintenance?: (isUnderMaintenance: boolean, isLimitedAccess: boolean) => React.ReactNode;
  feature?: string;
  showModalOnClick?: boolean;
  onClick?: () => void;
}

export default function MaintenanceWrapper({ 
  children, 
  mode = 'full',
  fallback = null,
  renderWhenMaintenance,
  feature,
  showModalOnClick = false,
  onClick
}: MaintenanceWrapperProps) {
  const { isUnderMaintenance, isLimitedAccess, isFeatureDisabled, showMaintenanceModal } = useMaintenance();

  if (mode === 'full' && isUnderMaintenance) {
    return <UnderMaintenance />;
  }

  if (mode === 'limited-access' && isFeatureDisabled(feature)) {
    if (renderWhenMaintenance) {
      return <>{renderWhenMaintenance(isUnderMaintenance, isLimitedAccess)}</>;
    }
    
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showModalOnClick) {
      return (
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showMaintenanceModal();
            onClick?.();
          }}
          className="opacity-75 cursor-pointer"
        >
          <div className="pointer-events-none">
            {children}
          </div>
        </div>
      );
    }

    return null;
  }

  if (mode === 'conditional') {
    if (renderWhenMaintenance) {
      return <>{renderWhenMaintenance(isUnderMaintenance, isLimitedAccess)}</>;
    }
    
    if ((isUnderMaintenance || isLimitedAccess) && fallback) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}