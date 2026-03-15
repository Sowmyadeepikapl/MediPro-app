import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout = ({ children, showNav = true }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen max-w-lg mx-auto bg-background relative">
      <div className={showNav ? "pb-20" : ""}>{children}</div>
      {showNav && <BottomNav />}
    </div>
  );
};

export default MobileLayout;
