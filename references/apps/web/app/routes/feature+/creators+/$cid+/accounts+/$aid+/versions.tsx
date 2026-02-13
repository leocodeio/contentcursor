import { useLoaderData, Link } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import {
  ArrowLeft,
  FolderOpen,
  History,
  GitCompare,
  Upload,
} from "lucide-react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

// Simple inline tabs for now to avoid import issues
const SimpleTabs = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

const SimpleTabsList = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
  >
    {children}
  </div>
);

interface SimpleTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const SimpleTabsTrigger = ({
  value,
  children,
  className,
  activeTab,
  setActiveTab,
}: SimpleTabsTriggerProps) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
      activeTab === value
        ? "bg-background text-foreground shadow-sm"
        : "hover:bg-muted/80"
    } ${className}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

interface SimpleTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab: string;
}

const SimpleTabsContent = ({
  value,
  children,
  className,
  activeTab,
}: SimpleTabsContentProps) => {
  if (activeTab !== value) return null;
  return <div className={`mt-2 ${className}`}>{children}</div>;
};

// Loader for contribution data with versions
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { cid, aid } = params;

  // Mock data for demonstration
  const mockContribution = {
    id: "contrib-1",
    title: "Gaming Montage - Epic Moments",
    description:
      "An exciting gaming compilation featuring the best moments from recent streams.",
    tags: ["gaming", "montage", "highlights"],
    status: "PENDING",
    accountId: aid || "",
    editorId: "editor-1",
    videoId: "video-1",
    thumbnailId: "thumb-1",
    duration: 180,
    versions: [
      {
        id: "version-1",
        contributeId: "contrib-1",
        versionNumber: 1,
        title: "Gaming Montage - Epic Moments v1",
        description: "Initial version with basic editing and transitions.",
        tags: ["gaming", "montage"],
        status: "COMPLETED",
        videoId: "video-1",
        thumbnailId: "thumb-1",
        duration: 180,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        comments: [],
      },
      {
        id: "version-2",
        contributeId: "contrib-1",
        versionNumber: 2,
        title: "Gaming Montage - Epic Moments v2",
        description:
          "Updated version with improved color grading and better audio sync.",
        tags: ["gaming", "montage", "highlights"],
        status: "PENDING",
        videoId: "video-2",
        thumbnailId: "thumb-2",
        duration: 195,
        createdAt: "2024-01-16T14:30:00Z",
        updatedAt: "2024-01-16T14:30:00Z",
        comments: [],
      },
    ],
  };

  return {
    contribution: mockContribution,
    cid,
    aid,
    userName: "Test User",
    role: "editor",
  };
};

interface VersionType {
  id: string;
  versionNumber: number;
  title: string;
  description: string;
  status: string;
  duration: number;
  createdAt: string;
  [key: string]: unknown;
}

export default function ContributionVersions() {
  const { contribution, cid, aid, userName, role } =
    useLoaderData<typeof loader>();
  const [selectedVersion, setSelectedVersion] = useState<VersionType | null>(
    contribution.versions?.[0] || null,
  );
  const [activeTab, setActiveTab] = useState("manage");

  const handleVersionSelect = (version: VersionType) => {
    setSelectedVersion(version);
    setActiveTab("timeline");
  };

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={userName} role={role} variant="default" />

      {/* Back Button */}
      <Button variant="ghost" className="my-2">
        <Link
          to={`/feature/creators/${cid}/accounts/${aid}`}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">Back to Account</Label>
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{contribution.title}</h1>
        </div>
        <p className="text-muted-foreground mb-4">{contribution.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Duration: {contribution.duration}s</span>
          <span>Status: {contribution.status}</span>
          <span>Versions: {contribution.versions?.length || 0}</span>
        </div>
      </div>

      {/* Upload New Version Button */}
      <div className="mb-6">
        <Button asChild>
          <Link to={`/feature/creators/${cid}/accounts/${aid}/upload/initiate`}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New Version
          </Link>
        </Button>
      </div>

      {/* Version Management Tabs */}
      <SimpleTabs className="w-full">
        <SimpleTabsList className="grid w-full grid-cols-3">
          <SimpleTabsTrigger
            value="manage"
            className="flex items-center gap-2"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            <History className="w-4 h-4" />
            Manage Versions
          </SimpleTabsTrigger>
          <SimpleTabsTrigger
            value="timeline"
            className="flex items-center gap-2"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            <History className="w-4 h-4" />
            Timeline
          </SimpleTabsTrigger>
          <SimpleTabsTrigger
            value="compare"
            className="flex items-center gap-2"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            <GitCompare className="w-4 h-4" />
            Compare
          </SimpleTabsTrigger>
        </SimpleTabsList>

        <SimpleTabsContent
          value="manage"
          className="mt-6"
          activeTab={activeTab}
        >
          <Card>
            <CardHeader>
              <CardTitle>Version Management</CardTitle>
              <CardDescription>
                Create, edit, and manage different versions of your content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contribution.versions?.map((version: VersionType) => (
                  <Card
                    key={version.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            Version {version.versionNumber}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              version.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : version.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {version.status}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVersionSelect(version)}
                        >
                          Select
                        </Button>
                      </div>
                      <h3 className="text-base font-medium">{version.title}</h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {version.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {version.duration}s</span>
                        <span>
                          Created:{" "}
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </SimpleTabsContent>

        <SimpleTabsContent
          value="timeline"
          className="mt-6"
          activeTab={activeTab}
        >
          <Card>
            <CardHeader>
              <CardTitle>Version Timeline</CardTitle>
              <CardDescription>
                Track the evolution of this contribution over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contribution.versions?.map(
                  (version: VersionType, index: number) => (
                    <div key={version.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            version.status === "COMPLETED"
                              ? "bg-green-500"
                              : version.status === "REJECTED"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        {index < (contribution.versions?.length || 0) - 1 && (
                          <div className="w-0.5 h-16 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            Version {version.versionNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(version.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium">{version.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {version.description}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </SimpleTabsContent>

        <SimpleTabsContent
          value="compare"
          className="mt-6"
          activeTab={activeTab}
        >
          <Card>
            <CardHeader>
              <CardTitle>Version Comparison</CardTitle>
              <CardDescription>
                Compare changes between different versions side by side.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(contribution.versions?.length || 0) < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>You need at least 2 versions to compare changes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contribution.versions
                    ?.slice(0, 2)
                    .map((version: VersionType) => (
                      <Card key={version.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">
                            Version {version.versionNumber}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <h3 className="font-medium mb-1">{version.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {version.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Duration: {version.duration}s
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </SimpleTabsContent>
      </SimpleTabs>

      {/* Selected Version Details */}
      {selectedVersion && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Selection: Version {selectedVersion.versionNumber}
            </CardTitle>
            <CardDescription>{selectedVersion.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedVersion.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Duration</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedVersion.duration} seconds
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedVersion.status}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedVersion.createdAt).toLocaleDateString()} at{" "}
                  {new Date(selectedVersion.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
