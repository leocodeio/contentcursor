"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/server/services/auth/auth-client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CommonSidebar } from "@/components/common/CommonSidebar";
import { Header } from "@/components/header";
import { NavLinks } from "@/models/navlinks";
import { hasPermission } from "@/utils/permissions";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  accesibleRoles: string[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();

        if (!session?.data?.user) {
          router.push("/auth/login");
          return;
        }

        const userData: User = {
          id: session.data.user.id,
          name: session.data.user.name || "User",
          email: session.data.user.email,
          image: session.data.user.image || undefined,
          role: (session.data.user as any).role || "user",
        };

        setUser(userData);
      } catch (error) {
        console.error("Failed to load session:", error);
        toast.error("Failed to load session data");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Filter nav links based on user role
  const userRole = user.role || "user";
  const filteredNavLinks: NavItem[] = NavLinks.filter((item) =>
    hasPermission(userRole, item.accesibleRoles)
  );

  return (
    <SidebarProvider>
      <CommonSidebar data={filteredNavLinks} variant="inset" />
      <SidebarInset>
        <Header page="Dashboard" user={user} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
