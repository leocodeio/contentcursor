/**
 * This file contains the server-side logic for editors to manage folders.
 */

import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken, getSession } from "../auth/db.server";
import { xDomainFolders, xDomainFolderItem } from "@spectral/types";

const editorFolderEndpoints = {
  getFoldersByEditor: {
    url: "/folders/by-editor/:accountId",
    method: "GET",
  },
  createFolderByEditor: {
    url: "/folders/by-editor",
    method: "POST",
  },
  updateFolder: {
    url: "/folders/:id",
    method: "PUT",
  },
  getFolderById: {
    url: "/folders/:id",
    method: "GET",
  },
  deleteFolder: {
    url: "/folders/:id",
    method: "DELETE",
  },
  getFolderItems: {
    url: "/folders/:folderId/items",
    method: "GET",
  },
  getFolderItem: {
    url: "/folders/:folderId/items/:mediaId",
    method: "GET",
  },
  deleteFolderItem: {
    url: "/folders/:folderId/items/:mediaId",
    method: "DELETE",
  },
  createFolderItem: {
    url: "/folders/items",
    method: "POST",
  },
  uploadMediaToFolder: {
    url: "/media",
    method: "POST",
  },
};

// start ------------------------------ getFoldersByEditor ------------------------------
export const getFoldersByEditor = async (
  request: Request,
  accountId: string,
): Promise<ActionResult<xDomainFolders[]>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.getFoldersByEditor.url,
    {
      method: editorFolderEndpoints.getFoldersByEditor.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        accountId: accountId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folders due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folders not found for the given editor",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folders due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folders due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolders[]> = {
    success: true,
    origin: "folder",
    message: "Folders retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getFoldersByEditor ------------------------------

// start ------------------------------ createFolderByEditor ------------------------------
export const createFolderByEditor = async (
  request: Request,
  createFolderDto: CreateFolderByEditorDto,
): Promise<ActionResult<xDomainFolders>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.createFolderByEditor.url,
    {
      method: editorFolderEndpoints.createFolderByEditor.method,
      access_token: await getAccessToken(request),
      request: request,
      body: createFolderDto,
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to create folder due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to create folder due to invalid input data",
      data: null,
    };
  } else if (response?.status === 409) {
    return {
      success: false,
      origin: "folder",
      message: "A folder with this name already exists for the account",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to create folder due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolders> = {
    success: true,
    origin: "folder",
    message: "Folder created successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ createFolderByEditor ------------------------------

// start ------------------------------ updateFolder ------------------------------
export const updateFolder = async (
  request: Request,
  folderId: string,
  updateFolderDto: UpdateFolderDto,
): Promise<ActionResult<xDomainFolders>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.updateFolder.url,
    {
      method: editorFolderEndpoints.updateFolder.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: folderId,
      },
      body: updateFolderDto,
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to update folder due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to update folder due to invalid input data",
      data: null,
    };
  } else if (response?.status === 409) {
    return {
      success: false,
      origin: "folder",
      message: "A folder with this name already exists for the account",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to update folder due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolders> = {
    success: true,
    origin: "folder",
    message: "Folder updated successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ updateFolder ------------------------------

// start ------------------------------ getFolderById ------------------------------
export const getFolderById = async (
  request: Request,
  folderId: string,
): Promise<ActionResult<xDomainFolders>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.getFolderById.url,
    {
      method: editorFolderEndpoints.getFolderById.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: folderId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolders> = {
    success: true,
    origin: "folder",
    message: "Folder retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getFolderById ------------------------------

// start ------------------------------ deleteFolder ------------------------------
export const deleteFolder = async (
  request: Request,
  folderId: string,
): Promise<ActionResult<void>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.deleteFolder.url,
    {
      method: editorFolderEndpoints.deleteFolder.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: folderId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to delete folder due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to delete folder",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to delete folder due to backend server error",
      data: null,
    };
  }

  const result: ActionResult<void> = {
    success: true,
    origin: "folder",
    message: "Folder deleted successfully",
    data: null,
  };
  return result;
};
// end ------------------------------ deleteFolder ------------------------------

// start ------------------------------ getFolderItems ------------------------------
export const getFolderItems = async (
  request: Request,
  folderId: string,
): Promise<ActionResult<xDomainFolderItem[]>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.getFolderItems.url,
    {
      method: editorFolderEndpoints.getFolderItems.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        folderId: folderId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder items due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder items not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder items due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder items due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolderItem[]> = {
    success: true,
    origin: "folder",
    message: "Folder items retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getFolderItems ------------------------------

// start ------------------------------ getFolderItem ------------------------------
export const getFolderItem = async (
  request: Request,
  folderId: string,
  mediaId: string,
): Promise<ActionResult<xDomainFolderItem>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.getFolderItem.url,
    {
      method: editorFolderEndpoints.getFolderItem.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        folderId: folderId,
        mediaId: mediaId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder item due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder item not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder item due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to get folder item due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolderItem> = {
    success: true,
    origin: "folder",
    message: "Folder item retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getFolderItem ------------------------------

// start ------------------------------ deleteFolderItem ------------------------------
export const deleteFolderItem = async (
  request: Request,
  folderId: string,
  mediaId: string,
): Promise<ActionResult<void>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.deleteFolderItem.url,
    {
      method: editorFolderEndpoints.deleteFolderItem.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        folderId: folderId,
        mediaId: mediaId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to delete folder item due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder item not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to delete folder item",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to delete folder item due to backend server error",
      data: null,
    };
  }

  const result: ActionResult<void> = {
    success: true,
    origin: "folder",
    message: "Folder item deleted successfully",
    data: null,
  };
  return result;
};
// end ------------------------------ deleteFolderItem ------------------------------

// start ------------------------------ createFolderItem ------------------------------
export const createFolderItem = async (
  request: Request,
  createFolderItemDto: CreateFolderItemDto,
): Promise<ActionResult<xDomainFolderItem>> => {
  const response = await makeApiRequest<any, any>(
    editorFolderEndpoints.createFolderItem.url,
    {
      method: editorFolderEndpoints.createFolderItem.method,
      access_token: await getAccessToken(request),
      request: request,
      body: createFolderItemDto,
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to add media to folder due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to add media to folder due to invalid input data",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder or media not found",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to add media to folder due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolderItem> = {
    success: true,
    origin: "folder",
    message: "Media added to folder successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ createFolderItem ------------------------------

// Helper function for multipart form data requests
async function makeApiRequestWithFiles(
  endpoint: string,
  options: {
    method: string;
    request: Request;
    access_token?: string;
    formData: FormData;
    pathParams?: Record<string, string>;
  },
): Promise<Response | undefined> {
  const { access_token, method, formData, pathParams } = options;

  // Replace path parameters if any
  let url = endpoint;
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }

  const fullUrl = `${process.env.BACKEND_API_URL}/${process.env.BACKEND_VERSION}${url}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        ...(access_token && { Authorization: `Bearer ${access_token}` }),
        "x-api-key": process.env.BACKEND_API_KEY as string,
        "x-correlation-id": "FRONTEND-CORRELATION-ID",
        // Don't set Content-Type for FormData - let fetch set it automatically
      },
      body: formData,
    });

    return response;
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
}

// start ------------------------------ uploadMediaToFolder ------------------------------
export const uploadMediaToFolder = async (
  request: Request,
  folderId: string,
  accountId: string,
  formData: FormData,
): Promise<ActionResult<any>> => {
  // Add required fields to formData
  formData.append("folderId", folderId);
  formData.append("accountId", accountId);

  // Get user session to add editorId
  const session = await getSession(request);
  if (session?.user?.id) {
    formData.append("editorId", session.user.id);
  }

  const response = await makeApiRequestWithFiles(
    editorFolderEndpoints.uploadMediaToFolder.url,
    {
      method: editorFolderEndpoints.uploadMediaToFolder.method,
      access_token: await getAccessToken(request),
      request: request,
      formData: formData,
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to upload media due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to upload media due to invalid input data",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "folder",
      message: "Folder not found",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "folder",
      message: "Failed to upload media due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<any> = {
    success: true,
    origin: "folder",
    message: "Media uploaded to folder successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ uploadMediaToFolder ------------------------------

export interface CreateFolderByEditorDto {
  name: string;
  creatorId: string;
  accountId: string;
}

export interface UpdateFolderDto {
  name?: string;
  editorId?: string;
}

export interface CreateFolderItemDto {
  folderId: string;
  mediaId: string;
}
