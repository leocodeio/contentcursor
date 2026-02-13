import { GitBranch, GitCommit, Clock, User, MessageCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type {
  xDomainContributionVersion,
  xContributionVersionStatusType,
} from "@spectral/types";

interface VersionTimelineProps {
  versions: xDomainContributionVersion[];
  onVersionSelect?: (version: xDomainContributionVersion) => void;
  selectedVersionId?: string;
}

export function VersionTimeline({
  versions,
  onVersionSelect,
  selectedVersionId,
}: VersionTimelineProps) {
  const getStatusColor = (status: xContributionVersionStatusType) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-lg mb-2">Version Timeline</CardTitle>
          <CardDescription>
            No versions created yet. Create your first version to see the
            timeline.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <CardTitle>Version Timeline</CardTitle>
        </div>
        <CardDescription>
          Track the evolution of this contribution over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {sortedVersions.map((version, index) => {
              const isSelected = selectedVersionId === version.id;
              const isLatest = index === 0;

              return (
                <div
                  key={version.id}
                  className="relative flex items-start gap-4"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-background ${getStatusColor(version.status)}`}
                    />
                    {isLatest && (
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-pulse opacity-30" />
                    )}
                  </div>

                  {/* Version card */}
                  <div
                    className={`flex-1 ${isSelected ? "ring-2 ring-primary rounded-lg" : ""}`}
                  >
                    <Card
                      className={
                        isSelected
                          ? "border-primary shadow-md"
                          : "hover:shadow-sm transition-shadow"
                      }
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GitCommit className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Version {version.versionNumber}
                            </span>
                            {isLatest && (
                              <Badge variant="default" className="text-xs">
                                Latest
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                version.status === "COMPLETED"
                                  ? "text-green-700 border-green-200"
                                  : version.status === "REJECTED"
                                    ? "text-red-700 border-red-200"
                                    : "text-yellow-700 border-yellow-200"
                              }`}
                            >
                              {version.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(version.createdAt)}
                          </div>
                        </div>
                        <CardTitle className="text-base">
                          {version.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {version.description}
                        </p>

                        {/* Version metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Editor
                          </div>
                          <div>Duration: {version.duration}s</div>
                          {version.comments && version.comments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {version.comments.length}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {version.tags && version.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {version.tags.slice(0, 3).map((tag, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {version.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{version.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => onVersionSelect?.(version)}
                            className="text-xs"
                          >
                            {isSelected ? "Selected" : "Select"}
                          </Button>
                          {version.video?.integrationUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                const url = version.video?.integrationUrl;
                                if (url) {
                                  window.open(url, "_blank");
                                }
                              }}
                            >
                              View Video
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline end marker */}
          <div className="relative flex items-center gap-4 mt-6">
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full border-2 border-background bg-muted" />
            </div>
            <div className="text-sm text-muted-foreground">
              Started tracking versions
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
