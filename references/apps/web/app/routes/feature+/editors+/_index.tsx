import { Persona } from "~/models/persona";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";

import { Form, useActionData, useLoaderData , Link } from "@remix-run/react";
import { PermissionCheck } from "~/utils/permissions/permission";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Plus, Filter } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

// loader
import { loader as EditorsForCreatorsLoader } from "@/routes/loader+/feature+/editors+/editor.loader";
export const loader = EditorsForCreatorsLoader;

// action
import { action as creatorActionOnEditors } from "@/routes/action+/feature+/creator+/editors+/manage-existing-editor.action";
import { toast } from "~/hooks/use-toast";
export const action = creatorActionOnEditors;

// component
export default function Editors() {
  // loader data
  const data = useLoaderData<typeof loader>();
  const { role, name, editorResults } = data;

  // action data
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (!actionData) return;
    if (actionData.success) {
      toast({
        title: "sucess",
        description: actionData.message,
      });
    } else {
      toast({
        title: "error",
        description: actionData.message,
      });
    }
  }, [actionData]);

  // states
  const [statusFilter, setStatusFilter] = useState<string>("active");

  // const onUnlink = (editorId: string) => {
  //   // TODO: lets see what I will be doing here
  // };

  // const connectEditor = () => {};

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "INACTIVE  ":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredEditors = editorResults?.filter((editorMap: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return editorMap.status === "ACTIVE";
    if (statusFilter === "pending") return editorMap.status === "PENDING";
    if (statusFilter === "previous") return editorMap.status === "INACTIVE";
    return true;
  });

  const getFilterLabel = () => {
    switch (statusFilter) {
      case "all":
        return "All Editors";
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "previous":
        return "Previous";
      default:
        return "All Editors";
    }
  };

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={name} role={role} variant="default" />

      {/* Back Button and Filter */}
      <div className="flex items-center gap-4 my-2">
        <Button variant="ghost">
          <Link to="/feature/dashboard" className="flex items-center space-x-2">
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
              All Editors
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
      </div>

      <PermissionCheck role={role} allowedRoles={[Persona.CREATOR]}>
        <Card className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-0 bg-transparent shadow-none">
          {filteredEditors?.map((editorMap: any) => (
            <Card key={editorMap.id}>
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={editorMap.editor.image}
                        alt={editorMap.editor.email}
                      />
                      <AvatarFallback>
                        {getInitials(editorMap.editor.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(editorMap.status)}`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium truncate block">
                      {editorMap.editor.email}
                    </Label>
                    <div className="flex items-center justify-start mt-1 gap-2  ">
                      <Badge variant="secondary" className="text-xs">
                        {editorMap.status}
                      </Badge>
                      <Form method="post">
                        <input
                          type="hidden"
                          name="mapId"
                          value={editorMap.id}
                        />
                        {editorMap.status === "PENDING" && (
                          <>
                            <input
                              type="hidden"
                              name="actionStep"
                              value="revoke"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs h-6 px-2"
                              // onClick={() => onUnlink(editorMap.id)}
                              type="submit"
                            >
                              Revoke
                            </Button>
                          </>
                        )}
                        {editorMap.status === "ACTIVE" && (
                          <>
                            <input
                              type="hidden"
                              name="actionStep"
                              value="remove"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs h-6 px-2"
                              // onClick={() => onUnlink(editorMap.id)}
                              type="submit"
                            >
                              Remove
                            </Button>
                          </>
                        )}
                        {editorMap.status === "INACTIVE" && (
                          <>
                            <input
                              type="hidden"
                              name="actionStep"
                              value="request"
                            />
                            <input
                              type="hidden"
                              name="editorId"
                              value={editorMap.editorId}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs h-6 px-2"
                              // onClick={() => connectEditor()}
                              type="submit"
                            >
                              Request again
                            </Button>
                          </>
                        )}
                      </Form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Card>
        <div className="w-full max-w-md mx-auto space-y-4">
          {/* Add a new account card */}
          <div className="mt-6 flex justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-2 text-center">
                  <CardTitle>Link Editor</CardTitle>
                  <CardDescription>
                    Connect a new editor to contribute to your content
                  </CardDescription>
                </div>
                <Button variant="default" className="mt-2">
                  <Link to="/feature/editors/search">Link New Editor</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PermissionCheck>
    </div>
  );
}
