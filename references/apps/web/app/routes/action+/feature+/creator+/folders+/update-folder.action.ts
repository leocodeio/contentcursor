import { updateFolder } from "~/server/services/editor/folder.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const folderId = formData.get("folderId");
  const name = formData.get("name");

  if (typeof folderId !== "string" || typeof name !== "string") {
    return {
      success: false,
      message: "Invalid input data",
      data: null,
    };
  }

  try {
    const result = await updateFolder(request, folderId, { name });
    return result;
  } catch (error) {
    console.error("Error updating folder:", error);
    return {
      success: false,
      message: "Failed to update folder",
      data: null,
    };
  }
};