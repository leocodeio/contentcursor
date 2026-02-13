import { createFolderByEditor } from "~/server/services/editor/folder.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const accountId = formData.get("accountId");
  const creatorId = formData.get("creatorId");

  if (typeof name !== "string" || typeof accountId !== "string" || typeof creatorId !== "string") {
    return {
      success: false,
      message: "Invalid input data",
      data: null,
    };
  }

  try {
    const result = await createFolderByEditor(request, {
      name,
      accountId,
      creatorId,
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