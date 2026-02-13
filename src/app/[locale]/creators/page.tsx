"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Filter, Users, UserPlus } from "lucide-react";

import { getSession } from "@/server/services/auth/auth-client";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface CreatorMap {
  id: string;
  creatorId: string;
  editorId: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  creator?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface CreatorsPageData {
  user: User;
  role: "creator" | "editor";
  creatorMaps: CreatorMap[];
}

export default function CreatorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creatorMaps, setCreatorMaps] = useState<CreatorMap[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

        const role = (currentUser.role === "creator" || currentUser.role === "editor") 
          ? currentUser.role as "creator" | "editor" 
          : "editor";

        // Only editors can view creators
        if (role !== "editor") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);

        // Fetch creator maps for this editor
        try {
          const mapsRes = await fetch(`/api/map?editorId=${currentUser.id}`);
          if (mapsRes.ok) {
            const maps = await mapsRes.json();
            setCreatorMaps(maps);
          }
        } catch (error) {
          console.error("Failed to fetch creators:", error);
        }
      } catch (error) {
        console.error("Failed to load creators:", error);
        toast.error("Failed to load creators");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAcceptInvitation = async (mapId: string) => {
    setAccepting(mapId);
    try {
      const response = await fetch("/api/map", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mapId, status: "ACTIVE" }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      toast.success("Invitation accepted successfully!");
      
      // Update local state
      setCreatorMaps((prev) =>
        prev.map((map) =>
          map.id === mapId ? { ...map, status: "ACTIVE" } : map
        )
      );
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setAccepting(null);
    }
  };

  const filteredCreators = creatorMaps.filter((map) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return map.status === "ACTIVE";
    if (statusFilter === "pending") return map.status === "PENDING";
    if (statusFilter === "previous") return map.status === "INACTIVE";
    return true;
  });

  const activeCreators = creatorMaps.filter((m) => m.status === "ACTIVE");
  const pendingCreators = creatorMaps.filter((m) => m.status === "PENDING");

  const getFilterLabel = () => {
    switch (statusFilter) {
      case "all":
        return "All Creators";
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "previous":
        return "Previous";
      default:
        return "Filter";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading creators...</p>
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
        <Header page="Creators" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button and Filter */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {getFilterLabel()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Creators
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("previous")}>
                    Previous (Inactive)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CommonSubHeader userName={user.name} role="editor" />

            <div className="mt-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeCreators.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Invitations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {pendingCreators.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{creatorMaps.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Creators Grid */}
              {filteredCreators.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {filteredCreators.map((creatorMap) => (
                    <Card key={creatorMap.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(creatorMap.creator?.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {creatorMap.creator?.name || "Unknown"}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {creatorMap.creator?.email}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center justify-between">
                          {getStatusBadge(creatorMap.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(creatorMap.creatorId ? Date.now() : Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {creatorMap.status === "PENDING" && (
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => handleAcceptInvitation(creatorMap.id)}
                            disabled={accepting === creatorMap.id}
                          >
                            {accepting === creatorMap.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Accept Invitation
                              </>
                            )}
                          </Button>
                        )}
                        {creatorMap.status === "ACTIVE" && (
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => router.push(`/creators/${creatorMap.creatorId}`)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Contribute
                          </Button>
                        )}
                        {creatorMap.status === "INACTIVE" && (
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Inactive
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No creators found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {statusFilter === "all"
                        ? "You haven't been invited by any creators yet"
                        : `No ${statusFilter} creators`}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Help Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Managing Invited Creators
                  </CardTitle>
                  <CardDescription>
                    To contribute to a new creator's account, you need to accept their invitation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Pending:</strong> You have been invited but haven't accepted yet</p>
                    <p>• <strong>Active:</strong> You can contribute to this creator's content</p>
                    <p>• <strong>Inactive:</strong> Previously active relationship</p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setStatusFilter("pending")}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Check Pending Invitations
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
