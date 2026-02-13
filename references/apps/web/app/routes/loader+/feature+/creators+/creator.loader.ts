/**
 * creator will be use this loader to get the editors he was editing to.
 */

import { LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/server/services/auth/db.server";
import { getCreators } from "~/server/services/editor/creators.server";
import { xDomainCreatorEditorMap } from "@spectral/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const role = session?.user?.role;

  if (!role) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const creatorsResult = await getCreators(request);
  return {
    role,
    name: session.user.name,
    creatorResults: creatorsResult.data as xDomainCreatorEditorMap[],
  };
};
