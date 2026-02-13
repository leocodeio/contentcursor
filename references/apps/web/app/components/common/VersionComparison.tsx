import { useState } from "react";
import { GitCompare, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import type { xDomainContributionVersion } from "@spectral/types";

interface VersionComparisonProps {
  versions: xDomainContributionVersion[];
  currentVersionId?: string;
}

export function VersionComparison({
  versions,
  currentVersionId,
}: VersionComparisonProps) {
  const [leftVersionId, setLeftVersionId] = useState<string>(
    currentVersionId || versions[0]?.id || "",
  );
  const [rightVersionId, setRightVersionId] = useState<string>(
    versions[1]?.id || "",
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const leftVersion = versions.find((v) => v.id === leftVersionId);
  const rightVersion = versions.find((v) => v.id === rightVersionId);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getDurationDiff = () => {
    if (!leftVersion || !rightVersion) return null;
    const diff = rightVersion.duration - leftVersion.duration;
    return diff;
  };

  const getTagsDiff = () => {
    if (!leftVersion || !rightVersion)
      return { added: [], removed: [], common: [] };

    const leftTags = leftVersion.tags || [];
    const rightTags = rightVersion.tags || [];

    const added = rightTags.filter((tag) => !leftTags.includes(tag));
    const removed = leftTags.filter((tag) => !rightTags.includes(tag));
    const common = leftTags.filter((tag) => rightTags.includes(tag));

    return { added, removed, common };
  };

  if (versions.length < 2) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-lg mb-2">Version Comparison</CardTitle>
          <CardDescription>
            You need at least 2 versions to compare changes.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  const tagsDiff = getTagsDiff();
  const durationDiff = getDurationDiff();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <CardTitle>Version Comparison</CardTitle>
          </div>
          <CardDescription>
            Compare changes between different versions side by side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="compare-from">Compare From</Label>
              <Select value={leftVersionId} onValueChange={setLeftVersionId}>
                <SelectTrigger id="compare-from">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      Version {version.versionNumber} - {version.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="compare-to">Compare To</Label>
              <Select value={rightVersionId} onValueChange={setRightVersionId}>
                <SelectTrigger id="compare-to">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      Version {version.versionNumber} - {version.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {leftVersion &&
            rightVersion &&
            leftVersion.id !== rightVersion.id && (
              <div className="space-y-6">
                {/* Video Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        Version {leftVersion.versionNumber}
                        <Badge variant="outline">{leftVersion.status}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                        {leftVersion.video?.integrationUrl ? (
                          <video
                            src={leftVersion.video.integrationUrl}
                            className="w-full h-full object-cover rounded-md"
                            poster={
                              leftVersion.thumbnail?.integrationUrl || undefined
                            }
                          >
                            <track
                              kind="captions"
                              srcLang="en"
                              label="English"
                            />
                          </video>
                        ) : (
                          <span className="text-muted-foreground">
                            No video available
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium mb-1">{leftVersion.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {leftVersion.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Duration: {leftVersion.duration}s
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        Version {rightVersion.versionNumber}
                        <Badge variant="outline">{rightVersion.status}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                        {rightVersion.video?.integrationUrl ? (
                          <video
                            src={rightVersion.video.integrationUrl}
                            className="w-full h-full object-cover rounded-md"
                            poster={
                              rightVersion.thumbnail?.integrationUrl ||
                              undefined
                            }
                          >
                            <track
                              kind="captions"
                              srcLang="en"
                              label="English"
                            />
                          </video>
                        ) : (
                          <span className="text-muted-foreground">
                            No video available
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium mb-1">{rightVersion.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rightVersion.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Duration: {rightVersion.duration}s
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Playback Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Synchronized Playback
                    </CardTitle>
                    <CardDescription>
                      Control both videos simultaneously for easier comparison.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          /* Skip back 10s */
                        }}
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={isPlaying ? "secondary" : "default"}
                        size="sm"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          /* Skip forward 10s */
                        }}
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Changes Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Changes Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Duration Changes */}
                    {durationDiff !== null && durationDiff !== 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Duration</h4>
                        <Badge
                          variant={durationDiff > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {durationDiff > 0 ? "+" : ""}
                          {durationDiff}s
                        </Badge>
                      </div>
                    )}

                    {/* Title Changes */}
                    {leftVersion.title !== rightVersion.title && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Title Changes
                        </h4>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-red-600">- </span>
                            <span className="line-through text-muted-foreground">
                              {leftVersion.title}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-green-600">+ </span>
                            <span>{rightVersion.title}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description Changes */}
                    {leftVersion.description !== rightVersion.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Description Changes
                        </h4>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-red-600">- </span>
                            <span className="line-through text-muted-foreground">
                              {leftVersion.description}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-green-600">+ </span>
                            <span>{rightVersion.description}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags Changes */}
                    {(tagsDiff.added.length > 0 ||
                      tagsDiff.removed.length > 0) && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Tags Changes
                        </h4>
                        <div className="space-y-2">
                          {tagsDiff.removed.length > 0 && (
                            <div>
                              <span className="text-xs text-red-600">
                                Removed:{" "}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tagsDiff.removed.map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs line-through text-muted-foreground"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {tagsDiff.added.length > 0 && (
                            <div>
                              <span className="text-xs text-green-600">
                                Added:{" "}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tagsDiff.added.map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="default"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {tagsDiff.common.length > 0 && (
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Unchanged:{" "}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tagsDiff.common.map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

          {leftVersion &&
            rightVersion &&
            leftVersion.id === rightVersion.id && (
              <div className="text-center py-8 text-muted-foreground">
                <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select different versions to compare changes.</p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
