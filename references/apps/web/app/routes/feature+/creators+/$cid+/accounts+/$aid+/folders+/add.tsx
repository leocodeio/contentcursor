import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, Folder } from 'lucide-react';
import { CommonSubHeader } from '~/components/common/CommonSubHeader';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from '@remix-run/node';
import { getSession } from '~/server/services/auth/db.server';
import { toast } from '~/hooks/use-toast';
import { createFolderByEditor } from '~/server/services/editor/folder.server';

// loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect('/');
  }

  const userName = session?.user?.name || '';
  const role = session?.user?.role || '';
  const userId = session?.user?.id || '';
  const { cid, aid } = params;

  return {
    cid,
    userName,
    userId,
    role,
    accountId: aid!,
  };
};

// action
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect('/');
  }

  const { cid, aid } = params;
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const editorId = formData.get('editorId') as string;

  if (!name?.trim()) {
    return {
      success: false,
      origin: 'folder',
      message: 'Folder name is required',
      data: null,
    };
  }

  const createFolderDto = {
    name: name.trim(),
    creatorId: cid!,
    accountId: aid!,
    ...(editorId && { editorId }),
  };

  const result = await createFolderByEditor(request, createFolderDto);

  if (result.success) {
    return redirect(`/feature/creators/${cid}/accounts/${aid}/folders`);
  }

  return result;
};

export default function AddFolder() {
  const data = useLoaderData<typeof loader>();
  const { cid, userName, userId, role, accountId } = data;

  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>('');

  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (!actionData) return;
    setCreateLoading(false);
    if (actionData?.success) {
      toast({ title: actionData.origin, description: actionData.message });
    } else {
      toast({ title: actionData?.origin, description: actionData?.message });
    }
  }, [actionData]);

  return (
    <div className="h-fit w-full p-3">
      <CommonSubHeader userName={userName} role={role} variant="default" />
      <div className="flex items-center gap-2 my-2">
        <Button variant="ghost">
          <Link
            to={`/feature/creators/${cid}/accounts/${accountId}/folders`}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Back to Folders</Label>
          </Link>
        </Button>
      </div>
      <CommonSubHeader
        userName="Create New Folder"
        role="Add a new folder to organize your content"
        variant="default"
      />
      <div className="max-w-2xl mx-auto my-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="h-5 w-5" />
              <span>Folder Details</span>
            </CardTitle>
            <CardDescription>
              Create a new folder assigned to you automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" onSubmit={() => setCreateLoading(true)}>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Account</Label>
                  <Input value={`Account ${accountId}`} readOnly className="bg-muted" />
                  <p className="text-sm text-muted-foreground mt-1">
                    The account this folder will be created for
                  </p>
                </div>
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Folder Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter folder name..."
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a descriptive name for your folder
                  </p>
                </div>
                <input type="hidden" name="editorId" value={userId} />
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={!folderName.trim() || createLoading}
                    className="flex-1"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {createLoading ? 'Creating...' : 'Create Folder'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    <Link to={`/feature/creators/${cid}/accounts/${accountId}/folders`}>
                      Cancel
                    </Link>
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
