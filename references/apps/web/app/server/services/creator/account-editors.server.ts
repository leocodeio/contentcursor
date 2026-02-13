/**
 * This file contains the server-side logic for managing account editors maps.
 */

import { ActionResult } from "~/types/action-result";
import { makeApiRequest } from "../common/common.server";
import { getAccessToken } from "../auth/db.server";
import { xDomainAccountEditorMap } from "@spectral/types";

const accountEditorEndpoints = {
  getAccountEditorMaps: {
    url: "/account-editor-map/get-account-editors/:accountId",
    method: "GET",
  },
  linkEditorToAccount: {
    url: "/account-editor-map/link-editor-to-account/:accountId/:editorId",
    method: "POST",
  },
  unlinkEditorFromAccount: {
    url: "/account-editor-map/unlink-editor-from-account/:accountId/:editorId",
    method: "PUT",
  },
};

// start ------------------------------ getAccountEditors ------------------------------
export const getAccountEditorMaps = async (
  request: Request,
  accountId: string
): Promise<ActionResult<xDomainAccountEditorMap[]>> => {
  const response = await makeApiRequest<any, any>(
    accountEditorEndpoints.getAccountEditorMaps.url,
    {
      method: accountEditorEndpoints.getAccountEditorMaps.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        accountId: accountId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get account editors due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Account not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get account editors due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to get account editors due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainAccountEditorMap[]> = {
    success: true,
    origin: "map",
    message: "Account editors fetched successfully",
    data: responseData.data,
  };
  return result;
};

export const linkEditorToAccount = async (
  request: Request,
  accountId: string,
  editorId: string
): Promise<ActionResult<xDomainAccountEditorMap>> => {
  const response = await makeApiRequest<any, any>(
    accountEditorEndpoints.linkEditorToAccount.url,
    {
      method: accountEditorEndpoints.linkEditorToAccount.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        accountId: accountId,
        editorId: editorId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message: "Failed to link editor to account due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Account or editor not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to link editor to account due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message: "Failed to link editor to account due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainAccountEditorMap> = {
    success: true,
    origin: "map",
    message: "Editor linked to account successfully",
    data: responseData.data,
  };
  return result;
};

export const unlinkEditorFromAccount = async (
  request: Request,
  accountId: string,
  editorId: string
): Promise<ActionResult<xDomainAccountEditorMap>> => {
  const response = await makeApiRequest<any, any>(
    accountEditorEndpoints.unlinkEditorFromAccount.url,
    {
      method: accountEditorEndpoints.unlinkEditorFromAccount.method,
      access_token: await getAccessToken(request),
      request: request,
      pathParams: {
        accountId: accountId,
        editorId: editorId,
      },
    }
  );

  if (response?.status === 401 || response?.status === 403) {
    return {
      success: false,
      origin: "map",
      message:
        "Failed to unlink editor from account due to invalid authorization",
      data: null,
    };
  } else if (response?.status === 404) {
    return {
      success: false,
      origin: "map",
      message: "Account or editor mapping not found",
      data: null,
    };
  } else if (response?.status === 400) {
    return {
      success: false,
      origin: "map",
      message: "Failed to unlink editor from account due to invalid request",
      data: null,
    };
  } else if (response?.status === 500) {
    return {
      success: false,
      origin: "map",
      message:
        "Failed to unlink editor from account due to backend server error",
      data: null,
    };
  }

  const responseData = await response?.json();
  const result: ActionResult<xDomainAccountEditorMap> = {
    success: true,
    origin: "map",
    message: "Editor unlinked from account successfully",
    data: responseData.data,
  };
  return result;
};
