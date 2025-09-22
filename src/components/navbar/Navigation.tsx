import React from "react";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { NavigationProps } from "@/types/navbar";

const Navigation: React.FC<NavigationProps> = ({
  isLoading,
  isAuthenticated,
  user,
  menuItems,
  onNavigate,
  onLogout
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-end space-x-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <DesktopNav
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        user={user}
        menuItems={menuItems}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <MobileNav
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        user={user}
        menuItems={menuItems}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    </>
  );
};

export default Navigation;