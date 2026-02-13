"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderOpen, GitBranch, Loader2, Users } from "lucide-react";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CommonSubHeader } from "@/components/common/CommonSubHeader";
import { VersionCard } from "@/components/common/VersionCard";
import { CreateVersionDialog } from "@/components/common/CreateVersionDialog";
import { VersionComments } from "@/components/common/VersionComments";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface Contribution {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  versions?: Version[];
}

interface Version {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  versionNumber: number;
  duration?: number;
  createdAt: string;
  comments?: Comment[];
  video?: { integrationUrl?: string };
  thumbnail?: { integrationUrl?: string };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: { name: string; email: string; image?: string };
}

interface Folder {
  id: string;
  name: string;
  items?: FolderItem[];
}

interface FolderItem {
  id: string;
  media?: { integrationUrl?: string; type: string };
}

export default function ContributeAccountPage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.creatorId as string;
  const accountId = params.accountId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

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

        // Fetch contributions for this account
        try {
          const contribRes = await fetch(`/api/contribute?accountId=${accountId}`);
          if (contribRes.ok) {
            const data = await contribRes.json();
            setContributions(data);
          }
        } catch (error) {
          console.error("Failed to fetch contributions:", error);
        }

        // Fetch folders
        try {
          const foldersRes = await fetch(
            `/api/folder?editorId=${currentUser.id}&accountId=${accountId}`
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
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, creatorId, accountId]);

  const handleCreateVersion = async (data: {
    title: string;
    description: string;
    tags: string[];
    videoFile: File | null;
    thumbnailFile: File | null;
  }) => {
    if (!data.videoFile) {
      toast.error("Please select a video file");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("video", data.videoFile);
      if (data.thumbnailFile) {
        formData.append("thumbnail", data.thumbnailFile);
      }
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("tags", data.tags.join(","));
      formData.append("accountId", accountId);

      const response = await fetch("/api/contribute", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create version");
      }

      toast.success("Version created successfully!");
      
      // Refresh contributions
      const contribRes = await fetch(`/api/contribute?accountId=${accountId}`);
      if (contribRes.ok) {
        const newData = await contribRes.json();
        setContributions(newData);
      }
    } catch (error) {
      console.error("Failed to create version:", error);
      toast.error("Failed to create version");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (version: Version, status: string) => {
    try {
      const response = await fetch(
        `/api/contribute/version/${version.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Version ${status.toLowerCase()}`);
      
      // Refresh contributions
      const contribRes = await fetch(`/api/contribute?accountId=${accountId}`);
      if (contribRes.ok) {
        const data = await contribRes.json();
        setContributions(data);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAddComment = async (content: string) => {
    if (!selectedVersion) return;

    try {
      const response = await fetch(
        `/api/contribute/version/${selectedVersion.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      toast.success("Comment added");
      
      // Refresh comments for selected version
      const commentsRes = await fetch(
        `/api/contribute/version/${selectedVersion.id}/comments`
      );
      if (commentsRes.ok) {
        const comments = await commentsRes.json();
        setSelectedVersion({ ...selectedVersion, comments });
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
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

  // Group versions by contribution
  const allVersions = contributions.flatMap((c) => c.versions || []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Contribute" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link href="/contribute" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Contribute</span>
              </Link>
            </Button>

            {/* Account Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">Contribute</h1>
                  <p className="text-muted-foreground">
                    Managing content for this account
                  </p>
                </div>
              </div>
              
              <CreateVersionDialog
                onCreate={handleCreateVersion}
                loading={submitting}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Contributions & Versions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Contributions */}
                {contributions.length > 0 ? (
                  contributions.map((contribution) => (
                    <Card key={contribution.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <GitBranch className="h-5 w-5" />
                              {contribution.title}
                            </CardTitle>
                            <CardDescription>
                              {contribution.description}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            {contribution.versions?.length || 0} versions
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {contribution.versions && contribution.versions.length > 0 ? (
                          <div className="space-y-4">
                            {contribution.versions
                              .sort((a, b) => b.versionNumber - a.versionNumber)
                              .map((version) => (
                                <VersionCard
                                  key={version.id}
                                  version={version}
                                  onView={(v) => setSelectedVersion(v)}
                                  canApprove={true}
                                  onStatusChange={handleStatusChange}
                                />
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No versions yet</p>
                            <p className="text-sm">
                              Create the first version to get started
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">
                        No contributions yet
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first version to start contributing
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column: Folders & Selected Version */}
              <div className="space-y-6">
                {/* Folders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      Folders
                    </CardTitle>
                    <CardDescription>
                      Available folders for this account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {folders.length > 0 ? (
                      <div className="space-y-2">
                        {folders.map((folder) => (
                          <div
                            key={folder.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {folder.name}
                              </span>
                            </div>
                            <Badge variant="outline">
                              {folder.items?.length || 0} items
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No folders available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Selected Version Details */}
                {selectedVersion && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Version {selectedVersion.versionNumber}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVersion(null)}
                        >
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Video Preview */}
                      {selectedVersion.video?.integrationUrl && (
                        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                          <p className="text-white text-sm">Video Preview</p>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedVersion.description || "No description"}
                        </p>
                      </div>

                      {/* Tags */}
                      {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedVersion.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comments */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Comments ({selectedVersion.comments?.length || 0})
                        </h4>
                        <VersionComments
                          comments={selectedVersion.comments || []}
                          onAddComment={handleAddComment}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
