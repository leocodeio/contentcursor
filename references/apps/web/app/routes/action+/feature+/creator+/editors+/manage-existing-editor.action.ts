import { redirect } from "@remix-run/node";
import {
  connectEditor,
  updateMapStatusFunction,
} from "~/server/services/creator/editors.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const actionStep = formData.get("actionStep") as string;
  const mapId = formData.get("mapId") as string;

  if (actionStep === "revoke" || actionStep === "remove") {
    try {
      await updateMapStatusFunction(request, mapId, "INACTIVE");
      return redirect("/feature/editors");
    } catch (error) {
      return redirect("/feature/editors");
    }
  } else if (actionStep === "request") {
    const editorId = formData.get("editorId") as string;
    const response = await connectEditor(request, editorId);
    return response;
  }
  return null;
};
