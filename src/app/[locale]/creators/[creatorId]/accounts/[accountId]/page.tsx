"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  Library,
  Upload,
  Loader2,
} from "lucide-react";

import { getSession } from "@/server/services/auth/auth-client";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CommonSubHeader } from "@/components/common/CommonSubHeader";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface AccountData {
  id: string;
  email: string;
  status: string;
  folders?: { id: string; name: string }[];
  contributions?: { id: string; title: string }[];
}

export default function CreatorAccountOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.creatorId as string;
  const accountId = params.accountId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        
        if (!session?.data?.user) {
          router.push("/auth/login");
          return;
        }

        const currentUser: User = {
          id: session.data.user.id,
          name: session.data.user.name || "User",
          email: session.data.user.email,
          image: session.data.user.image || undefined,
          role: (session.data.user as any).role || "user",
        };

        // Only creators can access this page
        if (currentUser.role !== "creator") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);

        // Fetch account details
        try {
          const ytRes = await fetch(`/api/yt_int/creator?creatorId=${currentUser.id}`);
          const ytData = await ytRes.json();
          const account = ytData.find((a: any) => a.id === accountId);
          
          if (account) {
            // Fetch folders count
            const foldersRes = await fetch(
              `/api/folder?creatorId=${currentUser.id}&accountId=${accountId}`
            );
            const folders = foldersRes.ok ? await foldersRes.json() : [];

            // Fetch contributions count
            const contribRes = await fetch(
              `/api/contribute?accountId=${accountId}`
            );
            const contributions = contribRes.ok ? await contribRes.json() : [];

            setAccountData({
              id: account.id,
              email: account.email,
              status: account.status,
              folders,
              contributions,
            });
          } else {
            toast.error("Account not found");
            router.push("/creators");
          }
        } catch (error) {
          console.error("Failed to fetch account data:", error);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, creatorId, accountId]);

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

  if (!user || !accountData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Account" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link href="/creators" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Creators</span>
              </Link>
            </Button>

            {/* Account Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {accountData.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{accountData.email}</h1>
                  <Badge variant="outline" className="mt-1">
                    {accountData.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Contributions */}
              <Card className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Library className="h-5 w-5 text-primary" />
                    Contributions
                  </CardTitle>
                  <CardDescription>
                    Upload and manage contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link
                      href={`/contribute/${creatorId}/${accountId}`}
                    >
                      Go to Contributions
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Versions */}
              <Card className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Library className="h-5 w-5 text-primary" />
                    Versions
                  </CardTitle>
                  <CardDescription>
                    Manage content versions and timeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link
                      href={`/creators/${creatorId}/accounts/${accountId}/versions`}
                    >
                      View Versions
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Folders */}
              <Card className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Folders
                  </CardTitle>
                  <CardDescription>
                    Organize media and assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full" variant="outline">
                    <Link
                      href={`/creators/${creatorId}/accounts/${accountId}/folders`}
                    >
                      View Folders
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link
                      href={`/creators/${creatorId}/accounts/${accountId}/folders/add`}
                    >
                      Create Folder
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
