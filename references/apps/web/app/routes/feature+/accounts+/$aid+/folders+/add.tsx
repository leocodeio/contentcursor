import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Folder } from "lucide-react";
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
import { Combobox } from "~/components/ui/combobox";
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getAccountEditorMaps } from "~/server/services/creator/account-editors.server";
import { createFolderByCreator } from "~/server/services/creator/folder.server";
import { getSession } from "~/server/services/auth/db.server";
import { toast } from "~/hooks/use-toast";
import { xDomainAccountEditorMap } from "@spectral/types";

// loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // session
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }

  const userName = session?.user?.name || "";
  const role = session?.user?.role || "";
  const { aid } = params;

  // Get connected editors for the account
  const getAccountEditorMapsResult = await getAccountEditorMaps(request, aid!);
  if (!getAccountEditorMapsResult.success) {
    return {
      userName,
      role,
      accountId: aid!,
      accountEditorMaps: [],
    };
  }

  const accountEditorMaps =
    getAccountEditorMapsResult.data as xDomainAccountEditorMap[];

  return {
    userName,
    role,
    accountId: aid!,
    accountEditorMaps,
  };
};

// action
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }

  const { aid } = params;
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const editorId = formData.get("editorId") as string;

  if (!name?.trim()) {
    return {
      success: false,
      origin: "folder",
      message: "Folder name is required",
      data: null,
    };
  }

  const createFolderDto = {
    name: name.trim(),
    accountId: aid!,
    editorId,
  };

  const result = await createFolderByCreator(request, createFolderDto);

  if (result.success) {
    return redirect(`/feature/accounts/${aid}/folders`);
  }

  return result;
};

export default function AddFolder() {
  const data = useLoaderData<typeof loader>();
  const { userName, role, accountId, accountEditorMaps } = data;

  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [selectedEditorId, setSelectedEditorId] = useState<string>("");
  const [folderName, setFolderName] = useState<string>("");

  // Prepare options for the combobox
  const editorOptions = [
    ...accountEditorMaps.map((accountEditorMap) => ({
      value: accountEditorMap.editorId,
      label:
        accountEditorMap.editor?.email || `Editor ${accountEditorMap.editorId}`,
    })),
  ];

  // useEffect for action result
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (!actionData) return;
    setCreateLoading(false);
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
            <Label className="text-base font-medium">Back to Folders</Label>
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <CommonSubHeader
        userName="Create New Folder"
        role="Add a new folder to organize your content"
        variant="default"
      />

      <div className="max-w-2xl mx-auto my-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="h-5 w-5" />
              <span>Folder Details</span>
            </CardTitle>
            <CardDescription>
              Create a new folder and optionally assign an editor to manage it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" onSubmit={() => setCreateLoading(true)}>
              <div className="space-y-6">
                {/* Account Display (Read-only) */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Account</Label>
                  <Input
                    value={`Account ${accountId}`}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The account this folder will be created for
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
                    Choose a descriptive name for your folder
                  </p>
                </div>

                {/* Editor Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Assign Editor (Optional)
                  </Label>
                  <Combobox
                    options={editorOptions}
                    value={selectedEditorId}
                    onValueChange={setSelectedEditorId}
                    placeholder="Select an editor or leave unassigned..."
                    searchPlaceholder="Search editors..."
                    emptyText="No editors found."
                  />
                  <input type="hidden" name="editorId" value={selectedEditorId} />
                  <p className="text-sm text-muted-foreground mt-1">
                    You can assign an editor now or later from the folder
                    management page
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={!folderName.trim() || createLoading}
                    className="flex-1"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {createLoading ? "Creating..." : "Create Folder"}
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
