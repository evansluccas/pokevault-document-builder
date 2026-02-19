import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Search,
  Settings,
  ScanLine,
  FileSpreadsheet,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderOpen, label: "Collections", path: "/collections" },
  { icon: ScanLine, label: "Scanner", path: "/scan" },
  { icon: FileSpreadsheet, label: "Import", path: "/import" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderOpen, label: "Collections", path: "/collections" },
  { icon: PlusCircle, label: "Add", path: "/items/new" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
          <span className="text-accent-foreground font-bold text-sm">PV</span>
        </div>
        <span className="text-lg font-bold text-sidebar-accent-foreground">PokéVault</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="nav"
                className={`w-full gap-3 px-3 h-10 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Add Item CTA */}
      <div className="px-3 pb-3">
        <Link to="/items/new">
          <Button variant="hero" className="w-full gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Button variant="nav" className="w-full gap-3 px-3 h-10 text-muted-foreground">
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isCenter = item.label === "Add";
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isCenter
                  ? ""
                  : isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isCenter ? (
                <div className="w-12 h-12 -mt-6 rounded-full gradient-accent flex items-center justify-center shadow-lg">
                  <item.icon className="w-6 h-6 text-accent-foreground" />
                </div>
              ) : (
                <>
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
