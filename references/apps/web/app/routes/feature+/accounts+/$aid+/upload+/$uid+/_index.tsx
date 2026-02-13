import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { getSession } from "~/server/services/auth/db.server";
import {
  getContributionById,
  getVersionsByContribution,
} from "~/server/services/creator/contribute.server";
import type {
  xDomainContribute,
  xDomainContributionVersion,
} from "@spectral/types";
import { ArrowLeft, Eye, Clock, Calendar } from "lucide-react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) return redirect("/");

  const { aid, uid } = params;
  if (!aid || !uid) throw new Response("Invalid parameters", { status: 400 });

  const [contributionResult, versionsResult] = await Promise.all([
    getContributionById(request, uid),
    getVersionsByContribution(request, uid),
  ]);

  if (!contributionResult.success || !contributionResult.data) {
    throw new Response("Contribution not found", { status: 404 });
  }

  const contribution = contributionResult.data as xDomainContribute;
  if (contribution.accountId !== aid) {
    throw new Response("Contribution not found for this account", {
      status: 404,
    });
  }

  return {
    userName: session.user?.name || "",
    role: session.user?.role || "",
    accountId: aid,
    contribution,
    versions: versionsResult.success ? versionsResult.data : [],
  };
};

function getStatusColor(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "COMPLETED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function ContributionVersions() {
  const { userName, role, contribution, versions } =
    useLoaderData<typeof loader>();

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={userName} role={role} variant="default" />
      <div className="flex items-center gap-2 my-2">
        <Button asChild variant="ghost">
          <Link
            to={`..`}
            relative="path"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto my-6 space-y-6">
        {/* Contribution Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{contribution.title}</CardTitle>
            <CardDescription>
              Contribution ID: {contribution.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="font-medium">
                  <Badge variant={getStatusColor(String(contribution.status))}>
                    {String(contribution.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{contribution.duration}s</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Description</p>
                <p>{contribution.description}</p>
              </div>
            </div>
            {contribution.tags && contribution.tags.length > 0 && (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {contribution.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Versions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Versions ({versions?.length || 0})
            </h2>
          </div>

          {!versions || versions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  No versions available
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This contribution doesn&apos;t have any versions yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {versions
                .sort((a: any, b: any) => b.versionNumber - a.versionNumber)
                .map((version: any) => (
                  <Card
                    key={version.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Version {version.versionNumber}
                          </CardTitle>
                          <CardDescription>{version.title}</CardDescription>
                        </div>
                        <Badge variant={getStatusColor(version.status)}>
                          {version.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {version.description}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Duration: {version.duration}s</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Created:{" "}
                            {new Date(version.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {version.tags && version.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {version.tags.map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button asChild size="sm" variant="default">
                          <Link
                            to={`version/${version.id}`}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
