import { ActionFunctionArgs } from "@remix-run/node";
import { throw403Error } from "~/server/services/common/error-validations.server";
import { acceptInvite } from "~/server/services/editor/creators.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const mapId = formData.get("mapId");
  // 1) console.log("Accepting invitation for mapId:", mapId);
  if (typeof mapId !== "string") {
    return throw403Error(request);
  }

  // 2) Process the invitation acceptance logic here
  return await acceptInvite(request, mapId, "ACTIVE");
};
