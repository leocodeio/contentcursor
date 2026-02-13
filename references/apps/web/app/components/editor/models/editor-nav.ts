/*
 * creator nav links
 */

import { DashboardIcon , HomeIcon } from "@radix-ui/react-icons";
import { BoxIcon } from "lucide-react";

export const EditorNavLinks = [
  { name: "Home", to: "/feature/home", icon: HomeIcon },
  { name: "Dashboard", to: "/feature/dashboard", icon: DashboardIcon },
  { name: "Accounts", to: "/feature/accounts", icon: BoxIcon },
];
