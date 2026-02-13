import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { ArrowLeft, Folder, Trash } from 'lucide-react';
import { useEffect } from 'react';
import { CommonSubHeader } from '~/components/common/CommonSubHeader';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { getSession } from '~/server/services/auth/db.server';
import { deleteFolder, getFoldersByEditor } from '~/server/services/editor/folder.server';
import { toast } from '~/hooks/use-toast';
import { ActionResult } from '~/types/action-result';

// Loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const currentSession = await getSession(request);
  const userName = currentSession?.user?.name || 'Guest';
  const role = currentSession?.user?.role || 'User';

  const foldersResult = await getFoldersByEditor(request, params.aid!);
  const folders = foldersResult.data || [];

  return {
    id: params.aid,
    cid: params.cid,
    userName,
    role,
    folders,
  };
};

// Action
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const folderId = formData.get('folderId') as string;
  const action = formData.get('action');

  if (action === 'delete') {
    const result = await deleteFolder(request, folderId as string);
    return result;
  }
  return null;
};

export default function CreatorAccountFoldersIndex() {
  const { id, cid, userName, role, folders } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionResult<any>;

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.success) {
      toast({
        title: 'Folder',
        description: 'Folder deleted successfully',
      });
    } else {
      toast({
        title: actionData?.message,
        description: actionData?.data,
        variant: 'destructive',
      });
    }
  }, [actionData]);

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={userName} role={role} variant="default" />

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 my-2">
        <Button variant="ghost">
          <Link
            to={`/feature/creators/${cid}/accounts/${id}`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back</Label>
          </Link>
        </Button>
        <div className=" flex justify-center">
          <Button asChild>
            <Link
              to={`/feature/creators/${cid}/accounts/${id}/folders/add`}
              className="flex items-center space-x-2"
            >
              <Folder className="w-4 h-4 mr-2" />
              Create New Folder
            </Link>
          </Button>
        </div>
      </div>

      <div className="my-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Folders</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            {folders.length} folder{folders.length !== 1 ? 's' : ''}
          </div>
        </div>

        {folders.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No folders found
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Create your first folder to get started organizing your content
                </p>
                <Button className="mt-4" asChild>
                  <Link to={`/feature/creators/${cid}/accounts/${id}/folders/add`}>
                    Create First Folder
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {folders.map((folder: any) => (
              <Card key={folder.id} className="hover:shadow-md transition-shadow">
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
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/feature/creators/${cid}/accounts/${id}/folders/${folder.id}/open`}>
                        Open
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/feature/creators/${cid}/accounts/${id}/folders/${folder.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Folders Feature is in development</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          Please check on contributions for now
          <Link to={`/feature/creators/${cid}/accounts/${id}/upload`}>
            <Button>Contributions</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
