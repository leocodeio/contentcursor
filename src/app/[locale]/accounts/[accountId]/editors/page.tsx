"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Loader2,
  MoreHorizontal,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface AccountEditorMap {
  id: string;
  editorId: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "REMOVED";
  editor?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export default function AccountEditorsPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editors, setEditors] = useState<AccountEditorMap[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

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

        // Fetch editors for this account
        try {
          const editorsRes = await fetch(
            `/api/map/account?creatorId=${currentUser.id}&accountId=${accountId}`
          );
          if (editorsRes.ok) {
            const data = await editorsRes.json();
            setEditors(data);
          }
        } catch (error) {
          console.error("Failed to fetch editors:", error);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, accountId]);

  const handleInviteEditor = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: user?.id,
          editorId: inviteEmail.trim(),
          accountId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to invite editor");
      }

      toast.success("Invitation sent successfully");
      setShowInvite(false);
      setInviteEmail("");

      // Refresh editors
      const editorsRes = await fetch(
        `/api/map/account?creatorId=${user?.id}&accountId=${accountId}`
      );
      if (editorsRes.ok) {
        const data = await editorsRes.json();
        setEditors(data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to invite editor");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveEditor = async (mapId: string) => {
    if (!confirm("Are you sure you want to remove this editor?")) return;

    try {
      const response = await fetch(`/api/map/${mapId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove editor");
      }

      toast.success("Editor removed successfully");
      setEditors((prev) => prev.filter((e) => e.id !== mapId));
    } catch (error) {
      toast.error("Failed to remove editor");
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      REMOVED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
        <Header page="Editors" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link
                href={`/accounts/${accountId}`}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Account</span>
              </Link>
            </Button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Account Editors</h1>
              </div>
              <Dialog open={showInvite} onOpenChange={setShowInvite}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Editor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Editor</DialogTitle>
                    <DialogDescription>
                      Invite an editor to collaborate on this account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="editor@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowInvite(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInviteEditor}
                      disabled={inviting || !inviteEmail.trim()}
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Invitation"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{editors.length}</div>
                  <p className="text-sm text-muted-foreground">Total Editors</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {editors.filter((e) => e.status === "ACTIVE").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">
                    {editors.filter((e) => e.status === "PENDING").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {editors.filter((e) => e.status === "REMOVED").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Removed</p>
                </CardContent>
              </Card>
            </div>

            {/* Editors Grid */}
            {editors.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {editors.map((map) => (
                  <Card key={map.id} className="hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {map.editor?.name
                                ? getInitials(map.editor.name)
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">
                              {map.editor?.name || "Unknown"}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {map.editor?.email}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveEditor(map.id)}
                              className="text-destructive"
                            >
                              Remove Editor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge className={getStatusBadge(map.status)}>
                        {map.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No editors yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Invite editors to collaborate on this account
                    </p>
                    <Button onClick={() => setShowInvite(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite First Editor
                    </Button>
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
