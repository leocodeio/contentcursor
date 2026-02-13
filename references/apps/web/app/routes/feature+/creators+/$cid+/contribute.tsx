import {
  useLoaderData,
  Link,
  useFetcher,
  useActionData,
} from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useState, useEffect } from "react";
import { ArrowLeft, Folder, FileText, Plus, Edit, Trash2 } from "lucide-react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/hooks/use-toast";
import { xDomainAccountEditorMap } from "@spectral/types";

// loader
import { loader as contributeLoader } from "~/routes/loader+/feature+/contribute+/contribute.loader";
export const loader = contributeLoader;

export default function Contribute() {
  const data = useLoaderData<typeof loader>();
  const { name, role, cid, accessibleFolders, editorLinkedAccountsByCreator } =
    data;

  // State for modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);

  // Form state
  const [folderName, setFolderName] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // Fetchers for different actions
  const createFetcher = useFetcher();
  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  // Handle create folder
  const handleCreateFolder = () => {
    if (!folderName.trim() || !selectedAccountId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    createFetcher.submit(
      {
        name: folderName,
        accountId: selectedAccountId,
        creatorId: cid,
      },
      { method: "post", action: "/feature/folders/create" }
    );
  };

  // Handle edit folder
  const handleEditFolder = () => {
    if (!folderName.trim() || !selectedFolder) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
      });
      return;
    }

    updateFetcher.submit(
      {
        folderId: selectedFolder.id,
        name: folderName,
      },
      { method: "post", action: "/feature/folders/update" }
    );
  };

  // Handle delete folder
  const handleDeleteFolder = () => {
    if (!selectedFolder) return;

    deleteFetcher.submit(
      {
        folderId: selectedFolder.id,
      },
      { method: "post", action: "/feature/folders/delete" }
    );
  };

  // Handle modal opening for edit
  const openEditModal = (folder: any) => {
    setSelectedFolder(folder);
    setFolderName(folder.name);
    setEditModalOpen(true);
  };

  // Handle modal opening for delete
  const openDeleteModal = (folder: any) => {
    setSelectedFolder(folder);
    setDeleteModalOpen(true);
  };

  // Reset form when modals close
  useEffect(() => {
    if (!createModalOpen) {
      setFolderName("");
      setSelectedAccountId("");
    }
  }, [createModalOpen]);

  useEffect(() => {
    if (!editModalOpen) {
      setFolderName("");
      setSelectedFolder(null);
    }
  }, [editModalOpen]);

  useEffect(() => {
    if (!deleteModalOpen) {
      setSelectedFolder(null);
    }
  }, [deleteModalOpen]);

  // Handle fetcher responses
  useEffect(() => {
    if (createFetcher.data) {
      const result = createFetcher.data as any;
      if (result.success) {
        toast({
          title: "Success",
          description: "Folder created successfully",
        });
        setCreateModalOpen(false);
        // Reload the page to show new folder
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create folder",
        });
      }
    }
  }, [createFetcher.data]);

  useEffect(() => {
    if (updateFetcher.data) {
      const result = updateFetcher.data as any;
      if (result.success) {
        toast({
          title: "Success",
          description: "Folder updated successfully",
        });
        setEditModalOpen(false);
        // Reload the page to show updated folder
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update folder",
        });
      }
    }
  }, [updateFetcher.data]);

  useEffect(() => {
    if (deleteFetcher.data) {
      const result = deleteFetcher.data as any;
      if (result.success) {
        toast({
          title: "Success",
          description: "Folder deleted successfully",
        });
        setDeleteModalOpen(false);
        // Reload the page to remove deleted folder
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete folder",
        });
      }
    }
  }, [deleteFetcher.data]);

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={name} role={role} variant="default" />

      {/* Back Button */}
      <Button variant="ghost" className="my-2">
        <Link to="/feature/creators" className="flex items-center space-x-2">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">Back</Label>
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Folders</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage folders for creator {cid}
        </p>
      </div>

      {/* Accessible Folders */}
      <Card className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-0 bg-transparent shadow-none">
        {accessibleFolders?.map((folder: any) => (
          <Card key={folder.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {folder.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {folder.accountEmail}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(folder.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/feature/folders/${folder.id}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Open
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(folder)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteModal(folder)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create new folder card */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
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
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {editorLinkedAccountsByCreator?.map(
                      (account: xDomainAccountEditorMap) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account?.email}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={createFetcher.state === "submitting"}
                  className="flex-1"
                >
                  {createFetcher.state === "submitting"
                    ? "Creating..."
                    : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Edit Folder Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
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
                onClick={() => setEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditFolder}
                disabled={updateFetcher.state === "submitting"}
                className="flex-1"
              >
                {updateFetcher.state === "submitting"
                  ? "Updating..."
                  : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
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
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFolder}
              disabled={deleteFetcher.state === "submitting"}
              className="flex-1"
            >
              {deleteFetcher.state === "submitting" ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty state if no folders */}
      {(!accessibleFolders || accessibleFolders.length === 0) && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Folder className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-2 text-center">
              <CardTitle>No Folders Yet</CardTitle>
              <CardDescription>
                Create your first folder to start organizing content.
              </CardDescription>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} className="mt-2">
              Create First Folder
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
