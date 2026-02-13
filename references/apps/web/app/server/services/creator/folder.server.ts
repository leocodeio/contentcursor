/**
 * This file contains the server-side logic for creators to manage folders.
 */

import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken, getSession } from "../auth/db.server";
import { xDomainFolders, xDomainFolderItem } from "@spectral/types";

const creatorFolderEndpoints = {
  getFoldersByCreator: {
    url: "/folders/by-creator/:accountId",
    method: "GET",
  },
  createFolderByCreator: {
    url: "/folders/by-creator",
    method: "POST",
  },
  updateFolder: {
    url: "/folders/:id",
    method: "PUT",
  },
  deleteFolder: {
    url: "/folders/:id",
    method: "DELETE",
  },
  getFolderById: {
    url: "/folders/:id",
    method: "GET",
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

// start ------------------------------ getFoldersByCreator ------------------------------
export const getFoldersByCreator = async (
  request: Request,
  accountId: string,
): Promise<ActionResult<xDomainFolders[]>> => {
  const response = await makeApiRequest<any, any>(
    creatorFolderEndpoints.getFoldersByCreator.url,
    {
      method: creatorFolderEndpoints.getFoldersByCreator.method,
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
      origin: "map",
      message: "Failed to get folders due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Folders not found for the given creator",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get folders due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get folders due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolders[]> = {
    success: true,
    origin: "map",
    message: "Folders retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getFoldersByCreator ------------------------------

// start ------------------------------ createFolderByCreator ------------------------------
export const createFolderByCreator = async (
  request: Request,
  createFolderDto: CreateFolderByCreatorDto,
): Promise<ActionResult<xDomainFolders>> => {
  const response = await makeApiRequest<any, any>(
    creatorFolderEndpoints.createFolderByCreator.url,
    {
      method: creatorFolderEndpoints.createFolderByCreator.method,
      access_token: await getAccessToken(request),
      request: request,
      body: createFolderDto,
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
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
      message:
        "A folder with this name already exists for the account or used previously",
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
// end ------------------------------ createFolderByCreator ------------------------------

// start ------------------------------ updateFolder ------------------------------
export const updateFolder = async (
  request: Request,
  folderId: string,
  updateFolderDto: UpdateFolderDto,
): Promise<ActionResult<xDomainFolders>> => {
  const response = await makeApiRequest<any, any>(
    creatorFolderEndpoints.updateFolder.url,
    {
      method: creatorFolderEndpoints.updateFolder.method,
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
      message:
        "A folder with this name already exists for the account or used previously",
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

// start ------------------------------ deleteFolder ------------------------------
export const deleteFolder = async (
  request: Request,
  folderId: string,
): Promise<ActionResult<void>> => {
  const response = await makeApiRequest<any, any>(
    creatorFolderEndpoints.deleteFolder.url,
    {
      method: creatorFolderEndpoints.deleteFolder.method,
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

// start ------------------------------ getFolderById ------------------------------
export const getFolderById = async (
  request: Request,
  folderId: string,
): Promise<ActionResult<xDomainFolders>> => {
  const response = await makeApiRequest<any, any>(
    creatorFolderEndpoints.getFolderById.url,
    {
      method: creatorFolderEndpoints.getFolderById.method,
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

// start ------------------------------ getFolderItems ------------------------------
export const getFolderItems = async (
  request: Request,
  folderId: string,
): Promise<ActionResult<xDomainFolderItem[]>> => {
  const response = await makeApiRequest<any, any>(
    creatorFolderEndpoints.getFolderItems.url,
    {
      method: creatorFolderEndpoints.getFolderItems.method,
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
    creatorFolderEndpoints.getFolderItem.url,
    {
      method: creatorFolderEndpoints.getFolderItem.method,
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
    creatorFolderEndpoints.deleteFolderItem.url,
    {
      method: creatorFolderEndpoints.deleteFolderItem.method,
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
    creatorFolderEndpoints.createFolderItem.url,
    {
      method: creatorFolderEndpoints.createFolderItem.method,
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

  // Get user session to add creatorId
  const session = await getSession(request);
  if (session?.user?.id) {
    formData.append("creatorId", session.user.id);
  }

  const response = await makeApiRequestWithFiles(
    creatorFolderEndpoints.uploadMediaToFolder.url,
    {
      method: creatorFolderEndpoints.uploadMediaToFolder.method,
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

export interface CreateFolderByCreatorDto {
  name: string;
  editorId: string;
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
