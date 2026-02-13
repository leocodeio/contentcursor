/**
 * This file contains the server-side logic for editors to manage media.
 */

import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import { xDomainMedia, xDomainFolderItem } from "@spectral/types";

const editorMediaEndpoints = {
  getFolderItems: {
    url: "/folders/:folderId/items",
    method: "GET",
  },
  getFolderItem: {
    url: "/folders/:folderId/items/:mediaId",
    method: "GET",
  },
  createMedia: {
    url: "/media",
    method: "POST",
  },
  updateMedia: {
    url: "/media/:id",
    method: "PUT",
  },
  deleteMedia: {
    url: "/media/:id",
    method: "DELETE",
  },
  deleteFolderItem: {
    url: "/folders/:folderId/items/:mediaId",
    method: "DELETE",
  },
};

// start ------------------------------ getFolderItems ------------------------------
export const getFolderItems = async (
  request: Request,
  folderId: string,
): Promise<ActionResult<xDomainFolderItem[]>> => {
  const response = await makeApiRequest<any, any>(
    editorMediaEndpoints.getFolderItems.url,
    {
      method: editorMediaEndpoints.getFolderItems.method,
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
      origin: "map",
      message: "Failed to get folder items due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Folder items not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get folder items due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get folder items due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolderItem[]> = {
    success: true,
    origin: "map",
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
    editorMediaEndpoints.getFolderItem.url,
    {
      method: editorMediaEndpoints.getFolderItem.method,
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
      origin: "map",
      message: "Failed to get folder item due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Folder item not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get folder item due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get folder item due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainFolderItem> = {
    success: true,
    origin: "map",
    message: "Folder item retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getFolderItem ------------------------------

// start ------------------------------ createMedia ------------------------------
export const createMedia = async (
  request: Request,
  createMediaDto: CreateMediaDto,
): Promise<ActionResult<xDomainMedia>> => {
  const response = await makeApiRequest<any, any>(
    editorMediaEndpoints.createMedia.url,
    {
      method: editorMediaEndpoints.createMedia.method,
      access_token: await getAccessToken(request),
      request: request,
      body: createMediaDto,
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message: "Failed to create media due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to create media due to invalid input data",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to create media due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainMedia> = {
    success: true,
    origin: "map",
    message: "Media created successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ createMedia ------------------------------

// start ------------------------------ updateMedia ------------------------------
export const updateMedia = async (
  request: Request,
  mediaId: string,
  updateMediaDto: UpdateMediaDto,
): Promise<ActionResult<xDomainMedia>> => {
  const response = await makeApiRequest<any, any>(
    editorMediaEndpoints.updateMedia.url,
    {
      method: editorMediaEndpoints.updateMedia.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: mediaId,
      },
      body: updateMediaDto,
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message: "Failed to update media due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Media not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to update media due to invalid input data",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to update media due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainMedia> = {
    success: true,
    origin: "map",
    message: "Media updated successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ updateMedia ------------------------------

// start ------------------------------ deleteMedia ------------------------------
export const deleteMedia = async (
  request: Request,
  mediaId: string,
): Promise<ActionResult<void>> => {
  const response = await makeApiRequest<xDomainMedia, any>(
    editorMediaEndpoints.deleteMedia.url as string,
    {
      method: editorMediaEndpoints.deleteMedia.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        id: mediaId,
      },
    },
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message: "Failed to delete media due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Media not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to delete media",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to delete media due to backend server error",
      data: null,
    };
  }

  const result: ActionResult<void> = {
    success: true,
    origin: "map",
    message: "Media deleted successfully",
    data: null,
  };
  return result;
};
// end ------------------------------ deleteMedia ------------------------------

// start ------------------------------ deleteFolderItem ------------------------------
export const deleteFolderItem = async (
  request: Request,
  folderId: string,
  mediaId: string,
): Promise<ActionResult<void>> => {
  const response = await makeApiRequest<xDomainMedia, any>(
    editorMediaEndpoints.deleteFolderItem.url,
    {
      method: editorMediaEndpoints.deleteFolderItem.method,
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
      origin: "map",
      message: "Failed to delete folder item due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Folder item not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to delete folder item",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to delete folder item due to backend server error",
      data: null,
    };
  }

  const result: ActionResult<void> = {
    success: true,
    origin: "map",
    message: "Folder item deleted successfully",
    data: null,
  };
  return result;
};
// end ------------------------------ deleteFolderItem ------------------------------

export interface CreateMediaDto {
  type: string;
  folderId?: string;
  accountId?: string;
  creatorId?: string;
  editorId?: string;
}

export interface UpdateMediaDto {
  type?: string;
}
