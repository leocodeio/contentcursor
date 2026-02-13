"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, X, Loader2, FileVideo } from "lucide-react";

interface CreateVersionDialogProps {
  onCreate: (data: {
    title: string;
    description: string;
    tags: string[];
    videoFile: File | null;
    thumbnailFile: File | null;
  }) => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export function CreateVersionDialog({
  onCreate,
  loading = false,
  children,
}: CreateVersionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }
    onCreate({
      title: title.trim(),
      description: description.trim(),
      tags,
      videoFile,
      thumbnailFile,
    });
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setTitle("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setVideoFile(null);
      setThumbnailFile(null);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (tags.length < 10 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Version
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>
            Upload a new video version with thumbnail for review
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Video Upload */}
          <div className="space-y-2">
            <Label htmlFor="video">Video File *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              <label htmlFor="video" className="cursor-pointer">
                {videoFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileVideo className="h-8 w-8 text-primary" />
                    <span className="font-medium">{videoFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        setVideoFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload video file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, MOV, AVI up to 2GB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <label htmlFor="thumbnail" className="cursor-pointer">
                {thumbnailFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src={URL.createObjectURL(thumbnailFile)}
                      alt="Thumbnail preview"
                      className="h-16 w-24 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{thumbnailFile.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setThumbnailFile(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload thumbnail
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter version title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what's new in this version..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Press Enter to add a tag (max 10)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !description.trim() || !videoFile}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Version"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
