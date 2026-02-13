"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  History,
  GitCompare,
  Upload,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CommonSubHeader } from "@/components/common/CommonSubHeader";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  description?: string;
  tags: string[];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  duration?: number;
  createdAt: string;
  comments?: { id: string; content: string; author?: { name: string } }[];
}

interface Contribution {
  id: string;
  title: string;
  description?: string;
  versions?: Version[];
}

export default function CreatorVersionsPage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.creatorId as string;
  const accountId = params.accountId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [activeTab, setActiveTab] = useState("manage");

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

        // Fetch contributions with versions
        try {
          const contribRes = await fetch(`/api/contribute?accountId=${accountId}`);
          if (contribRes.ok) {
            const data = await contribRes.json();
            setContributions(data);
          }
        } catch (error) {
          console.error("Failed to fetch contributions:", error);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, creatorId, accountId]);

  const handleStatusUpdate = async (version: Version, status: "COMPLETED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/contribute/version/${version.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Flatten all versions from all contributions
  const allVersions = contributions.flatMap((c) => c.versions || []);

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
        <Header page="Versions" user={user} />
        
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Version Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Track, compare, and manage all versions across contributions
              </p>
            </div>

            {/* Upload New Version Button */}
            <div className="mb-6">
              <Button asChild>
                <Link href={`/contribute/${creatorId}/${accountId}`}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Version
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{allVersions.length}</div>
                  <p className="text-sm text-muted-foreground">Total Versions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">
                    {allVersions.filter((v) => v.status === "PENDING").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {allVersions.filter((v) => v.status === "COMPLETED").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {allVersions.filter((v) => v.status === "REJECTED").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </CardContent>
              </Card>
            </div>

            {/* Version Management Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Manage Versions
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="compare" className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4" />
                  Compare
                </TabsTrigger>
              </TabsList>

              {/* Manage Versions */}
              <TabsContent value="manage">
                <Card>
                  <CardHeader>
                    <CardTitle>Version Management</CardTitle>
                    <CardDescription>
                      Create, edit, and manage different versions of your content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allVersions.length > 0 ? (
                      <div className="space-y-4">
                        {allVersions
                          .sort((a, b) => b.versionNumber - a.versionNumber)
                          .map((version) => (
                            <Card
                              key={version.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">
                                      Version {version.versionNumber}
                                    </span>
                                    <Badge
                                      className={getStatusBadge(version.status)}
                                    >
                                      {version.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {version.status === "PENDING" && user.role === "creator" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(version, "COMPLETED")
                                          }
                                        >
                                          <CheckCircle2 className="h-4 w-4 mr-1" />
                                          Approve
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(version, "REJECTED")
                                          }
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedVersion(version)}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                                <h3 className="text-base font-medium">
                                  {version.title}
                                </h3>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground mb-3">
                                  {version.description || "No description"}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {version.duration && (
                                    <span>Duration: {version.duration}s</span>
                                  )}
                                  <span>
                                    Created:{" "}
                                    {new Date(version.createdAt).toLocaleDateString()}
                                  </span>
                                  {version.tags && version.tags.length > 0 && (
                                    <span>Tags: {version.tags.join(", ")}</span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No versions yet</p>
                        <p className="text-sm">
                          Upload content to create the first version
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Timeline */}
              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Version Timeline</CardTitle>
                    <CardDescription>
                      Track the evolution of content over time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allVersions.length > 0 ? (
                      <div className="space-y-4">
                        {allVersions
                          .sort((a, b) => b.versionNumber - a.versionNumber)
                          .map((version, index) => (
                            <div key={version.id} className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    version.status === "COMPLETED"
                                      ? "bg-green-500"
                                      : version.status === "REJECTED"
                                        ? "bg-red-500"
                                        : version.status === "PROCESSING"
                                          ? "bg-blue-500"
                                          : "bg-yellow-500"
                                  }`}
                                />
                                {index < allVersions.length - 1 && (
                                  <div className="w-0.5 h-16 bg-border mt-2" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    Version {version.versionNumber}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={getStatusBadge(version.status)}
                                  >
                                    {version.status}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-medium">
                                  {version.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {version.description || "No description"}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  {version.duration && (
                                    <span>{version.duration}s</span>
                                  )}
                                  <span>
                                    {new Date(version.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No versions to display</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Compare */}
              <TabsContent value="compare">
                <Card>
                  <CardHeader>
                    <CardTitle>Version Comparison</CardTitle>
                    <CardDescription>
                      Compare changes between different versions side by side.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allVersions.length < 2 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>You need at least 2 versions to compare changes.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allVersions
                          .sort((a, b) => b.versionNumber - a.versionNumber)
                          .slice(0, 2)
                          .map((version) => (
                            <Card key={version.id}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm">
                                    Version {version.versionNumber}
                                  </CardTitle>
                                  <Badge
                                    className={getStatusBadge(version.status)}
                                  >
                                    {version.status}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <h3 className="font-medium mb-1">
                                  {version.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {version.description || "No description"}
                                </p>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  {version.duration && (
                                    <p>Duration: {version.duration}s</p>
                                  )}
                                  <p>
                                    Created:{" "}
                                    {new Date(version.createdAt).toLocaleDateString()}
                                  </p>
                                  {version.tags && version.tags.length > 0 && (
                                    <p>Tags: {version.tags.join(", ")}</p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Selected Version Details */}
            {selectedVersion && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      Version {selectedVersion.versionNumber} Details
                    </CardTitle>
                    <Button variant="ghost" onClick={() => setSelectedVersion(null)}>
                      ×
                    </Button>
                  </div>
                  <CardDescription>{selectedVersion.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedVersion.description || "No description"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Status</h4>
                        <Badge className={getStatusBadge(selectedVersion.status)}>
                          {selectedVersion.status}
                        </Badge>
                      </div>
                      {selectedVersion.duration && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Duration</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedVersion.duration} seconds
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Created</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedVersion.createdAt).toLocaleDateString()} at{" "}
                        {new Date(selectedVersion.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedVersion.tags.map((tag, i) => (
                            <Badge key={i} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedVersion.comments &&
                      selectedVersion.comments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Comments ({selectedVersion.comments.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedVersion.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-muted rounded-lg p-3"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {comment.author?.name?.charAt(0) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">
                                    {comment.author?.name || "Unknown"}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
