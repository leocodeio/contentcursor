import { type LoaderFunctionArgs } from "@remix-run/node";
import { Persona } from "../../../../models/persona";
import { getSession } from "~/server/services/auth/db.server";
import { getEditorLinkedAccountsByCreator } from "~/server/services/editor/accounts.server";
import { getFoldersByEditor } from "~/server/services/editor/folder.server";
import { xDomainAccountEditorMap, xDomainFolders } from "@spectral/types";

export const ROUTE_PATH = "/feature/contribute" as const;

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<any> {
  const session = await getSession(request);
  const role = session?.user.role as Persona;
  const name = session?.user.name;
  const cid = params.cid;
  const aid = params.aid;

  const mappedAccountsResult = await getEditorLinkedAccountsByCreator(request);
  // console.log("Mapped accounts", mappedAccountsResult);

  // Get accessible folders for editor if accounts are available
  let accessibleFolders: xDomainFolders[] | null = null;
  if (
    mappedAccountsResult.success &&
    mappedAccountsResult.data &&
    mappedAccountsResult.data.length &&
    mappedAccountsResult.data.length > 0
  ) {
    const folderPromises = mappedAccountsResult.data.map((account) =>
      getFoldersByEditor(request, account.id)
    );
    const folderResults = await Promise.all(folderPromises);
    console.log("Folder results", folderResults);

    accessibleFolders = folderResults
      .filter((result) => result.success && result.data)
      .flatMap((result) => result.data || [])
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        accountId: folder.accountId,
        creatorId: folder.creatorId,
        editorId: folder.editorId,
      }));
  }

  return {
    role,
    name,
    cid,
    editorLinkedAccountsByCreator: mappedAccountsResult.data,
    accessibleFolders,
  };
}
