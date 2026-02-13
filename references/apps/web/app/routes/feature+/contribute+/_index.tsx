import { Link, useLoaderData } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PermissionCheck } from "~/utils/permissions/permission";

// loader
import { loader as contributeLoader } from "~/routes/loader+/feature+/contribute+/contribute.loader";
import { xDomainAccountEditorMap } from "@spectral/types";
export const loader = contributeLoader;

export default function Contribute() {
  const data = useLoaderData<typeof loader>();
  const { name, role, editorLinkedAccountsByCreator } = data;

  return (
    <>
      <CommonSubHeader userName={name} role={role} variant="default" />
      <div className="h-fit w-full p-6">
        {/* Back Button */}
        <Button variant="ghost" className="my-2">
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
              editorLinkedAccountsByCreator?.map(
                (account: xDomainAccountEditorMap) => (
                  <Card key={account.id} className="gap-0">
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
                )
              )}
          </div>
        </PermissionCheck>
      </div>
    </>
  );
}
