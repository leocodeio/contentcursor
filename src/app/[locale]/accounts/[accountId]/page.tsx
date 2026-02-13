"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  Users,
  Plus,
  Settings,
  Loader2,
  FolderPlus,
  UserPlus,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  createdAt: string;
  items?: { id: string }[];
}

interface AccountEditorMap {
  id: string;
  editorId: string;
  status: string;
  editor?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface AccountData {
  user: User;
  account: {
    id: string;
    email: string;
    status: string;
  };
  folders: Folder[];
  editors: AccountEditorMap[];
}

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.accountId as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("folders");
  const [user, setUser] = useState<User | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showInviteEditor, setShowInviteEditor] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [creating, setCreating] = useState(false);
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

        // Fetch account details
        try {
          const ytRes = await fetch(`/api/yt_int/creator?creatorId=${currentUser.id}`);
          const ytData = await ytRes.json();
          const account = ytData.find((a: any) => a.id === accountId);
          
          if (account) {
            // Fetch folders
            const foldersRes = await fetch(
              `/api/folder?creatorId=${currentUser.id}&accountId=${accountId}`
            );
            const folders = foldersRes.ok ? await foldersRes.json() : [];

            // Fetch editors for this account
            const editorsRes = await fetch(
              `/api/map/account?creatorId=${currentUser.id}&accountId=${accountId}`
            );
            const editors = editorsRes.ok ? await editorsRes.json() : [];

            setAccountData({
              user: currentUser,
              account,
              folders,
              editors,
            });
          } else {
            toast.error("Account not found");
            router.push("/accounts");
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
  }, [router, accountId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          creatorId: user?.id,
          editorId: null,
          accountId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      toast.success("Folder created successfully");
      setShowCreateFolder(false);
      setNewFolderName("");

      // Refresh folders
      const foldersRes = await fetch(
        `/api/folder?creatorId=${user?.id}&accountId=${accountId}`
      );
      if (foldersRes.ok) {
        const folders = await foldersRes.json();
        setAccountData((prev) =>
          prev ? { ...prev, folders } : null
        );
      }
    } catch (error) {
      toast.error("Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  const handleInviteEditor = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      // First find the user by email
      const response = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: user?.id,
          editorId: inviteEmail.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to invite editor");
      }

      toast.success("Invitation sent successfully");
      setShowInviteEditor(false);
      setInviteEmail("");

      // Refresh editors
      const editorsRes = await fetch(
        `/api/map/account?creatorId=${user?.id}&accountId=${accountId}`
      );
      if (editorsRes.ok) {
        const editors = await editorsRes.json();
        setAccountData((prev) =>
          prev ? { ...prev, editors } : null
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to invite editor");
    } finally {
      setInviting(false);
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
              <Link href="/accounts" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Accounts</span>
              </Link>
            </Button>

            {/* Account Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {accountData.account.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{accountData.account.email}</h1>
                  <Badge variant="outline" className="mt-1">
                    {accountData.account.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tabs for Folders and Editors */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="folders" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Folders ({accountData.folders.length})
                </TabsTrigger>
                <TabsTrigger value="editors" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Editors ({accountData.editors.length})
                </TabsTrigger>
              </TabsList>

              {/* Folders Tab */}
              <TabsContent value="folders">
                <div className="space-y-4 mt-4">
                  {/* Create Folder */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Manage Folders</h2>
                    <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
                      <DialogTrigger asChild>
                        <Button variant="default">
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Create Folder
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Folder</DialogTitle>
                          <DialogDescription>
                            Create a folder to organize content for this account
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="folderName">Folder Name</Label>
                            <Input
                              id="folderName"
                              placeholder="e.g., Gaming Videos"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateFolder}
                            disabled={creating || !newFolderName.trim()}
                          >
                            {creating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Folder"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Folders Grid */}
                  {accountData.folders.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {accountData.folders.map((folder) => (
                        <Card key={folder.id} className="hover:shadow-md cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <FolderOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">
                                    {folder.name}
                                  </CardTitle>
                                  <CardDescription>
                                    {folder.items?.length || 0} items
                                  </CardDescription>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                          No folders yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Create your first folder to organize content
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Editors Tab */}
              <TabsContent value="editors">
                <div className="space-y-4 mt-4">
                  {/* Invite Editor */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Account Editors</h2>
                    <Dialog open={showInviteEditor} onOpenChange={setShowInviteEditor}>
                      <DialogTrigger asChild>
                        <Button variant="default">
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
                          <Button variant="outline" onClick={() => setShowInviteEditor(false)}>
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

                  {/* Editors Grid */}
                  {accountData.editors.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {accountData.editors.map((map) => (
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
                                  <CardDescription>
                                    {map.editor?.email}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {map.status}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                          No editors yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Invite editors to collaborate on this account
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
