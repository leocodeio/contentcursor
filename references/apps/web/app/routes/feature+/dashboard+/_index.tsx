import { CommonSubHeader } from "~/components/common/CommonSubHeader";

// loader

import { loader as dashboardLoader } from "@/routes/loader+/feature+/dashboard+/dashboard.loader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link, useLoaderData } from "@remix-run/react";
import { ChartAreaInteractive } from "~/components/common/charts/CreatorChart";
import { PermissionCheck } from "~/utils/permissions/permission";
export const loader = dashboardLoader;

export default function Dashboard() {
  const { role, name } = useLoaderData<typeof loader>();
  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={name} role={role} variant="default" />
      <PermissionCheck role={role} allowedRoles={["creator"]}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 p-6">
            {/* Accounts Linked */}
            <Card>
              <CardHeader>
                <CardTitle>Linked Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your connected social and content platforms.
                </p>
                <Button variant="default" className="w-full">
                  <Link to="/feature/accounts">View Accounts</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Editors Linked */}
            <Card>
              <CardHeader>
                <CardTitle>Editors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite or manage users who help edit your content.
                </p>
                <Button variant="default" className="w-full">
                  <Link to="/feature/editors">Manage Editors</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PermissionCheck>
      <PermissionCheck role={role} allowedRoles={["editor"]}>
        {/* Editors Linked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Creators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage Creators that have invited you.
              </p>
              <Button variant="default" className="w-full">
                <Link to="/feature/creators">Manage Creators</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PermissionCheck>

      {/* Optional Metrics */}
      <Card className="border-none shadow-none ">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Get insights on views, engagement, and growth.
          </p>
          {/* Placeholder for chart or stats */}
          <ChartAreaInteractive />
        </CardContent>
      </Card>
    </div>
  );
}
