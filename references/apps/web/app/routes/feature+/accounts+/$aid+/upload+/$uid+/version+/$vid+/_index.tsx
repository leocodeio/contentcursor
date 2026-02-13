import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
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
  addVersionComment,
} from "~/server/services/editor/contribute.server";
import { updateVersionStatus } from "~/server/services/creator/contribute.server";
import type {
  xDomainContributionVersion,
  xDomainVersionComment,
} from "@spectral/types";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Info,
  Tags,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ActionResult } from "~/types/action-result";
import { toast } from "~/hooks/use-toast";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) return redirect("/");

  const { aid, uid, vid } = params;
  if (!aid || !uid || !vid) {
    throw new Response("Invalid parameters", { status: 400 });
  }

  const versionResult = await getVersionById(request, vid);
  if (!versionResult.success || !versionResult.data) {
    throw new Response("Version not found", { status: 404 });
  }

  const version = versionResult.data as xDomainContributionVersion;

  if (version.contributeId !== uid) {
    throw new Response("Version not found for this contribution", {
      status: 404,
    });
  }

  const commentsResult = await getVersionComments(request, vid);
  const comments = commentsResult.success ? commentsResult.data || [] : [];

  return {
    userName: session.user?.name || "",
    role: session.user?.role || "",
    aid,
    version,
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

    const result = await addVersionComment(request, vid, content.trim());
    return result;
  }

  const status =
    intent === "approve"
      ? "COMPLETED"
      : intent === "reject"
        ? "REJECTED"
        : null;

  if (!status) {
    return {
      success: false,
      origin: "contribute",
      message: "Invalid action",
      data: null,
    } satisfies ActionResult<null>;
  }

  const result = await updateVersionStatus(request, vid, status as any);
  return result;
};

export default function VersionDetailCreator() {
  const { version, comments } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResult<xDomainContributionVersion>>();
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!actionData) return;
    setSubmitting(null);
    toast({ title: actionData.origin, description: actionData.message });
  }, [actionData]);

  const statusColor =
    version.status === "PENDING"
      ? "text-yellow-500"
      : version.status === "COMPLETED"
        ? "text-green-500"
        : version.status === "REJECTED"
          ? "text-red-500"
          : "text-muted-foreground";

  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!version.video) return;
    console.log(version.video.integrationUrl);
    setVideoPreview(version.video.integrationUrl);
  }, [version.video]);

  useEffect(() => {
    if (!version.thumbnail) return;
    console.log(version.thumbnail.integrationUrl);
    setThumbPreview(version.thumbnail.integrationUrl);
  }, [version.thumbnail]);

  const processedComments = comments.map((comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
    updatedAt: new Date(comment.updatedAt),
  })) as xDomainVersionComment[];

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader
        userName="Review Version"
        role="Approve or reject version"
        variant="default"
      />
      <div className="flex items-center gap-2 my-2">
        <Button asChild variant="ghost">
          <Link to=".." relative="path" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>
      </div>

      <div className="max-w-6xl mx-auto my-6 grid gap-6 xl:grid-cols-3">
        {/* Left: metadata */}
        <div className="space-y-6 xl:col-span-2 order-2 xl:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-4 h-4" /> {version.title}
              </CardTitle>
              <CardDescription>
                Version {version.versionNumber} - ID: {version.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duration
                    </p>
                    <p className="font-medium">{version.duration}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className={`font-medium ${statusColor}`}>
                      {String(version.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tags</p>
                    <p
                      className="font-medium truncate"
                      title={version.tags?.join(", ")}
                    >
                      {version.tags?.join(", ")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Tags className="w-4 h-4" /> Description
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {version.description}
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
                  <CardTitle className="text-sm">Video Preview</CardTitle>
                  <CardDescription>
                    Version {version.versionNumber} video preview
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
                  <CardTitle className="text-sm">Video Preview</CardTitle>
                  <CardDescription>
                    Video preview will appear here when available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                    No video available yet.
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
                  <CardTitle className="text-sm">Thumbnail Preview</CardTitle>
                  <CardDescription>
                    Version {version.versionNumber} thumbnail preview
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
                  <CardTitle className="text-sm">Thumbnail Preview</CardTitle>
                  <CardDescription>
                    Thumbnail preview will appear here when available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                    No thumbnail available yet.
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Right: actions */}
        <div className="space-y-6 order-1 xl:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Moderation Actions</CardTitle>
              <CardDescription>Approve or reject this version</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Current status:{" "}
                  <span className={statusColor}>{String(version.status)}</span>
                </div>
                <div className="flex gap-3">
                  <Form
                    method="post"
                    onSubmit={() => setSubmitting("approve")}
                    className="flex-1"
                  >
                    <input type="hidden" name="intent" value="approve" />
                    <Button
                      type="submit"
                      disabled={
                        submitting === "approve" || version.status !== "PENDING"
                      }
                      className="w-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />{" "}
                      {submitting === "approve" ? "Approving..." : "Approve"}
                    </Button>
                  </Form>
                  <Form
                    method="post"
                    onSubmit={() => setSubmitting("reject")}
                    className="flex-1"
                  >
                    <input type="hidden" name="intent" value="reject" />
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={
                        submitting === "reject" || version.status !== "PENDING"
                      }
                      className="w-full flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />{" "}
                      {submitting === "reject" ? "Rejecting..." : "Reject"}
                    </Button>
                  </Form>
                </div>
                {version.status !== "PENDING" && (
                  <p className="text-xs text-muted-foreground">
                    This version can no longer be moderated.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status Checklist</CardTitle>
              <CardDescription>Review before deciding</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-[11px] space-y-2 text-muted-foreground">
                <li>
                  Title present:{" "}
                  <span className="text-foreground">
                    {version.title ? "Yes" : "No"}
                  </span>
                </li>
                <li>
                  Description length: {version.description?.length || 0} chars
                </li>
                <li>Tags count: {version.tags?.length || 0}</li>
                <li>Duration: {version.duration}s</li>
                <li>Version number: {version.versionNumber}</li>
                <li>
                  Overall:{" "}
                  {version.status === "PENDING"
                    ? "Awaiting review"
                    : version.status}
                </li>
              </ul>
            </CardContent>
          </Card>
          {/* Comments section */}
          <VersionComments
            comments={processedComments}
            versionId={version.id}
          />
        </div>
      </div>
    </div>
  );
}
