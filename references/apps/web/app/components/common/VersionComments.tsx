import { Form, useFetcher } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import type { xDomainVersionComment } from "@spectral/types";
import type { ActionResult } from "~/types/action-result";

interface VersionCommentsProps {
  comments: xDomainVersionComment[];
  versionId: string;
}

export function VersionComments({ comments, versionId }: VersionCommentsProps) {
  const fetcher = useFetcher<ActionResult<xDomainVersionComment>>();
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    fetcher.submit(
      {
        intent: "add-comment",
        content: comment.trim(),
        versionId,
      },
      { method: "post" },
    );
    setComment("");
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageCircle className="w-4 h-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-20 resize-none"
            disabled={fetcher.state === "submitting"}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!comment.trim() || fetcher.state === "submitting"}
            >
              <Send className="w-3 h-3 mr-1" />
              {fetcher.state === "submitting" ? "Posting..." : "Post"}
            </Button>
          </div>
        </Form>

        <div className="space-y-3">
          {sortedComments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            sortedComments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {comment.author?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {comment.author?.name || "Unknown User"}
                    </span>
                    <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                      {comment.author?.role || "User"}
                    </span>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 rounded-md p-3">
                    {comment.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
