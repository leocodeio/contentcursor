"use client";

import { User } from "lucide-react";
import { ModeToggle } from "@/components/theme/theme-toggle";
import { ColorSelector } from "@/components/theme/color-selector";
import { LocaleSwitcher } from "@/components/locale-switcher";

interface HeaderProps {
  page?: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export function Header({ user, page }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-gradient-to-r from-background via-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section - Empty on large screens (sidebar handles branding) */}
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-muted-foreground">
              {page}
            </h1>
          </div>
        </div>

        {/* Right Section - Theme, Language, and User */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* Color Selector */}
          <ColorSelector />

          {/* Language Switcher */}
          <LocaleSwitcher />

          {/* Divider */}
          <div className="h-6 w-px bg-border hidden md:block mx-1" />

          {/* User Profile Section */}
          {user && (
            <div className="flex items-center gap-3 group cursor-pointer">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300 group-hover:scale-110">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="hidden md:flex flex-col">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
