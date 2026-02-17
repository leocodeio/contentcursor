"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Users, Link as LinkIcon, LayoutDashboard } from "lucide-react";

import { getSession } from "@/server/services/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { CommonSubHeader } from "@/components/common/CommonSubHeader";
import { PermissionCheck } from "@/components/common/PermissionCheck";
import { ChartAreaInteractive } from "@/components/common/charts/ChartAreaInteractive";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface LinkedAccount {
  id: string;
  email: string;
  status: string;
  creatorId: string;
}

interface CreatorMap {
  id: string;
  creatorId: string;
  editorId: string;
  status: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface DashboardData {
  user: User;
  role: "creator" | "editor";
  linkedAccounts?: LinkedAccount[];
  creatorMaps?: CreatorMap[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        
        if (!session?.data?.user) {
          return;
        }

        const user: User = {
          id: session.data.user.id,
          name: session.data.user.name || "User",
          email: session.data.user.email,
          image: session.data.user.image || undefined,
          role: (session.data.user as any).role || "user",
        };

        const role = (user.role === "creator" || user.role === "editor") 
          ? user.role as "creator" | "editor" 
          : "creator";

        // Fetch linked accounts for creators
        let linkedAccounts: LinkedAccount[] = [];
        let creatorMaps: CreatorMap[] = [];

        if (role === "creator") {
          try {
            const accountsRes = await fetch(`/api/yt_int/creator?creatorId=${user.id}`);
            if (accountsRes.ok) {
              linkedAccounts = await accountsRes.json();
            }
          } catch (error) {
            console.error("Failed to fetch accounts:", error);
          }

          try {
            const mapsRes = await fetch(`/api/map?creatorId=${user.id}`);
            if (mapsRes.ok) {
              creatorMaps = await mapsRes.json();
            }
          } catch (error) {
            console.error("Failed to fetch maps:", error);
          }
        }

        setData({
          user,
          role,
          linkedAccounts,
          creatorMaps,
        });
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { user, role } = data;

  return (
    <div className="h-fit w-full">
      <CommonSubHeader userName={user.name} role={role} />
      
      {/* Dashboard Content */}
      <div className="mt-6">
        {/* Creator Dashboard */}
        <PermissionCheck role={role} allowedRoles={["creator"]}>
          <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
              {/* Linked Accounts Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Linked Accounts
                  </CardTitle>
                  <CardDescription>
                    Manage your connected social and content platforms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {data.linkedAccounts?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {data.linkedAccounts?.length === 0 
                      ? "No accounts linked yet" 
                      : `${data.linkedAccounts?.length} account(s) connected`}
                  </p>
                  <Button variant="default" className="w-full" asChild>
                    <Link href="/accounts">
                      View Accounts
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Editors Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Editors
                  </CardTitle>
                  <CardDescription>
                    Invite or manage users who help edit your content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {data.creatorMaps?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {data.creatorMaps?.length === 0 
                      ? "No editors invited yet" 
                      : `${data.creatorMaps?.length} editor(s) working with you`}
                  </p>
                  <Button variant="default" className="w-full" asChild>
                    <Link href="/editors">
                      Manage Editors
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Performance Metrics Card */}
              <Card className="lg:col-span-1 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    Performance
                  </CardTitle>
                  <CardDescription>
                    Overview of your content performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartAreaInteractive />
                </CardContent>
              </Card>
            </div>
          </div>
        </PermissionCheck>

        {/* Editor Dashboard */}
        <PermissionCheck role={role} allowedRoles={["editor"]}>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
              {/* Creators Card */}
              <Card className="lg:col-span-3 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Creators
                  </CardTitle>
                  <CardDescription>
                    Manage Creators that have invited you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {data.creatorMaps?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {data.creatorMaps?.length === 0 
                      ? "No creator invitations yet" 
                      : `${data.creatorMaps?.length} creator(s) you work with`}
                  </p>
                  <Button variant="default" className="w-full sm:w-auto" asChild>
                    <Link href="/creators">
                      Manage Creators
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Performance Metrics for Editors */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Get insights on views, engagement, and growth.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartAreaInteractive />
                </CardContent>
              </Card>
            </div>
          </div>
        </PermissionCheck>
      </div>
    </div>
  );
}

