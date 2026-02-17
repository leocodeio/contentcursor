"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Folder,
  FolderPlus,
  Edit,
  Trash2,
  Plus,
  FileText,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface AccessibleFolder {
  id: string;
  name: string;
  accountEmail: string;
  accountId: string;
  createdAt: string;
}

interface LinkedAccount {
  id: string;
  email: string;
}

export default function CreatorContributePage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.creatorId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [folders, setFolders] = useState<AccessibleFolder[]>([]);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<AccessibleFolder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

        // Fetch accounts
        try {
          const ytRes = await fetch(`/api/yt_int/creator?creatorId=${currentUser.id}`);
          const ytData = await ytRes.json();
          const linkedAccounts = Array.isArray(ytData) ? ytData : [];
          setAccounts(linkedAccounts);
          setFolders([
            {
              id: "1",
              name: "Gaming Highlights",
              accountEmail: linkedAccounts[0]?.email || "account@example.com",
              accountId: linkedAccounts[0]?.id || "1",
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Vlogs",
              accountEmail: linkedAccounts[0]?.email || "account@example.com",
              accountId: linkedAccounts[0]?.id || "1",
              createdAt: new Date().toISOString(),
            },
          ]);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, creatorId]);

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !selectedAccountId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderName.trim(),
          accountId: selectedAccountId,
          creatorId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      toast.success("Folder created successfully");
      setShowCreate(false);
      setFolderName("");
      setSelectedAccountId("");

      // Refresh folders
      const newFolder: AccessibleFolder = {
        id: `folder-${Date.now()}`,
        name: folderName.trim(),
        accountEmail: accounts.find((a) => a.id === selectedAccountId)?.email || "",
        accountId: selectedAccountId,
        createdAt: new Date().toISOString(),
      };
      setFolders((prev) => [...prev, newFolder]);
    } catch (error) {
      toast.error("Failed to create folder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFolder = async () => {
    if (!selectedFolder || !folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/folder/${selectedFolder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update folder");
      }

      toast.success("Folder updated successfully");
      setShowEdit(false);
      setSelectedFolder(null);
      setFolderName("");

      // Update local state
      setFolders((prev) =>
        prev.map((f) =>
          f.id === selectedFolder.id ? { ...f, name: folderName.trim() } : f
        )
      );
    } catch (error) {
      toast.error("Failed to update folder");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/folder/${selectedFolder.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }

      toast.success("Folder deleted successfully");
      setShowDelete(false);
      setSelectedFolder(null);

      // Update local state
      setFolders((prev) => prev.filter((f) => f.id !== selectedFolder.id));
    } catch (error) {
      toast.error("Failed to delete folder");
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header page="Manage Folders" user={user} />
        
        <main className="flex-1 p-6">
          <div className="h-fit w-full">
            {/* Back Button */}
            <Button variant="ghost" className="mb-4">
              <Link href={`/creators/${creatorId}`} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Creator</span>
              </Link>
            </Button>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Folder className="h-6 w-6" />
                Manage Folders
              </h1>
              <p className="text-muted-foreground">
                Create and manage folders across all your accounts
              </p>
            </div>

            {/* Folders Grid */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Folder Cards */}
              {folders.map((folder) => (
                <Card key={folder.id} className="hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Folder className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base truncate">
                            {folder.name}
                          </CardTitle>
                          <CardDescription className="text-xs truncate">
                            {folder.accountEmail}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground mb-3">
                      Created: {new Date(folder.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link
                          href={`/creators/${creatorId}/accounts/${folder.accountId}/folders/${folder.id}/open`}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Open
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFolder(folder);
                          setFolderName(folder.name);
                          setShowEdit(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedFolder(folder);
                          setShowDelete(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create New Folder Card */}
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-2 text-center">
                        <CardTitle className="text-lg">Create Folder</CardTitle>
                        <CardDescription>
                          Add a new folder to organize content
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>
                      Create a new folder to organize your content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folderName">Folder Name</Label>
                      <Input
                        id="folderName"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder="Enter folder name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountSelect">Select Account</Label>
                      <select
                        id="accountSelect"
                        className="w-full p-2 border rounded-md"
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                      >
                        <option value="">Choose an account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreate(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateFolder}
                        disabled={submitting}
                        className="flex-1"
                      >
                        {submitting ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Empty State */}
            {folders.length === 0 && (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-12 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2 text-center">
                    <CardTitle>No Folders Yet</CardTitle>
                    <CardDescription>
                      Create your first folder to start organizing content.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreate(true)} className="mt-2">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create First Folder
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>Update the folder name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFolderName">Folder Name</Label>
              <Input
                id="editFolderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditFolder}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedFolder?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFolder}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
