"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Folder,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  editorId?: string;
}

export default function CreatorEditFolderPage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.creatorId as string;
  const accountId = params.accountId as string;
  const folderId = params.folderId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState("");

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

        // Fetch folder details
        try {
          const foldersRes = await fetch(
            `/api/folder?creatorId=${currentUser.id}&accountId=${accountId}`
          );
          if (foldersRes.ok) {
            const data = await foldersRes.json();
            const found = data.find((f: any) => f.id === folderId);
            if (found) {
              setFolder(found);
              setFolderName(found.name);
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
  }, [router, creatorId, accountId, folderId]);

  const handleUpdateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/folder/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update folder");
      }

      toast.success("Folder updated successfully");
      router.push(`/creators/${creatorId}/accounts/${accountId}/folders`);
    } catch (error) {
      toast.error("Failed to update folder");
    } finally {
      setSubmitting(false);
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

  if (!user || !folder) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Edit Folder" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full max-w-2xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link
                href={`/creators/${creatorId}/accounts/${accountId}/folders`}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Folders</span>
              </Link>
            </Button>

            {/* Page Header */}
            <CommonSubHeader
              userName="Edit Folder"
              role="editor"
              variant="default"
            />

            {/* Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Folder Details
                </CardTitle>
                <CardDescription>
                  Update the folder name and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Folder Name */}
                  <div className="space-y-2">
                    <Label htmlFor="folderName">Folder Name *</Label>
                    <Input
                      id="folderName"
                      placeholder="e.g., Gaming Videos"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Choose a descriptive name for your folder
                    </p>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={handleUpdateFolder}
                      disabled={submitting || !folderName.trim()}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        router.push(
                          `/creators/${creatorId}/accounts/${accountId}/folders`
                        )
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
