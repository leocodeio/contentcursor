/**
 * creator will be use this loader to get the editors he was editing to.
 */

import { LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/server/services/auth/db.server";
import { getEditorsMaps } from "~/server/services/creator/editors.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const role = session?.user?.role;

  if (!role) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const editorsMapsResult = await getEditorsMaps(request);
  console.log("Editors loaded:", editorsMapsResult);
  return {
    role,
    name: session.user.name,
    editorResults: editorsMapsResult.data,
  };
};
