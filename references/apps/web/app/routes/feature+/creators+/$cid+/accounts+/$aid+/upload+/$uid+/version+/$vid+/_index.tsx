import {
  LoaderFunctionArgs,
  redirect,
  ActionFunctionArgs,
} from "@remix-run/node";
import { Link, useLoaderData, useActionData } from "@remix-run/react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { VersionComments } from "~/components/common/VersionComments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { getSession } from "~/server/services/auth/db.server";
import {
  getVersionById,
  getVersionComments,
} from "~/server/services/editor/contribute.server";
import { addVersionComment as creatorAddComment } from "~/server/services/creator/contribute.server";
import type {
  xDomainContributionVersion,
  xDomainVersionComment,
} from "@spectral/types";
import { ArrowLeft, Info, Tags, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { ActionResult } from "~/types/action-result";
import { toast } from "~/hooks/use-toast";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) return redirect("/");

  const { uid, vid } = params;
  if (!uid || !vid) throw new Response("Invalid parameters", { status: 400 });

  const result = await getVersionById(request, vid);
  if (!result.success || !result.data) {
    throw new Response("Contribution not found", { status: 404 });
  }

  const contribution = result.data as xDomainContributionVersion;
  if (contribution.contributeId !== uid) {
    throw new Response("Contribution not found for this account", {
      status: 404,
    });
  }

  const commentsResult = await getVersionComments(request, vid);
  const comments = commentsResult.success ? commentsResult.data || [] : [];

  return {
    userName: session.user?.name || "",
    role: session.user?.role || "",
    contribution,
    comments,
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSession(request);
  if (!session) return redirect("/");

  const { vid } = params;
  if (!vid) {
    return {
      success: false,
      origin: "contribute",
      message: "Version ID is required",
      data: null,
    } satisfies ActionResult<null>;
  }

  const formData = await request.formData();
  const intent = (formData.get("intent") as string) || "";

  if (intent === "add-comment") {
    const content = (formData.get("content") as string) || "";
    if (!content.trim()) {
      return {
        success: false,
        origin: "creator",
        message: "Comment content is required",
        data: null,
      } satisfies ActionResult<null>;
    }

    const result = await creatorAddComment(request, vid, content.trim());
    return result;
  }

  return {
    success: false,
    origin: "contribute",
    message: "Invalid action",
    data: null,
  } satisfies ActionResult<null>;
};

export default function ContributionDetailCreator() {
  const { contribution, comments } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResult<xDomainVersionComment>>();

  useEffect(() => {
    if (!actionData) return;
    toast({ title: actionData.origin, description: actionData.message });
  }, [actionData]);

  const statusColor =
    contribution.status === "PENDING"
      ? "text-yellow-500"
      : contribution.status === "COMPLETED"
        ? "text-green-500"
        : contribution.status === "REJECTED"
          ? "text-red-500"
          : "text-muted-foreground";

  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!contribution.video) return;
    console.log(contribution.video.integrationUrl);
    setVideoPreview(contribution.video.integrationUrl);
  }, [contribution.video]);

  useEffect(() => {
    if (!contribution.thumbnail) return;
    console.log(contribution.thumbnail.integrationUrl);
    setThumbPreview(contribution.thumbnail.integrationUrl);
  }, [contribution.thumbnail]);

  const processedComments = comments.map((comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
    updatedAt: new Date(comment.updatedAt),
  })) as xDomainVersionComment[];

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader
        userName="Review Contribution"
        role="Approve or reject"
        variant="default"
      />
      <div className="flex items-center gap-2 my-2">
        <Button asChild variant="ghost">
          <Link
            to="../.."
            relative="path"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>
      </div>

      <div className="my-6 grid gap-6 grid-cols-2 max-w-7xl mx-auto">
        {/* Left: metadata */}
        <div className="space-y-6 col-span-1 order-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-4 h-4" /> {contribution.title}
              </CardTitle>
              <CardDescription>
                Contribution ID: {contribution.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duration
                    </p>
                    <p className="font-medium">{contribution.duration}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className={`font-medium ${statusColor}`}>
                      {String(contribution.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tags</p>
                    <p
                      className="font-medium truncate"
                      title={contribution.tags?.join(", ")}
                    >
                      {contribution.tags?.join(", ")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Tags className="w-4 h-4" /> Description
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {contribution.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          <Card className="border-dashed bg-muted/30">
            {videoPreview ? (
              <>
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                  <CardDescription>
                    Video preview / assets will appear here when available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className=" w-full">
                    <iframe
                      src={videoPreview.replace("view", "preview")}
                      width="100%"
                      height="480"
                      allow="autoplay"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                  <CardDescription>
                    Video preview / assets will appear here when available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                    No media available yet.
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Thumbnail Preview */}
          <Card className="border-dashed bg-muted/30">
            {thumbPreview ? (
              <>
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                  <CardDescription>
                    Thumbnail preview / assets will appear here when available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <iframe
                      src={thumbPreview.replace("view", "preview")}
                      width="640"
                      height="480"
                      allow="autoplay"
                    ></iframe>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                  <CardDescription>
                    Thumbnail preview / assets will appear here when available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                    No media available yet.
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
        {/* Comments section */}
        <div className="col-span-1 order-2">
          <VersionComments
            comments={processedComments}
            versionId={contribution.id}
          />
        </div>
      </div>
    </div>
  );
}
