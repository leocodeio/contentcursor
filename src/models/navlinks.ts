export enum Persona {
  CREATOR = "creator",
  EDITOR = "editor",
}

import {
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  HandHelping,
  User,
  Home,
  LucideIcon,
} from "lucide-react";

export interface NavLinkType {
  label: string;
  href: string;
  icon: LucideIcon;
  accesibleRoles: string[];
}

export const NavLinks: NavLinkType[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    accesibleRoles: [],
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    accesibleRoles: ["creator", "editor"],
  },
  {
    label: "Editors",
    href: "/editors",
    icon: Users,
    accesibleRoles: ["creator"],
  },
  {
    label: "Creators",
    href: "/creators",
    icon: Users,
    accesibleRoles: ["editor"],
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: LinkIcon,
    accesibleRoles: ["creator"],
  },
  {
    label: "Contribute",
    href: "/contribute",
    icon: HandHelping,
    accesibleRoles: ["editor"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    accesibleRoles: [],
  },
];
