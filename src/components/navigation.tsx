"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/theme-toggle";
import { ColorSelector } from "@/components/theme/color-selector";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("Navigation");

  const navigation = [
    { name: t("features"), href: "#features" },
    { name: t("pricing"), href: "#pricing" },
    { name: t("testimonials"), href: "#testimonials" },
    { name: t("faq"), href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">ContentCursor</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <ColorSelector />
          <ModeToggle />
          <LocaleSwitcher />
          <Button variant="ghost" asChild>
            <Link href="/auth/login">{t("signIn")}</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">{t("getStarted")}</Link>
          </Button>
        </div>

        <div className="md:hidden flex items-center space-x-2">
          <ColorSelector />
          <ModeToggle />
          <LocaleSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'rotate-180 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
                }`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-180 opacity-0 scale-75'
                }`}
              />
            </div>
          </Button>
        </div>
      </div>

      <div
        className={`md:hidden border-t bg-background overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex flex-col space-y-2 pt-4 border-t">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                {t("signIn")}
              </Link>
            </Button>
            <Button className="w-full justify-start" asChild>
              <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                {t("getStarted")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}