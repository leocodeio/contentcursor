import { ActionFunctionArgs } from "@remix-run/node";
import { connectEditor } from "~/server/services/creator/editors.server";

export default function ConnectEditor() {
  return <div>ConnectEditor</div>;
}

export const loader = () => {
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const editorId = formData.get("editorId");

  const response = await connectEditor(request, editorId as string);
  return response;
};
