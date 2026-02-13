import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ArrowLeft, Users, Folder, Filter, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
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
import { getSession } from "~/server/services/auth/db.server";
import {
  deleteFolder,
  getFoldersByCreator,
} from "~/server/services/creator/folder.server";
import { getAccountEditorMaps } from "~/server/services/creator/account-editors.server";
import { toast } from "~/hooks/use-toast";
import { ActionResult } from "~/types/action-result";
import { xDomainAccountEditorMap, xDomainFolders } from "@spectral/types";

// loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // Fetch user session
  const currentSession = await getSession(request);
  const userName = currentSession?.user?.name || "Guest";
  const role = currentSession?.user?.role || "User";

  const foldersResult = await getFoldersByCreator(request, params.aid!);
  const accountEditorMapsResult = await getAccountEditorMaps(
    request,
    params.aid!
  );

  const folders = foldersResult.data as xDomainFolders[];
  const accountEditorMaps =
    accountEditorMapsResult.data as xDomainAccountEditorMap[];

  return {
    id: params.aid,
    userName,
    role,
    folders,
    accountEditorMaps,
  };
};

// action
// 1.1) using this for deleting of a folder
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const folderId = formData.get("folderId") as string;
  const action = formData.get("action");

  if (action === "delete") {
    const result = await deleteFolder(request, folderId as string);
    return result;
  }
  return null;
};

export default function AccountFoldersIndex() {
  const { id, userName, role, folders, accountEditorMaps } =
    useLoaderData<typeof loader>();
  const [editorFilter, setEditorFilter] = useState<string>("all");
  // Filter folders based on selected editor
  const filteredFolders = folders?.filter((folder: xDomainFolders) => {
    if (editorFilter === "all") return true;
    return folder.editorId === editorFilter;
  });

  // useEffect to handle the result of the action
  const actionData = useActionData<typeof action>() as ActionResult<any>;
  useEffect(() => {
    if (!actionData) return;
    if (actionData?.success) {
      toast({
        title: "Folder",
        description: "Folder deleted successfully",
      });
    } else {
      toast({
        title: actionData?.message,
        description: actionData?.data,
        variant: "destructive",
      });
    }
  }, [actionData]);

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={userName} role={role} variant="default" />

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 my-2">
        {/* Back Button */}
        <Button variant="ghost">
          <Link
            to={`/feature/accounts/${id}`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>
        {/* Add Folder Button for Creators */}
        <div className=" flex justify-center">
          <Button asChild>
            <Link
              to={`/feature/accounts/${id}/folders/add`}
              className="flex items-center space-x-2"
            >
              <Folder className="w-4 h-4 mr-2" />
              Create New Folder
            </Link>
          </Button>
        </div>
        {/* Manage Editors Button - Only for creators */}
        <Button variant="outline">
          <Link
            to={`/feature/accounts/${id}/editors`}
            className="flex items-center space-x-2"
          >
            <Users className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Manage Editors</Label>
          </Link>
        </Button>

        {/* Editor Filter - Only show when there are editors */}
        {accountEditorMaps?.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Filter by Editor:</Label>
            <Select value={editorFilter} onValueChange={setEditorFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select editor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {accountEditorMaps?.map((accountEditorMap) => (
                  <SelectItem
                    key={accountEditorMap.editorId}
                    value={accountEditorMap.editorId}
                  >
                    {accountEditorMap.editor?.email ||
                      `Editor ${accountEditorMap.editorId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Folders Section */}

      <div className="my-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Folders</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredFolders?.length} folder
            {filteredFolders?.length !== 1 ? "s" : ""}
            {editorFilter !== "all" && ` (filtered)`}
          </div>
        </div>

        {filteredFolders?.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {editorFilter === "all"
                    ? "No folders found"
                    : "No folders match your filter"}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {editorFilter === "all"
                    ? role === "creator"
                      ? "Create your first folder to get started organizing your content"
                      : "No folders have been shared with you for this account yet"
                    : "Try changing your filter or create a new folder"}
                </p>
                <Button className="mt-4" asChild>
                  <Link to={`/feature/accounts/${id}/folders/add`}>
                    Create First Folder
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredFolders?.map((folder) => (
              <Card
                key={folder.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3 flex flex-row justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Folder className="h-5 w-5 text-primary" />
                    <span className="truncate">{folder.name}</span>
                  </CardTitle>
                  <Form method="post">
                    <input type="hidden" name="folderId" value={folder.id} />
                    <input type="hidden" name="action" value="delete" />
                    <Button variant="outline" size="sm" type="submit">
                      <Trash className="h-5 w-5 text-red-500" />
                    </Button>
                  </Form>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    {role === "creator" && (
                      <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground">Editor:</Label>
                        <span className="text-foreground">
                          {folder.editorId
                            ? accountEditorMaps?.find(
                                (accountEditorMap) =>
                                  accountEditorMap.editorId === folder.editorId
                              )?.editor?.email || "Unknown"
                            : "Not assigned"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link
                        to={`/feature/accounts/${id}/folders/${folder.id}/open`}
                      >
                        Open
                      </Link>
                    </Button>
                    {role === "creator" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link
                          to={`/feature/accounts/${id}/folders/${folder.id}/edit`}
                        >
                          Edit
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
