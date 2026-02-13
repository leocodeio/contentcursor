import { useEffect, useState } from "react";
import { Persona } from "~/models/persona";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { PermissionCheck } from "~/utils/permissions/permission";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { PersonIcon } from "@radix-ui/react-icons";

// loader
import { loader as CreatorsForEditorLoader } from "@/routes/loader+/feature+/creators+/creator.loader";
export const loader = CreatorsForEditorLoader;

// action
import { action as CreatorsForEditorAction } from "~/routes/action+/feature+/editor+/creator+/accept-invitation.action";
import { toast } from "~/hooks/use-toast";
export const action = CreatorsForEditorAction;

// component
export default function Creators() {
  const data = useLoaderData<typeof loader>();
  const { role, name, creatorResults } = data;
  const [statusFilter, setStatusFilter] = useState<string>("active");

  // const onUnlink = (creatorId: string) => {
  //   // TODO: lets see what I will be doing here
  // };

  // useEffect to manage action result
  const actionResult = useActionData<typeof CreatorsForEditorAction>();
  useEffect(() => {
    if (actionResult) {
      if (actionResult.success) {
        toast({
          title: "Success",
          description: `Invitation accepted successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: actionResult.message,
        });
      }
    }
  }, [actionResult]);

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "INACTIVE":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredCreators = creatorResults?.filter((creatorMap) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return creatorMap.status === "ACTIVE";
    if (statusFilter === "pending") return creatorMap.status === "PENDING";
    if (statusFilter === "previous") return creatorMap.status === "INACTIVE";
    return true;
  });

  const getFilterLabel = () => {
    switch (statusFilter) {
      case "all":
        return "All Creators";
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "previous":
        return "Previous";
      default:
        return "All Creators";
    }
  };

  return (
    <>
      <CommonSubHeader userName={name} role={role} variant="default" />
      <div className="h-fit w-full p-3">
        {/* Back Button and Filter */}
        <div className="flex items-center gap-4 my-2">
          <Button variant="ghost">
            <Link
              to="/feature/dashboard"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">Back</Label>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {getFilterLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Creators
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("previous")}>
                Previous (Inactive)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className="my-2"
            onClick={() => {
              setStatusFilter("pending");
            }}
          >
            <PersonIcon className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Check Invites</Label>
          </Button>
        </div>

        <PermissionCheck role={role} allowedRoles={[Persona.EDITOR]}>
          <Card className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-0 bg-transparent shadow-none">
            {filteredCreators?.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <Label className="text-sm font-medium">No creators found</Label>
              </div>
            )}
            {filteredCreators?.map((creatorMap) => (
              <Form key={creatorMap.id} method="post">
                <input type="hidden" name="mapId" value={creatorMap.id} />
                <Card key={creatorMap.id}>
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={creatorMap.creator?.image || ""}
                            alt={creatorMap.creator?.email || ""}
                          />
                          <AvatarFallback>
                            {getInitials(creatorMap.creator?.email || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(creatorMap.status)}`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium truncate block">
                          {creatorMap.creator?.email}
                          <Badge variant="secondary" className="text-xs w-fit">
                            {creatorMap.status}
                          </Badge>
                        </Label>
                        {creatorMap.status === "PENDING" && (
                          <Button
                            variant="default"
                            size="sm"
                            type="submit"
                            className="h-6 px-2"
                          >
                            Accept
                          </Button>
                        )}
                        {creatorMap.status === "ACTIVE" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            className="h-6 px-2"
                          >
                            <Link
                              to={`/feature/creators/${creatorMap.creatorId}`}
                            >
                              Contribute
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Form>
            ))}
          </Card>
          <div className="w-full max-w-md mx-auto space-y-4">
            {/* Add a new account card */}
            <div className="mt-6 flex justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className="space-y-2 text-center">
                    <CardTitle>Manage Invited Creator</CardTitle>
                    <CardDescription>
                      To contribute to a new creator's account, you need to
                      accept their invitation. If there is no invitation yet,
                      please ask your creator to send you an invitation.
                    </CardDescription>
                  </div>
                  <Button
                    variant="default"
                    className="mt-2"
                    onClick={() => setStatusFilter("pending")}
                  >
                    <Label>Manage Creators</Label>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </PermissionCheck>
      </div>
    </>
  );
}
