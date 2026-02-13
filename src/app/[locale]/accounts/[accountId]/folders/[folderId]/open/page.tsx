"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  File,
  Video,
  Image,
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

interface Folder {
  id: string;
  name: string;
  items?: FolderItem[];
}

interface FolderItem {
  id: string;
  name: string;
  type: string;
  media?: { integrationUrl?: string };
}

export default function AccountOpenFolderPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;
  const folderId = params.folderId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [folder, setFolder] = useState<Folder | null>(null);

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

        setUser(currentUser);

        // Fetch folder details with items
        try {
          const foldersRes = await fetch(
            `/api/folder?creatorId=${currentUser.id}&accountId=${accountId}`
          );
          if (foldersRes.ok) {
            const data = await foldersRes.json();
            const found = data.find((f: any) => f.id === folderId);
            if (found) {
              setFolder(found);
            }
          }
        } catch (error) {
          console.error("Failed to fetch folder:", error);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, accountId, folderId]);

  const getFileIcon = (type: string) => {
    if (type.includes("video")) return Video;
    if (type.includes("image")) return Image;
    return File;
  };

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

  if (!user || !folder) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Folder" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link
                href={`/accounts/${accountId}/folders`}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Folders</span>
              </Link>
            </Button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{folder.name}</h1>
                <p className="text-muted-foreground">
                  {folder.items?.length || 0} items
                </p>
              </div>
            </div>

            {/* Items Grid */}
            {folder.items && folder.items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {folder.items.map((item) => {
                  const Icon = getFileIcon(item.type);
                  return (
                    <Card key={item.id} className="hover:shadow-md cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                        <CardTitle className="text-sm mt-2 truncate">
                          {item.name}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    This folder is empty
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add files to this folder from your Google Drive
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Google Drive Integration Notice */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Google Drive Integration</CardTitle>
                <CardDescription>
                  Files in this folder are synced from your Google Drive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Drive account to automatically sync files
                  and organize your content.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/accounts">Manage Accounts</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
