// import { useState } from "react";
// import { Button } from "@./shadcn";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CommonSidebar } from "../../components/common/CommonSidebar";
import { Outlet, useLoaderData } from "@remix-run/react";
import { CommonHeader } from "../../components/common/CommonHeader";
import { NavLinks, NavLinkType } from "~/models/navlinks";

// Loaders
import { loader as featureLayoutLoader } from "../loader+/feature+/feature-layout.loader";
import { hasPermission } from "~/utils/permissions/permission";
export const loader = featureLayoutLoader;

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  const revisedLinks: NavLinkType[] = NavLinks.filter((link) =>
    hasPermission(user.role, link.accesibleRoles || [])
  );
  return (
    <SidebarProvider>
      <CommonSidebar data={revisedLinks} variant="inset" />
      <SidebarInset>
        <CommonHeader user={user} />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
