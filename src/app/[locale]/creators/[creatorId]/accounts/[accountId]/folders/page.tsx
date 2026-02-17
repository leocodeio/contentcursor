"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  FolderPlus,
  Trash2,
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
  createdAt: string;
  items?: { id: string }[];
}

export default function CreatorFoldersIndexPage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.creatorId as string;
  const accountId = params.accountId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

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

        if (currentUser.role !== "creator") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);

        // Fetch folders
        try {
          const foldersRes = await fetch(
            `/api/folder?creatorId=${currentUser.id}&accountId=${accountId}`
          );
          if (foldersRes.ok) {
            const data = await foldersRes.json();
            setFolders(data);
          }
        } catch (error) {
          console.error("Failed to fetch folders:", error);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, creatorId, accountId]);

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;

    setDeleting(folderId);
    try {
      const response = await fetch(`/api/folder/${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }

      toast.success("Folder deleted successfully");
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
    } catch (error) {
      toast.error("Failed to delete folder");
    } finally {
      setDeleting(null);
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Folders" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link
                href={`/creators/${creatorId}/accounts/${accountId}`}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Account</span>
              </Link>
            </Button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-6 w-6 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Folders</h1>
              </div>
              <Button asChild>
                <Link
                  href={`/creators/${creatorId}/accounts/${accountId}/folders/add`}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Folder
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="text-sm text-muted-foreground mb-4">
              {folders.length} folder{folders.length !== 1 ? "s" : ""}
            </div>

            {/* Folders Grid */}
            {folders.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3 flex flex-row justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        <span className="truncate">{folder.name}</span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFolder(folder.id)}
                        disabled={deleting === folder.id}
                      >
                        {deleting === folder.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground mb-3">
                        {folder.items?.length || 0} items
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link
                            href={`/creators/${creatorId}/accounts/${accountId}/folders/${folder.id}`}
                          >
                            Open
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link
                            href={`/creators/${creatorId}/accounts/${accountId}/folders/${folder.id}/edit`}
                          >
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No folders found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first folder to organize your content
                    </p>
                    <Button asChild>
                      <Link
                        href={`/creators/${creatorId}/accounts/${accountId}/folders/add`}
                      >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create First Folder
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature Notice */}
            <Card className="mt-8 max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Folders Feature</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">
                  Folders help you organize your content
                </p>
                <Button asChild variant="outline">
                  <Link
                    href={`/contribute/${creatorId}/${accountId}`}
                  >
                    Go to Contributions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
