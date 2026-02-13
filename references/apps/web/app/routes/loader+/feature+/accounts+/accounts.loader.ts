import { type LoaderFunctionArgs } from "@remix-run/node";
import { Persona } from "../../../../models/persona";
import { getSession } from "~/server/services/auth/db.server";
import { getLinkedAccounts } from "~/server/services/creator/accounts.server";
import { ActionResult } from "~/types/action-result";
import { xDomainAccountEditorMap, xDomainYtCreator } from "@spectral/types";

export const ROUTE_PATH = "/feature/accounts" as const;

export async function loader({ request }: LoaderFunctionArgs): Promise<any> {
  const session = await getSession(request);
  const role = session?.user.role as Persona;
  const name = session?.user.name;
  const linkedAccountsResult = (await getLinkedAccounts(
    request,
    session?.user?.id!
  )) as ActionResult<xDomainYtCreator[]>;
  console.log("linkedAccountsResult", linkedAccountsResult);
  return {
    name,
    role,
    linkedAccounts: linkedAccountsResult.data as xDomainYtCreator[],
  };
}
