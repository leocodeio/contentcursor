import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import { xDomainCreatorEditorMap } from "@spectral/types";

const mapEndpoints = {
  acceptInvitation: {
    url: "/creator-editor-map/update-status/:mapId/:status",
    method: "PUT",
  },
  getCreators: {
    url: "/creator-editor-map/find-maps-by-editor",
    method: "GET",
  },
};

// start ------------------------------ getCreators ------------------------------
export const getCreators = async (
  request: Request
): Promise<ActionResult<xDomainCreatorEditorMap[]>> => {
  const response = await makeApiRequest<any, any>(
    mapEndpoints.getCreators.url,
    {
      method: mapEndpoints.getCreators.method,
      request: request,
      access_token: await getAccessToken(request),
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get creators due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "editor",
      message: "No creators found",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "editor",
      message: "Failed to get creators due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainCreatorEditorMap[]> = {
    success: true,
    origin: "editor",
    message: "Creators retrieved successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ getCreators ------------------------------

// start ------------------------------ acceptInvite ------------------------------
export const acceptInvite = async (
  request: Request,
  mapId: string,
  status: string
): Promise<ActionResult<xDomainCreatorEditorMap>> => {
  const response = await makeApiRequest<any, any>(
    mapEndpoints.acceptInvitation.url,
    {
      method: mapEndpoints.acceptInvitation.method,
      request: request,
      access_token: await getAccessToken(request),
      pathParams: {
        mapId: mapId,
        status: status,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message: "Failed to accept invitation due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Invitation not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to accept invitation due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to accept invitation due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainCreatorEditorMap> = {
    success: true,
    origin: "map",
    message: "Invitation status updated successfully",
    data: responseData.data,
  };
  return result;
};
// end ------------------------------ acceptInvite ------------------------------
