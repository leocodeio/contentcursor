import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { getSession } from "~/server/services/auth/db.server";
import { getContributionsByAccount } from "~/server/services/editor/contribute.server";
import type { xDomainContribute } from "@spectral/types";
import { ArrowLeft, PlusCircle, Grid3X3, List } from "lucide-react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) return redirect("/");

  const { aid } = params;
  if (!aid) throw new Response("Account ID is required", { status: 400 });

  const res = await getContributionsByAccount(request, aid);
  const editorId = session.user.id;
  const all = (res.success ? (res.data as xDomainContribute[]) : []) || [];
  const mine = all.filter((c) => c.editorId === editorId);

  return {
    userName: session.user?.name || "",
    role: session.user?.role || "",
    accountId: aid,
    editorId,
    contributions: mine,
  };
};

export default function AccountUploadListEditor() {
  const { contributions } = useLoaderData<typeof loader>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader
        userName="My Contributions"
        role="View or continue work"
        variant="default"
      />
      <div className="flex items-center gap-2 my-4 mx-2">
        <Button asChild variant="ghost">
          <Link to="../" relative="path" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>
        <Button asChild>
          <Link to={`./initiate`} className="flex items-center space-x-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create Contribution</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Label className="text-sm">View:</Label>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "grid" | "list")}
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="max-w-6xl mx-auto my-6 space-y-6">
        {contributions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No contributions yet</CardTitle>
              <CardDescription>
                Click "Create Contribution" to start a new upload
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {contributions.map((c) => (
              <Card
                key={c.id}
                className={`hover:bg-muted/30 transition-colors ${viewMode === "list" ? "flex flex-row" : ""}`}
              >
                <CardHeader className={viewMode === "list" ? "flex-1" : ""}>
                  <CardTitle className="truncate">{c.title}</CardTitle>
                  <CardDescription>
                    Status: {String(c.status)} •
                    {c.versions
                      ? ` ${c.versions.length} version${c.versions.length !== 1 ? "s" : ""}`
                      : " 0 versions"}
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className={
                    viewMode === "list"
                      ? "flex flex-col justify-between py-6"
                      : ""
                  }
                >
                  {/* <div>
                    <div className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {c.description}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Tags: {c.tags?.join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                      Duration: {c.duration}s
                    </div>
                  </div> */}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className={viewMode === "list" ? "w-fit" : ""}
                  >
                    <Link to={`./${c.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
