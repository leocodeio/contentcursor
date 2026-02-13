import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Folder, Save } from "lucide-react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  getFolderById,
  updateFolder,
} from "~/server/services/creator/folder.server";
import { getSession } from "~/server/services/auth/db.server";
import { toast } from "~/hooks/use-toast";
import { xDomainFolders } from "@spectral/types";

// loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // session
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }

  const userName = session?.user?.name || "";
  const role = session?.user?.role || "";
  const { aid, fid } = params;

  if (!fid) {
    throw new Response("Folder ID is required", { status: 400 });
  }

  // Get folder details
  const getFolderResult = await getFolderById(request, fid);
  if (!getFolderResult.success) {
    throw new Response("Folder not found", { status: 404 });
  }

  const folder = getFolderResult.data as xDomainFolders;

  if (!folder) {
    throw new Response("Folder not found", { status: 404 });
  }

  // Verify this folder belongs to the specified account
  if (folder.accountId !== aid) {
    throw new Response("Folder not found in this account", { status: 404 });
  }

  return {
    userName,
    role,
    accountId: aid!,
    folderId: fid,
    folder,
  };
};

// action
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }

  const { aid, fid } = params;
  const formData = await request.formData();
  const name = formData.get("name") as string;

  if (!fid) {
    return {
      success: false,
      origin: "map",
      message: "Folder ID is required",
      data: null,
    };
  }

  if (!name?.trim()) {
    return {
      success: false,
      origin: "map",
      message: "Folder name is required",
      data: null,
    };
  }

  const updateFolderDto = {
    name: name.trim(),
  };

  const result = await updateFolder(request, fid, updateFolderDto);

  if (result.success) {
    return redirect(`/feature/accounts/${aid}/folders`);
  }

  return result;
};

export default function EditFolder() {
  const data = useLoaderData<typeof loader>();
  const { userName, role, accountId, folderId: fid, folder } = data;

  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>(folder.name || "");

  // useEffect for action result
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (!actionData) return;
    setUpdateLoading(false);
    if (actionData?.success) {
      toast({
        title: actionData.origin,
        description: actionData.message,
      });
    } else {
      toast({
        title: actionData?.origin,
        description: actionData?.message,
      });
    }
  }, [actionData]);

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={userName} role={role} variant="default" />

      {/* Navigation */}
      <div className="flex items-center gap-2 my-2">
        <Button variant="ghost">
          <Link
            to={`/feature/accounts/${accountId}/folders`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back to Account</Label>
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <CommonSubHeader
        userName="Edit Folder"
        role="Update the folder name"
        variant="default"
      />

      <div className="max-w-2xl mx-auto my-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="h-5 w-5" />
              <span>Folder Details</span>
            </CardTitle>
            <CardDescription>Update the name of your folder</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" onSubmit={() => setUpdateLoading(true)}>
              <div className="space-y-6">
                {/* Account Display (Read-only) */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Account
                  </Label>
                  <Input
                    value={`Account ${accountId}`}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The account this folder belongs to
                  </p>
                </div>

                {/* Folder ID Display (Read-only) */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Folder ID
                  </Label>
                  <Input value={fid} readOnly className="bg-muted" />
                  <p className="text-sm text-muted-foreground mt-1">
                    The unique identifier for this folder
                  </p>
                </div>

                {/* Current Editor Display (Read-only) */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Assigned Editor
                  </Label>
                  <Input
                    value={
                      folder.editorId
                        ? `Editor ${folder.editorId}`
                        : "No editor assigned"
                    }
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The editor currently assigned to this folder (cannot be
                    changed here)
                  </p>
                </div>

                {/* Folder Name Input */}
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium mb-2 block"
                  >
                    Folder Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter folder name..."
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Update the name for your folder
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      !folderName.trim() ||
                      updateLoading ||
                      folderName === folder.name
                    }
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    <Link to={`/feature/accounts/${accountId}/folders`}>Cancel</Link>
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
