"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getSession } from "@/server/services/auth/auth-client";
import { toast } from "sonner";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Link } from "@/i18n/navigation";
import { Pencil } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        if (session?.data?.user) {
          setUser({
            id: session.data.user.id,
            name: session.data.user.name || "User",
            email: session.data.user.email,
            image: session.data.user.image || undefined,
          });
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to get session:", error);
        toast.error("Failed to load session");
        router.push("/login");
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
          <p className="mt-2 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header page="Dashboard" user={user} />

        {/* Page Content */}
        <main className="flex-1 px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              Build Faster Than Ever
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Welcome back, {user.name}! Start creating amazing projects with
              LeoCode.
            </p>
            <div className="flex gap-4">
              <Link href="/profile">
                <Button size="lg">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
