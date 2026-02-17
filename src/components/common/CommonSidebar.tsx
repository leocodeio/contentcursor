"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLinkType } from "@/models/navlinks";

interface CommonSidebarProps {
  data: NavLinkType[];
  variant?: "sidebar" | "floating" | "inset";
}

export function CommonSidebar({ data, variant = "inset" }: CommonSidebarProps) {
  const pathname = usePathname();

  const stripLocale = (p: string) => p.replace(/^\/(en|es|fr)(?=\/|$)/, "");
  const currentPath = stripLocale(pathname) || "/";

  const getIsActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            {/* Logo */}
            <div className="px-4 py-4 text-center">
              <Link href="/" className="flex items-center justify-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    L
                  </span>
                </div>
                <span className="font-bold text-lg">LeoCode</span>
              </Link>
            </div>

            {/* Navigation Menu */}
            <SidebarMenu className="flex flex-col w-full px-3 gap-1">
              {data.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild={false}
                    isActive={getIsActive(item.href)}
                    tooltip={item.label}
                    className="flex items-center gap-3 py-2 px-3 w-full"
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      {item.icon && <item.icon size={18} />}
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
