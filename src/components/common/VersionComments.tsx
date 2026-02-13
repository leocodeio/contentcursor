"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
    image?: string;
  };
}

interface VersionCommentsProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  loading?: boolean;
}

export function VersionComments({
  comments,
  onAddComment,
  loading = false,
}: VersionCommentsProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
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

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to leave feedback</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {comment.author?.name
                    ? getInitials(comment.author.name)
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.author?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" size="sm" disabled={loading || !newComment.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
