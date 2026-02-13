import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import {
  GitBranch,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { toast } from "~/hooks/use-toast";
import type {
  xDomainContributionVersion,
  xContributionVersionStatusType,
} from "@spectral/types";

interface VersionManagerProps {
  contributeId: string;
  versions: xDomainContributionVersion[];
  onVersionSelect?: (version: xDomainContributionVersion) => void;
  canCreateVersion?: boolean;
  canEditVersion?: boolean;
  canDeleteVersion?: boolean;
}

export function VersionManager({
  contributeId,
  versions,
  onVersionSelect,
  canCreateVersion = true,
  canEditVersion = true,
  canDeleteVersion = false,
}: VersionManagerProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<xDomainContributionVersion | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const createFetcher = useFetcher();
  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  const getStatusIcon = (status: xContributionVersionStatusType) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: xContributionVersionStatusType) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const handleCreateVersion = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required",
      });
      return;
    }

    createFetcher.submit(
      {
        contributeId,
        title,
        description,
        tags: tags.join(","),
      },
      { method: "post", action: "/api/versions/create" },
    );
  };

  const handleEditVersion = () => {
    if (!selectedVersion || !title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required",
      });
      return;
    }

    updateFetcher.submit(
      {
        versionId: selectedVersion.id,
        title,
        description,
        tags: tags.join(","),
      },
      { method: "post", action: "/api/versions/update" },
    );
  };

  const handleDeleteVersion = () => {
    if (!selectedVersion) return;

    deleteFetcher.submit(
      { versionId: selectedVersion.id },
      { method: "post", action: "/api/versions/delete" },
    );
  };

  const handleTagsKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (tags.length >= 10) {
      toast({ title: "Tags", description: "Maximum 10 tags" });
      return;
    }
    setTags((t) => [...t, val]);
    setTagInput("");
  };

  const removeTag = (idx: number) =>
    setTags((t) => t.filter((_, i) => i !== idx));

  const openEditModal = (version: xDomainContributionVersion) => {
    setSelectedVersion(version);
    setTitle(version.title);
    setDescription(version.description);
    setTags(version.tags || []);
    setEditModalOpen(true);
  };

  const openDeleteModal = (version: xDomainContributionVersion) => {
    setSelectedVersion(version);
    setDeleteModalOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setSelectedVersion(null);
  };

  useEffect(() => {
    if (!createModalOpen && !editModalOpen) {
      resetForm();
    }
  }, [createModalOpen, editModalOpen]);

  useEffect(() => {
    if (createFetcher.data) {
      const result = createFetcher.data as any;
      if (result.success) {
        toast({
          title: "Success",
          description: "Version created successfully",
        });
        setCreateModalOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create version",
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
          description: "Version updated successfully",
        });
        setEditModalOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update version",
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
          description: "Version deleted successfully",
        });
        setDeleteModalOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete version",
        });
      }
    }
  }, [deleteFetcher.data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Version History</h2>
          <Badge variant="secondary">{versions.length} versions</Badge>
        </div>
        {canCreateVersion && (
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Version
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
                <DialogDescription>
                  Create a new version of this contribution with updated
                  content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="version-title">Title *</Label>
                  <Input
                    id="version-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter version title"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="version-description">Description *</Label>
                  <textarea
                    id="version-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-input"
                    placeholder="Describe what's new in this version..."
                  />
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagsKey}
                      placeholder="Add a tag"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(i)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
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
                    onClick={handleCreateVersion}
                    disabled={createFetcher.state === "submitting"}
                    className="flex-1"
                  >
                    {createFetcher.state === "submitting"
                      ? "Creating..."
                      : "Create Version"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {versions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">No Versions Yet</CardTitle>
              <CardDescription>
                Create your first version to start tracking changes.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          versions
            .sort((a, b) => b.versionNumber - a.versionNumber)
            .map((version) => (
              <Card
                key={version.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Version {version.versionNumber}
                        </span>
                      </div>
                      <Badge className={getStatusColor(version.status)}>
                        {getStatusIcon(version.status)}
                        {version.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVersionSelect?.(version)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {canEditVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(version)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeleteVersion && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteModal(version)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base">{version.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {version.description}
                  </p>
                  {version.tags && version.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {version.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(version.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {version.duration}s
                    </div>
                    {version.comments && version.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {version.comments.length} comments
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Edit Version Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Version</DialogTitle>
            <DialogDescription>
              Update version details and metadata.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter version title"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-input"
                placeholder="Describe what's new in this version..."
              />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagsKey}
                  placeholder="Add a tag"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
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
                onClick={handleEditVersion}
                disabled={updateFetcher.state === "submitting"}
                className="flex-1"
              >
                {updateFetcher.state === "submitting"
                  ? "Updating..."
                  : "Update Version"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Version Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete version{" "}
              {selectedVersion?.versionNumber}? This action cannot be undone.
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
              onClick={handleDeleteVersion}
              disabled={deleteFetcher.state === "submitting"}
              className="flex-1"
            >
              {deleteFetcher.state === "submitting"
                ? "Deleting..."
                : "Delete Version"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
