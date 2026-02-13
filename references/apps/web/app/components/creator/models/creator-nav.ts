/*
 * creator nav links
 */

import { DashboardIcon , HomeIcon } from "@radix-ui/react-icons";
import { BoxIcon, UserIcon } from "lucide-react";

export const CreatorNavLinks = [
  { name: "Home", to: "/feature/home", icon: HomeIcon },
  { name: "Dashboard", to: "/feature/dashboard", icon: DashboardIcon },
  { name: "Accounts", to: "/feature/accounts", icon: BoxIcon },
  { name: "Editors", to: "/feature/editors", icon: UserIcon },
];
