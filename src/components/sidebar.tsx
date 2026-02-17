"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  HandHelping,
  User,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBetterAuthSignout } from "@/server/services/auth/auth-client";
import { NavLinks } from "@/models/navlinks";
import { hasPermission } from "@/utils/permissions";

interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const signout = useBetterAuthSignout();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const stripLocale = (p: string) => p.replace(/^\/(en|es|fr)(?=\/|$)/, "");
  const currentPath = stripLocale(pathname) || "/";
  const isActive = (href: string) =>
    currentPath === href || currentPath.startsWith(`${href}/`);

  const userRole = user?.role || "user";
  const filteredMenuItems = NavLinks.filter((item) =>
    hasPermission(userRole, item.accesibleRoles)
  );

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  return (
    <>
      <style>{`
        @keyframes fadeInOverlay {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.5;
          }
        }

        .overlay-fade-in {
          animation: fadeInOverlay 0.3s ease-out forwards;
        }
      `}</style>

      {/* Sidebar Container */}
      <div
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 ${sidebarWidth}`}
      >
        {/* Mobile Toggle */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? "Close sidebar" : "Open sidebar"}
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Separator with Collapse Button */}
        <div className="border-b relative flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex relative z-10 absolute -right-4 -top-1/2 translate-y-1/2 border rounded-full"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        {/* Sidebar Content */}
        <aside
          className={`w-full h-full bg-background border-r flex flex-col transition-all duration-300 ${
            isOpen
              ? "translate-x-0 md:translate-x-0"
              : "-translate-x-full md:translate-x-0"
          } md:translate-x-0`}
          aria-hidden={!isOpen}
        >
          {/* Header */}
          <div className="p-4 pb-4 flex items-center gap-2">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-2 flex-1">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">
                    L
                  </span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-lg leading-none">
                    LeoCode
                  </span>
                  <span className="text-xs text-muted-foreground">v1.0</span>
                </div>
              </Link>
            )}
            {collapsed && (
              <Link
                href="/"
                className="flex items-center justify-center w-full"
              >
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    L
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasSubmenu = false; // Placeholder for future use

              return (
                <div key={item.label}>
                  <Button
                    asChild={!hasSubmenu}
                    variant={active ? "default" : "ghost"}
                    className={`w-full${
                      collapsed ? "justify-center" : " justify-start"
                    } `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 w-full"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 text-left">{item.label}</span>
                      )}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-3 border-t space-y-2">
            <Button
              variant="outline"
              className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 ${
                collapsed ? "justify-center" : "justify-start"
              }`}
              onClick={signout}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </aside>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden overlay-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Content Spacer */}
      <div
        className={`hidden md:block transition-all duration-300 ${sidebarWidth}`}
      />
    </>
  );
}
