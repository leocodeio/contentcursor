import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { getSession } from "~/server/services/auth/db.server";
import { getContributionsByAccount } from "~/server/services/creator/contribute.server";
import { getAccountEditorMaps } from "~/server/services/creator/account-editors.server";
import type {
  xDomainContribute,
  xDomainAccountEditorMap,
} from "@spectral/types";
import { ArrowLeft, Filter, Grid3X3, List } from "lucide-react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) return redirect("/");

  const { aid } = params;
  if (!aid) throw new Response("Invalid parameters", { status: 400 });

  const result = await getContributionsByAccount(request, aid);
  const editorMapsResult = await getAccountEditorMaps(request, aid);

  return {
    userName: session.user?.name || "",
    role: session.user?.role || "",
    aid,
    contributions:
      (result.success ? (result.data as xDomainContribute[]) : []) || [],
    accountEditorMaps:
      (editorMapsResult.success
        ? (editorMapsResult.data as xDomainAccountEditorMap[])
        : []) || [],
  };
};

export default function AccountContributionsCreator() {
  const { userName, role, aid, contributions, accountEditorMaps } =
    useLoaderData<typeof loader>();
  const [editorFilter, setEditorFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filteredContributions = (contributions || []).filter((c) => {
    if (editorFilter === "all") return true;
    return c.editorId === editorFilter;
  });

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader
        userName="Account Contributions"
        role="Review and manage"
        variant="default"
      />
      <div className="flex items-center gap-2 my-4 mx-2">
        <Button asChild variant="ghost">
          <Link
            to={`../..`}
            relative="path"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>

        {accountEditorMaps?.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Filter by Editor:</Label>
            <Select value={editorFilter} onValueChange={setEditorFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select editor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contributions</SelectItem>
                {accountEditorMaps.map((m) => (
                  <SelectItem key={m.editorId} value={m.editorId}>
                    {m.editor?.email || `Editor ${m.editorId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
        {filteredContributions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {editorFilter === "all"
                  ? "No contributions yet"
                  : "No contributions match your filter"}
              </CardTitle>
              <CardDescription>
                {editorFilter === "all"
                  ? "When editors upload, they will appear here"
                  : "Try changing your filter or ask an editor to upload"}
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
            {filteredContributions.map((c) => (
              <Card
                key={c.id}
                className={`hover:bg-muted/30 transition-colors ${viewMode === "list" ? "flex flex-row" : ""}`}
              >
                <CardHeader className={viewMode === "list" ? "flex-1" : ""}>
                  <CardTitle className="truncate">{c.title}</CardTitle>
                  <CardDescription>Status: {String(c.status)}</CardDescription>
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
                    <Link to={`./${c.id}`}>Visit</Link>
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
