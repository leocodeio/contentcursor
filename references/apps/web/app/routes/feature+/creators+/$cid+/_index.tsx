import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { getSession } from "~/server/services/auth/db.server";
import { getEditorLinkedAccountsByCreator } from "~/server/services/editor/accounts.server";
import { PermissionCheck } from "~/utils/permissions/permission";
import { xDomainAccountEditorMap } from "@spectral/types";

// loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  console.log("loader getting called successfully");
  // Fetch user session
  const currentSession = await getSession(request);
  const userName = currentSession?.user?.name || "Guest";
  const role = currentSession?.user?.role || "User";

  // params id -> creator Id
  // 1) Make sure the editor can contribute to the creator ( yes thats why he is seeing this page)
  // 2) Fetch accounts that are allocated by that creator to this editor
  const mappedAccounts = await getEditorLinkedAccountsByCreator(request);
  return {
    id: params.cid,
    userName,
    role,
    // only show accounts that are mapped to the creator
    editorLinkedAccountsByCreator: mappedAccounts.data?.filter(
      (account: xDomainAccountEditorMap) =>
        account.account?.creatorId === params.cid
    ),
  };
};

export default function CreatorsIdIndex() {
  const { id, userName, role, editorLinkedAccountsByCreator } =
    useLoaderData<typeof loader>();

  return (
    <>
      <CommonSubHeader userName={userName} role={role} variant="default" />
      {/* Back Button */}
      <div className="p-6">
        <Button variant="ghost" className="my-2 w-fit">
          <Link to="/feature/creators" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>
        {/* Accounts mapped by creator to editor */}
        <PermissionCheck role={role} allowedRoles={["editor"]}>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-0 bg-transparent shadow-none">
            {editorLinkedAccountsByCreator?.length === 0 && (
              <Label className="text-sm font-medium">
                No accounts yet to contribute to
              </Label>
            )}
            {editorLinkedAccountsByCreator &&
              editorLinkedAccountsByCreator?.map((account) => (
                <Card key={account.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary uppercase">
                          {account.account?.email?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {account.account?.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="default" className="w-full">
                      <Link
                        to={`/feature/creators/${account.account?.creatorId}/accounts/${account.account?.id}`}
                      >
                        Enter
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </PermissionCheck>
      </div>
    </>
  );
}
