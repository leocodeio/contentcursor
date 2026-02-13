"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Mail, User, Loader2, Search, Filter } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

interface EditorMap {
  id: string;
  creatorId: string;
  editorId: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  editor?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface InvitePayload {
  email: string;
}

export default function EditorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [editors, setEditors] = useState<EditorMap[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
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
          : "creator";

        // Only creators can manage editors
        if (role !== "creator") {
          router.push("/dashboard");
          return;
        }

        setUser(currentUser);

        // Fetch editors
        try {
          const mapsRes = await fetch(`/api/map?creatorId=${currentUser.id}`);
          if (mapsRes.ok) {
            const maps = await mapsRes.json();
            setEditors(maps);
          }
        } catch (error) {
          console.error("Failed to fetch editors:", error);
        }
      } catch (error) {
        console.error("Failed to load editors:", error);
        toast.error("Failed to load editors");
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

  const handleInviteEditor = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      // First, find the user by email
      const response = await fetch(`/api/map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: user?.id,
          editorId: inviteEmail, // Using email as ID for lookup
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to invite editor");
      }

      toast.success("Invitation sent successfully!");
      setShowInviteDialog(false);
      setInviteEmail("");

      // Refresh editors list
      if (user) {
        const mapsRes = await fetch(`/api/map?creatorId=${user.id}`);
        if (mapsRes.ok) {
          const maps = await mapsRes.json();
          setEditors(maps);
        }
      }
    } catch (error: any) {
      console.error("Failed to invite editor:", error);
      toast.error(error.message || "Failed to invite editor");
    } finally {
      setInviting(false);
    }
  };

  const activeEditors = editors.filter((e) => e.status === "ACTIVE");
  const pendingEditors = editors.filter((e) => e.status === "PENDING");
  const inactiveEditors = editors.filter((e) => e.status === "INACTIVE");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading editors...</p>
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
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>

            <CommonSubHeader userName={user.name} role="creator" />

            <div className="mt-6 space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Your Editors</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage editors who help create your content
                  </p>
                </div>
                
                {/* Invite Dialog */}
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="default">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Editor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Editor</DialogTitle>
                      <DialogDescription>
                        Send an invitation to an editor by email address
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
                          disabled={inviting}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteDialog(false)}
                        disabled={inviting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        onClick={handleInviteEditor}
                        disabled={inviting}
                      >
                        {inviting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Editors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeEditors.length}</div>
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
                      {pendingEditors.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Editors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{editors.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Editors */}
              {activeEditors.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-3">Active Editors</h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {activeEditors.map((editor) => (
                      <Card key={editor.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(editor.editor?.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {editor.editor?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {editor.editor?.email}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            {getStatusBadge(editor.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/editors/${editor.id}`)}
                            >
                              Manage
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Invitations */}
              {pendingEditors.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-3 text-yellow-600">
                    Pending Invitations
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {pendingEditors.map((editor) => (
                      <Card key={editor.id} className="border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-yellow-100 text-yellow-600">
                                {getInitials(editor.editor?.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {editor.editor?.name || "Pending User"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {editor.editor?.email || "Email not registered"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            {getStatusBadge(editor.status)}
                            <Badge variant="outline" className="text-xs">
                              Awaiting response
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {editors.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No editors yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Invite your first editor to start collaborating
                    </p>
                    <Button
                      variant="default"
                      onClick={() => setShowInviteDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Editor
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
