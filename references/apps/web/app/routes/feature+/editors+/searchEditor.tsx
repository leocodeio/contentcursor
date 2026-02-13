import { ActionFunctionArgs } from "@remix-run/node";
import { searchCreatorEditorMap } from "~/server/services/creator/editors.server";
export default function SearchEditor() {
  return <div>SearchEditor</div>;
}

export const loader = () => {
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");

  const response = await searchCreatorEditorMap(request, email as string);

  return response;
};
