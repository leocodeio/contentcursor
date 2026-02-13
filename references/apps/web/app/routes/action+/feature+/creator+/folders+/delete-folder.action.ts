import { deleteFolder } from "~/server/services/editor/folder.server";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const folderId = formData.get("folderId");

  if (typeof folderId !== "string") {
    return {
      success: false,
      message: "Invalid input data",
      data: null,
    };
  }

  try {
    const result = await deleteFolder(request, folderId);
    return result;
  } catch (error) {
    console.error("Error deleting folder:", error);
    return {
      success: false,
      message: "Failed to delete folder",
      data: null,
    };
  }
};