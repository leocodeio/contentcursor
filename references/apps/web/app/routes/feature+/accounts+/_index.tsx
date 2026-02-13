import { Link, useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Settings, Mail } from "lucide-react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ActionResult } from "~/types/action-result";
import { toast } from "~/hooks/use-toast";
import { xDomainYtCreator } from "@spectral/types";

// loader
import { loader as accountsLoader } from "~/routes/loader+/feature+/accounts+/accounts.loader";
import { PermissionCheck } from "~/utils/permissions/permission";
export const loader = accountsLoader;

export default function Accounts() {
  const data = useLoaderData<typeof loader>();
  const { name, role, linkedAccounts } = data;
  const navigate = useNavigate();

  const [unlinkingAccountId, setUnlinkingAccountId] = useState<string | null>(
    null
  );

  // unlink
  //TODO: Have to send toast after unlinking account
  const unlinkFetcher = useFetcher();
  // 1) action function is called
  const onUnlink = (accountId: string) => {
    setUnlinkingAccountId(accountId);
    unlinkFetcher.submit(
      { accountId },
      { method: "post", action: "/feature/accounts/unlink" }
    );
  };

  // 2) Clear unlinking state when submission completes
  useEffect(() => {
    if (unlinkFetcher.state === "idle") {
      setUnlinkingAccountId(null);
    }
  }, [unlinkFetcher.state]);

  // 3) Handle unlink action response
  useEffect(() => {
    const data = unlinkFetcher.data as ActionResult<any>;
    console.log("unlinkFetcher.data", data);
    if (data) {
      if (data.success) {
        toast({
          title: "Success",
          description: "Account unlinked successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to unlink account",
        });
      }
      // Clear the unlinking state
      setUnlinkingAccountId(null);
    }
  }, [unlinkFetcher.data]);

  // link account
  const linkFetcher = useFetcher();
  // 1) action function is called
  const onLinkNew = () => {
    linkFetcher.submit(
      {},
      { method: "post", action: "/feature/accounts/getUrlLink" }
    );
  };
  // 2) As were are redirecting we cant have the repsonse, so using url params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const message = urlParams.get("message");

    if (success === "true") {
      toast({
        title: "Success",
        description: message || "Account linked successfully",
      });
      // remove params from url
      window.history.replaceState({}, "", "/feature/accounts");
    } else if (success === "false") {
      toast({
        title: "Error",
        description: message || "Failed to link account",
      });
      // remove params from url
      window.history.replaceState({}, "", "/feature/accounts");
    }
  }, [linkFetcher.data]);

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={name} role={role} variant="default" />
      {/* Back Button */}
      <Button variant="ghost" className="my-2">
        <Link to="/feature/dashboard" className="flex items-center space-x-2">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">Back</Label>
        </Link>
      </Button>

      {/* Linked Accounts for creator */}
      <PermissionCheck role={role} allowedRoles={["creator"]}>
        {/* Linked Accounts */}
        <Card className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-0 bg-transparent shadow-none">
          {/* TODO: mayme any can be cleared with type maybe trpc */}
          {linkedAccounts?.map((account: xDomainYtCreator) => (
            <Card
              key={account.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary uppercase">
                      {account.email?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {account.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/feature/accounts/${account.id}`)}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onUnlink(account.id)}
                    disabled={unlinkingAccountId === account.id}
                    className="w-full"
                  >
                    {unlinkingAccountId === account.id
                      ? "Unlinking..."
                      : "Unlink"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </Card>
        {/* Add a new account card */}
        <div className="mt-6 flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-center">
                <CardTitle>Link Account</CardTitle>
                <CardDescription>
                  Connect a new account to enhance your experience
                </CardDescription>
              </div>
              <Button
                variant="default"
                onClick={onLinkNew}
                className="mt-2"
                disabled={linkFetcher.state === "submitting"}
              >
                {linkFetcher.state === "submitting"
                  ? "Linking..."
                  : "Link New Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PermissionCheck>
    </div>
  );
}
