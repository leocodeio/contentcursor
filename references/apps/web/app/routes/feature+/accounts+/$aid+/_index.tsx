import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { CommonSubHeader } from "~/components/common/CommonSubHeader";
import { getSession } from "~/server/services/auth/db.server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Users, Folder, Library } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FutureFeature } from "~/components/common/utils/futureFeature";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const currentSession = await getSession(request);
  const userName = currentSession?.user?.name || "Guest";
  const role = currentSession?.user?.role || "User";
  return { id: params.aid, userName, role };
};

export default function AccountOverview() {
  const { id, userName, role } = useLoaderData<typeof loader>();
  return (
    <div className="h-fit w-full p-3 space-y-6">
      <CommonSubHeader userName={userName} role={role} variant="default" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Manage Editors */}
        <Card className="hover:shadow-md transition-shadow flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Manage Editors
            </CardTitle>
            <CardDescription>
              Link or unlink editors for this account. Editors can upload
              contributions to this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to={`/feature/accounts/${id}/editors`}>Go to Editors</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Contributions */}
        <Card className="hover:shadow-md transition-shadow flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Library className="h-5 w-5 text-primary" />
              Contributions
            </CardTitle>
            <CardDescription>
              Manage account contributions, made by your editors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to={`/feature/accounts/${id}/upload`}>
                Go to Contributions
              </Link>
            </Button>
          </CardContent>
        </Card>
        {/* Folders */}
        {/* <FutureFeature> */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Folder className="h-5 w-5 text-primary" />
                Folders
              </CardTitle>
              <CardDescription>
                Organize media and assets by folder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link to={`/feature/accounts/${id}/folders`}>View Folders</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to={`/feature/accounts/${id}/folders/add`}>
                  Create Folder
                </Link>
              </Button>
            </CardContent>
          </Card>
        {/* </FutureFeature> */}
      </div>
    </div>
  );
}
