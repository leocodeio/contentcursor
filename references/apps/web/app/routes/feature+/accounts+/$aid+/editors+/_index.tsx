import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, Mail, UserMinus, UserPlus } from "lucide-react";
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
import { Combobox } from "~/components/ui/combobox";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import {
  getAccountEditorMaps,
  linkEditorToAccount,
  unlinkEditorFromAccount,
} from "~/server/services/creator/account-editors.server";
import { getEditorsMaps } from "~/server/services/creator/editors.server";
import { getSession } from "~/server/services/auth/db.server";
import { toast } from "~/hooks/use-toast";
import {
  xDomainAccountEditorMap,
  xDomainCreatorEditorMap,
} from "@spectral/types";

// loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // session
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }

  const userName = session?.user?.name!;
  const role = session?.user?.role!;
  const { aid } = params;
  // we will have creator Id in request and accountId in params
  // Get current account editors
  const getAccountEditorMapsResult = await getAccountEditorMaps(request, aid!);
  if (!getAccountEditorMapsResult.success) {
    return {
      userName,
      role,
      accountId: aid!,
      currentAccountEditorMaps: [],
      availableEditors: [],
    };
  }
  const currentAccountEditorMaps =
    getAccountEditorMapsResult.data as xDomainAccountEditorMap[];

  // Get available editors
  const getEditorsMapsResult = await getEditorsMaps(request);
  if (!getEditorsMapsResult.success) {
    return {
      userName,
      role,
      accountId: aid!,
      currentAccountEditorMaps: [],
      availableEditors: [],
    };
  }

  const editorsMaps = getEditorsMapsResult.data as xDomainCreatorEditorMap[];
  return {
    userName,
    role,
    accountId: aid!,
    currentAccountEditorMaps,
    availableEditors: editorsMaps.filter(
      (creatorEditorMap: xDomainCreatorEditorMap) =>
        creatorEditorMap.status === "ACTIVE" &&
        !currentAccountEditorMaps.some(
          (accountEditorMap: xDomainAccountEditorMap) =>
            accountEditorMap.editorId === creatorEditorMap.editorId &&
            accountEditorMap.status === "ACTIVE" 
        )
    ),
  };
};

// action
export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect("/");
  }
  const { aid } = params;
  const formData = await request.formData();
  const editorId = formData.get("editorId") as string;
  const actionType = formData.get("actionType") as string;
  if (actionType === "link") {
    const linkEditorResult = await linkEditorToAccount(
      request,
      aid!,
      editorId!
    );
    return linkEditorResult;
  } else if (actionType === "unlink") {
    const unlinkEditorResult = await unlinkEditorFromAccount(
      request,
      aid!,
      editorId!
    );
    return unlinkEditorResult;
  }
  return {
    success: true,
    message: "Editor linked/unlinked successfully",
    data: null,
    origin: "map",
  };
};

export default function AccountEditors() {
  const data = useLoaderData<typeof loader>();
  const {
    userName,
    role,
    accountId,
    currentAccountEditorMaps,
    availableEditors,
  } = data;

  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  const [unlinkLoading, setUnlinkLoading] = useState<boolean>(false);

  const [selectedEditorId, setSelectedEditorId] = useState<string>("");

  // Prepare options for the combobox
  const editorOptions = availableEditors.map(
    (creatorEditorMap: xDomainCreatorEditorMap) => ({
      value: creatorEditorMap.editorId,
      label: creatorEditorMap.editor?.email || "Editor",
    })
  );

  // useEffect for action result
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (!actionData) return;
    setLinkLoading(false);
    setUnlinkLoading(false);
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
            to={`/feature/accounts/${accountId}`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back to Account</Label>
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <CommonSubHeader
        userName="Manage Editors"
        role="Add or remove your editors as per your need"
        variant="default"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 my-4 gap-4">
        {/* Current Editors List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Current Editors</span>
            </CardTitle>
            <CardDescription>
              Editors currently linked to this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentAccountEditorMaps.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No editors linked yet
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Get started by linking an editor to this account using the
                  form above
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {currentAccountEditorMaps.map((accountEditorMap) => (
                  <Card
                    key={accountEditorMap.editorId}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-base font-semibold text-primary uppercase">
                            {(accountEditorMap.editor?.email || "?").charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-base font-medium text-foreground truncate">
                            {accountEditorMap.editor?.email ||
                              `Editor ${accountEditorMap.editorId}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {accountEditorMap.editor?.name || "Editor"}
                          </p>
                        </div>
                      </div>

                      <Form
                        method="post"
                        onSubmit={() => setUnlinkLoading(true)}
                      >
                        <input type="hidden" name="actionType" value="unlink" />
                        <input
                          type="hidden"
                          name="editorId"
                          value={accountEditorMap.editorId}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          type="submit"
                          disabled={unlinkLoading}
                          className="w-full"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          {unlinkLoading ? "Unlinking..." : "Unlink"}
                        </Button>
                      </Form>

                      {/* <Link
                        to={`/feature/accounts/${accountId}/editors/${editor.editorId}`}
                        className="w-full mt-2"
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        Folders
                      </Link> */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Add Editor Section */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Link New Editor</span>
            </CardTitle>
            <CardDescription>
              Select an editor from your available editors to link to this
              account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center items-end h-fit">
              <div className="col-span-1">
                <Label className="text-sm font-medium mb-2 block">
                  Select Editor
                </Label>
                <Combobox
                  options={editorOptions}
                  value={selectedEditorId}
                  onValueChange={setSelectedEditorId}
                  placeholder="Select an editor..."
                  searchPlaceholder="Search editors..."
                  emptyText="No available editors found."
                />
              </div>
              <Form method="post" onSubmit={() => setLinkLoading(true)}>
                <input type="hidden" name="actionType" value="link" />
                <input type="hidden" name="editorId" value={selectedEditorId} />
                <Button
                  type="submit"
                  disabled={!selectedEditorId || linkLoading}
                  className="w-full"
                >
                  {linkLoading ? "Linking..." : "Link Editor"}
                </Button>
              </Form>
            </div>
            {availableEditors.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No available editors to link. All your editors may already be
                linked to this account.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
