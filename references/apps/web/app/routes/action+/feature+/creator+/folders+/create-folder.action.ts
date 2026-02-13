import { createFolderByCreator } from "~/server/services/creator/folder.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const accountId = formData.get("accountId");
  const editorId = formData.get("editorId");

  if (
    typeof name !== "string" ||
    typeof accountId !== "string" ||
    typeof editorId !== "string"
  ) {
    return {
      success: false,
      message: "Invalid input data",
      data: null,
    };
  }

  try {
    const result = await createFolderByCreator(request, {
      name,
      accountId,
      editorId,
    });
    return result;
  } catch (error) {
    console.error("Error creating folder:", error);
    return {
      success: false,
      message: "Failed to create folder",
      data: null,
    };
  }
};
